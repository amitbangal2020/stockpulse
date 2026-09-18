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
 *   1. reuses an in-flight deployment for the current commit, or triggers one
 *   2. cancels stuck / duplicate builds that hold the single build slot
 *   3. promotes the production domains to the new deployment if needed
 *   4. verifies the live site answers and actually serves this build
 *
 * Usage
 * -----
 *   npm run deploy:prod                  # deploy the pushed HEAD of this branch
 *   npm run deploy:prod -- --allow-unpushed
 *   npm run deploy:prod -- --force-new   # never reuse an existing deployment
 *
 * Credentials
 * -----------
 *   VERCEL_TOKEN       optional, otherwise reused from the Vercel CLI login
 *   VERCEL_PROJECT_ID  optional, otherwise .vercel/project.json
 *   VERCEL_TEAM_ID     optional, otherwise .vercel/project.json
 *   PROD_DOMAINS       optional, comma separated override of the live domains
 */

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
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
const depId = (d) => d?.uid || d?.id || "";
const depState = (d) => d?.readyState || d?.state || "UNKNOWN";
const shortSha = (d) => (d?.meta?.githubCommitSha || "").slice(0, 7) || "unknown";
const clock = () => new Date().toISOString().slice(11, 19);
const isFinal = (state) => ["READY", "ERROR", "CANCELED"].includes(state);

async function listDeployments(limit = 12) {
  const { deployments = [] } = await api(`/v6/deployments?projectId=${projectId}&limit=${limit}`);
  return deployments;
}

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
const forceNew = process.argv.includes("--force-new");
const branch = sh("git rev-parse --abbrev-ref HEAD");
const fullSha = sh("git rev-parse HEAD");
const sha = fullSha.slice(0, 7);

log(`\n▶ StockPulse production deploy`);
log(`  commit ${sha} on ${branch}  @ ${clock()}`);

if (sh("git status --porcelain")) {
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

// Deploy the pushed commit when the working copy is ahead of the remote.
const targetSha = remoteSha && remoteSha !== fullSha ? remoteSha : fullSha;
const targetShaShort = targetSha.slice(0, 7);
if (targetSha !== fullSha) {
  warn(`deploying the pushed commit origin/${branch} (${targetShaShort})`);
}

const project = await api(`/v9/projects/${projectId}`);
const link = project.link || {};
const productionBranch = link.productionBranch || "main";

if (branch !== productionBranch) {
  warn(`branch "${branch}" is not the production branch "${productionBranch}"`);
}

if (!link.repoId) {
  fail("Project is not linked to a Git repo, so it cannot be deployed from a commit.");
}

// Domain discovery: the project's own domain list is authoritative. Vercel
// omits `targets.production.alias` from the project payload on occasion, so it
// is only a fallback here.
async function discoverDomains() {
  if (process.env.PROD_DOMAINS) {
    return process.env.PROD_DOMAINS.split(",").map((d) => d.trim()).filter(Boolean);
  }

  const custom = [];
  try {
    const { domains = [] } = await api(`/v9/projects/${projectId}/domains`);
    for (const d of domains) {
      if (!d?.name || d.gitBranch) continue; // branch aliases are not production
      if (d.name.endsWith(".vercel.app")) continue; // Vercel assigns these itself
      if (d.verified === false) continue;
      custom.push({ name: d.name, redirectsAway: Boolean(d.redirect) });
    }
  } catch (err) {
    warn(`could not list project domains: ${err.message}`);
  }

  if (custom.length) {
    // The domain that serves content first, the redirecting apex after it.
    return custom.sort((a, b) => Number(a.redirectsAway) - Number(b.redirectsAway)).map((d) => d.name);
  }

  const fromProject = project?.targets?.production?.alias || [];
  return fromProject.filter((d) => !d.endsWith(".vercel.app"));
}

const domains = await discoverDomains();

log(`  project ${project.name} · production branch ${productionBranch}`);
log(`  live domains: ${domains.length ? domains.join(", ") : "none configured"}\n`);

// ─── 2. reuse an in-flight deployment or trigger one ───

log("1/4 resolving deployment");

let target = null;
if (!forceNew) {
  const existing = (await listDeployments(12)).filter(
    (d) => d.meta?.githubCommitSha === targetSha && d.target === "production",
  );
  const inFlight = existing.find((d) => !isFinal(depState(d)));
  const ready = existing.find((d) => depState(d) === "READY");
  const candidate = inFlight || ready;
  if (candidate) {
    target = candidate;
    log(
      `  ↻ reusing existing ${inFlight ? "in-flight" : "ready"} deployment ` +
        `${depId(candidate)} (${depState(candidate)}) — no duplicate created`,
    );
  }
}

if (!target) {
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
        sha: targetSha,
      },
    },
  });
  target = created;
  ok(`deployment ${depId(created)} created (${depState(created)})`);
}
const targetId = depId(target);
log("");

// ─── 3. wait, clearing anything that blocks the single build slot ───

log("2/4 waiting for the build");
const startedAt = Date.now();

/**
 * Cancel non-final deployments that are either older than ours or a duplicate
 * of the same commit. On the Hobby plan a single one of those holds the only
 * build slot and blocks everything behind it.
 */
async function sweepStuck(all, targetCreated) {
  for (const dep of all) {
    const uid = depId(dep);
    if (uid === targetId || isFinal(depState(dep))) continue;

    if (new Date(dep.created || 0).getTime() < targetCreated) {
      await cancel(uid, "stuck ahead of this deploy");
    } else if (dep.meta?.githubCommitSha === targetSha) {
      await cancel(uid, "duplicate of this commit");
    }
  }
}

while (!isFinal(depState(target))) {
  await sleep(POLL_MS);

  const all = await listDeployments(12);
  target = all.find((d) => depId(d) === targetId) || target;
  const elapsed = Math.round((Date.now() - startedAt) / 1000);

  log(`  [${clock()}] ${depState(target)} (${elapsed}s)`);

  if (isFinal(depState(target))) break;

  await sweepStuck(all, new Date(target.created || Date.now()).getTime());

  if (Date.now() - startedAt > MAX_WAIT_MS) {
    fail(`Timed out after ${elapsed}s waiting for ${targetId} (state: ${depState(target)}).`);
  }
}

const finalState = depState(target);
const finalSha = shortSha(target);

if (finalState !== "READY") {
  const detail = await api(`/v13/deployments/${targetId}`).catch(() => ({}));
  fail(`Deployment ${finalState}: ${detail.errorMessage || "no error message reported"}`);
}
ok(`build READY for ${finalSha}`);

// The delayed Git webhook often drops a duplicate just after the build ends;
// clear it now so it does not block the next deploy.
await sweepStuck(await listDeployments(12), new Date(target.created || Date.now()).getTime());
log("");

// ─── 4. promote the production domains ───

log("3/4 promoting production domains");
const detail = await api(`/v13/deployments/${targetId}`).catch(() => ({}));
const assigned = new Set(detail.alias || target.alias || []);

if (domains.length === 0) {
  warn("no production domains configured on the project — skipping");
} else {
  for (const domain of domains) {
    if (assigned.has(domain)) {
      ok(`${domain} already points here`);
      continue;
    }
    try {
      await api(`/v2/deployments/${targetId}/aliases`, { method: "POST", body: { alias: domain } });
      ok(`${domain} assigned`);
    } catch (err) {
      // A domain already serving this deployment reports as a conflict — check
      // whether it simply points here after all before calling it a failure.
      try {
        const { alias } = await api(`/v13/deployments/${targetId}`);
        if ((alias || []).includes(domain)) {
          ok(`${domain} already points here`);
          continue;
        }
      } catch {
        /* fall through to the warning below */
      }
      warn(`could not assign ${domain}: ${err.message}`);
    }
  }
}
log("");

// ─── 5. verify the live site ───

log("4/4 verifying the live site");
let healthy = true;

/** The app bakes VERCEL_GIT_COMMIT_SHA into a <meta name="build-sha"> tag. */
function buildMarker(html) {
  return html.match(/<meta name="build-sha" content="([^"]+)"/)?.[1] || null;
}

async function probe(url) {
  const res = await fetch(url, {
    redirect: "follow",
    headers: { "cache-control": "no-cache", pragma: "no-cache" },
  });
  const body = await res.text();
  return {
    status: res.status,
    finalUrl: res.url,
    kb: body.length / 1024,
    marker: buildMarker(body),
    cache: res.headers.get("x-vercel-cache"),
    age: res.headers.get("age"),
  };
}

// Aliases are the authoritative answer to "which build does this domain serve?"
const promoted = await api(`/v13/deployments/${targetId}`).catch(() => ({}));
const servedAliases = new Set(promoted.alias || target.alias || []);
for (const domain of domains) {
  if (servedAliases.has(domain)) ok(`${domain} is aliased to this deployment`);
  else {
    healthy = false;
    warn(`${domain} is not aliased to ${finalSha} yet — run the script again if the API is lagging`);
  }
}

const newestProd = (await listDeployments(12)).find(
  (d) => d.target === "production" && depState(d) === "READY",
);
if (newestProd && depId(newestProd) === targetId) {
  ok(`production points at ${finalSha}`);
} else {
  healthy = false;
  warn(`production points at ${shortSha(newestProd)} — expected ${finalSha}`);
}

if (promoted.url) {
  try {
    const origin = await probe(`https://${promoted.url}/`);
    if (origin.finalUrl && !origin.finalUrl.includes(promoted.url)) {
      log("  · the deployment URL sits behind Vercel SSO protection — live domains are the real check");
    } else {
      ok(`origin serves build ${origin.marker || "(no marker)"} · ${origin.status} · ${origin.kb.toFixed(1)} KB`);
    }
  } catch (err) {
    throw new Error(`deployment URL unreachable: ${err.message}`);
  }
}

// The edge keeps serving the previous build briefly after a promotion, so give
// the marker a minute to catch up before calling the deploy stale.
const deadline = Date.now() + 60_000;
for (const domain of domains) {
  const url = `https://${domain}/`;
  let seen = null;

  while (true) {
    try {
      const res = await probe(url);
      if (!res.status.toString().startsWith("2")) {
        healthy = false;
        warn(`${url} → ${res.status}`);
        break;
      }
      seen = res;
      if (res.marker === targetShaShort) break;
      if (!res.marker) break; // deployment predates the build marker
      if (Date.now() > deadline) break;
      await sleep(7_000);
    } catch (err) {
      healthy = false;
      warn(`${url} unreachable: ${err.message}`);
      break;
    }
  }

  if (!seen) continue;
  if (!seen.marker) {
    ok(`${url} → ${seen.status} · ${seen.kb.toFixed(1)} KB (no build marker to compare)`);
  } else if (seen.marker === targetShaShort) {
    ok(`${url} → ${seen.status} · serving ${seen.marker} (edge: ${seen.cache || "n/a"} ${seen.age || ""})`);
  } else {
    healthy = false;
    warn(`${url} serves ${seen.marker}, expected ${targetShaShort} (edge cache: ${seen.cache || "n/a"})`);
  }
}

log("");
if (healthy) {
  log(`✅ deploy complete — ${finalSha} is live\n`);
} else {
  log(`⚠️  deploy finished but verification found problems (see warnings above)\n`);
  process.exit(1);
}
