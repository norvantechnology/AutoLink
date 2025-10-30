# AutoLink Frontend

Modern React frontend for LinkedIn automation with AI-powered content generation.

## 🚀 Features

- User authentication (signup/login)
- LinkedIn OAuth connection
- Topic management for content generation
- Post scheduling interface
- Real-time dashboard with analytics
- Post history with engagement metrics
- Responsive design with Tailwind CSS
- Modern UI with smooth animations

## 🛠️ Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Zustand** - State management
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **date-fns** - Date formatting

## 📋 Prerequisites

- Node.js v18+
- Backend API running on port 5000

## 🏃 Getting Started

### Installation

```bash
npm install
```

### Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update environment variables:
```env
VITE_API_URL=http://localhost:5000/api
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Auth/           # Login, Signup, VerifyEmail
│   │   ├── Dashboard/      # Main dashboard
│   │   ├── Topics/         # Topic management
│   │   ├── LinkedIn/       # LinkedIn connection
│   │   └── Automation/     # Post scheduling & history
│   ├── components/
│   │   └── Layout.jsx      # Main layout with sidebar
│   ├── store/
│   │   ├── authStore.js    # Authentication state
│   │   └── linkedinStore.js # LinkedIn connection state
│   ├── services/
│   │   └── api.js          # API client & endpoints
│   ├── App.jsx             # Main app component & routing
│   ├── main.jsx            # App entry point
│   └── index.css           # Global styles & Tailwind
├── index.html
├── package.json
└── vite.config.js
```

## 🎨 Pages Overview

### Authentication
- **Login** (`/login`) - User login with email/password
- **Signup** (`/signup`) - New user registration
- **Verify Email** (`/verify-email`) - Email verification handler

### Main Application
- **Dashboard** (`/dashboard`) - Overview with stats and quick actions
- **Topics** (`/topics`) - Create and manage content topics
- **LinkedIn** (`/linkedin`) - Connect/disconnect LinkedIn account
- **Automation** (`/automation`) - View all scheduled posts
- **Schedule Post** (`/automation/schedule`) - Create new scheduled post
- **Post History** (`/automation/history`) - View published posts with metrics

## 🔐 Authentication Flow

1. User signs up or logs in
2. JWT token stored in localStorage
3. Token automatically added to API requests via Axios interceptor
4. Protected routes check authentication status
5. Auto-redirect to login if token expires

## 🎯 State Management

### Auth Store (Zustand)
- User data
- Authentication status
- Login/logout methods
- Auto-load user on app start

### LinkedIn Store (Zustand)
- Connection status
- Account data
- Connect/disconnect methods
- Status checking

## 🎨 Styling

### Tailwind CSS
- Utility-first CSS framework
- Custom color scheme with LinkedIn branding
- Responsive design with mobile-first approach
- Custom component classes in `index.css`

### Component Classes
- `.btn` - Base button styles
- `.btn-primary` - Primary button (LinkedIn blue)
- `.btn-secondary` - Secondary button (gray)
- `.btn-danger` - Danger button (red)
- `.input` - Form input styles
- `.card` - Card container
- `.badge` - Status badge
- `.badge-*` - Status-specific badges

## 📱 Responsive Design

- Mobile-first approach
- Collapsible sidebar on mobile
- Responsive grids and layouts
- Touch-friendly UI elements

## 🔔 Notifications

Using `react-hot-toast` for user feedback:
- Success messages (green)
- Error messages (red)
- Loading states
- Auto-dismiss after 3-4 seconds

## 🚀 API Integration

All API calls are centralized in `src/services/api.js`:

```javascript
// Authentication
authAPI.signup(data)
authAPI.login(data)
authAPI.getMe()

// LinkedIn
linkedinAPI.getAuthUrl()
linkedinAPI.getStatus()
linkedinAPI.disconnect()

// Topics
topicsAPI.create(data)
topicsAPI.getAll()
topicsAPI.update(id, data)
topicsAPI.delete(id)

// Automation
automationAPI.schedulePost(data)
automationAPI.getScheduledPosts(status)
automationAPI.getGeneratedPosts()
automationAPI.getStats()
```

## 🔧 Development Tips

### Hot Module Replacement
Vite provides instant HMR for fast development.

### State Devtools
Use React DevTools and Zustand DevTools for debugging.

### Error Handling
All API calls include try-catch with toast notifications.

### Code Organization
- Keep components small and focused
- Use custom hooks for reusable logic
- Centralize API calls in services
- Store global state in Zustand stores

## 🐛 Common Issues

**API Connection Error:**
- Ensure backend is running on port 5000
- Check CORS configuration in backend
- Verify API URL in `.env`

**Authentication Issues:**
- Clear localStorage and try again
- Check JWT token expiration
- Verify backend authentication endpoints

**LinkedIn OAuth:**
- Ensure redirect URI matches backend config
- Check LinkedIn app credentials
- Verify OAuth flow in network tab

## 📝 License

MIT

