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
