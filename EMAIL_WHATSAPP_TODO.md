# Vibio — Email & WhatsApp: What Works, What's Missing, What To Do

> Audit date: 2026-07-25 · Branch `brandlogo`
> Scope: everything in the project that sends an **email** or a **WhatsApp** message.

---

## 1. Quick verdict

**The code is ~90% done. Nothing is actually delivered today because zero credentials are configured.**

Right now, if you place an order or submit the contact form:
- Email → **skipped** (no `RESEND_API_KEY`) — you only get a `WARN` in the API logs.
- WhatsApp → **skipped** (no Meta/Twilio credentials) — the `LogProvider` prints the message to the console instead of sending it.

Both channels fail *silently by design* (they never break the customer's request), so the app looks like it works while nothing leaves the server.

There are also **4 real code/config bugs** (§4) that will still bite you after you add the keys.

---

## 2. Architecture — how it works today

```
                          ┌──────────────────────────────┐
  Customer actions        │  NotificationsService        │   Resend API
  ───────────────         │  (single funnel)             │──► (customer + admin emails)
  register  ──────────┐   │                              │
  forgot password ────┤   │  sendWelcome                 │
  place order ────────┼──►│  sendPasswordReset           │
  contact form ───────┤   │  sendOrderConfirmation       │   WhatsAppService
  callback form ──────┤   │  sendShippingUpdate          │──► provider adapter
  product inquiry ────┤   │  sendWhatsAppOrderConfirm.   │      ├─ MetaCloudProvider
  newsletter ─────────┤   │  notifyAdmin  ◄── THE hub    │      ├─ TwilioProvider
  order modification ─┘   │  sendAdminNewOrder           │      └─ LogProvider (fallback)
                          └──────────────────────────────┘
```

### Key files

| File | Role |
|---|---|
| [api/src/notifications/notifications.service.ts](api/src/notifications/notifications.service.ts) | All email templates + `notifyAdmin` (the single admin-alert funnel) |
| [api/src/notifications/whatsapp/whatsapp.service.ts](api/src/notifications/whatsapp/whatsapp.service.ts) | Provider adapter: Meta Cloud API / Twilio / log-only fallback |
| [api/src/submissions/submissions.service.ts](api/src/submissions/submissions.service.ts) | Persists every form, then calls `notifyAdmin` |
| [api/src/orders/orders.service.ts](api/src/orders/orders.service.ts#L165-L251) | Order confirmation (customer) + `notifyAdminOnce` (owner, at-most-once) |
| [api/src/auth/auth.service.ts](api/src/auth/auth.service.ts#L58) | Welcome email + password reset email |
| [web/lib/storeConfig.ts](web/lib/storeConfig.ts) | Store phone / WhatsApp / `wa.me` link builder |
| [web/components/common/PhoneOrder.tsx](web/components/common/PhoneOrder.tsx) | Customer-side "Order by phone / WhatsApp" buttons |
| [docs/EMAIL_SETUP.md](docs/EMAIL_SETUP.md) | Existing (partial, Twilio-only) setup doc |

---

## 3. Inventory — every email & WhatsApp flow

### 3.1 Emails (Resend)

| # | Trigger | To | Template | Code wired? | Sends today? |
|---|---|---|---|---|---|
| E1 | User registers | Customer | `welcomeTemplate` | ✅ | ❌ no key |
| E2 | Google first login | Customer | `welcomeTemplate` | ✅ | ❌ no key |
| E3 | Forgot password | Customer | `passwordResetTemplate` | ✅ | ❌ no key (link is logged to console as fallback) |
| E4 | Order placed | Customer | `orderConfirmationTemplate` | ✅ | ❌ no key |
| E5 | Status → `SHIPPED` | Customer | `shippingUpdateTemplate` | ✅ | ❌ no key |
| E6 | Order placed | **Store owner** | `adminRequestTemplate` | ✅ | ❌ no key |
| E7 | Contact form | **Store owner** | `adminRequestTemplate` | ✅ | ❌ no key |
| E8 | Callback request | **Store owner** | `adminRequestTemplate` | ✅ | ❌ no key |
| E9 | Product inquiry | **Store owner** | `adminRequestTemplate` | ✅ | ❌ no key |
| E10 | Newsletter signup | **Store owner** | `adminRequestTemplate` | ✅ | ❌ no key |
| E11 | Order modification request | **Store owner** | `adminRequestTemplate` | ✅ | ❌ no key |

**Not implemented at all (decide if you want them):**
- ❌ No acknowledgement email to the *customer* after contact / callback / inquiry ("we received your message").
- ❌ No newsletter welcome email, no double opt-in, no unsubscribe link (⚠️ GDPR/CAN-SPAM risk).
- ❌ No "order cancelled / refunded" email.
- ❌ No "back in stock" / abandoned cart emails.

### 3.2 WhatsApp

| # | Trigger | To | Code wired? | Sends today? |
|---|---|---|---|---|
| W1 | Order placed | Customer (`user.phone`) | ⚠️ see bug B3 | ❌ log-only |
| W2 | Order placed | **Store owner** | ✅ | ❌ log-only |
| W3 | Contact / callback / inquiry / newsletter / order-modification | **Store owner** | ✅ | ❌ log-only |
| W4 | Customer clicks "Order via WhatsApp" (`wa.me` deep link) | — outbound link, no API | ⚠️ see bug B2 | ❌ button hidden |

**Not implemented:**
- ❌ No shipping-update WhatsApp (email only).
- ❌ No inbound WhatsApp webhook (customers cannot reply and be tracked).
- ❌ No WhatsApp **message templates** registered with Meta — see blocker §5.2.

---

## 4. 🔴 Bugs / blockers found in the code

### B1 — The API never loads the `.env` file in local dev *(blocker)*
`ConfigModule.forRoot({ isGlobal: true })` in [api/src/app.module.ts](api/src/app.module.ts#L26) resolves `.env` **relative to the process working directory**. You run the API with `npm run start:dev` inside `api/`, but the only `.env` lives at the **repo root**. There is no `api/.env`.

→ In local dev, `RESEND_API_KEY`, `STORE_NOTIFICATION_EMAIL`, all `WHATSAPP_*` are **undefined**, no matter what you put in the root `.env`.
(Docker is fine — `docker-compose.yml` uses `env_file: .env`.)

**Fix (choose one):**
```ts
// api/src/app.module.ts
ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: ['.env', '../.env'],   // ← falls back to the repo-root .env
}),
```
…or simply create `api/.env` as a copy of the root `.env`.

### B2 — WhatsApp/phone buttons are invisible in production Docker builds
`NEXT_PUBLIC_*` variables are **inlined at build time**. [web/Dockerfile](web/Dockerfile) declares no `ARG`/`ENV`, so the `NEXT_PUBLIC_STORE_PHONE_NUMBER` / `NEXT_PUBLIC_STORE_WHATSAPP_NUMBER` set in `docker-compose.yml` under `environment:` arrive **too late** (runtime, not build).
Result: [PhoneOrder.tsx](web/components/common/PhoneOrder.tsx#L29) hits `if (!STORE_PHONE && !STORE_WHATSAPP) return null;` → **the whole "Order by phone / WhatsApp" block silently disappears** from product, cart, and checkout pages.

Also: there is **no `web/.env.local`**, so the same happens in local dev.

**Fix:**
```dockerfile
# web/Dockerfile — before `RUN npm run build`
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_STORE_PHONE_NUMBER
ARG NEXT_PUBLIC_STORE_WHATSAPP_NUMBER
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_STORE_PHONE_NUMBER=$NEXT_PUBLIC_STORE_PHONE_NUMBER \
    NEXT_PUBLIC_STORE_WHATSAPP_NUMBER=$NEXT_PUBLIC_STORE_WHATSAPP_NUMBER
```
```yaml
# docker-compose.yml → web:
build:
  context: ./web
  args:
    NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
    NEXT_PUBLIC_SITE_URL: ${NEXT_PUBLIC_SITE_URL}
    NEXT_PUBLIC_STORE_PHONE_NUMBER: ${NEXT_PUBLIC_STORE_PHONE_NUMBER}
    NEXT_PUBLIC_STORE_WHATSAPP_NUMBER: ${NEXT_PUBLIC_STORE_WHATSAPP_NUMBER}
```
And create `web/.env.local` for dev.

### B3 — Customer WhatsApp confirmation uses the wrong phone number
[orders.service.ts:174](api/src/orders/orders.service.ts#L174) sends the customer WhatsApp only `if (user.phone)` — the phone on the **User profile**. But checkout collects the phone in the **shipping address** ([checkout/page.tsx:23](web/app/(storefront)/checkout/page.tsx#L23), required, `min(8)`), and never writes it back to the user profile.

→ Any customer who never opened *Account → Settings* gets **no WhatsApp confirmation**, even though they typed a phone number 10 seconds earlier.

**Fix:** fall back to the shipping address phone (the admin path at [line 230](api/src/orders/orders.service.ts#L230) already does this correctly):
```ts
const customerPhone = user?.phone || (data.shippingAddress as any)?.phone;
if (customerPhone) { await this.notifications.sendWhatsAppOrderConfirmation(customerPhone, {...}); }
```
Optionally also persist the phone onto the user profile on first order.

### B4 — Contact page hardcodes contact details instead of using `storeConfig`
[contact/page.tsx:100-115](web/app/(storefront)/contact/page.tsx#L100-L115) hardcodes `hello@vibio.com`, `+212 6 00 00 00 00`, `Casablanca, Morocco`. `storeConfig` exists for exactly this. When you set the real number, the contact page will keep showing the fake one.

**Fix:** import `storeConfig`, `telHref`, `whatsappHref` from [web/lib/storeConfig.ts](web/lib/storeConfig.ts).

---

## 5. 🟠 External-provider blockers (nothing to code — accounts & approvals)

### 5.1 Resend (email)
1. Create the account, **add and verify your sending domain** (`vibio.ma`) — DNS records SPF/DKIM, up to 24 h propagation.
2. Until the domain is verified you can only send **from `onboarding@resend.dev` to your own address** — fine for testing, useless for customers.
3. Create an API key with *Sending access*.
4. ⚠️ **Also add a DMARC record** — without it Gmail/Outlook will junk your transactional mail at volume.

### 5.2 WhatsApp — the real decision to make
The code supports both providers. Pick one:

| | **Meta WhatsApp Cloud API** (`WHATSAPP_PROVIDER=meta`) | **Twilio** (`WHATSAPP_PROVIDER=twilio`) |
|---|---|---|
| Cost | Cheaper at scale (Meta conversation pricing only) | Meta pricing + Twilio markup |
| Setup | Meta Business account + verified business + phone number ID + permanent token | Twilio account + WhatsApp sender approval |
| Test mode | 5 test recipients, no approval needed | Sandbox: recipient must send `join <code>` first |
| Best for | Production in Morocco | Fast prototyping |

⚠️ **The 24-hour window rule — this WILL break your admin alerts.**
Both providers only allow **free-form text** inside a 24 h window opened by the *customer* messaging you first. Outside that window you must send a **pre-approved message template**.

Your admin alerts (`notifyAdmin`) send free-form text to the store owner at any hour. They will fail with error `131047` / `63016` unless:
- **Option A (recommended, simplest):** the store owner sends a WhatsApp message to the business number once every 24 h → keeps the window open. Fragile.
- **Option B (correct):** register a Meta message template (e.g. `new_order_alert` with variables *type, customer, total, link*) and add a template-send path to `MetaCloudProvider`. **This code does not exist yet — it's the single biggest remaining dev task.**
- **Option C:** owner alerts by **email only**, and use WhatsApp only for *customer* messages sent within 24 h of their own message.

Customer order-confirmation WhatsApp (W1) has the **same** problem — a customer who never messaged you first cannot receive it as free text.

---

## 6. 🟡 Quality / hardening gaps

| Gap | Impact | Priority |
|---|---|---|
| No retry / queue — a Resend 5xx or WhatsApp timeout loses the message forever (logged only) | Lost orders alerts | High |
| No delivery status persisted (except `order.adminNotifiedAt`) — admin can't see "email failed" | Blind ops | High |
| Emails are **English only** — site is FR/AR, no RTL support in templates | Bad UX for Arabic customers | High |
| No unsubscribe link / newsletter opt-out flow | Legal risk | High |
| `SUPPORT` submission type exists in the enum + code but has **no API endpoint and no form** | Dead code | Low |
| No Stripe code in the API at all (`STRIPE_*` env vars are unused) → `ADMIN_ORDER_NOTIFY_ON=paid` only fires on manual admin status change | Misleading config | Medium |
| Zero tests for notifications (`api` has jest but no spec files) | Regressions | Medium |
| `sendShippingUpdate` receives `items: []` and no tracking URL | Weak email | Low |
| Templates escape user input in `adminRequestTemplate` (`esc()`) ✅ but **not** in `orderConfirmationTemplate` / `welcomeTemplate` (`${name}` raw) | HTML injection in emails | Medium |

---

## 7. ✅ THE TASK LIST — do it in this order

### Phase 0 — Make anything send at all (½ day)

- [ ] **0.1** Create a Resend account, verify the domain `vibio.ma`, generate an API key.
- [ ] **0.2** Fill the **real** values in the root `.env` (currently it is a byte-for-byte copy of `.env.example` — every value is a placeholder):
  ```env
  RESEND_API_KEY=re_<real>
  EMAIL_FROM=orders@vibio.ma          # or onboarding@resend.dev while testing
  STORE_NOTIFICATION_EMAIL=<real owner inbox>
  STORE_NOTIFICATION_PHONE=+212XXXXXXXXX
  NEXT_PUBLIC_SITE_URL=https://<real domain>
  ADMIN_SITE_URL=https://<real domain>
  ```
- [ ] **0.3** **Fix B1** — add `envFilePath: ['.env', '../.env']` to `ConfigModule.forRoot`, or create `api/.env`.
- [ ] **0.4** Create `web/.env.local` with the `NEXT_PUBLIC_*` values.
- [ ] **0.5** Restart the API and confirm the boot log reads
      `WhatsApp provider: log (not configured...)` and that no
      `RESEND_API_KEY not set` warning appears when submitting the contact form.
- [ ] **0.6** Smoke test: submit contact form → owner inbox receives *"✉️ New contact form submission"*.

### Phase 1 — WhatsApp actually sending (1–2 days)

- [ ] **1.1** Decide provider: **Meta Cloud API** (recommended for production) or **Twilio** (fastest to test). Set `WHATSAPP_PROVIDER`.
- [ ] **1.2** Meta path: create Meta Business account → verify business → add phone number → get `WHATSAPP_PHONE_NUMBER_ID` + a **permanent** system-user token (the default token expires in 24 h!) → fill `WHATSAPP_API_TOKEN`.
      Twilio path: get `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN`, and for the sandbox have the owner send `join <sandbox-code>` to `+1 415 523 8886`.
- [ ] **1.3** Set `STORE_WHATSAPP_NUMBER` (E.164, e.g. `+212600000000`).
- [ ] **1.4** Verify boot log now says `WhatsApp provider: meta` (or `twilio`) **without** "not configured".
- [ ] **1.5** Place a test order → owner receives the 🛍️ WhatsApp alert.
- [ ] **1.6** **Fix B2** (Dockerfile build args) so the customer-facing WhatsApp button is visible.
- [ ] **1.7** **Fix B3** (shipping-address phone fallback) so customers get their confirmation.

### Phase 2 — Survive the 24-hour window (2–3 days) ← *the hard part*

- [ ] **2.1** Register message templates in Meta Business Manager, e.g.
      `vibio_admin_alert` (owner) and `vibio_order_confirmation` (customer). Approval takes hours to days.
- [ ] **2.2** Extend `MetaCloudProvider` in [whatsapp.service.ts](api/src/notifications/whatsapp/whatsapp.service.ts#L42) with a `sendTemplate(to, templateName, lang, params[])` method (`type: 'template'` payload).
- [ ] **2.3** Add a `template?: {...}` field to `WhatsAppProvider.send` and make `notifyAdmin` / `sendWhatsAppOrderConfirmation` pass a template with a free-text fallback.
- [ ] **2.4** Test outside the 24 h window (simplest: wait a day, or use a number that has never messaged you).

### Phase 3 — Reliability (2–3 days)

- [ ] **3.1** Add a `NotificationLog` table (`channel`, `type`, `to`, `status`, `error`, `attempts`, `relatedId`) and write a row for every send.
- [ ] **3.2** Add retry with exponential backoff (BullMQ on the Redis you already run, or a simple `setTimeout` retry × 3 for a first pass).
- [ ] **3.3** Surface failures in the admin UI ([web/app/admin/submissions/page.tsx](web/app/admin/submissions/page.tsx)) — a red "email failed" badge with a *Resend* button.
- [ ] **3.4** Add jest specs: `notifyAdmin` returns `skipped` with no config, `failed` on a provider throw, and **never throws**.

### Phase 4 — Product completeness (2–4 days)

- [ ] **4.1** Localize email templates FR / AR (+ RTL `dir="rtl"` in the AR templates). Pick language from the customer's locale.
- [ ] **4.2** Add customer acknowledgement emails for contact / callback / inquiry.
- [ ] **4.3** Newsletter: welcome email + unsubscribe token & route (**legal requirement**).
- [ ] **4.4** Escape `${name}` / `${orderNumber}` in `welcomeTemplate`, `orderConfirmationTemplate`, `shippingUpdateTemplate` using the existing `esc()` helper.
- [ ] **4.5** **Fix B4** — contact page reads from `storeConfig`.
- [ ] **4.6** Shipping email: pass real `items` and a carrier tracking URL.
- [ ] **4.7** Decide on the `SUPPORT` submission type — add the endpoint + form, or remove it.

---

## 8. Environment variable reference

Legend: 🔴 = must be set for anything to work · 🟡 = recommended · ⚪ = optional

| Variable | Used by | Status in your `.env` | |
|---|---|---|---|
| `RESEND_API_KEY` | all emails | `re_...` placeholder | 🔴 |
| `EMAIL_FROM` | all emails | `noreply@yourbrand.com` | 🔴 |
| `STORE_NOTIFICATION_EMAIL` | owner alerts | `owner@yourbrand.com` | 🔴 |
| `STORE_NOTIFICATION_PHONE` | owner WhatsApp fallback | `+212600000000` fake | 🔴 |
| `STORE_WHATSAPP_NUMBER` | owner WhatsApp (overrides above) | empty | 🟡 |
| `WHATSAPP_PROVIDER` | provider choice | `auto` | 🟡 |
| `WHATSAPP_API_TOKEN` | Meta Cloud API | empty | 🔴 *(if meta)* |
| `WHATSAPP_PHONE_NUMBER_ID` | Meta Cloud API | empty | 🔴 *(if meta)* |
| `WHATSAPP_API_VERSION` | Meta Cloud API | unset → `v21.0` | ⚪ |
| `TWILIO_ACCOUNT_SID` | Twilio | `AC...` placeholder | 🔴 *(if twilio)* |
| `TWILIO_AUTH_TOKEN` | Twilio | placeholder | 🔴 *(if twilio)* |
| `TWILIO_WHATSAPP_FROM` | Twilio | sandbox number | 🟡 |
| `ADMIN_ORDER_NOTIFY_ON` | `created` \| `paid` | `created` | ⚪ |
| `ADMIN_SITE_URL` | "Open in admin →" link | `localhost:3000` | 🟡 |
| `NEXT_PUBLIC_SITE_URL` | reset-password link, email links | `localhost:3000` | 🔴 |
| `NEXT_PUBLIC_STORE_PHONE_NUMBER` | `tel:` button (**build-time**) | fake | 🔴 |
| `NEXT_PUBLIC_STORE_WHATSAPP_NUMBER` | `wa.me` button (**build-time**) | fake | 🔴 |

---

## 9. How to verify each flow

```bash
# 1. Start the stack
docker compose up -d          # or: cd api && npm run start:dev  /  cd web && npm run dev

# 2. Watch the notification logs — this is your source of truth
docker compose logs -f api | grep -iE "notification|whatsapp|resend|admin"
```

| What to test | Action | Expected log line |
|---|---|---|
| Contact form | Submit `/contact` | `Admin notified for CONTACT (...) — email:sent whatsapp:sent` |
| Newsletter | Submit home footer form | `Admin notified for NEWSLETTER ...` (2nd time: `skipping duplicate`) |
| Callback | Submit `/contact` callback box | `Admin notified for CALLBACK ...` |
| Product inquiry | Product page → inquiry | `Admin notified for PRODUCT_INQUIRY ...` |
| Order modification | Account → order → modify | `Admin notified for ORDER_MODIFICATION ...` |
| New order | Full checkout | `Admin notification email sent ...` + `Customer WhatsApp sent for #ORD-...` |
| Duplicate guard | Re-run order status → PAID | `Admin notification already sent for order ... — skipping duplicate` |
| Shipping email | Admin → set status `SHIPPED` | no error in logs; check inbox |
| Password reset | `/forgot-password` | `🔑 Password reset link for ...` **and** an email |

**Failure signatures to know:**
- `RESEND_API_KEY not set — skipping admin email` → §7 task 0.2/0.3
- `[whatsapp:log] no provider configured` → §7 task 1.2
- `HTTP 400 ... (#131047) Re-engagement message` → 24-hour-window blocker, §5.2
- `HTTP 401` from Meta → your token expired (use a **permanent** system-user token)

---

## 10. Effort summary

| Phase | Work | Estimate |
|---|---|---|
| 0 | Credentials + 2 config fixes | **½ day** ← unblocks email completely |
| 1 | WhatsApp provider + 2 bug fixes | 1–2 days |
| 2 | Message templates (24 h window) | 2–3 days + Meta approval wait |
| 3 | Retry, logging, admin visibility, tests | 2–3 days |
| 4 | i18n, ack emails, unsubscribe, escaping | 2–4 days |

**Minimum for a working production launch: Phase 0 + 1 + 2.**
Phase 0 alone already gets **every email flow live** — start there.
