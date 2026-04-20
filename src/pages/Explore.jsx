import React, { useState, useContext, useMemo } from 'react';
import {
  Search, Users, Filter, X, Sparkles, Building2,
  Briefcase, Target, Zap, SlidersHorizontal, UserPlus,
  Check, Send, Handshake, BookOpen, LayoutGrid, Share2
} from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { getMatchScore } from '../utils/matchmaking';
import NetworkGraph from '../components/NetworkGraph';
import './Explore.css';

// Local NetworkGraph removed in favor of external component

const FILTER_SKILLS = ['Python', 'React', 'TensorFlow', 'Product Strategy', 'Figma', 'System Architecture', 'Node.js', 'AWS'];
const FILTER_INTERESTS = ['Generative AI', 'Open Source', 'Ethics', 'Startups', 'UX for AI', 'Web3', 'SaaS', 'Data'];
const FILTER_EXP = ['Junior', 'Mid-Level', 'Senior', 'Executive'];
const FILTER_AVAIL = ['Highly Available', 'Mostly Available', 'Available for Coffee'];

const AttendeeBigCard = React.memo(({ attendee, score, signals, onConnect, status }) => {
  const initial = attendee.name?.charAt(0).toUpperCase();
  const hue = (attendee.name.charCodeAt(0) * 7) % 360;

  return (
    <div className="explore-attendee-card card">
      {/* Header */}
      <div className="eac-header">
        <div
          className="eac-avatar"
          style={{ background: `linear-gradient(135deg, hsl(${hue},65%,55%), hsl(${(hue + 60) % 360},65%,50%))` }}
        >
          {initial}
        </div>
        <div className="eac-identity">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="eac-name">{attendee.name}</h3>
            {score >= 60 && (
              <span className="eac-match-pill">
                <Sparkles size={9} /> {score}% match
              </span>
            )}
          </div>
          <p className="eac-role">
            {attendee.role}
            {attendee.company && <span className="text-tertiary"> · <Building2 size={10} className="inline" /> {attendee.company}</span>}
          </p>
          {attendee.availability && (
            <span className={`eac-avail-chip ${attendee.availability === 'Highly Available' ? 'chip-green' : 'chip-amber'}`}>
              {attendee.availability}
            </span>
          )}
        </div>
      </div>

      {/* Bio */}
      {attendee.bio && (
        <p className="eac-bio">{attendee.bio}</p>
      )}

      {/* Skills */}
      {attendee.skills?.length > 0 && (
        <div className="eac-tag-row">
          {attendee.skills.map(s => (
            <span key={s} className="eac-tag tag-skill"><Zap size={9} />{s}</span>
          ))}
        </div>
      )}

      {/* Interests */}
      {attendee.interests?.length > 0 && (
        <div className="eac-tag-row">
          {attendee.interests.map(i => (
            <span key={i} className="eac-tag tag-interest"><Sparkles size={9} />{i}</span>
          ))}
        </div>
      )}

      {/* Signals */}
      {signals.length > 0 && (
        <div className="eac-signals">
          {signals.slice(0, 2).map((sig, i) => (
            <div key={i} className="eac-signal">
              <span className="eac-signal-label">{sig.label}:</span>
              <span className="eac-signal-value">{sig.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Action */}
      <div className="eac-footer">
        {status === 'requested' ? (
          <button className="btn btn-secondary btn-sm w-full" disabled>
            <Check size={13} /> Request Sent
          </button>
        ) : status === 'connected' ? (
          <button className="btn btn-outline btn-sm w-full" disabled>
            <Handshake size={13} /> Connected
          </button>
        ) : (
          <button className="btn btn-primary btn-sm w-full" onClick={() => onConnect(attendee)}>
            <UserPlus size={13} /> Send Introduction
          </button>
        )}
      </div>
    </div>
  );
});

const Explore = () => {
  const { attendees, currentUser, networkRoster, setActiveConnectionMatch } = useContext(AppContext);
  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeSkill, setActiveSkill] = useState(null);
  const [activeInterest, setActiveInterest] = useState(null);
  const [activeExp, setActiveExp] = useState(null);
  const [activeAvail, setActiveAvail] = useState(null);
  const [activeRole, setActiveRole] = useState(null);
  const [activeCompany, setActiveCompany] = useState(null);
  const [sortBy, setSortBy] = useState('match'); // 'match' | 'name' | 'exp'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'graph'

  const FILTER_ROLES = useMemo(() => [...new Set(attendees.map(a => a.role).filter(Boolean))].slice(0, 6), [attendees]);
  const FILTER_COMPANIES = useMemo(() => [...new Set(attendees.map(a => a.company).filter(Boolean))].slice(0, 6), [attendees]);

  const hasFilters = activeSkill || activeInterest || activeExp || activeAvail || activeRole || activeCompany;

  const clearFilters = () => {
    setActiveSkill(null);
    setActiveInterest(null);
    setActiveExp(null);
    setActiveAvail(null);
    setActiveRole(null);
    setActiveCompany(null);
  };

  const enriched = useMemo(() => {
    return attendees.map(a => {
      const details = currentUser ? getMatchScore(currentUser, a) : { score: 0, sharedInterests: [], sharedSkills: [], matchingGoals: [] };
      const signals = [];
      if (details.sharedInterests.length) signals.push({ label: 'Shared', value: details.sharedInterests.join(', ') });
      if (details.sharedSkills.length) signals.push({ label: 'Skills', value: details.sharedSkills.join(', ') });
      return { ...a, score: details.score, signals };
    });
  }, [attendees, currentUser]);

  const filtered = useMemo(() => {
    let list = enriched.filter(a => {
      const q = query.toLowerCase();
      const matchesQ = !q || a.name.toLowerCase().includes(q)
        || a.role?.toLowerCase().includes(q)
        || a.company?.toLowerCase().includes(q)
        || a.bio?.toLowerCase().includes(q);
      const matchesSkill = !activeSkill || a.skills?.includes(activeSkill);
      const matchesInt = !activeInterest || a.interests?.includes(activeInterest);
      const matchesExp = !activeExp || a.experienceLevel === activeExp;
      const matchesAvail = !activeAvail || a.availability === activeAvail;
      const matchesRole = !activeRole || a.role === activeRole;
      const matchesComp = !activeCompany || a.company === activeCompany;
      return matchesQ && matchesSkill && matchesInt && matchesExp && matchesAvail && matchesRole && matchesComp;
    });

    if (sortBy === 'match') list = list.sort((a, b) => b.score - a.score);
    else if (sortBy === 'name') list = list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'exp') {
      const order = ['Executive', 'Senior', 'Mid-Level', 'Junior'];
      list = list.sort((a, b) => order.indexOf(a.experienceLevel) - order.indexOf(b.experienceLevel));
    }

    return list;
  }, [enriched, query, activeSkill, activeInterest, activeExp, activeAvail, activeRole, activeCompany, sortBy]);

  return (
    <div className="explore-page animate-fade-in">
      {/* ── Header ── */}
      <div className="explore-header">
        <div>
          <p className="explore-eyebrow">Attendee Directory</p>
          <h1 className="explore-title">Explore <span className="gradient-text-accent">People</span></h1>
          <p className="text-secondary text-sm mt-1">
            {attendees.length} attendees at this event · AI-ranked by compatibility
          </p>
        </div>
        <div className="explore-sort-row">
          <div className="view-mode-toggle mr-4">
            <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
              <LayoutGrid size={15} />
            </button>
            <button className={`view-btn ${viewMode === 'graph' ? 'active' : ''}`} onClick={() => setViewMode('graph')}>
              <Share2 size={15} />
            </button>
          </div>
          <span className="text-xs text-tertiary">Sort by:</span>
          {[['match', 'Best Match'], ['name', 'Name'], ['exp', 'Seniority']].map(([val, label]) => (
            <button
              key={val}
              className={`sort-btn ${sortBy === val ? 'active' : ''}`}
              onClick={() => setSortBy(val)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Search + Filter Bar ── */}
      <div className="explore-controls">
        <div className="explore-search-wrap">
          <Search size={16} className="search-icon" />
          <input
            className="explore-search"
            type="text"
            placeholder="Search by name, role, company, or keyword…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button className="search-clear" onClick={() => setQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>
        <button
          className={`filter-toggle-btn ${filtersOpen ? 'active' : ''} ${hasFilters ? 'has-filters' : ''}`}
          onClick={() => setFiltersOpen(v => !v)}
        >
          <SlidersHorizontal size={15} />
          Filters
          {hasFilters && <span className="filter-dot"></span>}
        </button>
      </div>

      {/* ── Filter Panel ── */}
      {filtersOpen && (
        <div className="filter-panel animate-slide-down">
          <div className="filter-group-row">
            <div className="filter-group">
              <p className="filter-group-label"><Zap size={11} /> Skills</p>
              <div className="filter-chips">
                {FILTER_SKILLS.map(s => (
                  <button key={s} className={`filter-chip ${activeSkill === s ? 'active' : ''}`}
                    onClick={() => setActiveSkill(activeSkill === s ? null : s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <p className="filter-group-label"><Sparkles size={11} /> Interests</p>
              <div className="filter-chips">
                {FILTER_INTERESTS.map(i => (
                  <button key={i} className={`filter-chip ${activeInterest === i ? 'active' : ''}`}
                    onClick={() => setActiveInterest(activeInterest === i ? null : i)}>
                    {i}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <p className="filter-group-label"><BookOpen size={11} /> Experience</p>
              <div className="filter-chips">
                {FILTER_EXP.map(e => (
                  <button key={e} className={`filter-chip ${activeExp === e ? 'active' : ''}`}
                    onClick={() => setActiveExp(activeExp === e ? null : e)}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <p className="filter-group-label"><Users size={11} /> Availability</p>
              <div className="filter-chips">
                {FILTER_AVAIL.map(a => (
                  <button key={a} className={`filter-chip ${activeAvail === a ? 'active' : ''}`}
                    onClick={() => setActiveAvail(activeAvail === a ? null : a)}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <p className="filter-group-label"><Briefcase size={11} /> Role</p>
              <div className="filter-chips">
                {FILTER_ROLES.map(r => (
                  <button key={r} className={`filter-chip ${activeRole === r ? 'active' : ''}`}
                    onClick={() => setActiveRole(activeRole === r ? null : r)}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <p className="filter-group-label"><Building2 size={11} /> Company</p>
              <div className="filter-chips">
                {FILTER_COMPANIES.map(c => (
                  <button key={c} className={`filter-chip ${activeCompany === c ? 'active' : ''}`}
                    onClick={() => setActiveCompany(activeCompany === c ? null : c)}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {hasFilters && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              <X size={12} /> Clear all filters
            </button>
          )}
        </div>
      )}

      {/* ── Results Summary ── */}
      <div className="explore-results-meta">
        <span className="text-xs text-tertiary">
          {filtered.length === attendees.length
            ? `Showing all ${filtered.length} attendees`
            : `${filtered.length} of ${attendees.length} attendees match`}
        </span>
      </div>

      {/* ── Content ── */}
      {viewMode === 'graph' ? (
        <NetworkGraph 
          matches={filtered.map(m => ({
            ...m,
            matchDetails: { 
              score: m.score, 
              sharedInterests: m.signals.find(s => s.label === 'Shared')?.value?.split(', ') || [], 
              sharedSkills: m.signals.find(s => s.label === 'Skills')?.value?.split(', ') || [], 
              matchingGoals: [] 
            }
          }))}
          currentUser={currentUser} 
          onSelectMatch={match => setActiveConnectionMatch(match)}
        />
      ) : (
        <>
          {/* ── Grid ── */}
          {filtered.length > 0 ? (
            <div className="explore-grid">
              {filtered.map((attendee, i) => {
                const rosterEntry = networkRoster.find(n => n.matchId === attendee.id);
                return (
                  <div key={attendee.id} className="animate-fade-in" style={{ animationDelay: `${Math.min(i * 40, 300)}ms` }}>
                    <AttendeeBigCard
                      attendee={attendee}
                      score={attendee.score}
                      signals={attendee.signals}
                      status={rosterEntry?.status}
                      onConnect={match => setActiveConnectionMatch({ ...match, matchDetails: { score: match.score, sharedInterests: match.signals.find(s => s.label === 'Shared')?.value?.split(', ') || [], sharedSkills: match.signals.find(s => s.label === 'Skills')?.value?.split(', ') || [], matchingGoals: [] } })}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="explore-empty card">
              <Users size={40} className="text-tertiary" />
              <h3 className="text-primary mt-4">No attendees found</h3>
              <p className="text-secondary text-sm mt-2">Try adjusting your search or clearing filters.</p>
              <button className="btn btn-outline mt-4" onClick={() => { setQuery(''); clearFilters(); }}>
                Reset Search
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Explore;
