import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { trackEvent } from '../services/analytics';
import './Onboarding.css';

const PRESET_INTERESTS = ['Generative AI', 'Open Source', 'Ethics', 'Startups', 'UX for AI', 'Predictive Modeling', 'Web3', 'SaaS'];
const PRESET_GOALS = ['Find Co-founder', 'Hire talent', 'Find Project', 'Mentorship', 'Learn new tech', 'Network'];
const PRESET_SKILLS = ['Python', 'React', 'TensorFlow', 'Product Strategy', 'Figma', 'System Architecture', 'Content Strategy', 'Go'];

const Onboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { completeOnboarding } = useContext(AppContext);
  
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    company: '',
    headline: '',
    experienceLevel: 'Mid-Level',
    availability: 'Highly Available',
    interests: [],
    goals: [],
    skills: []
  });

  const [errors, setErrors] = useState({});

  const toggleSelection = (category, item, maxLimit = 3) => {
    setFormData(prev => {
      const list = prev[category];
      if (list.includes(item)) {
        return { ...prev, [category]: list.filter(i => i !== item) };
      } else {
        if (list.length >= maxLimit) return prev;
        return { ...prev, [category]: [...list, item] };
      }
    });

    // Clear validation error if user fixes it
    if (errors[category]) setErrors(prev => ({...prev, [category]: null}));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Full Name is required.';
    if (!formData.role) newErrors.role = 'Current Role is required.';
    if (formData.interests.length === 0) newErrors.interests = 'Select at least 1 interest.';
    if (formData.goals.length === 0) newErrors.goals = 'Select at least 1 goal.';
    if (formData.skills.length === 0) newErrors.skills = 'Select at least 1 skill.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Update step based on form scroll / section filled
  const getCompletedStep = () => {
    if (formData.skills.length > 0 || formData.interests.length > 0 || formData.goals.length > 0) return 2;
    if (formData.name && formData.role) return 1;
    return 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    // Auto generate mocked email and linkedin based on name
    const googleUser = location.state?.googleUser;
    const finalData = {
      ...formData,
      email: googleUser?.email || `${formData.name.toLowerCase().replace(' ', '.')}@example.com`,
      linkedin: `linkedin.com/in/${formData.name.toLowerCase().replace(' ', '')}`,
      authMode: googleUser?.authMode || googleUser?.provider || 'manual',
    };

    completeOnboarding(finalData);
    trackEvent('onboarding_complete', { experience: finalData.experienceLevel });
    navigate('/dashboard');
  };

  return (
    <div className="onboarding-page flex-center">
      <div className="onboarding-container card animate-slide-down">
        <div className="onboarding-header text-center mt-4">
          <div className="sparkle-wrapper flex-center mx-auto mb-4">
            <Sparkles size={32} className="text-accent-primary" style={{color: 'var(--accent-primary)'}} />
          </div>
          <h1 className="mb-2">Set Up Your <span className="gradient-text-accent">Event Profile</span></h1>
          <p className="text-secondary mb-6">Tell your AI concierge who you are so it can find the right people and sessions for you.</p>

          {/* Step progress bar */}
          <div className="onboarding-steps">
            {['About You', 'Preferences', 'Availability'].map((label, i) => {
              const stepNum = i + 1;
              const done = getCompletedStep() >= stepNum;
              const active = getCompletedStep() + 1 === stepNum;
              return (
                <div key={label} className="ob-step">
                  <div className={`ob-step-dot ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                    {done ? <CheckCircle2 size={12} /> : stepNum}
                  </div>
                  <span className={`ob-step-label ${done ? 'done' : ''}`}>{label}</span>
                  {i < 2 && <div className={`ob-step-line ${done ? 'done' : ''}`}></div>}
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="onboarding-form flex-col gap-8">
          
          {/* Info Section */}
          <section className="form-section">
            <h3 className="section-title text-primary font-medium mb-1">1. About You</h3>
            <p className="text-xs text-tertiary mb-4">Your role and background helps the AI surface relevant people and sessions. Fields marked * are required.</p>
            <div className="form-group grid-cols-2">
              <div>
                <label>Full Name *</label>
                <input 
                  type="text" 
                  placeholder="Jane Doe"
                  value={formData.name}
                  onChange={e => {
                    setFormData({...formData, name: e.target.value});
                    if (errors.name) setErrors({...errors, name: null});
                  }}
                  className={errors.name ? 'input-error' : ''}
                />
                {errors.name && <span className="error-text"><AlertCircle size={12}/> {errors.name}</span>}
              </div>
              <div>
                <label>Current Role *</label>
                <input 
                  type="text" 
                  placeholder="Software Engineer"
                  value={formData.role}
                  onChange={e => {
                    setFormData({...formData, role: e.target.value});
                    if (errors.role) setErrors({...errors, role: null});
                  }}
                  className={errors.role ? 'input-error' : ''}
                />
                {errors.role && <span className="error-text"><AlertCircle size={12}/> {errors.role}</span>}
              </div>
              <div className="col-span-2">
                <label>Professional Headline</label>
                <input 
                  type="text" 
                  placeholder="Building scalable GenAI solutions..."
                  value={formData.headline}
                  onChange={e => setFormData({...formData, headline: e.target.value})}
                />
              </div>
              <div>
                <label>Company (Optional)</label>
                <input 
                  type="text" 
                  placeholder="Acme Corp"
                  value={formData.company}
                  onChange={e => setFormData({...formData, company: e.target.value})}
                />
              </div>
              <div>
                <label>Experience Level</label>
                <select 
                  value={formData.experienceLevel} 
                  onChange={e => setFormData({...formData, experienceLevel: e.target.value})}
                >
                  <option value="Junior">Junior</option>
                  <option value="Mid-Level">Mid-Level</option>
                  <option value="Senior">Senior</option>
                  <option value="Executive">Executive</option>
                </select>
              </div>
            </div>
          </section>

          {/* Selections Section */}
          <section className="form-section">
            <h3 className="section-title text-primary font-medium mb-4">2. Matching Preferences</h3>
            
            <div className="form-group mb-6">
              <div className="flex-between mb-1">
                <label>Core Skills *</label>
                <span className="text-xs text-secondary">{formData.skills.length}/3 Selected</span>
              </div>
              <p className="text-xs text-tertiary mb-2">Select up to 3 skills. These are used to find complementary matches and relevant sessions.</p>
              <div className="pill-group">
                {PRESET_SKILLS.map(item => (
                  <button 
                    type="button" key={item}
                    className={`pill-btn ${formData.skills.includes(item) ? 'selected' : ''}`}
                    onClick={() => toggleSelection('skills', item, 3)}
                  >
                    {item} {formData.skills.includes(item) && <CheckCircle2 size={12} className="ml-1"/>}
                  </button>
                ))}
              </div>
              {errors.skills && <span className="error-text mt-2 block"><AlertCircle size={12}/> {errors.skills}</span>}
            </div>

            <div className="form-group mb-6">
              <div className="flex-between mb-1">
                <label>Main Interests *</label>
                <span className="text-xs text-secondary">{formData.interests.length}/3 Selected</span>
              </div>
              <p className="text-xs text-tertiary mb-2">Pick up to 3 topics you care most about. Used to rank sessions and match people with shared focus.</p>
              <div className="pill-group">
                {PRESET_INTERESTS.map(item => (
                  <button 
                    type="button" key={item}
                    className={`pill-btn ${formData.interests.includes(item) ? 'selected' : ''}`}
                    onClick={() => toggleSelection('interests', item, 3)}
                  >
                    {item} {formData.interests.includes(item) && <CheckCircle2 size={12} className="ml-1"/>}
                  </button>
                ))}
              </div>
              {errors.interests && <span className="error-text mt-2 block"><AlertCircle size={12}/> {errors.interests}</span>}
            </div>

            <div className="form-group">
              <div className="flex-between mb-1">
                <label>Event Goals *</label>
                <span className="text-xs text-secondary">{formData.goals.length}/3 Selected</span>
              </div>
              <p className="text-xs text-tertiary mb-2">What do you hope to get from attending? Select up to 3 goals.</p>
              <div className="pill-group">
                {PRESET_GOALS.map(item => (
                  <button 
                    type="button" key={item}
                    className={`pill-btn ${formData.goals.includes(item) ? 'selected' : ''}`}
                    onClick={() => toggleSelection('goals', item, 3)}
                  >
                    {item} {formData.goals.includes(item) && <CheckCircle2 size={12} className="ml-1"/>}
                  </button>
                ))}
              </div>
              {errors.goals && <span className="error-text mt-2 block"><AlertCircle size={12}/> {errors.goals}</span>}
            </div>
          </section>

          <section className="form-section">
             <h3 className="section-title text-primary font-medium mb-1">3. Availability</h3>
             <p className="text-xs text-tertiary mb-3">Lets other attendees and the AI know how open you are to impromptu connections.</p>
             <div className="form-group">
                <label className="mb-2 block">Event Availability</label>
                <select 
                  value={formData.availability} 
                  onChange={e => setFormData({...formData, availability: e.target.value})}
                >
                  <option value="Highly Available">Highly Available (Open to random connects)</option>
                  <option value="Mostly Available">Mostly Available (Will check agenda)</option>
                  <option value="Available for Coffee">Available for Coffee Breaks Only</option>
                  <option value="Only Scheduled Meetings">Only Scheduled Meetings</option>
                </select>
             </div>
          </section>

          <div className="form-footer mt-4 pt-6 border-t">
            <button type="submit" className="btn btn-primary w-full btn-lg">
              Build My Event Plan <ArrowRight size={18} />
            </button>
            <p className="text-xs text-tertiary text-center mt-3">You can update these details anytime from your profile.</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
