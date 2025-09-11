# 🚀 Deployment Guide

## Prerequisites

1. **Hosting Platform**: Choose your preferred hosting platform (Render, Railway, Heroku, etc.)
2. **GitHub Account**: Your code should be on GitHub
3. **MongoDB Atlas**: Set up a cloud MongoDB database
4. **Environment Variables**: Prepare your environment variables

## Step 1: Prepare Your Database

### MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get your connection string
4. Whitelist your IP (or use `0.0.0.0/0` for all IPs)

## Step 2: Environment Variables Setup

Create a `.env` file locally for testing:

```env
PORT=8000
SECRET=your_super_secret_jwt_key_here
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/resourcebank
GOOGLE_DRIVE_CREDENTIALS={"type":"service_account",...}
FORGOTPASS=your_email_app_password
SUPPORT_MAIL=resourcebank.it@nitj.ac.in
```

## Step 3: Choose Your Deployment Platform

### Option 1: Render (Recommended)
- Free tier available
- Easy deployment from GitHub
- Automatic deployments
- See `RENDER-DEPLOYMENT.md` for detailed instructions

### Option 2: Railway
- Simple deployment process
- Good for Node.js applications
- Automatic scaling

### Option 3: Heroku
- Industry standard
- Good documentation
- Multiple pricing tiers

## Step 4: Google Drive API Setup

1. **Create Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable Google Drive API

2. **Create Service Account**:
   - Go to "IAM & Admin" → "Service Accounts"
   - Create a new service account
   - Download the JSON credentials

3. **Share Google Drive folder**:
   - Create a folder in Google Drive
   - Share it with your service account email
   - Give it "Editor" permissions

4. **Add credentials to your hosting platform**:
   - Copy the entire JSON content
   - Add it as `GOOGLE_DRIVE_CREDENTIALS` environment variable

## Step 5: Email Configuration

1. **Gmail App Password**:
   - Enable 2-factor authentication on your Gmail
   - Generate an app password
   - Use it as `FORGOTPASS` environment variable

2. **Test email functionality** after deployment

## Step 6: Verify Deployment

1. **Check your deployment URL** (provided by your hosting platform)

2. **Test all features**:
   - User registration/login
   - File upload/download
   - Admin dashboard
   - Email functionality

## Troubleshooting

### Common Issues:

1. **Database Connection Error**:
   - Check MongoDB URI format
   - Ensure IP whitelist includes your hosting platform's IPs
   - Verify database name and credentials

2. **File Upload Issues**:
   - Check Google Drive API credentials
   - Verify folder permissions
   - Check environment variables

3. **Email Not Working**:
   - Verify Gmail app password
   - Check `FORGOTPASS` environment variable
   - Test email configuration

4. **Build Errors**:
   - Verify all dependencies in `package.json`
   - Check for syntax errors
   - Review hosting platform logs

## Post-Deployment

1. **Set up custom domain** (optional):
   - Configure DNS settings
   - Add SSL certificate

2. **Monitor performance**:
   - Monitor error logs
   - Check database performance
   - Set up monitoring tools

3. **Set up automatic deployments**:
   - Connect to GitHub
   - Enable automatic deployments on push

## Security Notes

- ✅ Use strong JWT secrets
- ✅ Enable MongoDB authentication
- ✅ Use environment variables for all secrets
- ✅ Regularly rotate API keys
- ✅ Monitor access logs

---

**Your app should now be live at your chosen hosting platform's URL** 