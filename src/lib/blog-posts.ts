// ─── Blog Content ───
// Posts are stored as plain objects with markdown bodies (rendered by the
// lightweight markdown renderer in `render-markdown.tsx`). To publish a new
// post, add an entry here — newest first. No database, no external services.

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string; // ISO date
  readingTime: string;
  tags: string[];
  body: string; // markdown
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "stock-rejection-checklist-fix-and-resubmit",
    title: "The Stock Rejection Checklist: Fix, Resubmit and Win the Appeal (2026 Edition)",
    description:
      "Rejections kill more contributor income than bad keywords ever will. A field guide to the top rejection reasons on Adobe Stock — what each one really means, the fix that works, and when appealing is worth it.",
    date: "2026-09-20",
    readingTime: "8 min read",
    tags: ["Rejections", "Quality", "Adobe Stock", "Checklist"],
    body: `Every contributor hits the same wall eventually: a batch of uploads comes back rejected, the reasons are one-line cryptic phrases, and the temptation is to resubmit the exact same files and hope. That hope is expensive — repeated rejections on identical files can flag your whole account.

Rejections are not random. Each stock platform has a short list of recurring reasons, each with a specific fix. Learn the list once and your acceptance rate climbs permanently. This is that list.

## The Big Four Rejection Reasons (and What They Actually Mean)

### 1. "Focus" / Technical focus problems

The most common rejection, and the most misunderstood. Reviewers are not judging artistic blur — they're checking that the **intended subject is critically sharp** at 100% zoom.

**Fix:**
- Check every keeper at 100% before submitting — if the eyes of your subject (or the product's label, or the flower's stamen) are soft, it fails
- Watch for shutter speed below 1/focal-length handheld; watch for subject motion in video frame grabs
- Beware of "fake sharpness": heavy noise reduction smears detail, and reviewers zoom in

### 2. "Noise / artifacts" / technical issues

Grain in shadows, JPEG compression halos, purple fringing, demosaic mush.

**Fix:**
- Expose to the right (brighter, without clipping) so shadows carry clean data
- Export at maximum quality; compression artifacts from "optimized" exports are an instant rejection
- De-noise carefully: modern AI denoisers are fine, but check skin and fine texture at 100% — over-smoothed skin reads as "artifacts"

### 3. "Similar content" / already exists

The silent killer — your image is fine, but too close to something in the catalog (or to your own earlier upload).

**Fix:**
- Search your own portfolio before submitting a series; submit the **best one**, not five near-duplicates
- Change one strong variable per variant: different angle, different model pose, different setting — not just a crop
- AI creators: your generations are compared against the sea of AI content already there. Vary prompts meaningfully.

### 4. "Intellectual property" / trademark / property release

A logo on a t-shirt, a skyline with a protected building, a recognizable artwork on the wall.

**Fix:**
- Scout the frame before you shoot: remove branded props, mute visible logos, avoid identifiable private buildings
- AI generators still hallucinate brand-like shapes — inspect every generated image for pseudo-logos and text
- If it's genuinely unreleasable, it's unreleasable. No appeal survives a real trademark.

## The Silent Rejections Nobody Warns You About

- **Sparse keywording treated as lower quality:** files with 3 lazy keywords get flagged for "insufficient metadata" review queues more than you'd think
- **Aspect ratios reviewers dislike:** extreme crops leave nowhere for a buyer's text — "copy space" rejections are really composition rejections
- **AI files with wrong declaration:** declaring AI content as captured (or forgetting the declaration entirely) risks rejection and account review
- **Old technical standards on new files:** small sensor files at high ISO now fail where they passed in 2019 — reviewers' monitors got better

## Fix, Resubmit, Appeal — In That Order

1. **Read the reason literally, not emotionally.** "Focus" means focus — not "your style isn't welcome"
2. **Fix the specific failure.** One rejection reason per file; don't shotgun re-edits
3. **Wait between resubmits.** Fixing and instantly resubmitting the identical file reads as spam
4. **Appeal only when you're objectively right** — you have a release on file, the "trademark" is actually a generic shape, the focus is genuinely fine at 100%. A calm, factual appeal with evidence wins; an argument loses
5. **Track your rejection patterns.** Ten rejections for "noise" means your export pipeline has a problem, not ten bad files

## The Pre-Submit Checklist

Run every file through this 60-second check before upload:

- [ ] Sharp at 100% where it matters
- [ ] Shadows clean, no artifacts, export at max quality
- [ ] No logos, no recognizable IP, releases for people/property where needed
- [ ] Not a near-duplicate of your own catalog
- [ ] 25+ meaningful keywords, first 10 strongest
- [ ] Title written for search (subject first, no filler)
- [ ] AI declaration set correctly

## The Takeaway

Rejections are feedback at scale. The contributors with 90%+ acceptance rates aren't luckier — they've internalized this checklist until it's automatic. Fix the reason, resubmit clean, and appeal only from strength. Your acceptance rate is a skill, and skills compound.`,
  },
  {
    slug: "how-to-write-adobe-stock-titles-that-rank",
    title: "How to Write Adobe Stock Titles That Actually Rank",
    description:
      "Your title is the single strongest ranking signal on Adobe Stock. Here's the formula top contributors use — with real before/after rewrites you can copy.",
    date: "2026-09-18",
    readingTime: "6 min read",
    tags: ["Adobe Stock", "Titles", "SEO", "Keywords"],
    body: `On Adobe Stock, the title is not a label — it's the heaviest ranking signal your asset has. Two nearly identical images can be pages apart in search results purely because of how their titles are written. The good news: writing a ranking title is a formula, not a talent. Here's the formula.

## The Core Formula

> **[Subject] + [doing what] + [where/when] + [style/technique], with your most important keyword first.**

Adobe Stock's own guidance says titles should describe the image the way a colleague would over the phone — and their search engine rewards titles that front-load the literal subject. A ranking title is:

- **Descriptive, not decorative** — it states what's *in* the frame
- **Keyword-dense but human** — buyers should read it as a sentence
- **70–130 characters** — long enough to rank, short enough to stay sharp
- **Free of filler** — no "beautiful", "amazing", "high quality", "best"

## Real Before/After Rewrites

**❌ Before:**
> "Beautiful amazing business team working hard in modern office for success"

**✅ After:**
> "Business team collaborating around laptop in bright modern office, teamwork and financial planning concept"

Why it wins: starts with the exact keyword ("business team"), names the action ("collaborating"), the setting ("modern office"), and ends with buyer-intent concepts ("teamwork", "financial planning"). Zero filler.

---

**❌ Before:**
> "Sunset landscape 4K wallpaper background"

**✅ After:**
> "Golden sunset over calm ocean horizon with dramatic clouds, serene coastal seascape, copy space for text"

Why it wins: "sunset landscape" told the search engine almost nothing. The rewrite adds the specific subject (ocean horizon), the mood (serene), and a use-case buyers actually search for (copy space).

---

**❌ Before:**
> "Technology innovation digital transformation future concept"

**✅ After:**
> "Futuristic AI robot arm assembling circuit board in high-tech factory, automation and Industry 4.0 concept"

Why it wins: abstract concept titles rank for nothing. The rewrite names visible objects (robot arm, circuit board, factory) — which is exactly what the matching engine needs — then hangs the concepts on top.

## The Rules Behind the Rewrites

1. **First 3–5 words = your ranking keywords.** The engine weights the front of the title heaviest. Never open with "A", "The", or an adjective.
2. **Name what's visible.** If a human looking at the image wouldn't say the word, the search engine shouldn't rank it for it. Concepts go *after* the literal description.
3. **One title, one subject.** Don't cram three scenes into a title — the algorithm can't tell what the asset *is*, so it ranks it for nothing.
4. **End with use-cases.** "Copy space", "banner background", "web banner", "social media template" are searched constantly and almost never used as title openers.
5. **Match your first keywords.** Your title's opening phrase should reappear as your first 2–3 keywords. Consistency across fields reads as relevance.

## Filler Words That Kill Rankings

These appear in thousands of rejected and buried titles: *beautiful, amazing, awesome, stunning, high quality, best, great, wonderful, very, really, hd, 4k, wallpaper* (as a descriptor), *photo of, image of, picture of*.

Every filler word wastes characters the engine could be matching. If deleting a word changes nothing for a buyer's search, delete it.

## Scoring Your Own Titles

The fastest way to internalize this is mechanical feedback. Paste a draft into a scorer (StockPulse's Title Optimizer gives an A+–F grade with filler-word detection and a character weight map), fix what it flags, and re-score. After a dozen cycles you'll write 90+ titles on instinct.

## Titles Are Only Half the Pair

A perfect title with lazy keywords still underperforms — the two fields are read together. Your opening title phrase should be your #1 keyword, your title's concepts should appear in your keyword list, and nothing should contradict. Write the title first, then derive the keyword order from it — not the other way around.

Write the title like the match depends on it — because on Adobe Stock, it does.`,
  },
  {
    slug: "how-many-keywords-stock-photo-adobe-stock",
    title: "How Many Keywords Should a Stock Photo Have? (Adobe Stock Best Practices)",
    description:
      "The 49-keyword limit is a trap if you fill it blindly. Here's how keyword count, order and specificity actually affect your Adobe Stock (and Shutterstock) rankings.",
    date: "2026-09-18",
    readingTime: "5 min read",
    tags: ["Keywords", "Adobe Stock", "SEO"],
    body: `Ask ten contributors how many keywords a stock photo needs and you'll get ten answers. The platforms don't help — Adobe Stock allows up to 49 keywords, Shutterstock up to 50, and neither explains how the count changes your visibility. Here's what actually matters.

## The Short Answer

**35–45 keywords for Adobe Stock, with the first 10 chosen like they're the only ones that exist.** Below ~25 keywords you're leaving discoverability on the table. Above ~49 you're just padding — and padding can actively hurt you.

## Why Order Beats Count

Adobe Stock's search engine weights your keywords by position. The first keyword carries the most ranking power, the tenth carries far less, and keyword #40 is close to decorative. This has a practical consequence most contributors miss:

> Your first 10 keywords should be the exact phrases a buyer would type — not clever variations of them.

If your photo is a golden retriever puppy sleeping in a sunlit room, the first keywords should be *golden retriever, puppy, dog, sleeping, cute* — not *adorable, domestic animal, canine companion, fur baby*.

## The Keyword Pyramid

A well-keyworded asset has three layers:

1. **Core subject (1–8):** the literal thing in the frame — objects, people, actions. These match buyer searches 1:1.
2. **Context & attributes (9–25):** setting, mood, colors, style, composition — *sunset, beach, tropical, vacation, horizontal*.
3. **Concepts & use-cases (26–45):** what the image *means* — *freedom, new beginning, summer travel, copy space, banner background*. These long-tail terms have less competition and quietly accumulate downloads over years.

Skipping layer three is the most common mistake. Conceptual keywords are how an ordinary beach photo keeps selling for a decade.

## When More Becomes Worse

Keyword stuffing is detectable — and it backfires:

- **Irrelevant keywords** violate platform guidelines and can get assets rejected or accounts flagged.
- **Duplicate-variation padding** (*dog, dogs, doggy, doggie*) dilutes your ranking signal instead of adding to it.
- **One-word spam** in single-keyword fields (Shutterstock's arrangement) reads as noise to the matching engine.

If a keyword wouldn't help a buyer *find* or *select* your image, it doesn't belong on the list.

## Exact Counts by Platform

| Platform | Recommended | Hard limit | Notes |
| --- | --- | --- | --- |
| Adobe Stock | 35–45 | 49 | Order matters; first 10 carry the most weight |
| Shutterstock | 25–50 | 50 | Keywords typed individually; order matters less |
| Freepik | 15–30 | 30 | Fewer, more precise terms win |
| Vecteezy | 15–25 | 15+ | Subject-first |

## Doing This at Scale

Hand-writing 40 ordered keywords per file is where most contributors give up — and where quality collapses. An AI metadata generator that *understands the hierarchy* (subject → context → concept) and orders keywords accordingly changes the math completely. Generate the draft automatically, then spend your 30 seconds reviewing the top 10 — that's the 80/20 of stock metadata in 2026.

The contributors who treat keywords as a ranking system — not a chore — are the ones whose year-old uploads still sell every week.`,
  },
  {
    slug: "seasonal-stock-content-upload-timing",
    title: "Seasonal Stock Content: Upload 3 Months Early or Lose the Season",
    description:
      "Buyers search for Christmas content in October and Valentine's in December. Here's the full upload calendar microstock contributors should follow, and why late uploads are worthless.",
    date: "2026-09-18",
    readingTime: "5 min read",
    tags: ["Seasonal", "Strategy", "Adobe Stock"],
    body: `Every year, thousands of contributors upload their best Christmas imagery in December — and earn almost nothing from it. Not because the content is bad, but because they've already missed the entire buying window. Seasonal stock is a game of lead time, and the lead time is longer than you think.

## Why Buyers Shop Months Ahead

The people buying stock aren't consumers — they're designers, marketers and agencies working on campaigns that launch *on* the holiday. A Christmas retail campaign needs its assets approved, printed and distributed before December 1st. That means designers are searching for and downloading Christmas imagery in **October** — sometimes September.

By the time the holiday arrives, the buying is over. The search volume you see in December is procrastinators; the real money changed hands weeks earlier.

## The Working Calendar

Upload your content roughly **3–4 months before the event**. Working backwards through the year:

- **September–October** → Christmas, New Year, winter holidays
- **October–November** → Valentine's Day, Valentine's graphics
- **December–January** → Easter, spring, St. Patrick's Day
- **February** → Mother's Day, Father's Day, graduation
- **May–June** → back-to-school, Halloween concepts
- **June–July** → Thanksgiving, Black Friday, Diwali
- **August** → the following year's New Year calendars and '2027' content (yes, that early)

## Don't Ignore the Micro-Observances

The big holidays are a bloodbath — millions of competing assets. The interesting money is in smaller observances:

- **World Emoji Day, National Coffee Day, International Cat Day**
- **Earth Day, Mental Health Awareness Month, World Water Day**

These have real buyer demand (awareness campaigns need content every year) with a fraction of the competition. A calendar of observances — like the Events tool inside StockPulse — is enough to build a year-round content plan from.

## The Compounding Effect

Seasonal assets don't just sell once. Every year, your Halloween set from 2024 competes again in 2025 — with two years of downloads, reviews and search history behind it. Old, well-keyworded seasonal content is an annuity. New, late-uploaded seasonal content is a lottery ticket.

## The Practical Workflow

1. **Check the calendar** for events 3–4 months out
2. **Research keywords** for those events now (see what ranked last year — it's all in the search results)
3. **Create and upload early** — September for Christmas, not November
4. **Refresh annually** — update numbers ('2027' instead of '2026'), re-upload variants of last year's best sellers

The contributors earning consistently in November are the ones who worked in July. Seasonal stock isn't about working more — it's about working *earlier* than everyone else.`,
  },
  {
    slug: "ai-generated-content-rules-stock-platforms",
    title: "AI-Generated Content on Stock Platforms: The 2026 Rules That Actually Matter",
    description:
      "Adobe Stock accepts AI content, Getty bans it, Shutterstock waffles. A plain-English breakdown of every major platform's AI policy — and how to stay compliant.",
    date: "2026-09-18",
    readingTime: "6 min read",
    tags: ["AI Content", "Policy", "Adobe Stock"],
    body: `AI-generated imagery went from novelty to a third of new stock submissions in about two years. The platforms' responses range from enthusiastic to hostile — and the rules keep shifting. Here's the state of play, and the compliance checklist that keeps your account safe on every platform.

## Platform-by-Platform

**Adobe Stock — Accepts AI, with strict rules.** The largest AI-friendly marketplace requires:

- Marking submissions as **'Created using generative AI'** during upload
- An **'illustration'** designation (never submitted as photo/video)
- **No real people, real places, or trademarked elements** in the image
- A **model release** only if the person depicted is indistinguishable from a real person
- Compliance with their generative AI **content guidelines** (no deepfakes, no offensive content)

**Getty Images / iStock — Rejects AI entirely.** Don't submit AI content there, full stop. They've built their brand on provenance and licensing certainty.

**Shutterstock — Accepts AI through their own tools** and has licensing deals with AI companies; direct AI uploads from contributors have been restricted. Check their current contributor terms before submitting — this policy has moved more than once.

**Freepik, Vecteezy, Pond5** — Freepik and Vecteezy accept AI content with AI-content labeling requirements. Pond5 (video-heavy) follows a similar labeling approach. Always tick the AI disclosure box if one exists — mislabeling is the fastest way to get rejected.

## The Universal Compliance Checklist

Whichever AI-friendly platform you submit to, these five rules keep you out of trouble:

1. **Label it.** Every platform with AI acceptance requires disclosure. An 'AI' checkbox exists somewhere in the upload flow — find it and use it.
2. **No real people without releases.** A photorealistic AI face still counts as a recognizable person. Either keep faces stylized, generic or clearly illustrated — or provide releases where the platform allows them.
3. **No brands, logos or landmarks.** AI models love generating fake Nike swooshes and iPhones. Crop, inpaint or prompt them away before submission — trademark rejection is the #1 AI-content rejection reason.
4. **Fix the artifacts.** Six-fingered hands, warped text, impossible geometry. Reviewers reject on technical quality just like photography.
5. **Metadata like any other asset.** AI content competes by the same search rules — accurate titles, honest keywords, correct categories.

## The Honest Downsides Nobody Mentions

- **Saturation.** Generic AI content floods every niche hourly. Standing out requires concepts and series, not single pretty renders.
- **Buyer trust.** Some enterprise buyers filter AI content out. Your non-AI assets remain your credibility portfolio.
- **Policy drift.** These rules change quarterly. Re-read each platform's contributor guidelines every few months — especially Shutterstock's.

## Where AI Genuinely Helps

The contributors doing best with AI treat it as a *production accelerator inside a human-led workflow*: generate drafts, curate ruthlessly (submit 5% of what you render), fix artifacts, then apply serious keywording — often with AI metadata tools on top. AI creating the image is optional; AI assisting the pipeline is the actual edge in 2026.`,
  },
  {
    slug: "best-ai-tools-microstock-sellers-2026",
    title: "The 7 Best AI Tools for Microstock Sellers in 2026",
    description:
      "From AI metadata generators to trend forecasting — the tools that actually save time and increase downloads for Adobe Stock, Shutterstock and Freepik contributors.",
    date: "2026-09-18",
    readingTime: "6 min read",
    tags: ["AI Tools", "Microstock", "Adobe Stock", "Keywords"],
    body: `Microstock has a throughput problem. The platforms reward volume — contributors with thousands of assets earn exponentially more than those with hundreds — but every asset needs a title, a description and up to 50 keywords before it can earn anything. Writing that metadata by hand takes five to ten minutes per file.

That's where AI tooling has quietly changed the economics of the business. Here are the seven tool categories worth your time in 2026, and how to chain them into a workflow.

## 1. AI Metadata Generators (The Big One)

This is the highest-ROI category, full stop. An AI metadata generator looks at your image and writes a platform-optimized title, description and keyword list in seconds.

What separates a good one from a toy:

- **Platform-specific rules.** Adobe Stock wants a 200-character descriptive title; Shutterstock's title field works differently; Freepik has its own keyword norms. One generic output for all platforms leaves downloads on the table.
- **Keyword count control.** Adobe Stock indexes up to 49 keywords. The first ~10 carry the most ranking weight, so the order matters as much as the count.
- **Batch processing.** If it can't chew through 50 files while you make coffee, it doesn't solve the throughput problem.

StockPulse's MetaGen runs on your own API keys (OpenAI, Gemini, Claude, Grok, Mistral or OpenRouter), writes per-platform metadata, scores each result for quality, and exports the exact CSV format each platform expects. Because the keys are yours, a 500-file batch costs pennies.

## 2. Download Trackers

You can't improve what you don't measure. A good tracker polls live download counts for your asset IDs and keeps a history, so you can see which niches actually convert rather than guessing.

The killer feature is competitor tracking: enter any contributor ID and you can see their whole portfolio with real download counts. When you find a contributor earning consistently in a niche, you've found a niche worth entering.

## 3. Keyword Research Tools

Stock search engines are keyword-matching engines. Before shooting or generating anything, check the demand-to-competition ratio of your target keywords. The sweet spot is rising search volume with medium competition — those keywords are where new uploads can actually rank.

## 4. Trend Forecasters

Seasonal demand is predictable months ahead: buyers search for Christmas content in October and tax-season imagery in January. Trend tools that surface what's rising right now let you upload *before* the saturation wave, not after.

## 5. Title Optimizers

A title that reads naturally to humans and keyword-densely to algorithms is a skill. Optimizer tools score your draft (filler words, length, keyword placement) and show exactly which words carry ranking weight — turning a guessing game into a checklist.

## 6. Creative Utilities

Dither and halftone effects, color palette extraction, device mockups, bento grids — these fill specific content gaps that sell steadily: textures, abstract backgrounds, tech mockups. They also differentiate your portfolio from the millionth generic AI render.

## 7. Vector Converters

SVG-to-EPS conversion is a daily chore for vector contributors, since stock platforms want print-ready EPS. In-browser converters that never upload your files are both faster and safer for client work.

## Putting It Into a Workflow

The compounding comes from chaining them:

1. **Trend forecaster** → pick a rising niche
2. **Keyword analyzer** → find the low-competition keywords in that niche
3. **Create** content targeting those keywords
4. **AI metadata generator** → platform-perfect titles and keywords
5. **Title optimizer** → push each title above an 80 score
6. **Tracker** → after 60 days, double down on what's converting

Ten minutes of research before creating beats ten hours of re-keywording after. The contributors winning in 2026 aren't necessarily more talented — they're instrumented.`,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllPostSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug);
}
