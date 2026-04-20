import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import {
  Edit3, Check, X, ShieldCheck, Link2, Mail, Building2,
  BookOpen, Clock, Users, CalendarDays, BarChart2, Sparkles,
  Globe, Briefcase, Target, Zap, RotateCcw, QrCode,
  Eye, EyeOff, Shield, Trash2, Sliders, TrendingUp
} from 'lucide-react';
import AchievementSummary from '../components/AchievementSummary';
import './Profile.css';

const PRESET_INTERESTS = ['Generative AI', 'Open Source', 'Ethics', 'Startups', 'UX for AI', 'Predictive Modeling', 'Web3', 'SaaS', 'Data'];
const PRESET_GOALS = ['Find Co-founder', 'Hire talent', 'Find Project', 'Mentorship', 'Learn new tech', 'Network', 'Find clients'];
const PRESET_SKILLS = ['Python', 'React', 'TensorFlow', 'Product Strategy', 'Figma', 'System Architecture', 'Content Strategy', 'Go', 'R', 'Node.js', 'AWS'];

/* Circular progress ring */
const ProgressRing = ({ value, size = 80, stroke = 6 }) => {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="url(#ringGrad)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1s ease' }}
      />
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
    </svg>
  );
};

/* Skill bar */
const SkillBar = ({ skill, level }) => (
  <div className="skill-bar-row">
    <span className="skill-bar-label">{skill}</span>
    <div className="skill-bar-track">
      <div className="skill-bar-fill" style={{ width: `${level}%` }}></div>
    </div>
  </div>
);

/* Pill toggle */
const SelectionPills = ({ label, helper, max, values, presets, onChange }) => (
  <div className="edit-field-group">
    <div className="flex-between mb-1">
      <label className="edit-label">{label}</label>
      <span className="text-xs text-tertiary">{values.length}/{max}</span>
    </div>
    {helper && <p className="text-xs text-tertiary mb-2">{helper}</p>}
    <div className="pill-group">
      {presets.map(item => (
        <button type="button" key={item}
          className={`pill-btn ${values.includes(item) ? 'selected' : ''}`}
          onClick={() => {
            if (values.includes(item)) onChange(values.filter(v => v !== item));
            else if (values.length < max) onChange([...values, item]);
          }}>
          {item} {values.includes(item) && <Check size={11} />}
        </button>
      ))}
    </div>
  </div>
);

const Profile = () => {
  const { 
    currentUser, updateUser, userAgenda, networkRoster, resetApp,
    privacySettings, updatePrivacy, wipeAILearning, eventStats
  } = useContext(AppContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Elite simulated AI ROI Metrics
  const networkDiversity = Math.min(100, (networkRoster.length * 25));
  const topIndustry = "Generative AI & SaaS";
  const skillExposure = ["Zod", "Gemini API", "React 19", "System Design"];

  if (!currentUser) {
    return (
      <div className="profile-empty-state">
        <Sparkles size={48} className="text-tertiary" />
        <p className="text-secondary mt-4">No profile found. Complete onboarding first.</p>
      </div>
    );
  }

  const startEditing = () => { setFormData({ ...currentUser }); setIsEditing(true); };
  const handleSave = () => { updateUser(formData); setIsEditing(false); };
  const handleCancel = () => { setFormData(null); setIsEditing(false); };
  const setField = (k, v) => setFormData(p => ({ ...p, [k]: v }));

  const calcCompletion = () => {
    let s = 20;
    if (currentUser.name) s += 10;
    if (currentUser.headline) s += 15;
    if (currentUser.company) s += 10;
    if (currentUser.skills?.length >= 1) s += 15;
    if (currentUser.interests?.length >= 1) s += 15;
    if (currentUser.goals?.length >= 1) s += 15;
    return Math.min(s, 100);
  };

  const completion = calcCompletion();
  const connected = networkRoster.filter(n => n.status === 'requested' || n.status === 'connected').length;
  const lastSyncedLabel = currentUser.lastSynced
    ? new Date(currentUser.lastSynced).toLocaleString()
    : (eventStats?.isResilientMode ? 'Local resilience cache active' : 'Waiting for first sync');

  // Mock skill levels based on order
  const skillLevels = [92, 78, 85];

  const TABS = ['overview', 'insights', 'network', 'activity', 'privacy'];

  return (
    <div className="profile-page animate-fade-in">

      {/* ── HERO CARD ─────────────────────────── */}
      <div className="profile-hero-card">
        {/* Animated cover */}
        <div className="profile-cover">
          <div className="cover-orb cover-orb-1"></div>
          <div className="cover-orb cover-orb-2"></div>
          <div className="cover-gradient-overlay"></div>
        </div>

        <div className="profile-hero-body">
          {/* Avatar */}
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar-ring">
              <div className="profile-avatar-inner">
                {currentUser.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            <span className="profile-online-dot"></span>
          </div>

          {/* Identity */}
          <div className="profile-identity">
            <div className="profile-name-row">
              <h1 className="profile-name">{currentUser.name}</h1>
              <span className="badge-verified-pill">
                <ShieldCheck size={11} /> Verified
              </span>
              {eventStats?.isResilientMode && (
                <span className="badge-resilience-pill animate-pulse">
                  <Globe size={11} /> Hybrid Sync
                </span>
              )}
            </div>
            <p className="profile-headline">
              {currentUser.headline || `${currentUser.role || ''}${currentUser.company ? ` at ${currentUser.company}` : ''}`}
            </p>
            <div className="profile-meta-chips">
              {currentUser.role && (
                <span className="meta-chip"><Briefcase size={12} /> {currentUser.role}</span>
              )}
              {currentUser.company && (
                <span className="meta-chip"><Building2 size={12} /> {currentUser.company}</span>
              )}
              {currentUser.experienceLevel && (
                <span className="meta-chip"><BookOpen size={12} /> {currentUser.experienceLevel}</span>
              )}
              {currentUser.availability && (
                <span className="meta-chip availability-chip"><Clock size={12} /> {currentUser.availability}</span>
              )}
              <span className="meta-chip sync-chip">
                <RotateCcw size={12} /> Last synced: {lastSyncedLabel}
              </span>
            </div>
            <div className="sync-legend" aria-label="Persistence mode legend">
              <span className="sync-legend-item firebase">Cloud = Firebase</span>
              <span className="sync-legend-item local">Local = Resilience Mode</span>
            </div>
          </div>

          {/* Action */}
          <button className="profile-edit-btn" onClick={startEditing}>
            <Edit3 size={15} /> Edit Profile
          </button>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          {TABS.map(t => (
            <button
              key={t}
              className={`profile-tab ${activeTab === t ? 'active' : ''}`}
              onClick={() => setActiveTab(t)}
            >
              {t === 'insights' && <Sparkles size={11} className="mr-1 inline text-accent-secondary" />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* ── BODY ──────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="profile-body-grid animate-fade-in">
          {/* Left column */}
          <div className="profile-col-left">

            {/* Completion Ring Card */}
            <div className="card profile-completion-card">
              <div className="completion-ring-wrapper">
                <div className="completion-ring-inner">
                  <ProgressRing value={completion} size={100} stroke={8} />
                  <div className="completion-ring-label">
                    <span className="completion-pct">{completion}%</span>
                    <span className="completion-sub">Profile</span>
                  </div>
                </div>
                <div className="completion-meta">
                  <h3 className="text-primary font-semibold mb-1">Profile Strength</h3>
                  <p className="text-xs text-tertiary mb-3">
                    {completion < 70 ? 'Add more details to improve matching.' : completion < 100 ? 'Almost complete! Add a headline.' : 'Excellent profile. Keep it updated.'}
                  </p>
                  <div className="completion-stats">
                    <div className="cstat">
                      <div className="cstat-num">{userAgenda.length}</div>
                      <div className="cstat-label"><CalendarDays size={11} /> Saved</div>
                    </div>
                    <div className="cstat">
                      <div className="cstat-num">{connected}</div>
                      <div className="cstat-label"><Users size={11} /> Requests</div>
                    </div>
                    <div className="cstat">
                      <div className="cstat-num">{networkRoster.length}</div>
                      <div className="cstat-label"><BarChart2 size={11} /> Roster</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="card profile-contact-card">
              <h3 className="contact-title">Contact & Links</h3>
              <div className="contact-list">
                <div className="contact-row">
                  <div className="contact-icon-wrap"><Mail size={14} /></div>
                  <span className="text-sm text-secondary">{currentUser.email || 'No email set'}</span>
                </div>
                <div className="contact-row">
                  <div className="contact-icon-wrap text-info"><Link2 size={14} /></div>
                  {currentUser.linkedin ? (
                    <a href={`https://${currentUser.linkedin}`} target="_blank" rel="noreferrer" className="contact-link text-sm">
                      {currentUser.linkedin}
                    </a>
                  ) : (
                    <span className="text-sm text-tertiary">LinkedIn not added</span>
                  )}
                </div>
                <div className="contact-row">
                  <div className="contact-icon-wrap"><Globe size={14} /></div>
                  <span className="text-sm text-tertiary">{currentUser.company || 'No company listed'}</span>
                </div>
              </div>
            </div>

            {/* Digital Badge QR Card */}
            <div className="card profile-qr-card mt-4 text-center">
              <h3 className="text-primary font-medium mb-1"><QrCode size={16} className="inline mr-1 text-accent-primary" /> Event Badge</h3>
              <p className="text-xs text-tertiary mb-3">Scan to swap details instantly</p>
              
              <div className="qr-box mx-auto">
                {/* CSS placeholder for QR code */}
                <div className="qr-corners"></div>
                <div className="qr-pattern"></div>
                <div className="qr-center-logo"><Sparkles size={16} className="text-accent-primary" /></div>
              </div>
              
              <p className="text-xs text-secondary mt-3 font-mono">{currentUser.name.toUpperCase().replace(/\s+/g, '')}-MF26</p>
            </div>
          </div>

          {/* Right column */}
          <div className="profile-col-right">

            {/* Skills with bars */}
            <div className="card profile-skills-card">
              <div className="card-header-row">
                <h3 className="card-label"><Zap size={16} className="text-warning" /> Top Skills</h3>
                <span className="text-xs text-tertiary">AI-weighted</span>
              </div>
              {currentUser.skills?.length > 0 ? (
                <div className="skills-bars mt-3">
                  {currentUser.skills.map((skill, i) => (
                    <SkillBar key={skill} skill={skill} level={skillLevels[i] || 70} />
                  ))}
                </div>
              ) : (
                <p className="text-tertiary text-sm mt-3">No skills selected — edit your profile.</p>
              )}
            </div>

            {/* Interests */}
            <div className="card profile-interests-card">
              <div className="card-header-row">
                <h3 className="card-label"><Sparkles size={16} className="text-accent-secondary" /> Core Interests</h3>
              </div>
              <div className="pill-group mt-3">
                {currentUser.interests?.length > 0
                  ? currentUser.interests.map(i => <span key={i} className="badge badge-ai interest-pill">{i}</span>)
                  : <span className="text-tertiary text-sm">No interests selected.</span>}
              </div>
            </div>

            {/* Goals */}
            <div className="card profile-goals-card">
              <div className="card-header-row">
                <h3 className="card-label"><Target size={16} className="text-success" /> Networking Goals</h3>
              </div>
              <div className="goals-list mt-3">
                {currentUser.goals?.length > 0
                  ? currentUser.goals.map((g, i) => (
                    <div key={g} className="goal-item">
                      <div className="goal-num">{i + 1}</div>
                      <span className="goal-text">{g}</span>
                    </div>
                  ))
                  : <span className="text-tertiary text-sm">No goals selected.</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="profile-tab-panel animate-fade-in p-6">
          <div className="card glass-panel p-6 border-glass">
            <div className="flex-between mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-secondary" size={20} />
                <h3 className="section-title">Networking ROI Analysis</h3>
              </div>
              <div className="badge badge-ai">Analyzed by Gemini</div>
            </div>

            <div className="roi-grid grid gap-4 grid-cols-1 sm:grid-cols-3 mb-8">
              <div className="roi-stat-card p-4 rounded-xl bg-glass-surface">
                <p className="text-xs text-tertiary uppercase tracking-widest font-bold">Network Reach</p>
                <div className="flex items-end gap-2 mt-2">
                  <span className="text-3xl font-bold text-primary">{networkRoster.length}</span>
                </div>
              </div>
              <div className="roi-stat-card p-4 rounded-xl bg-glass-surface">
                <p className="text-xs text-tertiary uppercase tracking-widest font-bold">Diversity Score</p>
                <div className="flex items-end gap-2 mt-2">
                  <span className="text-3xl font-bold text-primary">{networkDiversity}%</span>
                </div>
              </div>
              <div className="roi-stat-card p-4 rounded-xl bg-glass-surface">
                <p className="text-xs text-tertiary uppercase tracking-widest font-bold">Top Cluster</p>
                <div className="flex items-center gap-2 mt-2">
                   <span className="text-sm font-medium text-primary">{topIndustry}</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="text-sm font-bold text-secondary flex items-center gap-2 mb-4">
                <Award size={16} className="text-accent-primary" />
                Knowledge & Skill Exposure
              </h4>
              <div className="flex flex-wrap gap-2">
                {skillExposure.map(skill => (
                  <div key={skill} className="badge badge-outline bg-glass-surface">
                    <Sparkles size={10} className="mr-2 text-accent-secondary" />
                    {skill}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-glass">
              <p className="text-xs text-tertiary italic">
                "Based on your <b>{networkRoster.length} matches</b>, you've focused heavily on the intersection of AI safety and SaaS architecture. 
                Meeting with 3 more Lead Engineers would broaden your networking target." 
                — MeetFlow Insights
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'network' && (
        <div className="profile-tab-panel animate-fade-in">
          <div className="network-summary-cards">
            <div className="card network-stat-card">
              <div className="nstat-icon"><Users size={24} className="text-accent-primary" /></div>
              <div className="nstat-num">{connected}</div>
              <div className="nstat-label">Intro Requests Sent</div>
            </div>
            <div className="card network-stat-card">
              <div className="nstat-icon"><BarChart2 size={24} className="text-accent-secondary" /></div>
              <div className="nstat-num">{networkRoster.length}</div>
              <div className="nstat-label">In Network Roster</div>
            </div>
            <div className="card network-stat-card">
              <div className="nstat-icon"><CalendarDays size={24} className="text-success" /></div>
              <div className="nstat-num">{userAgenda.length}</div>
              <div className="nstat-label">Sessions Saved</div>
            </div>
          </div>
          {networkRoster.length > 0 ? (
            <div className="card mt-4">
              <h3 className="card-label mb-4">Your Network Activity</h3>
              {networkRoster.map(entry => (
                <div key={entry.matchId} className="network-roster-item">
                  <div className="roster-avatar">{entry.matchId.toUpperCase().charAt(1)}</div>
                  <div className="roster-info">
                    <span className="text-sm text-primary font-medium">Attendee #{entry.matchId}</span>
                    <span className="text-xs text-tertiary">Networking contact</span>
                  </div>
                  <span className={`roster-status-badge status-${entry.status}`}>{entry.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="card mt-4 text-center network-empty">
              <Users size={40} className="text-tertiary mx-auto mb-3" />
              <h3 className="text-primary">No connections yet</h3>
              <p className="text-secondary text-sm mt-2">Go to the Dashboard and hit <strong>Connect</strong> on a match to start building your network.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'privacy' && (
        <div className="profile-tab-panel animate-fade-in">
          <div className="card privacy-hub-card">
            <div className="card-header-row mb-6">
              <h3 className="card-label">
                <Shield size={18} className="text-success" />
                AI Privacy & Trust Hub
              </h3>
              <span className="badge badge-ai">Safe Mode Active</span>
            </div>

            <div className="privacy-settings-list">
              {/* Stealth Mode */}
              <div className="privacy-setting-item">
                <div className="setting-info">
                  <h4 className="flex items-center gap-2">
                    {privacySettings.stealthMode ? <EyeOff size={16} /> : <Eye size={16} />}
                    Stealth Mode
                  </h4>
                  <p className="text-xs text-tertiary">When active, your full profile is only visible to high-value matches (80%+ score).</p>
                </div>
                <div 
                  className={`toggle-switch ${privacySettings.stealthMode ? 'active' : ''}`}
                  onClick={() => updatePrivacy('stealthMode', !privacySettings.stealthMode)}
                >
                  <div className="toggle-knob"></div>
                </div>
              </div>

              {/* Match Sensitivity */}
              <div className="privacy-setting-item">
                <div className="setting-info">
                  <h4 className="flex items-center gap-2"><Sliders size={16} /> Match Sensitivity</h4>
                  <p className="text-xs text-tertiary">Controls how strict the AI is when suggesting connections.</p>
                </div>
                <select 
                  className="privacy-select"
                  value={privacySettings.matchSensitivity}
                  onChange={(e) => updatePrivacy('matchSensitivity', e.target.value)}
                >
                  <option value="strict">Strict (High Synergy)</option>
                  <option value="balanced">Balanced (Default)</option>
                  <option value="discovery">Discovery (Wide Reach)</option>
                </select>
              </div>

              {/* Analytics */}
              <div className="privacy-setting-item">
                <div className="setting-info">
                  <h4 className="flex items-center gap-2"><BarChart2 size={16} /> Usage Analytics</h4>
                  <p className="text-xs text-tertiary">Allow MeetFlow to use anonymous usage data to improve the global event pulse.</p>
                </div>
                <div 
                  className={`toggle-switch ${privacySettings.allowAnalytics ? 'active' : ''}`}
                  onClick={() => updatePrivacy('allowAnalytics', !privacySettings.allowAnalytics)}
                >
                  <div className="toggle-knob"></div>
                </div>
              </div>
            </div>

            <div className="danger-zone mt-8 pt-6 border-t border-glass">
              <h4 className="text-danger flex items-center gap-2 mb-2"><Trash2 size={16} /> Danger Zone</h4>
              <p className="text-xs text-tertiary mb-4">Erasing your AI learning data will reset all networking weights. This action is irreversible.</p>
              <button 
                className="btn btn-outline text-danger w-full sm:w-auto"
                onClick={() => {
                  if(window.confirm("Confirm: Wipe all AI matchmaking weights?")) wipeAILearning();
                }}
              >
                Wipe AI Learning Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── UTILITIES ── */}
      <div className="profile-utilities text-center mt-6 pt-4 border-t border-glass">
        <button 
          className="btn btn-outline text-danger" 
          onClick={() => {
            if (window.confirm("Are you sure you want to reset all data and sign out? This cannot be undone.")) {
              resetApp();
            }
          }}
          style={{ borderColor: 'transparent', fontSize: '0.8rem' }}
        >
          <RotateCcw size={14} /> Reset App Data
        </button>
      </div>

      {/* ── EDIT MODAL ────────────────────────── */}
      {isEditing && formData && (
        <div className="edit-overlay animate-fade-in" onClick={handleCancel}>
          <div className="edit-modal" onClick={e => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h2>Edit Profile</h2>
              <button className="btn-icon-circle" onClick={handleCancel}><X size={18} /></button>
            </div>

            <div className="edit-modal-body">
              <h4 className="edit-section-label">Identity</h4>
              <div className="edit-grid-2">
                <div className="edit-field-group">
                  <label className="edit-label">Full Name</label>
                  <input type="text" placeholder="Jane Doe" value={formData.name || ''} onChange={e => setField('name', e.target.value)} />
                </div>
                <div className="edit-field-group">
                  <label className="edit-label">Current Role</label>
                  <input type="text" placeholder="Software Engineer" value={formData.role || ''} onChange={e => setField('role', e.target.value)} />
                </div>
                <div className="edit-field-group col-span-2">
                  <label className="edit-label">Headline</label>
                  <input type="text" placeholder="Building scalable GenAI solutions" value={formData.headline || ''} onChange={e => setField('headline', e.target.value)} />
                </div>
                <div className="edit-field-group">
                  <label className="edit-label">Company</label>
                  <input type="text" placeholder="Acme Corp" value={formData.company || ''} onChange={e => setField('company', e.target.value)} />
                </div>
                <div className="edit-field-group">
                  <label className="edit-label">LinkedIn</label>
                  <input type="text" placeholder="linkedin.com/in/yourname" value={formData.linkedin || ''} onChange={e => setField('linkedin', e.target.value)} />
                </div>
                <div className="edit-field-group">
                  <label className="edit-label">Experience Level</label>
                  <select value={formData.experienceLevel || 'Mid-Level'} onChange={e => setField('experienceLevel', e.target.value)}>
                    <option>Junior</option><option>Mid-Level</option><option>Senior</option><option>Executive</option>
                  </select>
                </div>
                <div className="edit-field-group">
                  <label className="edit-label">Availability</label>
                  <select value={formData.availability || 'Highly Available'} onChange={e => setField('availability', e.target.value)}>
                    <option>Highly Available</option><option>Mostly Available</option><option>Available for Coffee</option><option>Only Scheduled Meetings</option>
                  </select>
                </div>
              </div>

              <div className="edit-divider"></div>
              <h4 className="edit-section-label">Matching Vectors</h4>
              <SelectionPills label="Skills" helper="Up to 3 skills that define your expertise" max={3} values={formData.skills || []} presets={PRESET_SKILLS} onChange={v => setField('skills', v)} />
              <SelectionPills label="Interests" helper="Up to 3 topics you're most excited about" max={3} values={formData.interests || []} presets={PRESET_INTERESTS} onChange={v => setField('interests', v)} />
              <SelectionPills label="Goals" helper="Up to 3 networking goals for this event" max={3} values={formData.goals || []} presets={PRESET_GOALS} onChange={v => setField('goals', v)} />
            </div>

            <div className="edit-modal-footer">
              <button className="btn btn-secondary" onClick={handleCancel}><X size={15} /> Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}><Check size={15} /> Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
