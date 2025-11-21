# Gmail SMTP Setup Guide for Email Notifications

## Understanding Gmail SMTP Requirements

### Question: Do you need an existing email account?

**YES - You need ONE existing Gmail account to SEND FROM**
- You need a Gmail account (e.g., `yourfoodapp@gmail.com`)
- This account will be the "sender" of all order confirmation emails
- This is the account you'll configure in your backend

**NO - Recipients don't need to exist in your system**
- You can send emails to ANY email address
- The recipient email is the customer's email from `req.user.email`
- It doesn't matter if that email is Gmail, Yahoo, Outlook, etc.
- The customer just needs to have a valid email address

## How It Works

```
Your Gmail Account (sender)
    ↓
Gmail SMTP Server
    ↓
Customer's Email (recipient - can be any email provider)
```

**Example:**
- Your app uses: `fooddelivery@gmail.com` (your Gmail account)
- Customer orders with: `john@yahoo.com` (their email)
- Email goes FROM `fooddelivery@gmail.com` TO `john@yahoo.com`

## Gmail SMTP Requirements

### 1. You Need a Gmail Account
- Create a Gmail account specifically for your app (recommended)
- OR use your personal Gmail account
- This account will send ALL order confirmation emails

### 2. Enable 2-Step Verification
**Why:** Gmail requires 2-step verification to generate App Passwords
**Steps:**
1. Go to https://myaccount.google.com/security
2. Click "2-Step Verification"
3. Follow the setup process
4. Enable it for your account

### 3. Generate App Password (NOT regular password)
**Why:** Gmail doesn't allow regular passwords for SMTP anymore
**Steps:**
1. Go to https://myaccount.google.com/apppasswords
2. Sign in if prompted
3. Select "Mail" as the app
4. Select "Other" as device, enter "Food Delivery App"
5. Click "Generate"
6. Copy the 16-character password (looks like: `abcd efgh ijkl mnop`)
7. **Save this password** - you'll use it in your `.env` file

### 4. Gmail SMTP Settings

**SMTP Server:** `smtp.gmail.com`
**Port:** `587` (TLS) or `465` (SSL)
**Security:** TLS/SSL required
**Authentication:** Required
**Username:** Your full Gmail address
**Password:** The App Password (16 characters, no spaces)

## Environment Variables Needed

Create/update `backend/.env`:

```env
# Gmail SMTP Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false  # true for 465, false for 587
EMAIL_USER=yourfoodapp@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop  # Your 16-char app password
EMAIL_FROM=yourfoodapp@gmail.com
EMAIL_FROM_NAME=Food Delivery App
```

## Gmail Limitations

### Daily Sending Limits
- **Free Gmail:** 500 emails per day
- **Google Workspace:** 2,000 emails per day
- If you exceed, Gmail will temporarily block sending

### Rate Limits
- Maximum 100 recipients per email
- Don't send too many emails too quickly

### Best Practices
1. **Use a dedicated Gmail account** for your app
2. **Don't use your personal Gmail** (security risk)
3. **Monitor sending limits** - track daily count
4. **Consider upgrading** to Google Workspace for higher limits
5. **For production**, consider SendGrid/Mailgun for better reliability

## Security Notes

### ⚠️ Important Security Considerations

1. **Never commit `.env` to Git**
   - Add `.env` to `.gitignore`
   - App passwords are sensitive

2. **App Password vs Regular Password**
   - Use App Password (16 characters)
   - NOT your Gmail login password
   - App passwords are safer and revocable

3. **If App Password is Compromised**
   - Go to app passwords page
   - Revoke the specific app password
   - Generate a new one

4. **Environment Variables**
   - Store credentials in `.env` file
   - Never hardcode in source code
   - Use different credentials for dev/production

## Setup Checklist

Before implementing code:

- [ ] Create a Gmail account for your app (or decide to use existing)
- [ ] Enable 2-Step Verification on that Gmail account
- [ ] Generate an App Password
- [ ] Save the App Password securely
- [ ] Note down the Gmail address
- [ ] Understand Gmail's 500 emails/day limit
- [ ] Decide if Gmail is sufficient or need SendGrid/Mailgun for production

## What Happens When Customer Places Order

1. Customer logs in with their email (e.g., `customer@yahoo.com`)
2. Customer confirms order
3. Your backend gets `req.user.email` = `customer@yahoo.com`
4. Backend uses YOUR Gmail account to send email
5. Email sent FROM: `yourfoodapp@gmail.com` TO: `customer@yahoo.com`
6. Customer receives order confirmation in their Yahoo inbox

## Common Questions

**Q: Do customers need Gmail accounts?**
A: No, customers can use any email provider.

**Q: Can I send to multiple recipients?**
A: Yes, but Gmail limits to 100 recipients per email. For order confirmations, you send to one customer at a time.

**Q: What if I exceed 500 emails/day?**
A: Gmail will temporarily block sending. Consider SendGrid/Mailgun for production.

**Q: Can I use my personal Gmail?**
A: Yes, but not recommended. Create a dedicated account for your app.

**Q: Do I need to verify recipient emails?**
A: No, you can send to any valid email address.

## Next Steps (When Ready to Implement)

1. Install `nodemailer`: `npm install nodemailer`
2. Create `backend/src/services/emailService.js`
3. Configure nodemailer with Gmail SMTP settings
4. Add environment variables to `.env`
5. Call email service in `confirmOrder` function
6. Test with real email addresses
7. Monitor Gmail sending limits

## Alternative: If Gmail Limits Are Too Restrictive

If 500 emails/day is not enough:
- **SendGrid**: 100 emails/day free, then paid
- **Mailgun**: 5,000 emails/month free
- **AWS SES**: Very cheap, pay per email
- **Google Workspace**: 2,000 emails/day

For a food delivery app, 500 emails/day might be sufficient for small-medium scale, but consider alternatives for growth.

