
import { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import logo from '../assets/logo.png';
import '../styles/landing.css';

export default function Landing() {
  const [activeTab, setActiveTab] = useState('sales');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState({});
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [stats, setStats] = useState({ calls: 0, businesses: 0, savings: 0 });
  const navigate = useNavigate();

  // Animation observer for scroll effects
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting
          }));
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('[id]');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Testimonial carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Counter animation
  useEffect(() => {
    const animateCounter = (target, key) => {
      let current = 0;
      const increment = target / 100;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setStats(prev => ({ ...prev, [key]: Math.floor(current) }));
      }, 20);
    };

    if (isVisible.stats) {
      animateCounter(50000, 'calls');
      animateCounter(1200, 'businesses');
      animateCounter(75, 'savings');
    }
  }, [isVisible.stats]);

  const testimonials = [
    {
      name: "Rajesh Kumar",
      company: "TechStart Solutions, Mumbai",
      text: "Our lead generation increased by 300% after implementing AI telecalling. No more hiring expensive call center staff!",
      rating: 5
    },
    {
      name: "Sarah Johnson",
      company: "Digital Marketing Pro, New York",
      text: "The AI telecaller has transformed our customer outreach. We've seen a 400% increase in qualified leads with 24/7 availability across time zones.",
      rating: 5
    },
    {
      name: "Marco Rodriguez",
      company: "E-commerce Plus, Madrid",
      text: "Outstanding multilingual support! Our AI agent seamlessly switches between Spanish and English. Customer satisfaction increased by 85%.",
      rating: 5
    }
  ];

  return (
<div className="font-sans text-gray-900 bg-white min-h-screen relative overflow-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center animate-scale-in">
                <img src={logo} alt="Company Logo" className="h-28 w-auto" />
              </div>

              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                <a href="#features" className="text-gray-900 hover:text-indigo-600 inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-300 hover:bg-indigo-50 rounded-lg">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Features
                </a>
                <a href="#use-cases" className="text-gray-600 hover:text-indigo-600 inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-300 hover:bg-indigo-50 rounded-lg">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Use Cases
                </a>
                <a href="#pricing" className="text-gray-600 hover:text-indigo-600 inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-300 hover:bg-indigo-50 rounded-lg">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Pricing
                </a>
                <a href="#testimonials" className="text-gray-600 hover:text-indigo-600 inline-flex items-center px-3 py-2 text-sm font-medium transition-all duration-300 hover:bg-indigo-50 rounded-lg">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Reviews
                </a>
              </div>
            </div>

            <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <button 
                  onClick={() => navigate('/login')}
                  className="relative px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  🚀 Get Started
                </button>
            </div>

            <div className="-mr-2 flex items-center sm:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              >
                <span className="sr-only">Open main menu</span>
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="sm:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#features" className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Features
              </a>
              <a href="#use-cases" className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Use Cases
              </a>
              <a href="#pricing" className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Pricing
              </a>
              <a href="#testimonials" className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Reviews
              </a>
              <div className="mt-4 px-3">
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  🚀 Get Started
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="hero-section relative bg-gradient-to-br from-indigo-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="relative z-10 lg:max-w-2xl lg:w-full">
            <main className="mt-10 sm:mt-12 md:mt-16 lg:mt-20 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="hero-title-mobile-bg text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900">
                  <span className="block animate-slide-in-left">AI-Powered</span>
                  <span className="block text-indigo-600 relative animate-slide-in-right">
                    Telecaller
                  </span>
                  <span className="block text-gray-700 animate-slide-in-left" style={{animationDelay: '0.5s'}}>
                    Zero Setup, Global Reach
                  </span>
                </h1>
                <p className="mt-4 text-lg sm:text-xl md:text-2xl text-gray-600 sm:max-w-xl sm:mx-auto lg:mx-0 leading-relaxed animate-fade-in-up" style={{animationDelay: '0.8s'}}>
                  Just provide your <span className="font-semibold text-orange-600">script</span> and <span className="font-semibold text-green-600">contact numbers</span>. Our AI agent will handle all your telecalling needs without any additional cost or space.
                </p>
                <div className="mt-6 flex flex-wrap gap-3 animate-fade-in-up" style={{animationDelay: '1s'}}>
                  <span className="inline-flex items-center bg-green-100 px-3 py-1 rounded-full text-sm text-green-800">
                    <span className="text-green-500 mr-2">✓</span> No Telecaller Salary
                  </span>
                  <span className="inline-flex items-center bg-green-100 px-3 py-1 rounded-full text-sm text-green-800">
                    <span className="text-green-500 mr-2">✓</span> No Office Rent
                  </span>
                  <span className="inline-flex items-center bg-green-100 px-3 py-1 rounded-full text-sm text-green-800">
                    <span className="text-green-500 mr-2">✓</span> No Management Headache
                  </span>
                </div>
                <div className="mt-8 sm:mt-10 sm:flex sm:justify-center lg:justify-start gap-4 animate-fade-in-up" style={{animationDelay: '1.2s'}}>
                    <button 
                      onClick={() => navigate('/login')}
                      className="group flex items-center justify-center px-8 py-3.5 rounded-full text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      🚀 Get Started
                      <svg className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  
                  <button className="group flex items-center justify-center px-8 py-3.5 rounded-full text-base font-semibold text-indigo-600 bg-indigo-100 hover:bg-indigo-200 shadow-md hover:shadow-lg transition-all duration-300">
                    📺 Live Demo
                    <svg className="ml-2 w-5 h-5 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M12 5v.01M12 19v.01M5 12h.01M19 12h.01M12 9a3 3 0 100-6 3 3 0 000 6z" />
                    </svg>
                  </button>
                </div>
                <div className="mt-6 text-sm text-gray-500 animate-fade-in-up" style={{animationDelay: '1.4s'}}>
✅ No credit card required • ✅ 5-minute setup • ✅ Multilingual support
                </div>
              </div>
            </main>
          </div>
          <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
<img className="hero-image h-56 w-full p-10 object-cover sm:h-72 md:h-96 lg:h-full animate-fade-in-up" src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80" alt="AI Telecaller Interface" />
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div id="stats" className="bg-gradient-to-r from-gray-50 to-indigo-50 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className={`transform transition-all duration-1000 ${isVisible.stats ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} card-hover bg-white p-8 rounded-xl shadow-lg`}>
              <div className="text-4xl sm:text-5xl font-extrabold text-indigo-600 mb-2 animate-pulse">
                {stats.calls.toLocaleString('en-IN')}+
              </div>
              <div className="text-xl font-semibold text-gray-900 mb-2">Successful Calls</div>
              <div className="text-gray-600">Automated globally</div>
            </div>
            <div className={`transform transition-all duration-1000 ${isVisible.stats ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} card-hover bg-white p-8 rounded-xl shadow-lg`} style={{transitionDelay: '0.2s'}}>
              <div className="text-4xl sm:text-5xl font-extrabold text-purple-600 mb-2 animate-pulse">
                {stats.businesses.toLocaleString('en-IN')}+
              </div>
              <div className="text-xl font-semibold text-gray-900 mb-2">Businesses Served</div>
              <div className="text-gray-600">From startups to enterprises</div>
            </div>
            <div className={`transform transition-all duration-1000 ${isVisible.stats ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} card-hover bg-white p-8 rounded-xl shadow-lg`} style={{transitionDelay: '0.4s'}}>
              <div className="text-4xl sm:text-5xl font-extrabold text-green-600 mb-2 animate-pulse">
                {stats.savings}%
              </div>
              <div className="text-xl font-semibold text-gray-900 mb-2">Cost Savings</div>
              <div className="text-gray-600">Compared to human telecallers</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase mb-2 animate-fade-in-up">⚡ Why Choose AI Telecaller?</h2>
            <p className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              Perfect Solution for <span className="text-indigo-600">Modern Businesses</span>
            </p>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              Solving all problems of human telecallers with AI that understands your business needs worldwide.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="group card-hover bg-white p-8 rounded-2xl shadow-lg border-l-4 border-indigo-500 animate-fade-in-up">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multilingual Support</h3>
              <p className="text-gray-600 leading-relaxed">
                Perfect accent and natural conversation. Your customers will feel like they're talking to a real person.
              </p>
            </div>

            <div className="group card-hover bg-white p-8 rounded-2xl shadow-lg border-l-4 border-green-500 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-green-500 to-blue-500 text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Setup</h3>
              <p className="text-gray-600 leading-relaxed">
                Ready in just 5 minutes. No technical knowledge required. Simply upload script and start calls.
              </p>
            </div>

            <div className="group card-hover bg-white p-8 rounded-2xl shadow-lg border-l-4 border-purple-500 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">75% Cost Savings</h3>
              <p className="text-gray-600 leading-relaxed">
                No salary, no training, no office space. 75% less cost compared to human telecallers.
              </p>
            </div>

            <div className="group card-hover bg-white p-8 rounded-2xl shadow-lg border-l-4 border-cyan-500 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Advanced Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Detailed report of every call. Know who's interested and who's not - everything in real-time.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* How It Works Section */}
      <div id="how-it-works" className="py-16 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base text-green-600 font-semibold tracking-wide uppercase mb-2">🚀 How It Works</h2>
            <p className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">
              Get Started in <span className="text-green-600">3 Simple Steps</span>
            </p>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              No technical expertise required. Anyone can set up AI telecalling in minutes.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center animate-fade-in-up">
              <div className="relative mb-8">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white mx-auto mb-6">
                  <span className="text-2xl font-bold">1</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Upload Your Script</h3>
              <p className="text-gray-600 leading-relaxed">
Simply upload your calling script in multiple languages. Our AI will understand the context and tone perfectly.
              </p>
            </div>

            <div className="text-center animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="relative mb-8">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-green-500 to-blue-500 text-white mx-auto mb-6">
                  <span className="text-2xl font-bold">2</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Add Contact Numbers</h3>
              <p className="text-gray-600 leading-relaxed">
                Upload your contact list or integrate with your existing CRM. Support for Excel, CSV, and direct API integration.
              </p>
            </div>

            <div className="text-center animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <div className="relative mb-8">
                <div className="flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white mx-auto mb-6">
                  <span className="text-2xl font-bold">3</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Launch & Monitor</h3>
              <p className="text-gray-600 leading-relaxed">
                Hit start and watch your AI telecaller work. Monitor calls in real-time, get instant reports, and track conversions.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Use Cases Section */}
      <div id="use-cases" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base text-purple-600 font-semibold tracking-wide uppercase mb-2">🎯 Use Cases</h2>
            <p className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">
              Perfect for <span className="text-purple-600">Every Business</span>
            </p>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From small startups to large enterprises, our AI telecaller adapts to any business need.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="card-hover bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-lg border border-blue-200 animate-fade-in-up">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Lead Generation</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Generate high-quality leads by calling potential customers and qualifying them based on your criteria.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Cold calling campaigns</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Lead qualification</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Appointment setting</li>
              </ul>
            </div>

            <div className="card-hover bg-gradient-to-br from-green-50 to-blue-50 p-8 rounded-2xl shadow-lg border border-green-200 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-green-500 to-blue-500 text-white mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Customer Support</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Provide 24/7 customer support with instant responses and seamless escalation to human agents.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Order status updates</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Technical support</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Complaint handling</li>
              </ul>
            </div>

            <div className="card-hover bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl shadow-lg border border-purple-200 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Sales Follow-up</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Automatically follow up with prospects and customers to increase conversion rates and customer satisfaction.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Sales funnel nurturing</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Payment reminders</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Feedback collection</li>
              </ul>
            </div>

            <div className="card-hover bg-gradient-to-br from-yellow-50 to-orange-50 p-8 rounded-2xl shadow-lg border border-yellow-200 animate-fade-in-up" style={{animationDelay: '0.6s'}}>
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Marketing Campaigns</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Run targeted marketing campaigns to promote new products, services, or special offers.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Product launches</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Promotional offers</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Event invitations</li>
              </ul>
            </div>

            <div className="card-hover bg-gradient-to-br from-red-50 to-pink-50 p-8 rounded-2xl shadow-lg border border-red-200 animate-fade-in-up" style={{animationDelay: '0.8s'}}>
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Survey & Research</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Conduct market research, customer satisfaction surveys, and collect valuable feedback.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Market research</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Customer surveys</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Data collection</li>
              </ul>
            </div>

            <div className="card-hover bg-gradient-to-br from-teal-50 to-cyan-50 p-8 rounded-2xl shadow-lg border border-teal-200 animate-fade-in-up" style={{animationDelay: '1s'}}>
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Debt Collection</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Professional and compliant debt collection calls with automated follow-ups and payment reminders.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Payment reminders</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Overdue notifications</li>
                <li className="flex items-center"><span className="text-green-500 mr-2">✓</span> Settlement offers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div id="testimonials" className="py-16 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base text-orange-600 font-semibold tracking-wide uppercase mb-2">⭐ Customer Success Stories</h2>
            <p className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">
              Real Results from <span className="text-orange-600">Real Businesses</span>
            </p>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
See how global businesses have transformed their sales and customer service with our AI telecaller.
            </p>
          </div>
          
          <div className="relative">
            <div className="flex justify-center">
              <div className="w-full max-w-4xl">
                <div className="bg-white rounded-2xl p-8 shadow-xl border animate-fade-in-up">
                  <div className="flex items-center justify-center mb-6">
                    <div className="flex space-x-1">
                      {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                        <svg key={i} className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <blockquote className="text-xl sm:text-2xl font-medium text-gray-900 text-center mb-8 leading-relaxed">
                    "{testimonials[currentTestimonial].text}"
                  </blockquote>
                  <div className="text-center">
                    <div className="font-semibold text-lg text-gray-900">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-indigo-600 font-medium">
                      {testimonials[currentTestimonial].company}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center mt-8 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial ? 'bg-indigo-600 w-8' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Pricing Section */}
      <div id="pricing" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base text-green-600 font-semibold tracking-wide uppercase mb-2">💎 Affordable Plans</h2>
            <p className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">
              Choose Your <span className="text-green-600">Perfect Plan</span>
            </p>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Only 1/4th the cost of human telecallers with unlimited calls. No hidden charges.
            </p>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-semibold mt-4">
              ✅ 7 days free trial • ✅ No setup fee • ✅ Cancel anytime
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 animate-fade-in-up">
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Starter Plan</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">🚀 Popular</span>
                </div>
                <p className="text-gray-600 mb-6">Perfect for small businesses</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-gray-900">$82</span>
                  <span className="text-base font-medium text-gray-600">/month</span>
                </div>
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  🚀 Start Free Trial
                </button>
              </div>
              <div className="p-8 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 uppercase mb-4">What's Included</h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    <span className="text-gray-700">Up to 300 calls per month</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    <span className="text-gray-700">Basic call flows</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    <span className="text-gray-700">Standard reporting</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    <span className="text-gray-700">1 language support</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    <span className="text-gray-700">2 AI agents</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    <span className="text-gray-700">Email support</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-orange-500 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-1 rounded-full text-sm font-bold">🔥 Most Popular</span>
              </div>
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Business Plan</h3>
                  <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">💼 Best Value</span>
                </div>
                <p className="text-gray-600 mb-6">Ideal for growing businesses</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-gray-900">$249</span>
                  <span className="text-base font-medium text-gray-600">/month</span>
                  <div className="text-sm text-green-600 font-semibold mt-1">Optional Customization: $66</div>
                </div>
                <button 
                  onClick={() => navigate('/login')}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  💼 Start Professional
                </button>
              </div>
              <div className="p-8 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 uppercase mb-4">What's Included</h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    <span className="text-gray-700">400–800 calls per month</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    <span className="text-gray-700">Custom call flows</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    <span className="text-gray-700">Advanced analytics</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    <span className="text-gray-700">2–3 language support</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    <span className="text-gray-700">4 AI agents</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    <span className="text-gray-700">SMS & Auto-scheduling</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Enterprise Plan</h3>
                  <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">🏢 Scale</span>
                </div>
                <p className="text-gray-600 mb-6">For large businesses</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold text-gray-900">Custom</span>
                  <span className="text-base font-medium text-gray-600">(from $120/month)</span>
                  <div className="text-sm text-green-600 font-semibold mt-1">1,800+ Total Minutes</div>
                </div>
                <a href="https://wa.me/+917775980069" target="_blank" rel="noopener noreferrer">
  <button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full py-3 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
    🏢 Contact Sales
  </button>
</a>

              </div>
              <div className="p-8 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 uppercase mb-4">What's Included</h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    <span className="text-gray-700">700–1200+ calls per month</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    <span className="text-gray-700">Fully customized call flows</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    <span className="text-gray-700">Real-time sentiment analysis</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    <span className="text-gray-700">10 AI agents</span>
                  </li>
                  <li className="flex items-center">
                    <span className="text-green-500 mr-3">✓</span>
                    <span className="text-gray-700">API access for custom integrations</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div id="faq" className="py-16 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase mb-2">❓ FAQ</h2>
            <p className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">
              Frequently Asked <span className="text-blue-600">Questions</span>
            </p>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Got questions? We've got answers about how AI Telecaller can work for your business.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in-up">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How does AI Telecaller integrate with my existing systems?</h3>
              <p className="text-gray-600 leading-relaxed">
                AI Telecaller seamlessly integrates with popular CRM systems, databases, and business tools. We provide APIs and direct integrations with platforms like Salesforce, HubSpot, and custom databases.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Can AI Telecaller handle multilingual conversations?</h3>
              <p className="text-gray-600 leading-relaxed">
Yes! Our AI agent supports multiple languages with perfect pronunciation and natural conversation flow. It can switch between languages seamlessly based on customer preference.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Is there a setup fee for AI Telecaller?</h3>
              <p className="text-gray-600 leading-relaxed">
                No setup fees! We offer a 7-day free trial and transparent pricing with no hidden costs. You can start immediately and cancel anytime.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in-up" style={{animationDelay: '0.3s'}}>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">How secure is my data with AI Telecaller?</h3>
              <p className="text-gray-600 leading-relaxed">
                We use enterprise-grade encryption and comply with international security standards. Your data and conversations are completely secure and never shared with third parties.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What kind of support do you provide?</h3>
              <p className="text-gray-600 leading-relaxed">
                We provide 24/7 customer support through email, chat, and phone. Our team helps with setup, training, and ongoing optimization to ensure maximum success.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 animate-fade-in-up">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 leading-relaxed animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            Start today and see how AI telecaller takes your business to new heights.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
              <button 
                onClick={() => navigate('/login')}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-indigo-600 bg-white rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105"
              >
                <span className="flex items-center">
                  🚀 Start Free Trial Now
                  <svg className="ml-2 w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
            <a href="tel:917775980069" aria-label="Call to book a demo">
            <button className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-white rounded-full hover:bg-white hover:text-indigo-600 transition-all duration-300">
              <span className="flex items-center">
                <svg className="ml-2 w-5 h-5 transform group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>   
                <p className="ml-2">Book a Demo</p>
              </span>
            </button>
            </a>
          </div>
          <div className="mt-6 text-indigo-100 text-sm">
            ✓ No credit card required ✓ Setup in 5 minutes ✓ Cancel anytime
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4">AI Telecaller</h3>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Advanced AI telecalling service that takes your business to new heights globally.
            </p>
          </div>
          <div className="border-t border-gray-800 pt-8">
            <p className="text-gray-400">
              © 2024 AI Telecaller. Made with ❤ in India. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      
      {/* Sticky Bottom Bar */}
      <div className="sticky-bottom">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Ready to transform your business?</span>
            </div>
            <span className="hidden sm:block text-sm text-gray-500">Join 1,200+ businesses already using AI Telecaller</span>
          </div>
            <button 
              onClick={() => navigate('/login')}
              className="sticky-bottom-button flex items-center px-6 py-3 text-white font-semibold rounded-full shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Get Started Free
            </button>
        </div>
      </div>
    </div>
  );
}
