export default function Dashboard({ username, onSelectSection, onLogout }) {
  return (
    <div className="dashboard-screen">
      <header className="dashboard-header">
        <div>
          <p className="welcome-text">Welcome,</p>
          <h2 className="username-text">{username}</h2>
        </div>
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </header>

      <div className="section-cards">
        <button
          className="section-card"
          onClick={() => onSelectSection("image")}
        >
          <span className="section-card-icon">🖼️</span>
          <span className="section-card-label">Images</span>
        </button>

        <button
          className="section-card"
          onClick={() => onSelectSection("video")}
        >
          <span className="section-card-icon">🎬</span>
          <span className="section-card-label">Videos</span>
        </button>
      </div>
    </div>
  );
}