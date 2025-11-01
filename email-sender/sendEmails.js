import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Configuration
const CONFIG = {
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  },
  sender: {
    email: process.env.FROM_EMAIL,
    name: process.env.FROM_NAME || 'LinkedOra Team'
  },
  settings: {
    delaySeconds: parseInt(process.env.SEND_DELAY_SECONDS) || 6
  },
  paths: {
    csvFile: process.env.CSV_FILE_PATH || './contacts.csv',
    emailTemplate: process.env.EMAIL_TEMPLATE_PATH || '../email-templates/email-marketing-linkedora.html',
    progressFile: './progress.json'
  }
};

// Email subject lines (rotates for A/B testing)
const SUBJECT_LINES = [
  "Automate Your LinkedIn in 2 Minutes",
  "Your LinkedIn Profile on Autopilot",
  "Stop Wasting Hours on LinkedIn Content",
  "AI-Powered LinkedIn Automation",
  "Transform Your LinkedIn Presence Today"
];

// Statistics
const stats = {
  total: 0,
  sent: 0,
  failed: 0,
  skipped: 0,
  resumed: 0,
  startTime: null
};

/**
 * Load progress from JSON file
 */
function loadProgress() {
  try {
    const progressPath = path.resolve(__dirname, CONFIG.paths.progressFile);
    if (fs.existsSync(progressPath)) {
      const data = fs.readFileSync(progressPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    // Silent fail
  }
  return { 
    processedEmails: [], 
    failedEmails: [],
    lastIndex: 0,
    successCount: 0,
    failedCount: 0,
    skippedCount: 0,
    totalCount: 0
  };
}

/**
 * Save progress to JSON file
 */
function saveProgress(data) {
  try {
    const progressPath = path.resolve(__dirname, CONFIG.paths.progressFile);
    const progress = {
      processedEmails: data.processedEmails,
      failedEmails: data.failedEmails || [],
      lastIndex: data.lastIndex,
      successCount: data.successCount,
      failedCount: data.failedCount,
      skippedCount: data.skippedCount,
      totalCount: data.totalCount,
      lastUpdated: new Date().toISOString(),
      campaignStatus: data.campaignStatus || 'in-progress'
    };
    fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
  } catch (error) {
    // Silent fail
  }
}

/**
 * Create email transporter with anti-spam settings
 */
function createTransporter() {
  const transporter = nodemailer.createTransport({
    host: CONFIG.email.host,
    port: CONFIG.email.port,
    secure: CONFIG.email.secure,
    auth: CONFIG.email.auth,
    // Anti-spam settings
    pool: true,
    maxConnections: 1,
    maxMessages: 100,
    rateDelta: CONFIG.settings.delaySeconds * 1000,
    rateLimit: 1,
    // Security
    tls: {
      rejectUnauthorized: true,
      minVersion: 'TLSv1.2'
    }
  });

  return transporter;
}

/**
 * Load and prepare email template
 */
function loadEmailTemplate() {
  try {
    const templatePath = path.resolve(__dirname, CONFIG.paths.emailTemplate);
    const template = fs.readFileSync(templatePath, 'utf8');
    return template;
  } catch (error) {
    process.exit(1);
  }
}

/**
 * Personalize email content and add tracking parameters
 */
function personalizeEmail(template, firstName, email) {
  let personalized = template;
  
  // Replace first name
  const firstNameValue = firstName && firstName.trim() ? firstName.trim() : '';
  personalized = personalized.replace(/\{\{FIRST_NAME\}\}/g, firstNameValue);
  
  // Add email tracking parameter to all linkedora.com links
  const encodedEmail = encodeURIComponent(email);
  const timestamp = Date.now();
  const trackingParams = `?email=${encodedEmail}&source=email&campaign=automation&ts=${timestamp}`;
  
  // Replace all linkedora.com URLs with tracking parameters
  personalized = personalized.replace(/https:\/\/www\.linkedora\.com\//g, `https://www.linkedora.com/${trackingParams}`);
  
  // Clean up greeting if name is empty
  if (!firstNameValue) {
    personalized = personalized.replace(/Hi\s*,/g, 'Hi there,');
    personalized = personalized.replace(/Ready to Get Started,\s*\?/g, 'Ready to Get Started?');
  }
  
  return personalized;
}

/**
 * Read contacts from CSV
 */
async function readContacts(csvPath) {
  return new Promise((resolve, reject) => {
    const contacts = [];
    
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        // Only add if email exists
        if (row.email && row.email.trim()) {
          contacts.push({
            email: row.email.trim().toLowerCase(),
            firstName: row.first_name || ''
          });
        }
      })
      .on('end', () => {
        resolve(contacts);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

/**
 * Validate email address
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get random subject line for A/B testing
 */
function getRandomSubject() {
  return SUBJECT_LINES[Math.floor(Math.random() * SUBJECT_LINES.length)];
}

/**
 * Send email with anti-spam best practices
 */
async function sendEmail(transporter, contact, template, failedEmails) {
  try {
    // Validate email
    if (!isValidEmail(contact.email)) {
      stats.skipped++;
      return { success: false, error: null };
    }

    // Personalize template with tracking
    const personalizedContent = personalizeEmail(template, contact.firstName, contact.email);
    
    // Get subject line
    const subject = getRandomSubject();
    
    // Email options with anti-spam headers
    const mailOptions = {
      from: {
        name: CONFIG.sender.name,
        address: CONFIG.sender.email
      },
      to: contact.email,
      subject: subject,
      html: personalizedContent,
      // Anti-spam headers
      headers: {
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Importance': 'Normal',
        'Precedence': 'bulk'
      },
      // Text version (important for spam filters)
      text: `Hi ${contact.firstName || 'there'},\n\nAutomate Your LinkedIn with AI-powered content creation.\n\nVisit: https://www.linkedora.com/`
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    stats.sent++;
    
    // Log successful send
    const displayName = contact.firstName || 'No name';
    console.log(`✅ Email sent to: ${displayName} <${contact.email}>`);
    
    return { success: true, error: null };
    
  } catch (error) {
    stats.failed++;
    
    // Store failed email with error
    failedEmails.push({
      email: contact.email,
      firstName: contact.firstName,
      error: error.message,
      timestamp: new Date().toISOString()
    });
    
    console.error(`❌ Error sending to ${contact.email}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Delay function
 */
function delay(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

/**
 * Main function
 */
async function main() {
  // Validate configuration
  if (!CONFIG.email.auth.user || !CONFIG.email.auth.pass) {
    process.exit(1);
  }

  if (!CONFIG.sender.email) {
    process.exit(1);
  }

  stats.startTime = new Date();

  try {
    // Load progress
    const progress = loadProgress();
    const processedEmails = new Set(progress.processedEmails || []);
    const failedEmails = progress.failedEmails || [];
    
    stats.resumed = processedEmails.size;
    stats.sent = progress.successCount || 0;
    stats.failed = progress.failedCount || 0;
    stats.skipped = progress.skippedCount || 0;

    // Load email template
    const template = loadEmailTemplate();

    // Load contacts from CSV
    const csvPath = path.resolve(__dirname, CONFIG.paths.csvFile);
    
    if (!fs.existsSync(csvPath)) {
      process.exit(1);
    }

    const allContacts = await readContacts(csvPath);
    
    // Filter out already processed contacts
    const contacts = allContacts.filter(c => !processedEmails.has(c.email));
    
    stats.total = allContacts.length;

    if (contacts.length === 0) {
      // All done, mark as completed
      saveProgress({
        processedEmails: Array.from(processedEmails),
        failedEmails: failedEmails,
        lastIndex: stats.total,
        successCount: stats.sent,
        failedCount: stats.failed,
        skippedCount: stats.skipped,
        totalCount: stats.total,
        campaignStatus: 'completed'
      });
      process.exit(0);
    }

    // Create transporter
    const transporter = createTransporter();
    
    // Verify connection
    await transporter.verify();

    // Start sending log
    console.log(`🚀 Starting email campaign: ${contacts.length} emails to send`);
    console.log(`⏱️  Estimated time: ~${Math.ceil(contacts.length * CONFIG.settings.delaySeconds / 60)} minutes\n`);

    // Start sending
    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      const globalIndex = processedEmails.size + i + 1;
      
      // Send email
      const result = await sendEmail(transporter, contact, template, failedEmails);
      
      // Update stats and save progress
      if (result.success) {
        processedEmails.add(contact.email);
      }
      
      // Save progress after each email
      saveProgress({
        processedEmails: Array.from(processedEmails),
        failedEmails: failedEmails,
        lastIndex: globalIndex,
        successCount: stats.sent,
        failedCount: stats.failed,
        skippedCount: stats.skipped,
        totalCount: stats.total,
        campaignStatus: 'in-progress'
      });
      
      // Delay before next email (except for last one)
      if (i < contacts.length - 1) {
        await delay(CONFIG.settings.delaySeconds);
      }
    }

    // Close transporter
    transporter.close();

    // Mark campaign as completed if all done
    if (processedEmails.size === stats.total) {
      saveProgress({
        processedEmails: Array.from(processedEmails),
        failedEmails: failedEmails,
        lastIndex: stats.total,
        successCount: stats.sent,
        failedCount: stats.failed,
        skippedCount: stats.skipped,
        totalCount: stats.total,
        campaignStatus: 'completed'
      });
      
      // Final summary
      console.log(`\n✅ Campaign completed!`);
      console.log(`📊 Success: ${stats.sent} | Failed: ${stats.failed} | Skipped: ${stats.skipped}`);
      console.log(`📁 Full details in progress.json\n`);
    }

  } catch (error) {
    console.error(`❌ Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// Handle script interruption (Ctrl+C)
process.on('SIGINT', () => {
  process.exit(0);
});

// Run the script
main().catch(error => {
  process.exit(1);
});
