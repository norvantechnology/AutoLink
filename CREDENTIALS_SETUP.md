# 🔐 Credentials Setup Guide

## ⚠️ IMPORTANT: Never commit credentials to git!

This guide explains how to properly handle sensitive credentials for the AutoLink project.

---

## 🚨 Security Best Practices

1. **NEVER** commit credential files (`.json`, `.pem`, `.key`) to git
2. **NEVER** hardcode API keys or secrets in source code
3. **ALWAYS** use environment variables for sensitive data
4. **ALWAYS** keep credential files outside the repository or in `.gitignore`
5. **ROTATE** credentials immediately if they're accidentally exposed

---

## 📋 Setup Instructions

### 1. Backend Environment Variables

Copy the example environment file:
```bash
cd backend
cp .env.example .env
```

Edit `.env` with your actual credentials:
```bash
nano .env  # or use your preferred editor
```

### 2. Google Cloud Service Account Setup

You need to download your service account key from Google Cloud Console:

#### Step-by-Step:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (leadfinder-454916)
3. Navigate to **IAM & Admin** → **Service Accounts**
4. Find your service account: `autolink-imagen@leadfinder-454916.iam.gserviceaccount.com`
5. Click **Actions** → **Manage Keys**
6. Click **Add Key** → **Create New Key** → **JSON**
7. Save the downloaded JSON file **outside this repository** or in a secure location

#### Option A: Use Local File Path (Development)

1. Save the JSON file outside the git repository:
   ```
   /home/jenish/.credentials/autolink-gcloud-service-account.json
   ```

2. Add this to your `.env` file:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=/home/jenish/.credentials/autolink-gcloud-service-account.json
   ```

#### Option B: Use Environment Variables (Production/Cloud)

For cloud deployments (Heroku, Railway, Vercel, etc.), set these environment variables:

```
GOOGLE_CLOUD_PROJECT_ID=leadfinder-454916
GOOGLE_SERVICE_ACCOUNT_EMAIL=autolink-imagen@leadfinder-454916.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

**Note:** Keep the `\n` characters in the private key as they represent newlines.

### 3. Other API Keys

Get and configure the following API keys in your `.env` file:

- **Gemini API**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **OpenAI API**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)
- **LinkedIn OAuth**: Create an app at [LinkedIn Developers](https://www.linkedin.com/developers/)
- **Cloudinary**: Sign up at [Cloudinary](https://cloudinary.com/)
- **Stripe**: Get keys from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)

---

## 🔄 What to Do If Credentials Were Exposed

If you accidentally committed credentials to git:

### 1. **Immediately Revoke/Rotate the Exposed Credentials**
   - Go to Google Cloud Console → IAM & Admin → Service Accounts
   - Delete the exposed key
   - Generate a new key

### 2. **Remove from Git History**
   ```bash
   # If it's in the latest commit
   git rm --cached path/to/credentials.json
   git commit --amend --no-edit
   git push origin main --force
   
   # If it's in older commits, use git filter-branch or BFG Repo-Cleaner
   ```

### 3. **Update GitHub Secret Scanning**
   - GitHub will notify you of exposed secrets
   - Follow the provided link to acknowledge you've rotated the credentials

---

## 📁 Project .gitignore

The following patterns are already in `.gitignore`:

```
# Credentials and secrets
*.json
backend/*.json
!backend/package.json
!backend/package-lock.json
.env
.env.local
.env.*.local

# Google Cloud
*service-account*.json
*credentials*.json
```

---

## 🧪 Verify Your Setup

Test that credentials are working:

```bash
cd backend
npm install
npm run dev
```

Check the console output:
- ✅ Database connected
- ✅ Gemini API client initialized
- ✅ Server running

---

## 🆘 Troubleshooting

### Issue: "GOOGLE_APPLICATION_CREDENTIALS not found"
**Solution:** Check that the file path in `.env` is correct and the file exists.

### Issue: "Gemini API client not initialized"
**Solution:** Verify `GEMINI_API_KEY` is set in `.env` file.

### Issue: "MongoDB connection failed"
**Solution:** Ensure MongoDB is running locally or update `MONGODB_URI` with your cloud MongoDB URI.

---

## 📞 Need Help?

- Check the [Google Cloud Documentation](https://cloud.google.com/docs/authentication/getting-started)
- Review [Best Practices for Managing Secrets](https://cloud.google.com/secret-manager/docs/best-practices)

---

**Remember:** Security is not optional. Always protect your credentials! 🔒

