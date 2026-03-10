// frontend/src/components/common/DifficultyBadge.jsx
// Shows Easy / Medium / Hard with color coding

const DifficultyBadge = ({ difficulty }) => {
  const level = difficulty?.toLowerCase() || 'easy';
  return (
    <span className={`badge badge--${level}`}>
      {difficulty}
    </span>
  );
};

export default DifficultyBadge;
