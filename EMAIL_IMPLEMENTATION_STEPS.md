# Email Notification Implementation Steps

## Overview
Send email notifications to customers when they place an order (when `confirmOrder` is called).

## Current System Analysis
- **User Authentication**: Users log in with email (stored in `User` model)
- **Order Confirmation**: Happens in `confirmOrder` function in `backend/src/controllers/orderController.js`
- **Available Data**: 
  - `req.user` contains user info (including email) from JWT middleware
  - Order has: items, totalAmount, status, timestamps
  - Order is populated with `items.foodItem` but NOT with `user` info

## Implementation Steps

### Step 1: Choose Email Service Provider

**Option A: Nodemailer (Recommended for Development)**
- Free, works with Gmail, Outlook, or any SMTP
- Good for development and small projects
- Requires SMTP credentials

**Option B: SendGrid**
- Free tier: 100 emails/day
- Production-ready, reliable
- Requires API key

**Option C: Mailgun**
- Free tier: 5,000 emails/month
- Good for production
- Requires API key and domain

**Option D: AWS SES**
- Very cheap for production
- Requires AWS account setup
- Good for high volume

### Step 2: Install Required Package

```bash
cd backend
npm install nodemailer
# OR
npm install @sendgrid/mail
# OR
npm install mailgun-js
```

### Step 3: Add Environment Variables

Create or update `.env` file in `backend/`:

**For Nodemailer (Gmail SMTP example):**
```
# Gmail SMTP Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false  # true for port 465, false for port 587
EMAIL_USER=yourfoodapp@gmail.com  # YOUR Gmail account (sender)
EMAIL_PASSWORD=abcdefghijklmnop  # 16-character App Password (NOT regular password)
EMAIL_FROM=yourfoodapp@gmail.com
EMAIL_FROM_NAME=Food Delivery App
```

**⚠️ Gmail Requirements:**
- You need ONE existing Gmail account to send FROM
- Recipients (customers) can have ANY email provider
- Must enable 2-Step Verification on Gmail account
- Must generate App Password (not regular password)
- Gmail free tier: 500 emails/day limit
- See `GMAIL_SMTP_SETUP_GUIDE.md` for detailed setup instructions

**For SendGrid:**
```
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=your-email@yourdomain.com
EMAIL_FROM_NAME=Food Delivery App
```

**For Mailgun:**
```
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-domain.com
EMAIL_FROM=noreply@your-domain.com
EMAIL_FROM_NAME=Food Delivery App
```

### Step 4: Create Email Service Module

Create `backend/src/services/emailService.js` or `backend/src/utils/emailService.js`

**Structure:**
1. Import email library (nodemailer, sendgrid, etc.)
2. Configure email transporter/client
3. Create function: `sendOrderConfirmationEmail(order, userEmail, userName)`
4. Build email template (HTML or plain text)
5. Send email
6. Handle errors gracefully

**Email should include:**
- Order ID/Number
- Customer name
- List of items (name, quantity, price)
- Total amount
- Order date/time
- Order status
- Estimated delivery/cooking time (if applicable)

### Step 5: Modify `confirmOrder` Function

**Location**: `backend/src/controllers/orderController.js`

**Changes needed:**
1. Import the email service
2. After order is confirmed and saved (line 161)
3. Get user email from `req.user.email` (already available from auth middleware)
4. Populate order with user info OR use `req.user` directly
5. Call email service function
6. **Important**: Don't block the response if email fails
7. Handle email errors gracefully (log but don't fail the order)

**Where to add email sending:**
```javascript
// After line 161: await order.save();

// Get user email (req.user is available from auth middleware)
const userEmail = req.user.email;
const userName = req.user.name;

// Send email notification (non-blocking)
try {
  await sendOrderConfirmationEmail(order, userEmail, userName);
} catch (emailError) {
  console.error('Failed to send order confirmation email:', emailError);
  // Don't fail the order if email fails
}
```

### Step 6: Email Template Content

**Subject**: "Order Confirmation - Order #[OrderID]"

**Body should include:**
- Greeting with customer name
- Order confirmation message
- Order ID/Number
- Order date and time
- List of items:
  - Item name
  - Quantity
  - Price per item
  - Subtotal per item
- Total amount
- Order status
- Estimated cooking/delivery time (optional)
- Contact information
- Thank you message

### Step 7: Error Handling Strategy

**Options:**
1. **Fire and forget**: Send email but don't wait for response
2. **Log errors**: If email fails, log it but don't fail the order
3. **Async sending**: Use background job queue (optional, for production)
4. **Retry mechanism**: Retry failed emails (optional, advanced)

**Recommended**: Log errors but don't block order confirmation

### Step 8: Testing

1. Test with real email addresses
2. Test email formatting (HTML vs plain text)
3. Test error handling (invalid email, SMTP down)
4. Verify email doesn't block order confirmation
5. Check spam folder
6. Test with different order sizes

### Step 9: Additional Considerations

**Security:**
- Never expose email credentials in code
- Use environment variables
- Use app-specific passwords for Gmail
- Consider email service API keys with limited permissions

**Performance:**
- Email sending is async by nature
- Consider using a job queue (Bull, Agenda) for high volume
- Don't block the HTTP response waiting for email

**User Experience:**
- Send email immediately after order confirmation
- Include all relevant order details
- Make email mobile-friendly
- Consider including order tracking link (if implemented)

### Step 10: Optional Enhancements

1. **Email templates**: Use libraries like Handlebars, EJS, or React Email
2. **Email queue**: Use Bull or similar for reliable email delivery
3. **Email tracking**: Track if email was opened/clicked
4. **Multiple email types**: Order confirmation, order ready, order delivered
5. **Admin notifications**: Also notify admin when order is placed
6. **Email preferences**: Let users opt-in/opt-out of emails

## Implementation Priority

**Must Have:**
- Email service setup
- Basic email sending in confirmOrder
- Error handling that doesn't block orders

**Nice to Have:**
- HTML email templates
- Email queue system
- Multiple email types
- Admin notifications

## Code Changes Summary (When Ready to Implement)

1. **New file**: `backend/src/services/emailService.js`
2. **Modified file**: `backend/src/controllers/orderController.js` (confirmOrder function)
3. **Modified file**: `backend/package.json` (add email dependency)
4. **Modified file**: `.env` (add email configuration)
5. **Optional**: Create email template files

## Notes

- `req.user` is available in `confirmOrder` because it's protected by `protect` middleware
- User email is in `req.user.email`
- Order needs to be populated or user info fetched separately
- Consider making email sending truly async (fire and forget) to not slow down API response
- For production, consider using a dedicated email service (SendGrid, Mailgun) instead of SMTP

