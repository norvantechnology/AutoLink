import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Linkedin, Bot, Calendar, TrendingUp, Zap, Users, MessageSquare, BarChart3, Clock, CheckCircle, ArrowRight, Mail, Star, Shield, Sparkles, Target, Award, Globe, Heart, Rocket, DollarSign, TrendingDown, ChevronLeft, ChevronRight, ExternalLink, ThumbsUp } from 'lucide-react';
import SEO from '../../components/SEO';
import useAuthStore from '../../store/authStore';
import { publicAPI } from '../../services/api';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuthStore();
  const [topPosts, setTopPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollContainerRef = useRef(null);
  const autoScrollRef = useRef(null);

  // Fetch top performing posts
  useEffect(() => {
    const fetchTopPosts = async () => {
      try {
        const response = await publicAPI.getTopPosts();
        if (response.data.success && response.data.posts.length > 0) {
          setTopPosts(response.data.posts);
        }
      } catch (error) {
        console.error('Error fetching top posts:', error);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchTopPosts();
  }, []);

  // Auto-scroll functionality - scroll by 3 cards
  useEffect(() => {
    if (topPosts.length === 0) return;

    const maxSlide = Math.ceil(topPosts.length / 3) - 1;
    
    autoScrollRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
    }, 5000); // Auto-scroll every 5 seconds

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [topPosts.length]);

  const maxSlide = Math.ceil(topPosts.length / 3) - 1;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
    // Reset auto-scroll timer
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
      }, 5000);
    }
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev <= 0 ? maxSlide : prev - 1));
    // Reset auto-scroll timer
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
      }, 5000);
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    // Reset auto-scroll timer
    if (autoScrollRef.current) {
      clearInterval(autoScrollRef.current);
      autoScrollRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev >= maxSlide ? 0 : prev + 1));
      }, 5000);
    }
  };

  // Handle Get Started button click - redirect to dashboard if logged in
  const handleGetStarted = (e) => {
    e.preventDefault();
    if (isAuthenticated || token) {
      navigate('/app/dashboard');
    } else {
      navigate('/signup');
    }
  };
  const features = [
    {
      icon: Bot,
      title: 'AI-Powered Content Generation',
      description: 'Our advanced AI creates engaging, professional LinkedIn posts tailored to your industry and audience. Never run out of content ideas again!'
    },
    {
      icon: Calendar,
      title: 'Smart Auto-Scheduling',
      description: 'Posts automatically publish 3 times daily at peak engagement times (9 AM, 2 PM, 6 PM). Maximize your reach without lifting a finger.'
    },
    {
      icon: TrendingUp,
      title: 'Real-Time Analytics',
      description: 'Comprehensive dashboard showing likes, comments, shares, and engagement rates. Make data-driven decisions to boost your performance.'
    },
    {
      icon: Zap,
      title: '100% Automated Workflow',
      description: 'Set it once and watch it work. Our automation handles everything from content creation to posting to analytics tracking.'
    },
    {
      icon: MessageSquare,
      title: 'Unlimited Topics & Themes',
      description: 'Create as many topics as you want. AI generates unique, relevant content for each topic ensuring variety and engagement.'
    },
    {
      icon: Users,
      title: 'Audience Growth Engine',
      description: 'Consistent, quality posting increases your visibility, grows your follower base, and establishes you as a thought leader in your industry.'
    },
    {
      icon: Shield,
      title: 'Secure & Compliant',
      description: 'Bank-level security with OAuth 2.0 LinkedIn integration. Your credentials are never stored, and we comply with all LinkedIn policies.'
    },
    {
      icon: Target,
      title: 'Industry-Specific Content',
      description: 'AI understands your niche and creates content that resonates with your specific audience, whether you\'re in tech, finance, marketing, or any field.'
    }
  ];

  const benefits = [
    { text: 'Save 10-15 hours every week on content creation', highlight: '10-15 hours' },
    { text: 'Boost engagement by up to 300% with consistent posting', highlight: '300%' },
    { text: 'Never miss important industry trends or posting opportunities', highlight: 'Never miss' },
    { text: 'Professional, error-free content that builds credibility', highlight: 'Professional' },
    { text: 'Grow your network 5x faster with regular, quality posts', highlight: '5x faster' },
    { text: 'Track ROI with detailed analytics and performance metrics', highlight: 'Track ROI' },
    { text: 'Maintain active presence even during vacations or busy periods', highlight: 'Always active' },
    { text: 'Establish thought leadership in your industry automatically', highlight: 'Thought leader' }
  ];

  const realResults = [
    {
      metric: '10x',
      label: 'More Profile Views',
      description: 'Users see dramatic increase in profile visibility'
    },
    {
      metric: '5x',
      label: 'Higher Engagement',
      description: 'More likes, comments, and shares on posts'
    },
    {
      metric: '3x',
      label: 'Faster Network Growth',
      description: 'Connection requests and follower growth'
    },
    {
      metric: '15hrs',
      label: 'Time Saved Weekly',
      description: 'Focus on your business, not content creation'
    }
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Connect LinkedIn',
      description: 'Securely connect your LinkedIn account in just one click using OAuth 2.0. No passwords stored, completely safe.'
    },
    {
      step: '2',
      title: 'Add Your Topics',
      description: 'Tell us what you want to post about - your industry, expertise, interests. Create unlimited topics for content variety.'
    },
    {
      step: '3',
      title: 'AI Does the Work',
      description: 'Our AI generates unique, engaging posts for each topic. Content is professional, relevant, and tailored to your audience.'
    },
    {
      step: '4',
      title: 'Auto-Posting',
      description: 'Posts publish automatically 3x daily at optimal times. No manual work required - ever!'
    }
  ];


  const useCases = [
    {
      title: 'For Entrepreneurs',
      description: 'Build your personal brand while focusing on growing your business',
      icon: Rocket
    },
    {
      title: 'For Executives',
      description: 'Establish thought leadership and increase industry influence',
      icon: Award
    },
    {
      title: 'For Sales Teams',
      description: 'Stay top-of-mind with prospects and generate more inbound leads',
      icon: DollarSign
    },
    {
      title: 'For Consultants',
      description: 'Showcase expertise and attract high-value clients consistently',
      icon: Target
    },
    {
      title: 'For Marketers',
      description: 'Amplify reach and demonstrate marketing expertise effortlessly',
      icon: Globe
    },
    {
      title: 'For Job Seekers',
      description: 'Stand out to recruiters with an active, professional LinkedIn presence',
      icon: Users
    }
  ];

  const faqs = [
    {
      q: 'How does the AI create content?',
      a: 'Our AI analyzes your topics, industry trends, and best-performing LinkedIn content to generate unique, engaging posts that sound natural and professional.'
    },
    {
      q: 'Will the content sound like me?',
      a: 'Yes! You can customize the tone, style, and topics. The AI learns from your preferences and creates content that aligns with your voice and expertise.'
    },
    {
      q: 'Is it safe to connect my LinkedIn account?',
      a: 'Absolutely! We use OAuth 2.0 (the same method LinkedIn uses). We never see or store your password. You can disconnect anytime with one click.'
    },
    {
      q: 'Can I review posts before they\'re published?',
      a: 'Yes! You have full control. Review, edit, or delete any scheduled post. You can also set posts to require approval before publishing.'
    },
    {
      q: 'What if I want to take a break?',
      a: 'Simply pause automation from your dashboard. Resume anytime. You\'re always in control of when and what gets posted.'
    },
    {
      q: 'How do I get started?',
      a: 'Simply sign up with your email, connect your LinkedIn account, and start creating topics. You\'ll be posting automatically within 5 minutes!'
    }
  ];

  return (
    <div className="page-container">
      {/* SEO Meta Tags */}
      <SEO page="home" />
      
      {/* Navigation - Clean & Simple */}
      <nav className="nav-bar">
        <div className="nav-container">
          <div className="nav-content">
            {/* Logo */}
            <Link to="/" className="nav-logo-link">
              <div className="nav-logo-icon">
                <Linkedin className="icon-md icon-white" />
              </div>
              <span className="nav-logo-text">LinkedOra</span>
            </Link>

            {/* CTA Button - Responsive */}
            <button onClick={handleGetStarted} className="nav-cta-btn">
              <span>Get Started</span>
              <ArrowRight className="icon-sm" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Premium 3D Effect */}
      <section className="hero-section animate-gradient">
        {/* Animated Mesh Gradient Background */}
        <div className="hero-bg-gradient">
          <div className="hero-blob-1"></div>
          <div className="hero-blob-2"></div>
          <div className="hero-blob-3"></div>
        </div>

        {/* Floating 3D Icons with Depth */}
        <div className="hero-icons">
          <Linkedin className="hero-icon animate-float" style={{ top: '5rem', left: '2.5rem', width: '4rem', height: '4rem', animationDelay: '0s', animationDuration: '6s' }} />
          <Bot className="hero-icon animate-float" style={{ top: '10rem', right: '5rem', width: '5rem', height: '5rem', animationDelay: '1s', animationDuration: '7s' }} />
          <Calendar className="hero-icon animate-float" style={{ bottom: '8rem', left: '5rem', width: '4.5rem', height: '4.5rem', animationDelay: '2s', animationDuration: '8s' }} />
          <TrendingUp className="hero-icon animate-float" style={{ top: '25%', right: '2.5rem', width: '3.5rem', height: '3.5rem', animationDelay: '0.5s', animationDuration: '6.5s' }} />
          <Zap className="hero-icon animate-float" style={{ bottom: '5rem', right: '8rem', width: '4rem', height: '4rem', animationDelay: '1.5s', animationDuration: '7.5s' }} />
          <Users className="hero-icon animate-float" style={{ top: '33%', left: '4rem', width: '3rem', height: '3rem', animationDelay: '2.5s', animationDuration: '8.5s' }} />
        </div>

        <div className="hero-content">
          <h1 className="hero-title">
            Your LinkedIn, On
            <br />
            <span className="hero-title-accent">Complete Autopilot</span>
          </h1>
          <p className="hero-subtitle">
            Stop spending 10+ hours weekly on LinkedIn content. Our AI creates, schedules, and posts engaging content automatically—3 times every single day.
          </p>
          <p className="hero-description">
            Join 500+ professionals who've transformed their LinkedIn presence while focusing on what really matters—growing their business.
          </p>
          <div className="hero-cta-container">
            <button onClick={handleGetStarted} className="hero-cta-primary">
              <Rocket className="icon-md" />
              <span>Get Started Free</span>
              <ArrowRight className="icon-md" />
            </button>
            <Link to="/login" className="hero-secondary-link">
              Already have an account? Sign in
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="hero-trust-indicators">
            <div className="trust-item">
              <CheckCircle className="icon-sm" />
              <span>Trusted by 500+ Professionals</span>
            </div>
            <div className="trust-item">
              <CheckCircle className="icon-sm" />
              <span>4.9/5 Star Rating</span>
            </div>
            <div className="trust-item">
              <CheckCircle className="icon-sm" />
              <span>24/7 Automation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Example Posts Showcase Section - Real Posts from DB - MOVED TO TOP */}
      <section className="section-sm bg-gradient-soft">
        <div className="container-max">
          <div className="section-header">
            <span className="section-badge">See It In Action</span>
            <h2 className="section-title">Real Posts Generated by Our AI</h2>
            <p className="section-subtitle">Top performing posts from our users—engaging, professional content that drives real results</p>
          </div>

          {loadingPosts ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p className="loading-text">Loading amazing posts...</p>
            </div>
          ) : topPosts.length > 0 && (
            <div className="carousel-wrapper">
              {/* Carousel Container */}
              <div className="carousel-container">
                <div 
                  className="carousel-track"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {topPosts.map((post, index) => (
                    <div 
                      key={post.id} 
                      className="carousel-slide"
                    >
                      <div className="card-3d post-card">
                        <div className="post-card-inner">
                          {/* Topic Badge & LinkedIn Link */}
                          <div className="post-header">
                            <span className="topic-badge">
                              {post.topic.name}
                            </span>
                            <a
                              href={post.linkedInUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="view-btn"
                            >
                              <span>View</span>
                              <ExternalLink className="icon-xs" />
                            </a>
                          </div>
                          
                          {/* Post Content */}
                          <div className="post-content">
                            <p className="post-text">
                              {post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content}
                            </p>
                            {post.hashtags && post.hashtags.length > 0 && (
                              <div className="hashtag-container">
                                {post.hashtags.slice(0, 3).map((tag, idx) => (
                                  <span key={idx} className="hashtag">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Post Image if exists */}
                          {post.imageUrl && (
                            <div className="post-image-container">
                              <img 
                                src={post.imageUrl} 
                                alt="Post visual"
                                className="post-image"
                                loading="lazy"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              {topPosts.length > 3 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="btn-nav-arrow btn-nav-left"
                    aria-label="Previous posts"
                  >
                    <ChevronLeft className="icon-nav" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="btn-nav-arrow btn-nav-right"
                    aria-label="Next posts"
                  >
                    <ChevronRight className="icon-nav" />
                  </button>
                </>
              )}

              {/* Dots Navigation */}
              {topPosts.length > 3 && (
                <div className="carousel-dots">
                  {Array.from({ length: Math.ceil(topPosts.length / 3) }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`dot ${index === currentSlide ? 'active' : ''}`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Real Results Section */}
      <section className="section-sm bg-white">
        <div className="container-max">
          <div className="section-header">
            <span className="section-badge">Proven Results</span>
            <h2 className="section-title-lg">Real Impact, Real Numbers</h2>
            <p className="section-subtitle">See the average results our users achieve within the first 90 days</p>
          </div>

          <div className="grid-results">
            {realResults.map((result, index) => (
              <div key={index} className="result-card">
                <div className="result-metric">{result.metric}</div>
                <div className="result-label">{result.label}</div>
                <div className="result-description">{result.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-md bg-gray-50">
        <div className="container-max">
          <div className="section-header">
            <span className="section-badge">Powerful Features</span>
            <h2 className="section-title-lg">Everything You Need to Dominate LinkedIn</h2>
            <p className="section-subtitle">Advanced tools and automation that put your LinkedIn growth on steroids</p>
          </div>

          <div className="grid-features">
            {features.slice(0, 6).map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="feature-card">
                  <div className="feature-icon">
                    <Icon className="icon-lg icon-white" />
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              );
            })}
          </div>

          {/* Additional Features - Premium 3D Cards */}
          <div className="grid-features" style={{ marginTop: '1.5rem' }}>
            {features.slice(6).map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="feature-card">
                  <div className="feature-icon">
                    <Icon className="icon-lg icon-white" />
                  </div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="section-md bg-white">
        <div className="container-max">
          <div className="section-header">
            <span className="section-badge">Perfect For</span>
            <h2 className="section-title-lg">Built for Every Professional</h2>
            <p className="section-subtitle">Whether you're building a personal brand or growing your business, LinkedOra works for you</p>
          </div>

          <div className="grid-use-cases">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon;
              return (
                <div key={index} className="use-case-card">
                  <div className="use-case-icon">
                    <Icon className="icon-md icon-white" />
                  </div>
                  <h3 className="use-case-title">{useCase.title}</h3>
                  <p className="use-case-description">{useCase.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-md bg-gray-50">
        <div className="container-max">
          <div className="section-header">
            <span className="section-badge">Simple Process</span>
            <h2 className="section-title">From Setup to Success in 4 Easy Steps</h2>
            <p className="section-subtitle">Get your LinkedIn automation running in less than 5 minutes</p>
          </div>

          <div className="grid-steps">
            {howItWorks.map((item, index) => (
              <div key={index} className="step-container">
                {index < howItWorks.length - 1 && (
                  <div className="step-connector"></div>
                )}
                <div className="step-card">
                  <div className="step-circle">
                    {item.step}
                  </div>
                  <h3 className="step-title">{item.title}</h3>
                  <p className="step-description">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA after How It Works */}
          <div className="cta-container-centered">
            <button onClick={handleGetStarted} className="btn-primary-gradient">
              <Rocket className="icon-md" />
              <span>Get Started Now</span>
              <ArrowRight className="icon-md" />
            </button>
            <p className="cta-note">
              <span className="cta-note-item">
                <Clock className="icon-sm" style={{ color: '#3b82f6' }} />
                <span>Setup in 5 minutes</span>
              </span>
              <span>•</span>
              <span className="cta-note-item">
                <Shield className="icon-sm" style={{ color: '#a855f7' }} />
                <span>Secure & Professional</span>
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="section-md bg-linkedin-gradient">
        <div className="bg-pattern-overlay">
          <div className="bg-pattern-dots"></div>
        </div>

        <div className="container-max relative-z10">
          <div className="section-header">
            <span className="section-badge" style={{ color: '#bfdbfe' }}>Real Benefits</span>
            <h2 className="section-title section-title-white">Why Successful Professionals Choose LinkedOra</h2>
            <p className="section-subtitle section-subtitle-light">Transform your LinkedIn presence and unlock opportunities you never thought possible</p>
          </div>

          <div className="grid-benefits">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-item">
                <div className="benefit-check">
                  <div className="benefit-check-icon">
                    <CheckCircle className="icon-sm icon-white" />
                  </div>
                </div>
                <div>
                  <span className="benefit-text">{benefit.text}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Extra benefit callout */}
          <div className="benefit-callout">
            <Sparkles className="benefit-callout-icon" />
            <h3 className="benefit-callout-title">Plus: Completely Hands-Free</h3>
            <p className="benefit-callout-text">
              Once you set it up, LinkedOra works 24/7 in the background. Wake up to new posts, growing engagement, and expanding network—all without any effort from you.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-md bg-gray-50">
        <div className="container-md">
          <div className="section-header">
            <span className="section-badge">FAQ</span>
            <h2 className="section-title">Common Questions Answered</h2>
            <p className="section-subtitle">Everything you need to know about LinkedOra</p>
          </div>

          <div className="faq-list">
            {faqs.map((faq, index) => (
              <details key={index} className="faq-item">
                <summary className="faq-question">
                  <span className="faq-question-text">{faq.q}</span>
                  <span className="faq-icon">
                    <svg className="icon-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <p className="faq-answer">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="section-md bg-white-border">
        <div className="container-max">
          <div className="section-header-center">
            <h2 className="section-title">Trusted by Professionals Worldwide</h2>
          </div>
          <div className="grid-stats">
            <div className="stat-card">
              <div className="stat-number">15,000+</div>
              <div className="stat-label">Posts Generated</div>
              <div className="stat-sublabel">This Month</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">500+</div>
              <div className="stat-label">Active Professionals</div>
              <div className="stat-sublabel">And Growing</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">98%</div>
              <div className="stat-label">Satisfaction Rate</div>
              <div className="stat-sublabel">5-Star Reviews</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Automation</div>
              <div className="stat-sublabel">Never Stop Growing</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="cta-section bg-cta-gradient">
        <div className="bg-blur-overlay">
          <div className="bg-blur-circle-1"></div>
          <div className="bg-blur-circle-2"></div>
        </div>

        <div className="cta-content">
          <Sparkles className="cta-icon" />
          <h2 className="cta-title">Ready to 10x Your LinkedIn Game?</h2>
          <p className="cta-subtitle">Join 500+ professionals who've automated their LinkedIn success</p>
          <p className="cta-description">
            Stop wasting hours on content creation. Start building your brand, generating leads, and growing your network—all on complete autopilot.
          </p>
          
          <div className="cta-button-container">
            <button onClick={handleGetStarted} className="btn-cta-large">
              <Rocket className="icon-md" />
              <span>Get Started Now</span>
              <ArrowRight className="icon-md" />
            </button>
          </div>

          <div className="cta-trust">
            <div className="trust-item">
              <CheckCircle className="icon-sm" style={{ color: '#4ade80' }} />
              <span>Trusted by 500+ Users</span>
            </div>
            <div className="trust-item">
              <CheckCircle className="icon-sm" style={{ color: '#4ade80' }} />
              <span>Setup in 5 Minutes</span>
            </div>
            <div className="trust-item">
              <CheckCircle className="icon-sm" style={{ color: '#4ade80' }} />
              <span>24/7 Support Available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-sm bg-gray-50">
        <div className="container-max">
          <div className="contact-grid">
            <div className="contact-item">
              <Mail className="contact-icon" />
              <h3 className="contact-title">Email Us</h3>
              <a href="mailto:info@linkedora.com" className="contact-link">
                info@linkedora.com
              </a>
            </div>
            <div className="contact-item">
              <Linkedin className="contact-icon" />
              <h3 className="contact-title">Follow Us</h3>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="contact-link">
                LinkedIn
              </a>
            </div>
            <div className="contact-item">
              <Clock className="contact-icon" />
              <h3 className="contact-title">Support</h3>
              <p className="contact-text">24/7 Support Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container-max">
          <div className="footer-grid">
            {/* Brand */}
            <div>
              <div className="footer-brand">
                <Linkedin className="footer-brand-icon" />
                <span className="footer-brand-text">LinkedOra</span>
              </div>
              <p className="footer-description">
                The #1 LinkedIn automation platform trusted by professionals worldwide. Automate your LinkedIn presence with AI-powered content generation and smart scheduling.
              </p>
              <div className="footer-rating">
                <div className="footer-stars">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="footer-star" />
                  ))}
                </div>
                <span className="footer-rating-text">4.9/5 from 500+ reviews</span>
              </div>
              <div className="footer-social">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                  <Linkedin className="icon-sm" />
                </a>
                <a href="mailto:info@linkedora.com" className="social-icon">
                  <Mail className="icon-sm" />
                </a>
              </div>
            </div>

            {/* Support & Contact */}
            <div>
              <h4 className="footer-section-title">Support & Contact</h4>
              <ul className="footer-list">
                <li className="footer-list-item">
                  <Mail className="footer-icon" />
                  <div>
                    <div className="footer-label">Email us</div>
                    <a href="mailto:info@linkedora.com" className="footer-link">
                      info@linkedora.com
                    </a>
                  </div>
                </li>
                <li className="footer-list-item">
                  <Clock className="footer-icon" />
                  <div>
                    <div className="footer-label">Support Hours</div>
                    <div className="footer-link">24/7 Available</div>
                  </div>
                </li>
                <li className="footer-list-item">
                  <Globe className="footer-icon" />
                  <div>
                    <div className="footer-label">Website</div>
                    <a href="https://www.linkedora.com" className="footer-link">
                      www.linkedora.com
                    </a>
                  </div>
                </li>
                <li>
                  <Link to="/login" className="footer-link-secondary">
                    Login to Dashboard
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="footer-bottom">
            <div className="footer-copyright">
              <p className="footer-copyright-text">&copy; {new Date().getFullYear()} LinkedOra. All rights reserved.</p>
              <p className="footer-copyright-sub">Making LinkedIn automation simple, powerful, and effective.</p>
            </div>
            <div className="footer-links">
              <a href="#" className="footer-link-secondary">Privacy Policy</a>
              <a href="#" className="footer-link-secondary">Terms of Service</a>
              <a href="#" className="footer-link-secondary">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
