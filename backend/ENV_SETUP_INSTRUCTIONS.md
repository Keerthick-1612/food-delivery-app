# Environment Variables Setup Instructions

## Create `.env` file in `backend/` directory

Create a file named `.env` in the `backend/` directory with the following content:

```env
# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/food-delivery

# JWT Secret for authentication
JWT_SECRET=your-secret-key-change-this-in-production

# Server Port
PORT=5000

# Gmail SMTP Configuration for Email Notifications
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=keerthick1612@gmail.com
EMAIL_PASSWORD=your-16-character-app-password-here
EMAIL_FROM=keerthick1612@gmail.com
EMAIL_FROM_NAME=Food Delivery App
```

## Important: Gmail App Password Setup

**You MUST replace `your-16-character-app-password-here` with your actual Gmail App Password.**

### Steps to get Gmail App Password:

1. **Enable 2-Step Verification** (if not already enabled)
   - Go to https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Follow the setup process

2. **Generate App Password**
   - Go to https://myaccount.google.com/apppasswords
   - Sign in if prompted
   - Under "Select app", choose "Mail"
   - Under "Select device", choose "Other" and enter "Food Delivery App"
   - Click "Generate"
   - Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)
   - **Remove the spaces** when pasting into `.env` file
   - Paste it in the `EMAIL_PASSWORD` field

3. **Update `.env` file**
   - Replace `your-16-character-app-password-here` with your actual app password
   - Make sure there are no spaces in the password

## Security Notes

- Never commit `.env` file to Git (it's already in `.gitignore`)
- Keep your App Password secure
- If compromised, revoke it and generate a new one
- The `.env` file is for local development only

## Testing

After setting up the `.env` file:
1. Restart your backend server
2. Place an order as a customer
3. Check the customer's email inbox for the order confirmation
4. Check server logs for email sending status

