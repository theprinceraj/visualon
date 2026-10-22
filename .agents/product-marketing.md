# Product Marketing Context

**Document version:** v1
**Last updated:** 2026-10-22

Read by the marketing skills (cold-email, prospecting, offers). Prices and package contents come
from `src/data/site.ts`: if they change there, change them here too.

## Product Overview
**One-liner:** Short product videos made with AI from your real product, directed by a person, at fixed prices, delivered in days.
**What it does:** VisualOn (visualon.top) turns a link to a live product (its real UI, copy, colours and fonts) into a 15–45s
launch film, promo or ad. AI does the rendering, variants and re-cuts. A director chooses the idea and every cut and checks each render still by still.
**Product category:** Productized video service: "AI product videos", "launch video", "app promo video", "SaaS explainer".
**Product type:** Done-for-you service, paid upfront by card or UPI through Dodo Payments checkout on the site.
**Business model:** Fixed-price packages, one-time payment, tax included. Longer films or a series get a fixed quote by email.

| Package | USD | INR | Delivery | What's in it |
|---|---|---|---|---|
| Single | $19.99 | ₹1,199 | 48 hours | one 15–25s video, 1 format, scored music + sfx, poster frame, 1 revision |
| Launch kit (recommended) | $32.99 | ₹2,999 | 72 hours | 20–45s film in 9:16 + 1:1 + 16:9, captions + hashtags, poster frames, 2 revisions |
| Hook pack | $44.99 | ₹4,499 | 72 hours | 1 ad with 5 hook variants, 9:16 + 4:5, A/B test plan, 2 revisions |

Capacity: about 20 renders a day. If the queue is full, the buyer is told before paying.

## Target Audience
**Target companies:** Small software products with a visible UI and no good video: indie SaaS, mobile apps, browser
extensions, dev tools, AI tools, and small D2C/e-commerce brands. Typically 1–10 people, recently launched or about to launch.
**Decision-makers:** The founder or solo developer. They decide and pay on their own, on a card, the same day.
**Primary use case:** A video for a launch (Product Hunt, BetaList, app store listing, X/LinkedIn launch post, landing page hero) or a first set of paid-social ads.
**Jobs to be done:**
- "Show what my product does in 20 seconds, so visitors get it without reading."
- "Have something better than a screen recording to post on launch day."
- "Test a few ad openings without paying for a shoot."

## Personas
| Persona | Cares about | Challenge | Value we promise |
|---|---|---|---|
| Solo SaaS / app founder | Launch traction, looking credible | No time, no video skills, agency quotes are $1–5K | A launch film from the real product in 48–72h for the price of a lunch |
| Small D2C / e-com brand | Ad creative that converts | Shoots are slow and expensive; creatives fatigue fast | Five hook variants of one ad in 72h, no shoot |
| Local business with an app or QR product (restaurants, clinics, gyms) | Customers understanding the offer | No in-house marketing | A short vertical video for Instagram and WhatsApp |

## Problems & Pain Points
**Core problem:** Their product is hard to grasp from a static landing page or a store listing, and they have no video, or only a screen recording.
**Why alternatives fall short:**
- Agencies and production teams: $1,000+ and weeks of back-and-forth.
- Freelancers (Fiverr, Upwork): uneven quality, slow revisions, briefing takes hours.
- DIY tools (Canva, CapCut, screen recorders): look DIY, eat founder time.
- Raw AI video generators: invented screens, warped text, "AI slop" that hurts credibility.
See `src/pages/ai-studio-vs-freelancer-vs-agency.astro` for the comparison as published.
**What it costs them:** Launch-day posts and listings that get scrolled past; ad spend on weak creative.
**Emotional tension:** Worry that cheap AI video will look fake and embarrass them.

## Differentiation
**Key differentiators:**
- Built from the real, live product (real UI, copy, brand). No stock dashboards or invented features.
- Directed by a person, built on a single idea and a designed first 1.5 seconds.
- Fixed public prices, paid upfront, with delivery in 48–72 hours (some delivered in 1–2 hours).
- Music and sfx scored to the cut.
- Every render checked still by still ("anti-slop" review) before delivery.

## Objections
| Objection | Response |
|---|---|
| "AI video looks fake" | It starts from their actual interface. Point to a portfolio piece in their sector on visualon.top/work. |
| "Too cheap to be good" | Fixed price works because AI does the rendering. Judge by the work. |
| "I don't have a brief" | A link and two lines are enough. We propose the idea. |
| "Not launching right now" | A Single works for the store listing or landing-page hero any time. |
| "Can I use it in ads?" | Yes, for any lawful purpose once paid. Music is licensed for that (see /terms). |

**Anti-persona:** Companies that need live-action shoots, long-form (2min+) explainers, enterprise procurement or agency retainers. Also ebook and template sellers, who have no product UI to show.

## Customer Language
**Words to use:** launch film, product video, promo, ad, hook, real product, 48 hours, fixed price.
**Words to avoid:** leverage, unlock, stunning, cutting-edge, revolutionary, "AI-powered magic", synergy.

## Brand Voice
Calm, specific, a little dry. Short sentences. Site body copy is lowercase. Emails use normal sentence case. Show, don't claim: link one relevant film instead of describing quality.
**Never use:** em dashes or "it's not X, it's Y" lines in outreach. Never state what any client paid.

## Proof Points
**Customers:** 20 shipped client films on visualon.top/work across SaaS, apps, dev tools, e-commerce, fintech, education, local
(e.g. kōdlo, Bugwalk, PeerPush, AdMiro, TaskLoco, FlavorLinq, Lensmilk, GST Reco Pro). GitHub and Techolution pieces are concepts, not clients: never cite them as clients.
**Turnaround proof:** FlavorLinq delivered in 1 hour, TaskLoco in 2 hours (case-study "turnaround" lines).
**Testimonials:** none collected yet. Ask every paying client for one line.
**Value themes:**
| Theme | Proof |
|---|---|
| Speed | 1–2 hour turnarounds on FlavorLinq and TaskLoco |
| Real product, not slop | Every case study page shows scenes built from the client's actual UI |
| Range | 20 films across 8 sectors on /work, filterable by sector |

## Goals
**Business goal:** First steady paying clients from outbound, then repeat orders.
**Conversion action:** Paid Dodo checkout on visualon.top. Secondary: a reply asking for a sample or a quote.
**Attribution:** Outreach links carry `?ref=<lead id>`. It is stored in the browser and reaches Dodo as `metadata_ref`
(and the `Ref:` line of order or quote emails), so each payment can be matched to a lead in `outreach/leads.csv`.
**Current metrics (2026-10-22):** 13 cold emails sent 2026-10-12 (batch 1), 0 replies, 0 orders.

## Learnings
| Date | Learning | Evidence | Applies to | Status |
|---|---|---|---|---|
| 2026-10-22 | A price-led first email with links got no replies from 13 founders | Batch 1, 0/13 after 10 days | cold-email | Testing a permission-ask plus free-sample play instead (outreach/playbook.md) |

## Changelog
- v1 (2026-10-22): Initial context, drawn from site.ts, services.ts, work.json and the batch 1 outreach results.
