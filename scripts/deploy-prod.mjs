#!/usr/bin/env node
/**
 * One-command production deploy for StockPulse.
 *
 * Why this exists
 * ---------------
 * Vercel's Git integration has been unreliable lately: webhook deliveries arrive
 * late, which produces duplicate deployments for the same commit. Since the
 * project is on the Hobby plan (one concurrent build), a single stuck build
 * blocks everything behind it for many minutes. On top of that, deployments
 * created on those delayed paths sometimes never get the production domain
 * assigned, so the live site keeps serving the previous build.
 *
 * This script makes a deploy deterministic:
 *   1. triggers a production deployment for the current commit
 *   2. cancels stuck / duplicate builds that hold the single build slot
 *   3. promotes the production domains to the new deployment if needed
 *   4. verifies the live site answers and that production points at it
 *
 * Usage
 * -----
 *   npm run deploy:prod                 # deploys the pushed HEAD of this branch
 *   npm run deploy:prod -- --allow-unpushed
 *
 * Credentials
 * -----------
 *   VERCEL_TOKEN       optional, otherwise reused from the Vercel CLI login
 *   VERCEL_PROJECT_ID  optional, otherwise .vercel/project.json
 *   VERCEL_TEAM_ID     optional, otherwise .vercel/project.json
 *   PROD_DOMAINS       optional, comma separated override of the live domains
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const API = "https://api.vercel.com";
const POLL_MS = 15_000;
const MAX_WAIT_MS = 25 * 60_000;

const log = (...args) => console.log(...args);
const ok = (msg) => log(`  ✓ ${msg}`);
const warn = (msg) => log(`  ! ${msg}`);

function fail(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

function sh(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

function readJsonSafe(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

// ─── credentials & project ───

function resolveToken() {
  if (process.env.VERCEL_TOKEN) return process.env.VERCEL_TOKEN;
  const cliPaths = [
    process.env.APPDATA && join(process.env.APPDATA, "com.vercel.cli", "Data", "auth.json"),
    process.env.XDG_DATA_HOME && join(process.env.XDG_DATA_HOME, "com.vercel.cli", "auth.json"),
    join(homedir(), ".local", "share", "com.vercel.cli", "auth.json"),
    join(homedir(), ".config", "com.vercel.cli", "auth.json"),
    join(homedir(), ".vercel", "auth.json"),
  ].filter(Boolean);

  for (const path of cliPaths) {
    const auth = readJsonSafe(path);
    if (auth?.token) return auth.token;
  }
  fail("No Vercel token found. Set VERCEL_TOKEN or run `npx vercel login` first.");
}

function resolveProject() {
  const linked = readJsonSafe(join(process.cwd(), ".vercel", "project.json"));
  const projectId = process.env.VERCEL_PROJECT_ID || linked?.projectId;
  const teamId = process.env.VERCEL_TEAM_ID || linked?.orgId;
  if (!projectId) {
    fail("No Vercel project id found. Add .vercel/project.json or set VERCEL_PROJECT_ID.");
  }
  return { projectId, teamId };
}

const token = resolveToken();
const { projectId, teamId } = resolveProject();

async function api(path, { method = "GET", body } = {}) {
  const url = new URL(API + path);
  if (teamId) url.searchParams.set("teamId", teamId);

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    const detail = json?.error?.message || text.slice(0, 200);
    throw new Error(`${method} ${path} → HTTP ${res.status}${detail ? ` (${detail})` : ""}`);
  }
  return json;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const shortSha = (d) => (d?.meta?.githubCommitSha || "").slice(0, 7) || "unknown";
const clock = () => new Date().toISOString().slice(11, 19);

async function listDeployments(limit = 12) {
  const { deployments = [] } = await api(`/v6/deployments?projectId=${projectId}&limit=${limit}`);
  return deployments;
}

const isFinal = (state) => ["READY", "ERROR", "CANCELED"].includes(state);

async function cancel(uid, reason) {
  try {
    await api(`/v12/deployments/${uid}/cancel`, { method: "PATCH" });
    log(`  ✂ canceled ${uid} (${reason})`);
  } catch (err) {
    warn(`could not cancel ${uid}: ${err.message}`);
  }
}

// ─── 1. sanity checks ───

const allowUnpushed = process.argv.includes("--allow-unpushed");
const branch = sh("git rev-parse --abbrev-ref HEAD");
const fullSha = sh("git rev-parse HEAD");
const sha = fullSha.slice(0, 7);

log(`\n▶ StockPulse production deploy`);
log(`  commit ${sha} on ${branch}  @ ${clock()}`);

const dirty = sh("git status --porcelain");
if (dirty) {
  warn("working tree has uncommitted changes — only pushed commits are deployed");
}

let remoteSha = "";
try {
  remoteSha = sh(`git rev-parse origin/${branch}`);
} catch {
  warn(`no origin/${branch} ref found locally`);
}

if (remoteSha && remoteSha !== fullSha && !allowUnpushed) {
  fail(
    `HEAD (${sha}) is not pushed to origin/${branch} (${remoteSha.slice(0, 7)}).\n` +
      `  Push first, or re-run with --allow-unpushed to deploy the remote commit.`,
  );
}

const project = await api(`/v9/projects/${projectId}`);
const link = project.link || {};
const productionBranch = link.productionBranch || "main";

if (remoteSha && remoteSha !== fullSha) {
  warn(`deploying the pushed commit origin/${branch} (${remoteSha.slice(0, 7)})`);
}

if (branch !== productionBranch) {
  warn(`branch "${branch}" is not the production branch "${productionBranch}"`);
}

// Custom domains only — Vercel always assigns its own *.vercel.app aliases.
const allDomains = (process.env.PROD_DOMAINS
  ? process.env.PROD_DOMAINS.split(",")
  : project?.targets?.production?.alias || []
).map((d) => d.trim()).filter(Boolean);
const domains = allDomains.filter((d) => !d.endsWith(".vercel.app"));

log(`  project ${project.name} · production branch ${productionBranch}`);
log(`  live domains: ${domains.length ? domains.join(", ") : "none configured"}\n`);

// ─── 2. trigger the deployment ───

log("1/4 triggering deployment");
if (!link.repoId) {
  fail("Project is not linked to a Git repo, so it cannot be deployed from a commit.");
}

const created = await api(`/v13/deployments`, {
  method: "POST",
  body: {
    name: project.name,
    project: projectId,
    target: "production",
    gitSource: {
      type: link.type || "github",
      repoId: link.repoId,
      ref: branch,
      sha: remoteSha || fullSha,
    },
  },
});

const targetId = created.id || created.uid;
ok(`deployment ${targetId} created (${created.readyState || created.status || "queued"})\n`);

// ─── 3. wait, clearing anything that blocks the single build slot ───

log("2/4 waiting for the build");
const startedAt = Date.now();
let target = created;

while (true) {
  await sleep(POLL_MS);

  const all = await listDeployments(12);
  target = all.find((d) => (d.uid || d.id) === targetId) || target;
  const elapsed = Math.round((Date.now() - startedAt) / 1000);

  log(`  [${clock()}] ${target.readyState || target.state} (${elapsed}s)`);

  if (isFinal(target.readyState || target.state)) break;

  // Cancel older non-final deployments: they are stuck duplicates holding the
  // only build slot on the Hobby plan.
  const targetCreated = new Date(target.created || Date.now()).getTime();
  for (const dep of all) {
    const state = dep.readyState || dep.state;
    const uid = dep.uid || dep.id;
    if (uid === targetId || isFinal(state)) continue;

    const depCreated = new Date(dep.created || 0).getTime();
    const olderThanTarget = depCreated < targetCreated;
    const sameCommit = dep.meta?.githubCommitSha === (target.meta?.githubCommitSha || fullSha);

    if (olderThanTarget) {
      await cancel(uid, "stuck ahead of this deploy");
    } else if (sameCommit) {
      await cancel(uid, "duplicate of this commit");
    }
  }

  if (Date.now() - startedAt > MAX_WAIT_MS) {
    fail(`Timed out after ${elapsed}s waiting for ${targetId} (state: ${target.readyState}).`);
  }
}

const finalState = target.readyState || target.state;
const finalSha = shortSha(target);

if (finalState !== "READY") {
  const detail = await api(`/v13/deployments/${targetId}`).catch(() => ({}));
  fail(`Deployment ${finalState}: ${detail.errorMessage || "no error message reported"}`);
}
ok(`build READY for ${finalSha}\n`);

// ─── 4. promote the production domains ───

log("3/4 promoting production domains");
const alreadyAssigned = new Set(target.alias || []);

if (domains.length === 0) {
  warn("no production domains configured on the project — skipping");
} else {
  const skipped = allDomains.length - domains.length;
  if (skipped > 0) log(`  (${skipped} vercel.app alias${skipped > 1 ? "es" : ""} handled automatically)`);

  for (const domain of domains) {
    if (alreadyAssigned.has(domain)) {
      ok(`${domain} already points here`);
      continue;
    }
    try {
      await api(`/v2/deployments/${targetId}/aliases`, {
        method: "POST",
        body: { alias: domain },
      });
      ok(`${domain} assigned`);
    } catch (err) {
      warn(`could not assign ${domain}: ${err.message}`);
    }
  }
}
log("");

// ─── 5. verify the live site ───

log("4/4 verifying the live site");
let healthy = true;

const newestProd = (await listDeployments(12)).find(
  (d) => d.target === "production" && (d.readyState || d.state) === "READY",
);
if (newestProd && (newestProd.uid || newestProd.id) === targetId) {
  ok(`production now points at ${finalSha}`);
} else {
  healthy = false;
  warn(`production points at ${shortSha(newestProd)} — expected ${finalSha}`);
}

for (const domain of domains) {
  const url = `https://${domain}/`;
  try {
    const res = await fetch(url, { redirect: "follow", headers: { "cache-control": "no-cache" } });
    const body = await res.text();
    if (res.ok) {
      ok(`${url} → ${res.status} · ${(body.length / 1024).toFixed(1)} KB · etag ${res.headers.get("etag") || "n/a"}`);
    } else {
      healthy = false;
      warn(`${url} → ${res.status}`);
    }
  } catch (err) {
    healthy = false;
    warn(`${url} unreachable: ${err.message}`);
  }
}

log("");
if (healthy) {
  log(`✅ deploy complete — ${finalSha} is live\n`);
} else {
  log(`⚠️  deploy finished but verification found problems (see warnings above)\n`);
  process.exit(1);
}
