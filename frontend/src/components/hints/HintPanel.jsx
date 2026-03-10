// frontend/src/components/hints/HintPanel.jsx
// The "Get Hint" section below the editor
// Calls our backend which calls the LLM API
// LLM is prompted to give HINTS only, not solutions

import { useState } from 'react';
import { getHint } from '../../utils/api';

const HintPanel = ({ assignmentId, currentQuery, queryError }) => {
  const [hint, setHint] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hintCount, setHintCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const handleGetHint = async () => {
    setIsLoading(true);
    setError(null);
    setIsOpen(true);
    
    try {
      const response = await getHint(
        assignmentId,
        currentQuery,
        queryError // Pass any error message so AI can explain it
      );
      
      setHint(response.hint);
      setHintCount(prev => prev + 1);
    } catch (err) {
      setError(err.message || 'Failed to get hint. Check your API key.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format hint text: convert **bold** and `code` markdown
  const formatHint = (text) => {
    if (!text) return '';
    // Replace **text** with <strong>
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Replace `code` with <code>
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Replace newlines with <br>
    formatted = formatted.replace(/\n/g, '<br/>');
    return formatted;
  };

  return (
    <div className="hint-panel">
      {/* Trigger button */}
      <button 
        className="hint-panel__trigger"
        onClick={isLoading ? undefined : handleGetHint}
        disabled={isLoading}
        aria-expanded={isOpen}
      >
        <span className="hint-icon">💡</span>
        <span className="hint-label">
          {isLoading ? 'Thinking...' : 'Get AI Hint'}
        </span>
        {hintCount > 0 && (
          <span className="hint-counter">{hintCount} hint{hintCount > 1 ? 's' : ''} used</span>
        )}
        {isLoading && (
          <span className="loading-dots" style={{ marginLeft: '8px' }}>
            <span /><span /><span />
          </span>
        )}
      </button>

      {/* Hint content (shown when hint is fetched) */}
      {isOpen && hint && !isLoading && (
        <div className="hint-panel__content">
          <div className="hint-panel__label">AI Hint</div>
          <p 
            dangerouslySetInnerHTML={{ __html: formatHint(hint) }}
          />
        </div>
      )}

      {/* Error state */}
      {isOpen && error && !isLoading && (
        <div className="hint-panel__content">
          <div className="hint-panel__label" style={{ color: 'var(--color-danger)' }}>
            Error
          </div>
          <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem' }}>
            {error}
          </p>
        </div>
      )}
    </div>
  );
};

export default HintPanel;
