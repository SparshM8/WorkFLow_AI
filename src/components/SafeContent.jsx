import React from 'react';
import DOMPurify from 'dompurify';
import './SafeContent.css';

/**
 * SafeContent Component (Senior Security Implementation)
 * Ensures all AI-generated strings are sanitized before being rendered to the DOM.
 * Prevents XSS attacks from potentially malicious model outputs.
 * 
 * @param {Object} props
 * @param {string} props.content - The raw string/HTML to sanitize and render
 * @param {string} [props.className] - Optional styling class
 * @param {string} [props.tag='div'] - The wrapper element tag
 */
const SafeContent = ({ content, className = '', tag = 'div' }) => {
  // Configured to allow basic formatting tags used by Gemini
  const sanitized = DOMPurify.sanitize(content || '', {
    ALLOWED_TAGS: ['b', 'strong', 'i', 'em', 'u', 'br', 'span'],
    ALLOWED_ATTR: ['class', 'style'],
  });

  return React.createElement(tag, {
    className: `safe-content-wrapper ${className}`,
    dangerouslySetInnerHTML: { __html: sanitized },
  });
};

export default SafeContent;
