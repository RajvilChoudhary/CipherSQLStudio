// frontend/src/pages/HomePage.jsx
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <main className="home-page">
      {/* Hero Section */}
      <section className="home-page__hero">
        <div className="home-page__eyebrow">
          <span>▶</span> Interactive SQL Learning Platform
        </div>

        <h1 className="home-page__title">
          Master SQL with<br />
          <span className="highlight">Real Queries.</span>
        </h1>

        <p className="home-page__subtitle">
          Write actual SQL against real PostgreSQL databases. Get intelligent 
          AI hints — not answers. Learn by doing.
        </p>

        <div className="home-page__cta">
          <Link to="/assignments" className="btn btn--primary btn--lg">
            Start Practicing →
          </Link>
          <a 
            href="https://www.postgresql.org/docs/current/sql.html" 
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--secondary btn--lg"
          >
            SQL Reference ↗
          </a>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="home-page__stats">
        <div className="stat">
          <div className="stat__value">6+</div>
          <div className="stat__label">Assignments</div>
        </div>
        <div className="stat">
          <div className="stat__value">3</div>
          <div className="stat__label">Difficulty Levels</div>
        </div>
        <div className="stat">
          <div className="stat__value">100%</div>
          <div className="stat__label">Isolated Sandbox</div>
        </div>
        <div className="stat">
          <div className="stat__value">AI</div>
          <div className="stat__label">Hint System</div>
        </div>
      </div>

      {/* Feature Cards */}
      <section style={{ 
        padding: '3rem 1.5rem', 
        maxWidth: '1000px', 
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem' 
        }}>
          {[
            {
              icon: '⬡',
              title: 'Real PostgreSQL',
              desc: 'Execute queries against actual PostgreSQL. No simulation — real results, real errors.'
            },
            {
              icon: '🔒',
              title: 'Isolated Sandbox',
              desc: 'Your queries run in a private schema. You can\'t accidentally break anything.'
            },
            {
              icon: '💡',
              title: 'Smart Hints',
              desc: 'AI gives conceptual hints and guidance. Never the full solution — you earn it.'
            },
            {
              icon: '📊',
              title: 'Live Results',
              desc: 'See your query results in real-time. Formatted table, row count, execution time.'
            }
          ].map(feature => (
            <div key={feature.title} className="card">
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>
                {feature.icon}
              </div>
              <h3 style={{ 
                fontFamily: 'Syne, sans-serif',
                fontSize: '1.1rem',
                marginBottom: '0.5rem',
                color: 'var(--color-text-primary)'
              }}>
                {feature.title}
              </h3>
              <p style={{ 
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary)',
                lineHeight: '1.6'
              }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default HomePage;
