// frontend/src/pages/AttemptPage.jsx
// THE MAIN PAGE - where students actually write and run SQL
//
// Layout:
//   [Navbar]
//   [Topbar: breadcrumb + difficulty]
//   [LEFT: Question + Sample Data] | [RIGHT: SQL Editor + Results + Hints]

import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchAssignment, executeQuery, getProgress } from '../utils/api';
import SqlEditor from '../components/editor/SqlEditor';
import QueryResults from '../components/editor/QueryResults';
import SampleDataViewer from '../components/assignments/SampleDataViewer';
import HintPanel from '../components/hints/HintPanel';
import DifficultyBadge from '../components/common/DifficultyBadge';

const AttemptPage = () => {
  // useParams gets the :id from the URL (e.g., /assignments/abc123)
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [assignment, setAssignment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [query, setQuery] = useState('-- Write your SQL query here\n');
  const [queryResult, setQueryResult] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryError, setQueryError] = useState(null);

  // Load assignment on mount
  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        
        // Fetch assignment details
        const response = await fetchAssignment(id);
        setAssignment(response.data);

        // Try to load saved progress (if any)
        try {
          const progressRes = await getProgress(id);
          if (progressRes.data?.sqlQuery) {
            setQuery(progressRes.data.sqlQuery);
          }
        } catch {
          // No progress saved yet, that's fine
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [id]);

  // Execute the user's SQL query
  const handleExecute = useCallback(async () => {
    if (!query.trim() || isExecuting) return;

    setIsExecuting(true);
    setQueryResult(null);
    setQueryError(null);

    try {
      const result = await executeQuery(id, query);
      setQueryResult(result);
      
      // Track error for hint context
      if (!result.success) {
        setQueryError(result.error);
      } else {
        setQueryError(null);
      }
    } catch (err) {
      setQueryResult({ success: false, error: err.message });
      setQueryError(err.message);
    } finally {
      setIsExecuting(false);
    }
  }, [id, query, isExecuting]);

  // ==================== RENDER STATES ====================

  if (isLoading) {
    return (
      <div className="attempt-page">
        <div className="loading-screen" style={{ minHeight: '60vh' }}>
          <div className="loading-screen__spinner" />
          <span className="loading-screen__text">Loading assignment...</span>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="attempt-page">
        <div className="error-state">
          <div className="error-state__icon">⚠</div>
          <div className="error-state__title">Assignment not found</div>
          <div className="error-state__message">{error || 'Unknown error'}</div>
          <button className="btn btn--secondary" onClick={() => navigate('/assignments')}>
            ← Back to Assignments
          </button>
        </div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================

  return (
    <div className="attempt-page">
      {/* Top breadcrumb bar */}
      <div className="attempt-page__topbar">
        <div className="attempt-page__breadcrumb">
          <Link to="/assignments" className="btn btn--ghost btn--sm">
            ← Back
          </Link>
          <span className="sep">/</span>
          <span className="current">{assignment.title}</span>
        </div>
        <div className="attempt-page__difficulty">
          <DifficultyBadge difficulty={assignment.difficulty} />
          {assignment.tags?.slice(0, 2).map(tag => (
            <span key={tag} className="badge badge--tag">{tag}</span>
          ))}
        </div>
      </div>

      {/* Main two-column layout */}
      <div className="attempt-page__layout">

        {/* ========== LEFT COLUMN ========== */}
        <div className="attempt-page__left">
          {/* Question Panel */}
          <div className="question-panel">
            <div className="question-panel__label">Assignment</div>
            <h1 className="question-panel__title">{assignment.title}</h1>
            <p className="question-panel__text">{assignment.question}</p>
            <div className="question-panel__tags">
              {assignment.tags?.map(tag => (
                <span key={tag} className="badge badge--tag">{tag}</span>
              ))}
            </div>
          </div>

          {/* Sample Data Tables */}
          <SampleDataViewer sampleTables={assignment.sampleTables} />
        </div>

        {/* ========== RIGHT COLUMN ========== */}
        <div className="attempt-page__right">
          {/* SQL Editor */}
          <div className="editor-area">
            {/* Panel header */}
            <div 
              style={{ 
                padding: '8px 16px',
                background: 'var(--color-bg-elevated)',
                borderBottom: '1px solid var(--color-border)',
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
                fontFamily: 'JetBrains Mono, monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}
            >
              Query Editor
            </div>

            <SqlEditor
              value={query}
              onChange={setQuery}
              onExecute={handleExecute}
              isLoading={isExecuting}
            />
          </div>

          {/* Results Panel */}
          <div 
            className="results-area"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <div 
              style={{ 
                padding: '8px 16px',
                background: 'var(--color-bg-elevated)',
                borderBottom: '1px solid var(--color-border)',
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
                fontFamily: 'JetBrains Mono, monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.08em'
              }}
            >
              Results
            </div>
            <QueryResults result={queryResult} isLoading={isExecuting} />
          </div>

          {/* AI Hint Panel */}
          <HintPanel
            assignmentId={id}
            currentQuery={query}
            queryError={queryError}
          />
        </div>

      </div>
    </div>
  );
};

export default AttemptPage;
