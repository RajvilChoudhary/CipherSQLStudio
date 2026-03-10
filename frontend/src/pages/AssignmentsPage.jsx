// frontend/src/pages/AssignmentsPage.jsx
// Shows all available assignments in a grid
// Users can filter by difficulty

import { useState, useEffect } from 'react';
import { fetchAssignments } from '../utils/api';
import AssignmentCard from '../components/assignments/AssignmentCard';

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  // Fetch assignments when component mounts
  useEffect(() => {
    const loadAssignments = async () => {
      try {
        setIsLoading(true);
        const response = await fetchAssignments();
        setAssignments(response.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadAssignments();
  }, []); // Empty array = run once on mount

  // Filter assignments based on selected difficulty
  const filtered = activeFilter === 'All' 
    ? assignments 
    : assignments.filter(a => a.difficulty === activeFilter);

  if (isLoading) {
    return (
      <div className="assignments-page">
        <div className="loading-screen">
          <div className="loading-screen__spinner" />
          <span className="loading-screen__text">Loading assignments...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="assignments-page">
        <div className="error-state">
          <div className="error-state__icon">⚠</div>
          <div className="error-state__title">Failed to load assignments</div>
          <div className="error-state__message">
            {error}. Make sure the backend server is running on port 5000.
          </div>
          <button 
            className="btn btn--secondary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="assignments-page">
      <div className="assignments-page__header">
        <h1>SQL <span>Assignments</span></h1>
        <p>
          {assignments.length} assignment{assignments.length !== 1 ? 's' : ''} available. 
          Start with Easy, work up to Hard.
        </p>
      </div>

      {/* Difficulty filter tabs */}
      <div className="assignments-page__filters">
        {DIFFICULTIES.map(diff => (
          <button
            key={diff}
            className={`filter-tab ${activeFilter === diff ? 'active' : ''}`}
            onClick={() => setActiveFilter(diff)}
          >
            {diff}
            {diff !== 'All' && (
              <span style={{ marginLeft: '6px', opacity: 0.6 }}>
                ({assignments.filter(a => a.difficulty === diff).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Assignments grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🔍</div>
          <p className="empty-state__text">No {activeFilter} assignments found.</p>
        </div>
      ) : (
        <div className="assignments-page__grid">
          {filtered.map((assignment, index) => (
            <AssignmentCard 
              key={assignment._id}
              assignment={assignment}
              index={assignments.indexOf(assignment)} // Use original index
            />
          ))}
        </div>
      )}
    </main>
  );
};

export default AssignmentsPage;
