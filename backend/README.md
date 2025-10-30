# AutoLink Backend

Automated LinkedIn post generation and publishing system with AI-powered content creation.

## 🚀 Features

- User authentication (JWT-based)
- LinkedIn OAuth 2.0 integration
- Topic management for content generation
- Scheduled post creation with AI (OpenAI GPT)
- AI-powered image generation with Gemini API Imagen
- Automatic publishing to LinkedIn
- Background job processing with BullMQ
- Cron jobs for scheduled tasks
- Email verification
- Encrypted token storage

## 📋 Prerequisites

- Node.js v18+ 
- MongoDB
- Redis (for BullMQ job queue)
- OpenAI API Key (for text generation)
- Gemini API Key (for image generation)
- LinkedIn Developer App credentials
- Cloudinary account (for image hosting)

## 🛠️ Installation

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Update `.env` with your credentials:
   - MongoDB connection string
   - JWT secret
   - LinkedIn OAuth credentials
   - OpenAI API key (for text generation)
   - Gemini API key (for image generation) - See [GEMINI_API_SETUP.md](../GEMINI_API_SETUP.md)
   - Cloudinary credentials (for image hosting)
   - Redis connection details
   - Email service credentials (optional)

## 🏃 Running the Application

### Development Mode

1. Start the main server:
```bash
npm run dev
```

2. In a separate terminal, start the worker process:
```bash
npm run worker
```

### Production Mode

```bash
npm start
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files (DB, Redis, LinkedIn, OpenAI)
│   ├── controllers/     # Request handlers
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middlewares/     # Custom middleware
│   ├── services/        # Business logic (AI, LinkedIn)
│   ├── jobs/            # BullMQ job definitions
│   ├── workers/         # Background job workers
│   ├── cron/            # Cron jobs for scheduling
│   ├── utils/           # Helper functions
│   └── server.js        # Main application file
├── package.json
└── .env
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/verify-email/:token` - Verify email

### LinkedIn Integration
- `GET /api/linkedin/connect` - Get OAuth URL
- `GET /api/linkedin/callback` - OAuth callback
- `GET /api/linkedin/status` - Get connection status
- `DELETE /api/linkedin/disconnect` - Disconnect account

### Topics
- `POST /api/topics` - Create topic
- `GET /api/topics` - Get all topics
- `GET /api/topics/:id` - Get single topic
- `PUT /api/topics/:id` - Update topic
- `DELETE /api/topics/:id` - Delete topic

### Automation
- `POST /api/automation/schedule` - Schedule a post
- `GET /api/automation/scheduled` - Get scheduled posts
- `GET /api/automation/scheduled/:id` - Get single scheduled post
- `DELETE /api/automation/scheduled/:id` - Cancel scheduled post
- `GET /api/automation/posts` - Get generated posts history
- `GET /api/automation/stats` - Get dashboard statistics

## 🔐 LinkedIn API Setup

1. Create a LinkedIn App at https://www.linkedin.com/developers/
2. Add redirect URI: `http://localhost:5000/api/linkedin/callback`
3. Request access to required products:
   - Sign In with LinkedIn
   - Share on LinkedIn
4. Copy Client ID and Client Secret to `.env`

## 🤖 How It Works

1. **User Registration**: Users sign up and verify their email
2. **LinkedIn Connection**: Users connect their LinkedIn account via OAuth
3. **Topic Creation**: Users create topics for content generation
4. **Post Scheduling**: Users schedule posts with:
   - Create time (when AI generates content)
   - Post time (when it publishes to LinkedIn)
5. **AI Generation**: At create time:
   - OpenAI GPT generates post content
   - Gemini Imagen generates a professional image
   - Image is uploaded to Cloudinary
6. **Auto Publishing**: At post time, content with image is published to LinkedIn

## 🔄 Background Processing

The system uses two methods for reliable scheduling:

1. **BullMQ** (primary): Redis-based job queue for scalable processing
2. **Cron Jobs** (fallback): Checks for pending tasks every minute

Both the main server and worker process must be running for full functionality.

## 📊 Database Models

- **User**: User accounts and authentication
- **LinkedInAccount**: LinkedIn OAuth tokens (encrypted)
- **Topic**: Content topics with keywords and tone
- **ScheduledPost**: Scheduled post information
- **GeneratedPost**: AI-generated content and LinkedIn post data

## 🔒 Security

- Passwords hashed with bcryptjs
- JWT-based authentication
- LinkedIn tokens encrypted at rest
- CORS configured for frontend
- Environment variables for sensitive data
- Input validation on all endpoints

## 🐛 Troubleshooting

**MongoDB Connection Issues:**
- Ensure MongoDB is running
- Check connection string in `.env`

**Redis Connection Issues:**
- Ensure Redis is running: `redis-server`
- Check Redis host/port in `.env`

**LinkedIn API Errors:**
- Verify OAuth credentials
- Check redirect URI matches exactly
- Ensure app has required permissions

**OpenAI API Errors:**
- Verify API key is valid
- Check API usage limits
- Ensure correct model name

**Gemini Image Generation Issues:**
- See detailed guide: [GEMINI_API_SETUP.md](../GEMINI_API_SETUP.md)
- Verify `GEMINI_API_KEY` is set in `.env`
- Check API quota in Google AI Studio
- Review prompt length (max 480 tokens)

## 📝 License

MIT

