import React from 'react';
import { ShieldCheck, BarChart2, Globe, FileText, Lock, Sparkles } from 'lucide-react';
import './TermsPrivacy.css';

const TermsPrivacy = () => {
  return (
    <div className="terms-page animate-fade-in">
      <header className="terms-header">
        <h1 className="text-3xl font-bold gradient-text">Transparency & Data Ethics</h1>
        <p className="text-secondary mt-2">How we use Google Cloud, Gemini, and your event data.</p>
      </header>

      <section className="terms-content mt-8">
        <div className="card legal-card">
          <section className="legal-section">
            <div className="section-title">
              <Sparkles size={20} className="text-accent-primary" />
              <h3>The AI Concierge Stack</h3>
            </div>
            <p>
              MeetFlow AI is built on the <strong>Google Cloud Platform</strong> and utilizes <strong>Google Gemini</strong> for real-time networking intelligence. We implement a non-negotiable safety layer:
            </p>
            <ul>
              <li><strong>Google Safety Filters:</strong> All AI generations are passed through Gemini's strict harassment, hate speech, and dangerous content filters (BLOCK_MEDIUM_AND_ABOVE).</li>
              <li><strong>Firestore Persistence:</strong> Your event journey is secured via <strong>Encrypted Cloud Firestore</strong>, ensuring accessibility while maintaining enterprise-grade security.</li>
              <li><strong>Agentic Transparency:</strong> AI-driven reroutes are always human-in-the-loop, requiring your explicit approval before agenda modifications.</li>
            </ul>
          </section>

          <section className="legal-section">
            <div className="section-title">
              <BarChart2 size={20} className="text-info" />
              <h3>Google Analytics Transparency</h3>
            </div>
            <p>
              We use <strong>Google Analytics</strong> to monitor platform health and improve attendee matchmaking. All analytics data is anonymized and used strictly for improving the event pulse and networking relevance.
            </p>
          </section>

          <section className="legal-section">
            <div className="section-title">
              <Lock size={20} className="text-success" />
              <h3>Data Privacy & Security</h3>
            </div>
            <p>
              Your data is your own. We do not sell your personal networking data to third parties. We use industry-standard encryption for data at rest and in transit via the Google Firebase suite.
            </p>
          </section>

          <div className="legal-footer mt-8 pt-6 border-t border-glass">
            <p className="text-xs text-tertiary">Version 1.1.0 · Gold Standard Hackathon Release · April 2026</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsPrivacy;
