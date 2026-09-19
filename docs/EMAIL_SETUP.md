# Email Setup (Resend)

Vibio uses [Resend](https://resend.com) to send transactional emails (order confirmations, shipping updates).

## 1. Create a Resend account

1. Go to [resend.com](https://resend.com) and sign up
2. Verify your email address

## 2. Add and verify your sending domain

1. In the Resend dashboard go to **Domains → Add Domain**
2. Enter your domain (e.g. `vibio.ma`)
3. Add the DNS records Resend shows you to your domain registrar
4. Click **Verify** once DNS has propagated (can take up to 24 h)

> **Development shortcut**: If you don't have a domain yet, Resend lets you send to your own email address from `onboarding@resend.dev` without domain verification. This is sufficient for local testing.

## 3. Create an API key

1. Go to **API Keys → Create API Key**
2. Name it `vibio-api`, permission: **Sending access**
3. Copy the key (shown only once)

## 4. Add the key to the API environment file

In `api/.env`:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=orders@vibio.ma
```

For local dev without a verified domain:
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=onboarding@resend.dev
```

## 5. Email templates

Order confirmation and shipping update templates are defined in:
- `api/src/notifications/notifications.service.ts`

The service uses the Resend Node.js SDK. To modify the email HTML, edit the `html` field inside `sendOrderConfirmation` and `sendShippingUpdate`.

## 6. WhatsApp notifications (optional)

The notifications service also supports WhatsApp via the Twilio API. To enable it add to `api/.env`:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

If these variables are absent, WhatsApp messages are silently skipped and email-only mode applies.
