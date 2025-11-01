# 📧 LinkedOra Email Campaign Sender

Professional email marketing automation system with anti-spam protection.

---

## 🚀 Quick Start

### **Step 1: Install Dependencies**

```bash
cd email-sender
npm install
```

### **Step 2: Configure Email Settings**

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Edit `.env` and add your email credentials:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=LinkedOra Team
```

### **Step 3: Prepare Your Contact List**

Edit `contacts.csv` with your contacts:
```csv
first_name,last_name,email,company,position
John,Doe,john@example.com,Tech Corp,CEO
Sarah,Smith,sarah@example.com,Marketing Inc,CMO
```

**Required columns:** `first_name`, `email`  
**Optional columns:** Other columns are ignored

### **Step 4: Test First!**

Always test before sending to real contacts:

1. Set test mode in `.env`:
```env
TEST_MODE=true
TEST_EMAIL=your-test-email@gmail.com
```

2. Run test:
```bash
npm start
```

3. Check your test email inbox and verify:
   - Template looks good
   - Links work
   - Personalization works
   - Not in spam folder

### **Step 5: Send Campaign**

Once tested, disable test mode and run:

1. Set in `.env`:
```env
TEST_MODE=false
```

2. Start campaign:
```bash
npm start
```

---

## 🔐 Gmail Setup (Recommended)

### **Option 1: App-Specific Password (Recommended)**

1. Go to Google Account: https://myaccount.google.com/
2. Security → 2-Step Verification (enable if not enabled)
3. Security → App passwords
4. Generate password for "Mail"
5. Copy password to `.env` file

### **Option 2: SMTP Relay (For High Volume)**

If sending 500+ emails:
1. Use Google Workspace SMTP Relay
2. Or use professional SMTP service:
   - SendGrid (99,000 free/month)
   - Amazon SES (62,000 free/month)
   - Mailgun (5,000 free/month)

---

## ⚙️ Configuration Options

### **Email Sending Settings**

```env
# Delay between emails (6 seconds recommended)
SEND_DELAY_SECONDS=6

# Maximum emails per day (Gmail limit: 500/day)
MAX_EMAILS_PER_DAY=500
```

### **Path Configuration**

```env
# CSV file path (relative to email-sender folder)
CSV_FILE_PATH=./contacts.csv

# Email template path (relative to email-sender folder)
EMAIL_TEMPLATE_PATH=../email-templates/email-marketing-linkedora.html
```

---

## 🛡️ Anti-Spam Features

### **Built-in Protection:**

✅ **Rate Limiting:** 1 email every 6 seconds (10 emails/minute)  
✅ **Connection Pooling:** Reuses connections efficiently  
✅ **Proper Headers:** List-Unsubscribe, Precedence, etc.  
✅ **Text Version:** Plain text alternative included  
✅ **Valid From Address:** Uses verified sender  
✅ **Unsubscribe Link:** Required by law (CAN-SPAM)  
✅ **SPF/DKIM:** Use authenticated email service  
✅ **Clean HTML:** No spam trigger words  

### **Best Practices Implemented:**

1. **Warm-up Period:** Start with 50 emails/day, increase gradually
2. **Engagement Tracking:** Monitor open/click rates
3. **Clean List:** Only valid, opted-in contacts
4. **Unsubscribe Handling:** Respect unsubscribe requests
5. **Bounce Handling:** Remove bounced emails from list

---

## 📊 What Happens During Sending

```
╔════════════════════════════════════════════════════════╗
║   📧 LinkedOra Email Marketing Campaign Sender        ║
╚════════════════════════════════════════════════════════╝

📄 Loading email template...
✅ Email template loaded

📋 Reading contacts from CSV...
✅ Loaded 100 contacts from CSV

🔌 Connecting to email server...
✅ Email server connected

📨 Starting to send emails (1 every 6 seconds)...

────────────────────────────────────────────────────────

[1/100] Processing: john@example.com
✅ Sent to: John (john@example.com)
⏳ Waiting 6 seconds...

[2/100] Processing: sarah@example.com
✅ Sent to: Sarah (sarah@example.com)
⏳ Waiting 6 seconds...

...

────────────────────────────────────────────────────────

📊 Campaign Summary:
────────────────────────────────────────────────────────
✅ Successfully sent: 98
❌ Failed: 1
⚠️  Skipped (invalid): 1
📧 Total processed: 100
⏱️  Duration: 10m 0s
────────────────────────────────────────────────────────

✅ Email campaign completed!
```

---

## 🎯 CSV Format

### **Required Format:**

```csv
first_name,last_name,email,company,position
John,Doe,john@example.com,Tech Corp,CEO
Sarah,Smith,sarah@example.com,Marketing Inc,CMO
,Johnson,nofirstname@example.com,Startup,Founder
```

### **Important Notes:**

- **Email column** is required
- **first_name** is optional (script handles blank names)
- Other columns (last_name, company, position) are ignored but can exist
- Script only uses: `first_name` and `email`
- Invalid emails are automatically skipped

---

## ⏱️ Timing & Limits

### **Gmail Limits:**
- **500 emails per day** (personal Gmail)
- **2,000 emails per day** (Google Workspace)

### **Recommended Schedule:**

**For 100 contacts:**
- Time: ~10 minutes (6 seconds each)
- Best time: Tuesday-Thursday, 10 AM - 2 PM

**For 500 contacts:**
- Time: ~50 minutes
- Split into batches if needed

---

## 🧪 Testing Checklist

Before sending to real contacts:

- [ ] Set `TEST_MODE=true` in .env
- [ ] Add your test email to `TEST_EMAIL`
- [ ] Run script and check test email
- [ ] Verify links work
- [ ] Check if in spam folder
- [ ] Test personalization (first name)
- [ ] Test with blank first name
- [ ] Verify unsubscribe link works
- [ ] Check email on mobile device
- [ ] Disable test mode before real send

---

## 📈 Success Metrics to Track

After sending, monitor:

1. **Delivery Rate:** >98% (check bounces)
2. **Open Rate:** 22-28% (industry average)
3. **Click Rate:** 3-5%
4. **Spam Rate:** <0.1%
5. **Unsubscribe Rate:** <0.5%

---

## ⚠️ Important Legal Requirements

### **CAN-SPAM Compliance:**

✅ Include unsubscribe link (already added)  
✅ Use real sender address (your email)  
✅ No deceptive subject lines  
✅ Include physical address (add to template footer)  
✅ Honor unsubscribe within 10 days  

### **GDPR Compliance (if sending to EU):**

✅ Only email people who opted in  
✅ Provide easy unsubscribe  
✅ Include privacy policy link  
✅ Allow data export/deletion  

---

## 🔧 Troubleshooting

### **Problem: "Invalid login"**
**Solution:** Use app-specific password, not your regular Gmail password

### **Problem: "Daily sending quota exceeded"**
**Solution:** Wait 24 hours or use Google Workspace

### **Problem: Emails going to spam**
**Solution:** 
- Warm up your email (start with 50/day)
- Add SPF/DKIM records to your domain
- Use professional email service (SendGrid, etc.)

### **Problem: Script crashes**
**Solution:** Check .env file has all required values

---

## 💡 Pro Tips

1. **Warm Up Your Email Account:**
   - Day 1: Send 20 emails
   - Day 2: Send 50 emails
   - Day 3: Send 100 emails
   - Day 4+: Send 500 emails

2. **Improve Deliverability:**
   - Use custom domain (not @gmail.com)
   - Set up SPF, DKIM, DMARC records
   - Monitor bounce rates
   - Remove bounced emails from list

3. **A/B Test Subject Lines:**
   - Script rotates 5 subject lines automatically
   - Track which gets best open rate
   - Update SUBJECT_LINES array with winners

4. **Best Sending Times:**
   - Tuesday-Thursday: 10 AM - 2 PM
   - Avoid Monday mornings and Friday afternoons
   - Don't send on weekends

---

## 📁 File Structure

```
email-sender/
├── package.json              # Dependencies
├── sendEmails.js            # Main script
├── .env                     # Your configuration (create this)
├── .env.example             # Configuration template
├── contacts.csv             # Your contact list
├── README.md                # This file
└── logs/                    # Email logs (auto-created)
```

---

## 🚀 Advanced Usage

### **Use Different SMTP Services:**

**SendGrid:**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

**Amazon SES:**
```env
EMAIL_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_PORT=587
EMAIL_USER=your-ses-smtp-username
EMAIL_PASSWORD=your-ses-smtp-password
```

**Mailgun:**
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=your-mailgun-smtp-login
EMAIL_PASSWORD=your-mailgun-smtp-password
```

---

## 📞 Support

If you need help:
1. Check this README
2. Verify .env configuration
3. Test with TEST_MODE=true first
4. Check email service quotas

---

**Remember:** Always test first, respect unsubscribes, and follow email marketing laws!

Good luck with your campaign! 🎉

