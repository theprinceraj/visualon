# Analytics

Google Analytics 4 tracks the whole path, from landing to paying: what people watch, how far down they read, which
package they open, where the order form loses them, and which outreach email or launch link brought them in. Cloudflare
Web Analytics still runs alongside it. That one is cookieless and ad blockers don't stop it, so it's the honest
baseline for raw visit counts.

| What | File |
|---|---|
| Loader, consent, attribution, `track()` and the list of event names | `src/scripts/analytics.ts` |
| Funnel, sections, clicks, previews, FAQ, currency | `src/scripts/main.ts` |
| Film playback, formats, scenes | `src/components/CaseFilm.astro` |
| Work filters | `src/pages/work/index.astro` |
| Purchase / failed payment | `src/pages/thanks.astro` |
| Cookie banner (Europe) | `src/components/ConsentBanner.astro` |
| Page type → GA "Content group" | `src/layouts/Base.astro` (`data-page` on `<body>`) |
| GA property config (dimensions, key events, retention, enhanced measurement) | `scripts/ga-setup.mjs` |

To add an event: add it to the table below, then to `EventName` in `analytics.ts`, then call `track()`. Add any new
parameter to `scripts/ga-setup.mjs` and run `npm run ga:setup`. GA drops parameters that aren't registered there from
every report.

## How it runs

- **On only in production.** `PUBLIC_GA_ID` (the `G-…` measurement id) is set in the production `vars` of
  `wrangler.jsonc`, and the script only loads on the site's own domain. Previews, `*.pages.dev` and local dev send
  nothing, so Dodo test orders never reach GA.
- **Debugging:** add `?ga_debug=1` to any page URL. That tab then sends to GA → Admin → DebugView, even from localhost (build
  with `PUBLIC_GA_ID=G-… npm run build && npm run preview`), and is marked internal so it stays out of reports.
  `?ga_debug=0` stops it.
- **Your own visits:** open `https://visualon.top/?internal=1` once on each of your browsers and phones. They then
  send `traffic_type=internal`, which the Internal Traffic filter drops. `?internal=0` undoes it.
- **Clean URLs:** GA gets the page URL without the hash and with only `utm_*`/`gclid` parameters. Payment ids, `?t=`,
  `?f=` and `?ref=` never appear in page reports.
- **Outreach attribution:** mail apps send no referrer, so `?ref=V014` would show up as "direct". The script turns it
  into `utm_source=outreach`, `utm_medium=email`, `utm_campaign=outreach`, `utm_content=V014`. Any other `?ref=`
  (for example `?ref=producthunt`) becomes `utm_source=producthunt / utm_medium=referral`. Links that already
  carry `utm_*` are left alone. The latest ref is also kept as the user property `lead_ref`, so a buyer can be
  traced back to the outreach email even if they come back days later.
- **Consent (Consent Mode v2):** no ad storage anywhere. In the EEA, the UK and Switzerland, analytics cookies stay off
  until the visitor accepts. Until then GA receives cookieless pings and models the missing data. Everywhere else
  cookies are on. The banner shows to visitors with a European time zone. The privacy page has buttons to change the
  choice from anywhere. The choice is stored in `localStorage` (`vo-consent`).
- **Cookies:** `_ga` and `_ga_<id>`, 13 months. Never sent: name, email, product link, brief, payment details.

## Events

Every event also carries `content_group` (page type: `home`, `work`, `work_index`, `service`, `compare`, `legal`,
`thanks`, `not_found`, `other`), so any report can be split by page type.

### Funnel

GA's standard ecommerce names, so **Reports → Monetization** (revenue, purchases and items) works without custom setup.

| Event | When | Parameters |
|---|---|---|
| `view_item_list` | Packages section scrolls into view (once per page) | `item_list_id` (`home`, `service:<slug>`...), `currency`, `items` |
| `select_item` | An order button opens the order dialog | `package`, `from` (section), `value`, `currency`, `item_list_id`, `items` |
| `order_form_error` | Order form check fails | `package`, `reason`: `name_missing` · `email_invalid` · `link_missing` · `brief_short` |
| `order_abandon` | Dialog closed without ordering | `package`, `fields_filled` (0–4), `last_field` |
| `begin_checkout` ★ | Order sent to Dodo checkout (waits ≤ 0.9 s for GA before leaving) | `package`, `value`, `currency`, `formats`, `feel`, `items` |
| `purchase` ★ | `/thanks` with `status=succeeded` (once per payment id) | `transaction_id` (Dodo payment id), `value`, `currency`, `package`, `items` |
| `payment_incomplete` | `/thanks` with any other status (failed, processing...) | `status`, `package`, `currency` |
| `generate_lead` ★ | Quote form sent, or an order sent by email (when a package has no Dodo product) | `method` (`quote_form` / `order_email`), `regarding`, `start`, `budget`, or `package` + `value` |

★ = key event (conversion).

### Engagement

| Event | When | Parameters |
|---|---|---|
| `page_view` | Every page (GA's own; enhanced measurement history changes are off) | |
| `section_view` | A page section reaches the middle of the screen (once each per page) | `section` (`work`, `method`, `packages`, `faq`, `contact`...) |
| `film_click` | Link to a work page clicked | `film` (slug), `list` (section it was in) |
| `preview_play` | Hover starts a preview (once per film per page) | `film`, `list` (`work_list`, section id) |
| `video_start` | A work-page film starts playing (once per film and format) | `film`, `ratio`, `video_duration`, `video_current_time` |
| `video_progress` | 25 / 50 / 75 % reached | `film`, `ratio`, `video_percent` |
| `video_complete` | Film ended | `film`, `ratio`, `video_percent=100` |
| `film_format` | Format chip picked (9:16, 1:1...) | `film`, `ratio` |
| `scene_click` | Scene in "scene by scene" clicked, or page opened with `?t=` | `film`, `scene`, `seconds`, `via` (`scene_list` / `url`) |
| `work_filter` | Sector filter on `/work` (also when arriving with `?f=`) | `filter`, `results`, `via` (`chip` / `link`) |
| `cta_click` | Any `.btn`, `.cta`, `.link-arrow` or nav link (not order buttons) | `cta_text`, `cta_location`, `link_url` |
| `email_click` | A mailto link | `location` |
| `faq_open` | FAQ answer opened (once each per page) | `question`, `list` |
| `currency_switch` | INR / USD toggle | `currency`, `list` |
| `consent_choice` | Cookie choice made | `choice`, `from` (`banner` / `page`) |

User properties: `lead_ref` (outreach id), `display_currency` (INR / USD).

Enhanced measurement adds `scroll` (90 %), outbound `click` and `file_download`.

## GA4 setup (once)

1. **Create the property:** analytics.google.com → Admin → Create property "VisualOn". Time zone India, currency USD (INR
   orders are converted). Then add a Web data stream for `https://visualon.top`.
2. **Put the measurement id in the site:** set `PUBLIC_GA_ID` in the top-level `vars` of `wrangler.jsonc` to the stream's
   `G-…` id, then merge and deploy. The id is public (it's in the page source), so it's fine in git.
3. **Configure the property:** run `GA_PROPERTY_ID=<property number> npm run ga:setup` (auth notes at the top of
   `scripts/ga-setup.mjs`; `-- --dry-run` first to see the plan). It:
   - registers the custom dimensions and metrics listed above
   - marks `begin_checkout` and `generate_lead` as key events (`purchase` already is one)
   - sets data retention to 14 months
   - turns off enhanced measurement's page-change, form, video and site-search events, which would double-count.

   Without the API, do the same by hand: Admin → Custom definitions, Key events, Data retention, and the stream's
   enhanced measurement gear.
4. **Internal traffic:** Admin → Data filters → "Internal Traffic" → set it to **Active**. GA creates it in Testing
   state, and it already matches `traffic_type=internal`. Then visit `/?internal=1` on your devices.
5. **Search Console:** Admin → Product links → Search Console links → link the `visualon.top` property. This shows which
   search queries bring visitors to which service pages.
6. **Leave Google signals off** (Admin → Data collection). The site runs no ads, and turning it on adds thresholding
   that hides rows from small reports.
7. **Check it:** open `https://visualon.top/?ga_debug=1`, scroll, open a package, play a film, and watch the events
   arrive in Admin → DebugView.

## Explorations to save (Explore → Blank)

Build these once and they update themselves. Use the Content group and custom dimensions above.

1. **Order funnel** (Funnel exploration, open funnel):
   `page_view` → `section_view` with section = packages → `select_item` → `begin_checkout` → `purchase`.
   Breakdown: Session source / medium. Shows which step loses people, by channel.
2. **Order form friction** (Free form): rows = Form error (`reason`) and Last field filled. Values = event count of
   `order_form_error` / `order_abandon`. Columns = Package.
3. **Which films sell** (Free form): rows = Film. Values = `video_start`, `video_progress` with Video percent = 75,
   `video_complete`, `film_click`. Then a Path exploration starting at `video_complete` to see what people do next.
4. **Homepage depth** (Free form): rows = Section, filtered to Content group = home, values = Total users. A big drop
   between two sections means the one above isn't doing its job.
5. **Outreach → orders** (Free form): rows = Lead ref. Values = Sessions, `select_item`, `begin_checkout`, `purchase`,
   Purchase revenue. Join with `outreach/leads.csv` by id.
6. **Service pages** (Free form): rows = Landing page, filtered to Content group = service. Values = Sessions, Key
   events, Purchase revenue. Pair with Search Console queries.

## Questions → where to look

| Question | Report |
|---|---|
| Where do visitors come from, and which channel buys? | Reports → Acquisition → Traffic acquisition (add Key events + Revenue) |
| How many people saw packages and how many checked out? | Exploration 1 (GA's built-in purchase/checkout journeys expect cart and shipping steps this site doesn't have) |
| Which package gets opened but not bought? | Exploration 1 broken down by Item name, plus Monetization → E-commerce purchases for revenue per package |
| Which films hold attention? | Exploration 3 |
| Did the Product Hunt launch bring buyers? | Traffic acquisition, source = producthunt (use `?ref=producthunt` on the PH link) |
| Which outreach emails worked? | Exploration 5 |
| Which searches bring buyers? | Search Console → Queries, with landing pages from exploration 6 |
| INR vs USD visitors? | Any report, add the Display currency dimension or Country |

## Limits

- `purchase` is sent from the browser on `/thanks`. A buyer who closes the tab before Dodo redirects them isn't
  counted, so Dodo's dashboard is the source of truth for revenue. Fix later: Dodo webhook → Cloudflare Pages Function →
  GA Measurement Protocol, with the GA client id passed in checkout metadata.
- Payments that are still `processing` on return are logged as `payment_incomplete` and never become a `purchase` in
  GA, for the same reason.
- Seeking a film forward fires every progress milestone it skips past, like GA's own YouTube tracking does.
- Ad blockers stop GA for part of a tech audience. Cloudflare Web Analytics shows the true visit count.
