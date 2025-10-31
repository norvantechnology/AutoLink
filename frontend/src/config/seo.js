// SEO Configuration - Update all meta tags from this single file
// This makes it easy to manage SEO across your entire website

export const seoConfig = {
  // Default/Global SEO Settings
  default: {
    siteName: 'LinkedOra',
    siteUrl: 'https://www.linkedora.com',
    twitterHandle: '@linkedora',
    locale: 'en_US',
    type: 'website',
    
    // Default image for social sharing (Open Graph & Twitter)
    defaultImage: 'https://www.linkedora.com/og-image.jpg', // Update with your actual image URL
    imageWidth: '1200',
    imageHeight: '630',
  },

  // Page-Specific SEO Settings
  pages: {
    home: {
      title: 'LinkedOra - AI-Powered LinkedIn Automation | Grow Your Network on Autopilot',
      description: 'Automate your LinkedIn presence with AI-generated content. Post 3x daily, grow your network 5x faster, and save 15+ hours weekly. Trusted by 500+ professionals worldwide.',
      keywords: 'LinkedIn automation, AI content generation, LinkedIn marketing, social media automation, LinkedIn scheduler, professional networking, LinkedIn growth, AI writing, content marketing, LinkedIn posts',
      path: '/',
      ogType: 'website'
    },
    
    login: {
      title: 'Login to LinkedOra - Access Your Dashboard',
      description: 'Sign in to your LinkedOra account and manage your automated LinkedIn presence. Access analytics, scheduled posts, and AI-generated content.',
      keywords: 'LinkedOra login, sign in, user dashboard, LinkedIn automation access',
      path: '/login',
      ogType: 'website'
    },
    
    signup: {
      title: 'Sign Up for LinkedOra - Start Your Free Trial',
      description: 'Create your LinkedOra account and start automating your LinkedIn content today. No credit card required. Setup in 5 minutes.',
      keywords: 'LinkedOra signup, create account, free trial, LinkedIn automation registration, get started',
      path: '/signup',
      ogType: 'website'
    },

    forgotPassword: {
      title: 'Reset Your Password - LinkedOra',
      description: 'Reset your LinkedOra account password securely. Enter your email to receive a verification code.',
      keywords: 'reset password, forgot password, account recovery',
      path: '/forgot-password',
      ogType: 'website'
    },

    dashboard: {
      title: 'Dashboard - LinkedOra',
      description: 'Your LinkedOra dashboard - Manage automated posts, view analytics, and grow your LinkedIn presence.',
      keywords: 'dashboard, LinkedIn analytics, post management',
      path: '/app/dashboard',
      ogType: 'website',
      robots: 'noindex, nofollow' // Private pages
    }
  },

  // Structured Data (JSON-LD) for Rich Snippets
  structuredData: {
    organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'LinkedOra',
      url: 'https://www.linkedora.com',
      logo: 'https://www.linkedora.com/logo.png',
      description: 'AI-powered LinkedIn automation platform for professionals',
      email: 'info@linkedora.com',
      sameAs: [
        'https://www.linkedin.com/company/linkedora',
        'https://twitter.com/linkedora'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'info@linkedora.com',
        contactType: 'Customer Support',
        availableLanguage: ['English']
      }
    },

    website: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'LinkedOra',
      url: 'https://www.linkedora.com',
      description: 'Automate your LinkedIn presence with AI-powered content generation',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://www.linkedora.com/?s={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    },

    softwareApplication: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'LinkedOra',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        lowPrice: '6',
        highPrice: '99',
        offerCount: '5'
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        ratingCount: '500',
        bestRating: '5',
        worstRating: '1'
      },
      description: 'AI-powered LinkedIn automation that generates and posts content automatically',
      featureList: [
        'AI Content Generation',
        'Automated Scheduling',
        'LinkedIn Analytics',
        'Multi-topic Support',
        '3 Posts Per Day'
      ]
    }
  }
};

export default seoConfig;

