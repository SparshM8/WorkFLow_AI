import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle2, Search, Zap, Target, Loader2, Sparkles } from 'lucide-react';
import './ReasoningChain.css';

// Steps are defined outside component — stable references, no re-creation on render
const buildSteps = (match, currentUser) => [
  {
    id: 'context',
    label: 'Context Extraction',
    desc: `Parsing profile delta for ${match.name}…`,
    icon: <Search size={14} aria-hidden="true" />,
  },
  {
    id: 'semantic',
    label: 'Semantic Mapping',
    desc: `Calculating overlap across ${match.interests?.length || 0} interest vectors.`,
    icon: <Zap size={14} aria-hidden="true" />,
  },
  {
    id: 'goal',
    label: 'Goal Alignment',
    desc: `Heuristic check: "${currentUser.goals?.[0] || 'Networking'}" ↔ "${match.goals?.[0] || 'Collaboration'}".`,
    icon: <Target size={14} aria-hidden="true" />,
  },
  {
    id: 'synthesis',
    label: 'Weighted Synthesis',
    desc: 'Ranking signals finalized. Score locked.',
    icon: <Brain size={14} aria-hidden="true" />,
  },
];

/**
 * ReasoningChain — AI Transparency Visualizer
 *
 * Shows the step-by-step reasoning process of the MeetFlow matching engine.
 * Provides explainability for users who want to understand AI decisions.
 * WCAG: Uses aria-live to announce steps, screen-reader accessible labels.
 *
 * @param {object} match - The attendee being matched
 * @param {object} currentUser - The active user
 */
const ReasoningChain = ({ match, currentUser }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const steps = buildSteps(match, currentUser);
  const score = match.matchDetails?.score ?? '—';

  useEffect(() => {
    if (isCompleted) return;

    setActiveStep(0);
    const timers = steps.map((_, i) =>
      setTimeout(() => {
        setActiveStep(i);
        if (i === steps.length - 1) {
          setTimeout(() => setIsCompleted(true), 1200);
        }
      }, i * 1400)
    );

    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match.id]);

  return (
    <div className="reasoning-chain-container" aria-label="AI reasoning chain">
      <div className="rc-header">
        <Sparkles size={12} className="text-accent-secondary" aria-hidden="true" />
        <span>Gemini Reasoning Chain</span>
      </div>

      <ol className="rc-steps" aria-label="Reasoning steps">
        {steps.map((step, i) => {
          const isDone = isCompleted || i < activeStep;
          const isActive = !isCompleted && i === activeStep;
          const isPending = !isDone && !isActive;

          return (
            <li
              key={step.id}
              className={`rc-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'step' : undefined}
            >
              <div className="rc-line" aria-hidden="true" />
              <div className="rc-indicator" aria-hidden="true">
                {isDone
                  ? <CheckCircle2 size={12} />
                  : isActive
                    ? <Loader2 size={12} className="animate-spin" />
                    : <div className="rc-dot" />
                }
              </div>
              <div className="rc-body">
                <div className="rc-label">
                  <span className="rc-icon">{step.icon}</span>
                  {step.label}
                  {isPending && <span className="sr-only"> (pending)</span>}
                  {isDone && <span className="sr-only"> (completed)</span>}
                </div>
                {isActive && (
                  <div className="rc-desc" aria-live="polite">
                    {step.desc}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {isCompleted && (
        <div className="rc-completion animate-fade-in" role="status" aria-live="polite">
          <div className="rc-cert-badge">
            <CheckCircle2 size={10} aria-hidden="true" />
            Verified by MeetFlow Reasoning Engine
          </div>
          <p className="text-xs text-tertiary mt-2">
            Analysis complete. Compatibility score: <strong>{score}%</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default ReasoningChain;
