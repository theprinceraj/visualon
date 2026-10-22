# Outreach playbook

What we send, to whom, and why. The rules for tracking and sending are in [README.md](README.md).

## The play: a free opening, then the film

Batch 1 (13 founders, 2026-10-12) pitched the $19.99 Single with links in the first email. After 10 days it had **no
replies**. A price in a cold email asks for a buying decision from someone who has never seen our work on their
product. We sell something people can see, so we show it first:

1. **First email asks permission, with no link.** Name one specific thing about their product or launch, and offer to
   make a free **6-second opening shot** of their product from their live site. One-line reply to accept.
2. **On "yes", make it within 24 hours.** A 5–8 second 9:16 opening built from their real UI, the kind of first 1.5
   seconds our films open with. Small `visualon` mark, 720p, no music licence. Reply with the clip and one link to
   the matching package (`?ref=<id>`).
3. **Then sell the whole film.** "Want the full 20 seconds? It's the Single, $19.99, back in 48 hours." Suggest the
   Launch kit when they're launching soon, or the Hook pack if they run paid ads.

The sample is cheap to make (one of about 20 renders a day) and only goes to people who asked for it. That caps the
free work at people who are already interested. Judge the play after about 100 first emails, not 13. Measure replies,
then the yes rate, then sample-to-order.

## Who to target (ICP)

A lead must pass all of these:

- [ ] A **software product with a visible UI**: SaaS, mobile app, browser extension, dev tool, AI tool or D2C store.
      Not ebooks, templates, courses or agencies.
- [ ] **Live or launching soon**: a working site or store listing to build from.
- [ ] **No good video**: none on the landing page or store listing, or only a raw screen recording.
- [ ] **A person can be reached**: founder or developer email (not a `noreply@`), or a contact form at worst.
- [ ] **Small**: about 1–20 people. Over 50 people usually means an in-house team or agency.

**Tier A** (contact first): launched in the last 30 days or launching within 30 days (Product Hunt "upcoming",
BetaList, a launch post on X). Turn timing into the hook ("saw you're launching on Product Hunt next week").
**Tier B**: passes the checklist, no timing signal. **Tier C**: unclear fit, contact last.

Skip: big brands, anyone already with a polished video, adult, gambling, crypto-casino, or anything we wouldn't put on /work.

## Where to find them

Best timing signal first:

| Source | Why | What to collect |
|---|---|---|
| Product Hunt, upcoming and new launches | Launch date known, launch-day video is the obvious need | Maker name, site, launch date |
| BetaList (new and upcoming) | Pre-launch and just launched, usually solo founders | Site, launch date, contact on site |
| X `#buildinpublic`, "launching", "just shipped" posts | Founder voice, gives a real hook | Handle, product, what they posted |
| Show HN, Indie Hackers products, Peerlist Launchpad, Microlaunch, Uneed | Indie launches | Maker, site |
| Google Play and Chrome Web Store, new and recently updated | Listings with no promo video | Developer email on the listing |
| Shopify / D2C brands running Meta ads (Meta Ad Library) | Already pay for ads, so the Hook pack fits | Brand site, ad count |

Use public pages only. Never scrape LinkedIn. The `prospecting` skill (`references/demand-signals.md` and
`saas-prospecting.md`) covers qualifying in more depth.

## Which film to show

Pick one film from /work in their sector, and link only after they say yes (or in follow-up 2):

| Their product | Show | Or link |
|---|---|---|
| SaaS / web app | `/work/kodlo`, `/work/admiro` | `/saas-launch-videos` |
| Dev tool | `/work/bugwalk`, `/work/peerpush` | `/work?f=devtools` |
| Mobile app / extension | `/work/taskloco`, `/work/parkkolkata` | `/app-promo-videos` |
| E-commerce / D2C | `/work/lensmilk`, `/work/headel` | `/ecommerce-product-videos` |
| Restaurant / local | `/work/flavorlinq`, `/work/scan4feedback` | `/restaurant-videos` |
| Fintech | `/work/gst-reco-pro`, `/work/dbt-invoice` | `/work?f=fintech` |
| Education | `/work/solacc`, `/work/mindmates` | `/work?f=education` |

Always add `?ref=<lead id>` to the link.

## Email templates

Templates show the shape. Rewrite every email around the real hook: if you can delete the first line and the email
still makes sense, the personalization isn't working. Plain text, lowercase subject of 2–4 words, no em dashes,
contractions. Sign as Prince, VisualOn.

### First email (day 0, no link)

> **Subject:** {product} launch clip
>
> Hi {name},
>
> Saw {product} on {source}. {One specific observation, e.g. "the price-alert flow is the clearest part of the page, but
> there's no video showing it"}.
>
> I make short product videos from the real app. Want me to make a free 6-second opening shot from your live site so you
> can see how it would look? No call, nothing to fill in.
>
> Prince, VisualOn
>
> If this isn't for you, reply "no" and I won't email again.

### Follow-up 1 (day 4): a new angle

> **Subject:** re: {product} launch clip
>
> Hi {name}, one more thought: {a timing reason, e.g. "with launch day on the 28th, a moving clip at the top of the
> post would show the price alerts faster than the screenshots do"}. The offer stands: a free 6-second opening from {product}'s real UI, back
> within a day. Just reply "yes".

### Follow-up 2 (day 10): proof, one link

> Hi {name}, here's one we made for another {sector} product, built from their live UI and delivered in {n} hours:
> https://visualon.top/work/{slug}?ref={id}. Happy to do a free opening shot for {product} the same way.

### Breakup (day 21): then `no_response`

> Hi {name}, I'll stop here. If a launch video is ever on the list, the Single is {price} and comes back in 48 hours:
> https://visualon.top/?ref={id}. Good luck with {product}.

### Batch 1 follow-up (they already got a pitch)

Batch 1 leads (V001–V013) heard the price first. Their next email is follow-up 1, with the free-sample angle:

> **Subject:** {product} opening shot
>
> Hi {name}, I emailed last week about a video for {product}. Easier way to judge: want me to make a free 6-second
> opening from your live {site/listing}? If you like it, we finish it. If not, no follow-up from me. Just reply "yes".
>
> If this isn't for you, reply "no" and I won't email again.

Then follow-up 2 and the breakup as above.

## Replies

Answer within a few hours, from the same thread. Stop all follow-ups the moment anyone replies.

| Reply | Do |
|---|---|
| "yes" / "sure" | Status `replied`. Ask for nothing more. Build the clip from the live site and send it within 24h. Status `sample_sent`. |
| Asks the price | Give the one package that fits, in their currency, with the link and `?ref=`. Status `quoted`. |
| Wants something bigger | Ask for the length, formats and deadline. The owner quotes a fixed price. Status `quoted`. |
| "not now" | Ask when to check back. Set `next_action_date` to that date. |
| "no" / "stop" / unsubscribe | Reply once, politely ("Got it, won't email again"). Status `do_not_contact`. |
| Wrong person | Thank them and ask who handles marketing. Log it. |
| Auto-reply / out of office | Not a reply. Keep the sequence and push the next date past their return. |

After a sample, follow up once in 3 days ("did the opening work for you?"), and once more a week later with a different
format idea, then stop.

After a **won** order: deliver, then ask for one line of feedback for the site and if we can put the film on /work.
Add the quote to Proof Points in `.agents/product-marketing.md`.

## Weekly review

Every week, count first emails, replies, yeses, samples, orders and revenue from `log.csv` and `leads.csv`. Add one
line to Learnings in `.agents/product-marketing.md`. Change one thing at a time (subject, hook type, sample length,
source) so you can tell what worked.
