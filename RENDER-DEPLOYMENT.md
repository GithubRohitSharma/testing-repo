# 🚀 Render Deployment Guide

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
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
CLIENT_ID=your_gmail_client_id
CLEINT_SECRET=your_gmail_client_secret
REDIRECT_URI=https://developers.google.com/oauthplayground
REFRESH_TOKEN=your_gmail_refresh_token
SUPPORT_MAIL=resourcebank.it@nitj.ac.in
FORGOTPASS=your_email_app_password
```

## Step 3: Deploy to Render

### Method 1: Using Render Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

2. **Connect to Render**:
   - Go to [render.com/dashboard](https://render.com/dashboard)
   - Click "New +" and select "Web Service"
   - Connect your GitHub repository
   - Select the repository

3. **Configure the service**:
   - **Name**: `resource-bank-nitj` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or choose paid plan for better performance)

## Step 4: Configure Environment Variables

1. **In Render Dashboard**:
   - Go to your service settings
   - Navigate to "Environment" tab
   - Add each variable from your `.env` file:

   ```
   SECRET=your_super_secret_jwt_key_here
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/resourcebank
   CLIENT_ID=your_gmail_client_id
   CLEINT_SECRET=your_gmail_client_secret
   REDIRECT_URI=https://developers.google.com/oauthplayground
   REFRESH_TOKEN=your_gmail_refresh_token
   SUPPORT_MAIL=resourcebank.it@nitj.ac.in
   FORGOTPASS=your_email_app_password
   ```

2. **Deploy** after adding environment variables

## Step 5: Gmail OAuth2 Setup

1. **Create Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project
   - Enable Gmail API

2. **Create OAuth2 Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Create OAuth2 Client ID
   - Set authorized redirect URIs to include `https://developers.google.com/oauthplayground`

3. **Get Refresh Token**:
   - Go to [Google OAuth Playground](https://developers.google.com/oauthplayground/)
   - Set your OAuth2 credentials
   - Select Gmail API v1 scope
   - Exchange authorization code for refresh token

4. **Add credentials to Render**:
   - Add `CLIENT_ID`, `CLEINT_SECRET`, `REDIRECT_URI`, and `REFRESH_TOKEN` as environment variables

## Step 6: Google Drive API Setup

1. **Enable Google Drive API**:
   - In Google Cloud Console, enable Google Drive API
   - Create a service account
   - Download the JSON credentials

2. **Share Google Drive folder**:
   - Create a folder in Google Drive
   - Share it with your service account email
   - Give it "Editor" permissions

3. **Add credentials to Render**:
   - Copy the entire JSON content
   - Add it as `GOOGLE_DRIVE_CREDENTIALS` environment variable

## Step 7: Email Configuration

1. **Gmail App Password**:
   - Enable 2-factor authentication on your Gmail
   - Generate an app password
   - Use it as `FORGOTPASS` environment variable

2. **Test email functionality** after deployment

## Step 8: Verify Deployment

1. **Check your deployment URL** (e.g., `https://resource-bank-nitj.onrender.com`)

2. **Test all features**:
   - User registration/login
   - File upload/download
   - Admin dashboard
   - Email functionality

## Troubleshooting

### Common Issues:

1. **Database Connection Error**:
   - Check MongoDB URI format
   - Ensure IP whitelist includes Render's IPs
   - Verify database name and credentials

2. **File Upload Issues**:
   - Check Google Drive API credentials
   - Verify folder permissions
   - Check environment variables

3. **Email Not Working**:
   - Verify Gmail OAuth2 setup
   - Check all email-related environment variables
   - Test email configuration

4. **Build Errors**:
   - Check `package.json` for correct start script
   - Verify all dependencies
   - Check for syntax errors

### Debug Commands:

```bash
# Check Render logs
# Go to your service dashboard and check "Logs" tab

# Redeploy with fresh build
# Use "Manual Deploy" option in Render dashboard
```

## Post-Deployment

1. **Set up custom domain** (optional):
   - Go to service settings in Render
   - Add your custom domain
   - Configure DNS settings

2. **Monitor performance**:
   - Use Render's built-in monitoring
   - Monitor error logs
   - Check database performance

3. **Set up automatic deployments**:
   - Connect to GitHub
   - Enable automatic deployments on push

## Render-Specific Features

### Auto-Deploy
- Render automatically deploys when you push to your main branch
- You can configure branch-specific deployments

### Health Checks
- Render provides built-in health check functionality
- Configure health check endpoint in your app

### Environment Variables
- Secure environment variable management
- Different variables for different environments (staging/production)

### Logs and Monitoring
- Real-time log streaming
- Performance monitoring
- Error tracking

## Security Notes

- ✅ Use strong JWT secrets
- ✅ Enable MongoDB authentication
- ✅ Use environment variables for all secrets
- ✅ Regularly rotate API keys
- ✅ Monitor access logs
- ✅ Use HTTPS (automatically provided by Render)

---

**Your app should now be live at**: `https://your-service-name.onrender.com`

---

*This guide is specifically tailored for Render deployment. For other platforms, please refer to their respective documentation.* 