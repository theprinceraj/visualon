# Client outreach tracker

This folder is the record of every founder we have found, emailed or ruled out as a possible VisualOn client. Check it
before contacting anyone, and update it after every message. **What to send** is in [playbook.md](playbook.md). Who we
sell to, prices and proof are in [`.agents/product-marketing.md`](../.agents/product-marketing.md).

| File | What it holds | In git? |
|---|---|---|
| `README.md` | These rules. | yes |
| `playbook.md` | The play, where to find leads, email templates, reply handling. | yes |
| `leads.csv` | One row per lead: product, contact, status, next action. | **no** (private) |
| `log.csv` | One row per message sent or received, oldest first. Never edit or delete a line. | **no** (private) |
| `archive-2026-10-12.md` | The old `outreach.md` list, kept for reference. `leads.csv` replaces it. | **no** (private) |

The CSVs hold other people's contact details, so they are gitignored. Back them up outside the repo. Both are UTF-8 CSV.
If you edit them in Excel, save as **CSV UTF-8**, or `₹` will be corrupted.

Agents: the marketing skills used here are `prospecting` (finding and qualifying leads), `cold-email` (copy, follow-ups,
replies) and `offers` (shaping the offer), from [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills).
They read `.agents/product-marketing.md` first. These rules override anything in them.

## Rules

1. **Search before contacting or adding anyone.** One company can show up under a product name, a domain, a studio
   name and several emails. Search for all of them:

   ```sh
   grep -i "domain_or_email_or_name" outreach/leads.csv outreach/log.csv
   ```

   If something matches, update that row instead of adding a new one.
2. **Never contact a lead whose status is `declined`, `no_response`, `bounced` (same address), `lost` or `do_not_contact`.**
3. **The owner approves each batch.** An agent may send a batch through Gmail only after the owner has approved it,
   then logs every message it sent. It never starts a new batch on its own.
4. **At most four emails per lead:** the first email plus up to three follow-ups, on roughly days 0, 4, 10 and 21.
   Every follow-up adds something new (see playbook). The fourth email is the breakup: after it, set
   `no_response` and never write again. Stop the moment they reply.
5. **Log every message.** Add a line to `log.csv`, then update the lead's `status`, `last_contacted`, `follow_ups`,
   `next_action` and `next_action_date`.
6. **Plain text, personal, short.** Under about 80 words for a first email, no attachments, no images, no link in the
   first email and at most one link after that. Each email must mention something real about their product (from their
   site, listing or launch post). Identical bodies with the name swapped are not allowed.
7. **Every email ends with an opt-out line**: `If this isn't for you, reply "no" and I won't email again.` Anyone who
   says no, or asks to stop, becomes `do_not_contact` that same day. Leave the postal address out by default. Add
   `Belghoria, Kolkata, West Bengal, India` under the signature only where the law requires it: commercial email to
   leads known to be in the US (CAN-SPAM).
8. **One currency per lead.** Indian leads see INR only, everyone else USD only (`market` column).
9. **Pace sends.** One at a time, a minute or more apart, and **no more than 15 emails a day** in total (first emails
   and follow-ups together) from `profile.princeraj@gmail.com`. Prefer Tuesday–Thursday mornings in the lead's timezone. If any batch bounces over 2%,
   stop and verify the rest of the list.
10. **Every link carries the lead's id**: `https://visualon.top/work/<slug>?ref=<id>` (or the homepage). The site
    keeps the code and passes it to Dodo as `metadata_ref`, so a payment can be matched to its lead. When a payment
    arrives, check its `metadata_ref` and set that lead to `won`.
11. **Never state what a client paid**, never cite the GitHub or Techolution concept pieces as clients, and never
    promise delivery faster than `site.ts` says (48h Single, 72h others).

## Statuses

| Status | Meaning |
|---|---|
| `new` | Found, not qualified or contacted yet. |
| `qualified` | Checked against the ICP in the playbook. Has a tier and a hook, ready for a first email. |
| `contacted` | First email sent, waiting. |
| `followed_up` | One or more follow-ups sent (count in `follow_ups`), waiting. |
| `replied` | They replied and the conversation is open. Note the gist in `reply_summary`. |
| `sample_sent` | We sent the free opening clip. Date in `sample_sent`. |
| `quoted` | We sent a price or a custom quote. |
| `won` | They paid. Put the package and date in `order`. |
| `lost` | They engaged, then went with someone else or no video. Can be re-contacted after 90 days with something new. |
| `declined` | They said no. Do not contact again. |
| `no_response` | No reply after the breakup email. Do not contact again. |
| `bounced` | That address does not exist. Try a different address once, never the same one. |
| `do_not_contact` | Must never be contacted (they asked us to stop, or a competitor). |

## `leads.csv` columns

| Column | Notes |
|---|---|
| `id` | `V001`, `V002`, … Never reuse or renumber. New leads take the next id. Also the `?ref=` code in links. |
| `product`, `website` | Product name and its domain, so duplicates are easy to find. |
| `contact_name`, `email` | The founder's name if known. Several emails separated by `; `. |
| `other_contact` | X, LinkedIn, contact forms, Product Hunt or BetaList pages. |
| `market` | `IN, INR` or `foreign, USD`. |
| `source`, `found_on` | Where we found them (BetaList, Product Hunt, Google Play, …) and when. |
| `about` | What the product does, in one line. |
| `signal` | Why now: launched on X date, launching soon, no video on site, new store listing, raising, hiring. |
| `hook` | The specific thing we noticed to open the email with, and which film on /work to show. |
| `tier` | `A`: launching or launched in the last 30 days, no good video, founder reachable. `B`: good fit, weaker timing. `C`: long shot. |
| `status`, `batch` | Status from the table above. Batch number of the first email. |
| `first_contacted`, `last_contacted` | `YYYY-MM-DD`. |
| `follow_ups` | Follow-ups sent so far (0–3). |
| `last_reply`, `reply_summary` | Date and gist of their latest reply. |
| `sample_sent` | Date the free opening clip was sent, and its link. |
| `order` | Package, currency and date once paid (e.g. `launch, USD, 2026-10-30`). Never shown publicly. |
| `next_action`, `next_action_date` | What happens next and when. Blank when nothing is planned. |
| `notes` | Anything else. |

## `log.csv` columns

`date`, `time`, `lead_id`, `lead_name`, `channel`, `direction` (`out` or `in`), `kind` (`first_contact`,
`follow_up`, `breakup`, `reply`, `sample`, `quote`, `order`, `bounce` or `status_change`), `address`, `summary`
(the subject line in quotes, plus what was offered or said).

## Sending

All outreach goes out from `profile.princeraj@gmail.com` through Gmail on the web, replying in the original thread for
follow-ups. That is also the address on the site and receipts, so if it gets flagged as spam, real customer email
suffers too: keep to 15 a day. Before raising volume, move cold email to a separate mailbox on a second domain with SPF,
DKIM and DMARC set up, and warm it up for 2–3 weeks first.
The `cold-email` skill's `references/deliverability.md` has the setup.
