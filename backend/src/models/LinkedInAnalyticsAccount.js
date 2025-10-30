import mongoose from 'mongoose';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your_32_character_encryption_key';
const ALGORITHM = 'aes-256-cbc';

// Encryption function
const encrypt = (text) => {
  if (!text) return text;
  
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

// Decryption function
const decrypt = (text) => {
  if (!text) return text;
  
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

const linkedInAnalyticsAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  linkedInId: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    required: true,
    set: encrypt
  },
  refreshToken: {
    type: String,
    set: encrypt
  },
  expiresAt: {
    type: Date,
    required: true
  },
  profileData: {
    name: String,
    email: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Method to get decrypted access token
linkedInAnalyticsAccountSchema.methods.getDecryptedAccessToken = function() {
  return decrypt(this.accessToken);
};

// Method to get decrypted refresh token
linkedInAnalyticsAccountSchema.methods.getDecryptedRefreshToken = function() {
  return this.refreshToken ? decrypt(this.refreshToken) : null;
};

linkedInAnalyticsAccountSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const LinkedInAnalyticsAccount = mongoose.model('LinkedInAnalyticsAccount', linkedInAnalyticsAccountSchema);

export default LinkedInAnalyticsAccount;


