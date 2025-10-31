import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Bot, Calendar, TrendingUp, Zap, Users, MessageSquare, BarChart3, Clock, CheckCircle, ArrowRight, Mail, Star, Shield, Sparkles, Target, Award, Globe, Heart, Rocket, DollarSign, TrendingDown } from 'lucide-react';
import { paymentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import SEO from '../../components/SEO';

function Home() {
  const [pricing, setPricing] = useState(null);
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await paymentAPI.getPricing(currency);
        setPricing(response.data);
      } catch (error) {
        console.error('Failed to fetch pricing:', error);
        toast.error('Failed to load pricing');
      } finally {
        setLoading(false);
      }
    };

    fetchPricing();
  }, [currency]);
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
      q: 'Do you offer a free trial?',
      a: 'Yes! Start with our free trial to experience the power of automated LinkedIn posting. No credit card required to get started.'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* SEO Meta Tags */}
      <SEO page="home" />
      
      {/* Navigation - Glass Morphism */}
      <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-xl shadow-lg z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-linkedin to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Linkedin className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">LinkedOra</span>
            </div>

            {/* CTA Button - Premium Glow */}
            <Link
              to="/signup"
              className="btn btn-primary px-6 py-3 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all animate-glow rounded-xl bg-gradient-to-r from-linkedin to-blue-600"
            >
              <span className="font-bold">Start Free Trial</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Premium 3D Effect */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-linkedin via-blue-600 to-linkedin-dark animate-gradient">
        {/* Animated Mesh Gradient Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Floating 3D Icons with Depth */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none parallax-3d">
          <Linkedin className="absolute top-20 left-10 w-16 h-16 text-white/20 animate-float drop-shadow-2xl" style={{ animationDelay: '0s', animationDuration: '6s', transform: 'translateZ(50px)' }} />
          <Bot className="absolute top-40 right-20 w-20 h-20 text-white/20 animate-float drop-shadow-2xl" style={{ animationDelay: '1s', animationDuration: '7s', transform: 'translateZ(30px)' }} />
          <Calendar className="absolute bottom-32 left-20 w-18 h-18 text-white/20 animate-float drop-shadow-2xl" style={{ animationDelay: '2s', animationDuration: '8s', transform: 'translateZ(40px)' }} />
          <TrendingUp className="absolute top-1/4 right-10 w-14 h-14 text-white/20 animate-float drop-shadow-2xl" style={{ animationDelay: '0.5s', animationDuration: '6.5s', transform: 'translateZ(60px)' }} />
          <Zap className="absolute bottom-20 right-32 w-16 h-16 text-white/20 animate-float drop-shadow-2xl" style={{ animationDelay: '1.5s', animationDuration: '7.5s', transform: 'translateZ(35px)' }} />
          <Users className="absolute top-1/3 left-16 w-12 h-12 text-white/20 animate-float drop-shadow-2xl" style={{ animationDelay: '2.5s', animationDuration: '8.5s', transform: 'translateZ(45px)' }} />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Your LinkedIn, On
            <br />
            <span className="text-blue-200">Complete Autopilot</span>
          </h1>
          <p className="text-xl sm:text-2xl text-blue-100 mb-4 max-w-3xl mx-auto leading-relaxed">
            Stop spending 10+ hours weekly on LinkedIn content. Our AI creates, schedules, and posts engaging content automatically—3 times every single day.
          </p>
          <p className="text-lg text-blue-200 mb-8 max-w-2xl mx-auto">
            Join 500+ professionals who've transformed their LinkedIn presence while focusing on what really matters—growing their business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/signup"
              className="btn btn-primary px-10 py-5 text-xl flex items-center space-x-2 bg-white text-linkedin hover:bg-blue-50 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 animate-glow rounded-xl"
            >
              <Rocket className="w-6 h-6" />
              <span>Get Started Free</span>
              <ArrowRight className="w-6 h-6" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 text-lg font-medium text-white hover:text-blue-100 transition-colors"
            >
              Already have an account? Sign in
            </Link>
          </div>
          
          {/* Trust Indicators */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-blue-100">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Free Trial Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Cancel Anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Real Results Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-linkedin font-semibold text-sm uppercase tracking-wide">Proven Results</span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4 mt-2">
              Real Impact, Real Numbers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See the average results our users achieve within the first 90 days
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {realResults.map((result, index) => (
              <div key={index} className="text-center p-8 bg-gradient-to-br from-white via-blue-50 to-white rounded-2xl border-2 border-linkedin/20 hover:border-linkedin shadow-lg hover:shadow-2xl card-3d group relative overflow-hidden">
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-linkedin/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="text-6xl font-bold bg-gradient-to-r from-linkedin to-blue-600 bg-clip-text text-transparent mb-3 group-hover:scale-110 transition-transform">{result.metric}</div>
                  <div className="text-lg font-bold text-gray-900 mb-2 group-hover:text-linkedin transition-colors">{result.label}</div>
                  <div className="text-sm text-gray-600">{result.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-linkedin font-semibold text-sm uppercase tracking-wide">Powerful Features</span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4 mt-2">
              Everything You Need to Dominate LinkedIn
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced tools and automation that put your LinkedIn growth on steroids
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.slice(0, 6).map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl card-3d group relative overflow-hidden"
                >
                  {/* Shimmer effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer"></div>
                  
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-linkedin via-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-5 shadow-xl group-hover:shadow-2xl transition-all group-hover:scale-110 group-hover:rotate-3">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-linkedin transition-colors">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Features - Premium 3D Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {features.slice(6).map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl card-3d group relative overflow-hidden"
                >
                  {/* Shimmer effect on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer"></div>
                  
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-linkedin via-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-5 shadow-xl group-hover:shadow-2xl transition-all group-hover:scale-110 group-hover:rotate-3">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-linkedin transition-colors">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-linkedin font-semibold text-sm uppercase tracking-wide">Simple Process</span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4 mt-2">
              From Setup to Success in 4 Easy Steps
            </h2>
            <p className="text-xl text-gray-600">
              Get your LinkedIn automation running in less than 5 minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative">
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-10 right-0 w-full h-1 animated-border rounded-full transform translate-x-1/2 opacity-40"></div>
                )}
                <div className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl card-3d group">
                  {/* Premium step circle with glow */}
                  <div className="w-24 h-24 bg-gradient-to-br from-linkedin via-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-6 shadow-2xl relative z-10 group-hover:scale-110 transition-transform animate-glow">
                    {item.step}
                    {/* Inner glow ring */}
                    <div className="absolute inset-2 rounded-full border-2 border-white/30"></div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-linkedin transition-colors">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA after How It Works */}
          <div className="text-center mt-16">
            <Link
              to="/signup"
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-linkedin to-blue-600 text-white px-12 py-5 rounded-2xl text-xl font-bold hover:from-blue-600 hover:to-linkedin transition-all shadow-2xl hover:shadow-3xl transform hover:scale-110 animate-glow"
            >
              <Rocket className="w-6 h-6" />
              <span>Start Your Free Trial Now</span>
              <ArrowRight className="w-6 h-6" />
            </Link>
            <p className="text-sm text-gray-500 mt-6 flex items-center justify-center flex-wrap gap-3">
              <span className="inline-flex items-center space-x-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
              </span>
              <span>•</span>
              <span className="inline-flex items-center space-x-1">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Setup in 5 minutes</span>
              </span>
              <span>•</span>
              <span className="inline-flex items-center space-x-1">
                <Shield className="w-4 h-4 text-purple-500" />
                <span>Cancel anytime</span>
              </span>
            </p>
          </div>
        </div>
      </section>


      {/* Use Cases Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-linkedin font-semibold text-sm uppercase tracking-wide">Perfect For</span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4 mt-2">
              Built for Every Professional
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're building a personal brand or growing your business, LinkedOra works for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((useCase, index) => {
              const Icon = useCase.icon;
              return (
                <div key={index} className="p-7 bg-gradient-to-br from-white via-blue-50/30 to-white rounded-2xl border-2 border-gray-200 hover:border-linkedin hover:shadow-xl card-3d group relative overflow-hidden">
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-linkedin/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-linkedin to-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-linkedin transition-colors">{useCase.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{useCase.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-linkedin to-linkedin-dark relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="text-blue-300 font-semibold text-sm uppercase tracking-wide">Real Benefits</span>
            <h2 className="text-4xl font-bold text-white mb-4 mt-2">
              Why Successful Professionals Choose LinkedOra
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Transform your LinkedIn presence and unlock opportunities you never thought possible
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:bg-white/20 transition-all">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <span className="text-white text-lg font-medium leading-relaxed">{benefit.text}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Extra benefit callout */}
          <div className="mt-12 max-w-4xl mx-auto bg-white/20 backdrop-blur-sm p-8 rounded-2xl border-2 border-white/30 text-center">
            <Sparkles className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3">Plus: Completely Hands-Free</h3>
            <p className="text-blue-100 text-lg leading-relaxed">
              Once you set it up, LinkedOra works 24/7 in the background. Wake up to new posts, growing engagement, and expanding network—all without any effort from you.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-linkedin font-semibold text-sm uppercase tracking-wide">FAQ</span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4 mt-2">
              Common Questions Answered
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about LinkedOra
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="bg-white p-6 rounded-xl shadow-md group">
                <summary className="cursor-pointer list-none flex items-center justify-between font-bold text-gray-900 text-lg">
                  <span>{faq.q}</span>
                  <span className="text-linkedin group-open:rotate-180 transition-transform">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-y-2 border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Trusted by Professionals Worldwide
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="p-4">
              <div className="text-5xl md:text-6xl font-bold text-linkedin mb-2">15,000+</div>
              <div className="text-gray-600 font-medium">Posts Generated</div>
              <div className="text-gray-500 text-sm mt-1">This Month</div>
            </div>
            <div className="p-4">
              <div className="text-5xl md:text-6xl font-bold text-linkedin mb-2">500+</div>
              <div className="text-gray-600 font-medium">Active Professionals</div>
              <div className="text-gray-500 text-sm mt-1">And Growing</div>
            </div>
            <div className="p-4">
              <div className="text-5xl md:text-6xl font-bold text-linkedin mb-2">98%</div>
              <div className="text-gray-600 font-medium">Satisfaction Rate</div>
              <div className="text-gray-500 text-sm mt-1">5-Star Reviews</div>
            </div>
            <div className="p-4">
              <div className="text-5xl md:text-6xl font-bold text-linkedin mb-2">24/7</div>
              <div className="text-gray-600 font-medium">Automation</div>
              <div className="text-gray-500 text-sm mt-1">Never Stop Growing</div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-linkedin font-semibold text-sm uppercase tracking-wide">Simple Pricing</span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4 mt-2">
              Flexible Plans for Every Need
            </h2>
            <p className="text-xl text-gray-600">
              Transparent pricing with no hidden fees. Cancel anytime, no questions asked.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-linkedin border-t-transparent mx-auto shadow-lg"></div>
              <p className="text-gray-600 mt-4 font-medium">Loading pricing...</p>
            </div>
          ) : pricing && pricing.pricing ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {pricing.pricing.map((plan, index) => {
                  const isPopular = plan.postsPerDay === 3;
                  return (
                    <div
                      key={index}
                      className={`${
                        isPopular
                          ? 'bg-gradient-to-br from-linkedin via-blue-600 to-blue-700 transform scale-105 shadow-2xl animate-glow card-3d'
                          : 'bg-white shadow-xl hover:shadow-2xl card-3d'
                      } p-8 rounded-3xl relative group overflow-hidden`}
                    >
                      {/* Shimmer effect on hover for non-popular cards */}
                      {!isPopular && (
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer"></div>
                      )}
                      
                      {isPopular && (
                        <>
                          <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 text-xs font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-2xl shadow-lg">
                            ⭐ MOST POPULAR
                          </div>
                          {/* Animated glow ring for popular plan */}
                          <div className="absolute inset-0 rounded-3xl opacity-50 blur-xl bg-gradient-to-r from-linkedin to-blue-600"></div>
                        </>
                      )}
                      <div className="text-center mb-6 relative z-10">
                        <h3 className={`text-2xl font-bold mb-2 ${isPopular ? 'text-white' : 'text-gray-900'}`}>
                          {plan.name}
                        </h3>
                        <div className={`text-5xl font-bold mb-2 ${isPopular ? 'text-white' : 'text-gray-900'}`}>
                          {pricing.currency.symbol}{plan.price}
                        </div>
                        <div className={`${isPopular ? 'text-blue-100' : 'text-gray-500'}`}>
                          per month
                        </div>
                        <div className={`mt-2 text-sm ${isPopular ? 'text-blue-200' : 'text-gray-600'}`}>
                          {plan.postsPerDay} {plan.postsPerDay === 1 ? 'post' : 'posts'} per day
                        </div>
                      </div>
                      
                      <ul className="space-y-3 mb-8">
                        <li className="flex items-start space-x-3">
                          <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isPopular ? 'text-green-300' : 'text-green-500'}`} />
                          <span className={isPopular ? 'text-white' : 'text-gray-600'}>
                            {plan.postsPerDay} AI-generated posts daily
                          </span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isPopular ? 'text-green-300' : 'text-green-500'}`} />
                          <span className={isPopular ? 'text-white' : 'text-gray-600'}>
                            Automated scheduling
                          </span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isPopular ? 'text-green-300' : 'text-green-500'}`} />
                          <span className={isPopular ? 'text-white' : 'text-gray-600'}>
                            Unlimited custom topics
                          </span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isPopular ? 'text-green-300' : 'text-green-500'}`} />
                          <span className={isPopular ? 'text-white' : 'text-gray-600'}>
                            Analytics & insights
                          </span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isPopular ? 'text-green-300' : 'text-green-500'}`} />
                          <span className={isPopular ? 'text-white' : 'text-gray-600'}>
                            Email support
                          </span>
                        </li>
                      </ul>
                      
                      <Link
                        to="/signup"
                        className={`block w-full text-center py-4 px-6 font-bold rounded-xl transition-all transform hover:scale-105 relative z-10 ${
                          isPopular
                            ? 'bg-white text-linkedin hover:bg-blue-50 shadow-xl hover:shadow-2xl'
                            : 'border-2 border-linkedin text-linkedin hover:bg-linkedin hover:text-white shadow-lg hover:shadow-xl'
                        }`}
                      >
                        {isPopular ? '🚀 Get Started Now' : 'Get Started'}
                      </Link>
                    </div>
                  );
                })}
              </div>

              <div className="text-center mt-12">
                <p className="text-gray-600 text-lg mb-4">
                  💎 All plans include: AI content generation • Auto-scheduling • LinkedIn integration • Full analytics • Email support
                </p>
                <p className="text-gray-500">
                  Prices shown in {pricing.currency.name} ({pricing.currency.symbol})
                </p>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-600 py-12">
              <p className="text-lg mb-4">Unable to load pricing at this moment.</p>
              <Link to="/signup" className="btn btn-primary">
                Get Started Anyway
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-linkedin via-blue-600 to-linkedin-dark relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-300 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <Sparkles className="w-16 h-16 text-yellow-300 mx-auto mb-6" />
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
            Ready to 10x Your LinkedIn Game?
          </h2>
          <p className="text-xl sm:text-2xl text-blue-100 mb-4">
            Join 500+ professionals who've automated their LinkedIn success
          </p>
          <p className="text-lg text-blue-200 mb-10 max-w-3xl mx-auto">
            Stop wasting hours on content creation. Start building your brand, generating leads, and growing your network—all on complete autopilot.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              to="/signup"
              className="inline-flex items-center space-x-2 bg-white text-linkedin px-10 py-5 rounded-xl text-xl font-bold hover:bg-blue-50 transition-all shadow-2xl hover:shadow-3xl transform hover:scale-105"
            >
              <Rocket className="w-6 h-6" />
              <span>Start Free Trial</span>
              <ArrowRight className="w-6 h-6" />
            </Link>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 text-blue-100 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span>Free 7-Day Trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span>No Credit Card Needed</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span>Setup in 5 Minutes</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-300" />
              <span>Cancel Anytime</span>
            </div>
          </div>

          <p className="text-blue-200 text-sm mt-8">
            ⚡ Limited Time: Get your first month 50% off when you sign up today!
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <Mail className="w-8 h-8 text-linkedin mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Email Us</h3>
              <a href="mailto:info@linkedora.com" className="text-linkedin hover:text-linkedin-dark">
                info@linkedora.com
              </a>
            </div>
            <div>
              <Linkedin className="w-8 h-8 text-linkedin mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Follow Us</h3>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-linkedin hover:text-linkedin-dark">
                LinkedIn
              </a>
            </div>
            <div>
              <Clock className="w-8 h-8 text-linkedin mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-2">Support</h3>
              <p className="text-gray-600">24/7 Support Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Linkedin className="w-10 h-10 text-linkedin" />
                <span className="text-3xl font-bold">LinkedOra</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed text-lg">
                The #1 LinkedIn automation platform trusted by professionals worldwide. Automate your LinkedIn presence with AI-powered content generation and smart scheduling.
              </p>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-gray-400 text-sm">4.9/5 from 500+ reviews</span>
              </div>
              <div className="flex space-x-4 mt-6">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-linkedin rounded-full flex items-center justify-center transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="mailto:info@linkedora.com" className="w-10 h-10 bg-gray-800 hover:bg-linkedin rounded-full flex items-center justify-center transition-colors">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-bold text-lg mb-4">Product</h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/signup" className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2">
                    <ArrowRight className="w-4 h-4" />
                    <span>Start Free Trial</span>
                  </Link>
                </li>
                <li>
                  <a href="#features" className="text-gray-400 hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#testimonials" className="text-gray-400 hover:text-white transition-colors">
                    Success Stories
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-bold text-lg mb-4">Support & Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-start space-x-2">
                  <Mail className="w-5 h-5 text-linkedin flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-gray-400 text-sm">Email us</div>
                    <a href="mailto:info@linkedora.com" className="text-white hover:text-linkedin transition-colors">
                      info@linkedora.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start space-x-2">
                  <Clock className="w-5 h-5 text-linkedin flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-gray-400 text-sm">Support Hours</div>
                    <div className="text-white">24/7 Available</div>
                  </div>
                </li>
                <li className="flex items-start space-x-2">
                  <Globe className="w-5 h-5 text-linkedin flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-gray-400 text-sm">Website</div>
                    <a href="https://www.linkedora.com" className="text-white hover:text-linkedin transition-colors">
                      www.linkedora.com
                    </a>
                  </div>
                </li>
                <li>
                  <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
                    Login to Dashboard
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-400 text-center md:text-left">
                <p>&copy; {new Date().getFullYear()} LinkedOra. All rights reserved.</p>
                <p className="text-sm mt-1">Making LinkedIn automation simple, powerful, and effective.</p>
              </div>
              <div className="flex space-x-6 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;

