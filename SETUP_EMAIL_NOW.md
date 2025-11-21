# Quick Setup Guide - Email Notifications

## ✅ Code Implementation Complete!

Email notifications are now implemented. You just need to configure Gmail.

## What You Need to Do Now

### Step 1: Get Gmail App Password

1. **Go to**: https://myaccount.google.com/security
2. **Enable 2-Step Verification** (if not already enabled)
3. **Go to**: https://myaccount.google.com/apppasswords
4. **Select**:
   - App: "Mail"
   - Device: "Other" → Enter "Food Delivery App"
5. **Click "Generate"**
6. **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)
7. **Remove spaces** when using it

### Step 2: Create `.env` File

Create a file named `.env` in the `backend/` folder with this content:

```env
# MongoDB (adjust if needed)
MONGO_URI=mongodb://localhost:27017/food-delivery

# JWT Secret (change this to a random string)
JWT_SECRET=your-secret-key-change-this

# Server Port
PORT=5000

# Gmail SMTP - Sender: keerthick1612@gmail.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=keerthick1612@gmail.com
EMAIL_PASSWORD=PASTE_YOUR_16_CHAR_APP_PASSWORD_HERE
EMAIL_FROM=keerthick1612@gmail.com
EMAIL_FROM_NAME=Food Delivery App
```

**Replace `PASTE_YOUR_16_CHAR_APP_PASSWORD_HERE` with your actual app password (no spaces)**

### Step 3: Restart Backend

```bash
cd backend
npm start
# or for development
npm run dev
```

### Step 4: Test

1. Login as a customer
2. Add items to cart
3. Confirm order
4. Check the customer's email inbox
5. You should receive an order confirmation email from `keerthick1612@gmail.com`

## What Was Implemented

✅ **Email Service** (`backend/src/services/emailService.js`)
- Gmail SMTP configuration
- HTML email template with order details
- Plain text fallback
- Error handling

✅ **Order Controller Updated** (`backend/src/controllers/orderController.js`)
- Sends email after order confirmation
- Uses `keerthick1612@gmail.com` as sender
- Sends to customer's email from `req.user.email`
- Non-blocking (order succeeds even if email fails)

✅ **Package Installed**
- `nodemailer` installed in backend

## Troubleshooting

**Email not sending?**
- Check `.env` file exists in `backend/` folder
- Verify app password is correct (16 characters, no spaces)
- Check server console for error messages
- Make sure 2-Step Verification is enabled on Gmail

**"Email configuration not found" warning?**
- Check `.env` file has `EMAIL_USER` and `EMAIL_PASSWORD`
- Restart server after creating/updating `.env`

**Gmail blocking emails?**
- Check Gmail's "Less secure app access" (not needed with App Password)
- Verify app password is correct
- Check if you've exceeded 500 emails/day limit

## Email Content

The email includes:
- Order ID
- Customer name
- Order date/time
- List of items (name, quantity, price)
- Total amount
- Estimated cooking time
- Professional HTML formatting

## Notes

- Sender email: `keerthick1612@gmail.com` (as requested)
- Recipients: Customer's email from their account
- Gmail limit: 500 emails/day (free tier)
- Email failures don't block order confirmation

