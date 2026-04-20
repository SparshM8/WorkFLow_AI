/* d:\PROMPT\MEETFLOW-AI\src\pages\LandingPage.jsx */

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, Zap, CalendarDays, Share2, 
  ArrowRight, ShieldCheck, Target, Users, BookOpen
} from 'lucide-react';
import GoogleSignIn from '../components/GoogleSignIn';
import { IS_FIREBASE_CONFIGURED } from '../services/firebase';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const runtimeMode = useMemo(() => {
    if (!IS_FIREBASE_CONFIGURED) return 'local-missing-config';
    const isFallback = typeof window !== 'undefined'
      && localStorage.getItem('meetflow_firebase_auth_unavailable') === '1';
    return isFallback ? 'local-fallback' : 'firebase';
  }, []);

  const handleAuthSuccess = (userData) => {
    // In a real app, this would be the Firebase callback
    navigate('/onboarding', { state: { googleUser: userData } });
  };

  const handleGetStarted = () => navigate('/onboarding');

  return (
    <div className="landing-page animate-fade-in">
      <div className="bg-orb orb-1"></div>
      <div className="bg-orb orb-2"></div>
      <div className="bg-orb orb-3"></div>
      {/* ── HEADER ── */}
      <header className="landing-header">
        <div className="landing-logo">
          <Sparkles className="text-accent-primary" size={28} />
          <span className="gradient-text-accent">MeetFlow AI</span>
        </div>
        
        <nav className="landing-desktop-nav">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#pricing">Pricing</a>
        </nav>

        <div className="landing-actions">
          <button className="btn btn-primary" onClick={handleGetStarted}>Get Started</button>
        </div>
      </header>

      {/* ── HERO SECTION ── */}
      <section className="hero-section">
        <div className="hero-glow"></div>
        <div className="hero-content">
          <h1 className="hero-headline">
            Your AI Event Concierge for <br />
            <span className="gradient-text">Smarter Networking</span>
          </h1>
          <p className="hero-subheadline">
            MeetFlow AI dynamically matches you with high-value connections, builds your optimal event agenda, and reroutes you in real-time when sessions go full.
          </p>
          
          <div className="hero-cta-group">
            {IS_FIREBASE_CONFIGURED ? (
              <>
                <GoogleSignIn onAuthSuccess={handleAuthSuccess} />
                <button className="btn btn-outline hero-cta-btn" onClick={handleGetStarted}>
                  Enter without Sign-In <ArrowRight size={18} className="ml-2" />
                </button>
              </>
            ) : (
              <div className="resilient-cta-wrapper">
                <button className="btn btn-primary btn-lg hero-cta-btn-xl" onClick={handleGetStarted}>
                  Begin Your AI Journey <Zap size={20} className="ml-2" />
                </button>
                <div className="resilient-badge">
                  <ShieldCheck size={14} /> Privacy-First & Offline-Ready Architecture Active
                </div>
              </div>
            )}
          </div>

          <div className={`runtime-mode-badge ${runtimeMode}`} role="status" aria-live="polite">
            {runtimeMode === 'firebase' && <><ShieldCheck size={14} /> Mode: Firebase Cloud Auth Active</>}
            {runtimeMode === 'local-fallback' && <><ShieldCheck size={14} /> Mode: Local Resilience (Firebase Auth Unavailable)</>}
            {runtimeMode === 'local-missing-config' && <><ShieldCheck size={14} /> Mode: Local Resilience (Firebase Keys Missing)</>}
          </div>

          <div className="hero-cards">
            <div className="hero-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <i><Sparkles size={28} aria-hidden="true" /></i>
              <h3>AI Badge Scanner</h3>
              <p>Extract networking signals instantly from physical badges using <strong>Gemini 1.5 Flash Vision</strong>.</p>
            </div>
            <div className="hero-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <i><CalendarDays size={28} aria-hidden="true" /></i>
              <h3>Live Venue Radar</h3>
              <p>Dynamic indoor mapping with AI-calculated walking times and match hotspot detection.</p>
            </div>
            <div className="hero-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <i><Zap size={28} aria-hidden="true" /></i>
              <h3>Agentic Rerouting</h3>
              <p>Smart schedule adaptation. Get instantly rerouted when session rooms hit capacity limits.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ── */}
      <section id="how-it-works" className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <div className="timeline">
          <div className="timeline-step">
            <div className="step-number">1</div>
            <h4>Create Your Profile</h4>
            <p>Tell us your skills, interests, and networking goals during onboarding.</p>
          </div>
          <div className="timeline-step">
            <div className="step-number">2</div>
            <h4>Get Matched</h4>
            <p>AI surfaces your top connections with personalized icebreakers to start chatting.</p>
          </div>
          <div className="timeline-step">
            <div className="step-number">3</div>
            <h4>Build Your Agenda</h4>
            <p>RSVP to sessions that matter. We detect conflicts and optimize for your time.</p>
          </div>
          <div className="timeline-step">
            <div className="step-number">4</div>
            <h4>Stay On Track</h4>
            <p>Get live reroutes when plans change. We handle the chaos so you can focus on learning.</p>
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ── */}
      <section id="features" className="features-section">
        <h2 className="section-title text-center">Engineered for Impact</h2>
        <div className="features-grid">
          <div className="feature-item" id="matchmaking">
            <Users className="feature-icon" />
            <h3>AI-Powered Matchmaking</h3>
            <p>Our neural matchmaking engine ranks attendees by compatibility across multi-dimensional signals.</p>
            <a href="#how-it-works" className="learn-more">Learn More <ArrowRight size={14} /></a>
          </div>
          <div className="feature-item" id="agenda">
            <Target className="feature-icon" />
            <h3>Dynamic Agenda Planning</h3>
            <p>Build a cohesive journey across the event with AI-suggested sessions aligned with your career path.</p>
            <a href="#how-it-works" className="learn-more">Learn More <ArrowRight size={14} /></a>
          </div>
          <div className="feature-item" id="rerouting">
            <Zap className="feature-icon" />
            <h3>Real-Time Rerouting</h3>
            <p>Never miss out. When capacity hits limits, we instantly calculate the next best session for your goals.</p>
            <a href="#how-it-works" className="learn-more">Learn More <ArrowRight size={14} /></a>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="trust-bar">
        <p className="text-tertiary text-xs uppercase tracking-widest mb-6">Trusted by Innovation Leaders</p>
        <div className="logo-strip">
          <div className="mock-logo">HACK2SKILL</div>
          <div className="mock-logo">PROMPTWARS</div>
          <div className="mock-logo">FUTURECON</div>
          <div className="mock-logo">AI SUMMIT</div>
          <div className="mock-logo">TECHFLOW</div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testimonials-section">
        <h2 className="section-title">What Attendees are Saying</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <p>"MeetFlow completely changed how I network. The AI-suggested icebreakers are a game changer for shy developers."</p>
            <div className="testimonial-author">
              <div className="author-avatar">JD</div>
              <div>
                <span className="author-name">James Dyson</span>
                <span className="author-role">Senior Engineer</span>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <p>"The real-time rerouting saved my conference. When my main session was full, I was instantly guided to a hidden gem."</p>
            <div className="testimonial-author">
              <div className="author-avatar">SC</div>
              <div>
                <span className="author-name">Sarah Chen</span>
                <span className="author-role">Product Architect</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING SECTIONS ── */}
      <section id="pricing" className="pricing-section">
        <h2 className="section-title">Scalable for Every Event</h2>
        <div className="pricing-grid">
          <div className="pricing-card">
            <span className="tier-badge">Standard</span>
            <h3>$0<span>/event</span></h3>
            <p>Perfect for hackathons and local community meetups.</p>
            <ul>
              <li>50 Active Nodes</li>
              <li>Basic Matchmaking</li>
              <li>Public Event Feed</li>
            </ul>
          </div>
          <div className="pricing-card featured">
            <span className="tier-badge badge-ai">Pro</span>
            <h3>$499<span>/event</span></h3>
            <p>Advanced intelligence for professional conferences.</p>
            <ul>
              <li>Unlimited Nodes</li>
              <li>Agentic Rerouting</li>
              <li>Custom Venue Maps</li>
              <li>Full Analytics Suite</li>
            </ul>
            <button className="btn btn-primary w-full mt-4">Contact Sales</button>
          </div>
        </div>
      </section>

      {/* ── LIVE DEMO PREVIEW SECTION ── */}
      <section className="demo-section">
        <div className="demo-card card">
          <h2 className="text-2xl font-bold">See MeetFlow AI in Action</h2>
          <p className="text-secondary mt-2">The complete event experience, reimagined through intelligence.</p>
          
          <div className="demo-mockup">
            <div className="mockup-overlay">
              <button className="btn btn-primary" onClick={handleGetStarted}>Try Live Demo</button>
            </div>
            {/* Visually representative background for the mockup */}
            <div className="p-8 text-left opacity-30 select-none">
                <div className="flex gap-4 mb-4">
                    <div className="w-1/4 h-32 bg-glass rounded-lg"></div>
                    <div className="w-3/4 h-32 bg-glass rounded-lg"></div>
                </div>
                <div className="h-64 bg-glass rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="landing-logo mb-4">
              <Sparkles className="text-accent-primary" size={24} />
              <span className="gradient-text-accent">MeetFlow AI</span>
            </div>
            <p className="text-sm text-tertiary max-width-250">
              The next generation event concierge powered by advanced reasoning artifacts.
            </p>
          </div>
          
          <div className="footer-links">
            <div className="footer-col">
              <h4>Platform</h4>
              <ul>
                <li><a href="/privacy">Privacy</a></li>
                <li><a href="/privacy">Terms</a></li>
                <li><a href="/privacy">Security</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="#">Contact</a></li>
                <li><a href="#">About</a></li>
                <li><a href="#">Support</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="attribution">
            Built for PromptWars Virtual — Hack2skill x Google for Developers
          </p>
          <p className="text-xs text-secondary opacity-50">
            © 2026 MeetFlow AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
