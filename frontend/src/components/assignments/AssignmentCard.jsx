// frontend/src/components/assignments/AssignmentCard.jsx
// Individual card shown in the assignment listing grid

import { useNavigate } from 'react-router-dom';
import DifficultyBadge from '../common/DifficultyBadge';

const AssignmentCard = ({ assignment, index }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/assignments/${assignment._id}`);
  };

  return (
    <article 
      className="assignment-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleClick()}
      aria-label={`Open assignment: ${assignment.title}`}
    >
      <div className="assignment-card__header">
        <span className="assignment-card__number">
          #{String(index + 1).padStart(2, '0')}
        </span>
        <DifficultyBadge difficulty={assignment.difficulty} />
      </div>

      <h2 className="assignment-card__title">{assignment.title}</h2>

      <p className="assignment-card__question">
        {assignment.question}
      </p>

      <div className="assignment-card__footer">
        <div className="assignment-card__tags">
          {assignment.tags?.slice(0, 3).map(tag => (
            <span key={tag} className="badge badge--tag">{tag}</span>
          ))}
        </div>
        <span className="assignment-card__arrow">→</span>
      </div>
    </article>
  );
};

export default AssignmentCard;
