import { useEffect, useState } from "react";
import { getAnnouncement, updateAnnouncement } from "../api/api";
import AnnouncementModal from "./AnnouncementModal";

export default function Dashboard({ username, role, onSelectSection, onLogout }) {
  const isAdmin = role === "admin";

  const [announcement, setAnnouncement] = useState("");
  const [draftMessage, setDraftMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const res = await getAnnouncement();
        const msg = res.data.message || "";
        setAnnouncement(msg);
        setDraftMessage(msg);
        if (!isAdmin && msg) {
          setShowAlert(true);
        }
      } catch (err) {
        // Announcement is a non-critical feature - fail silently
      }
    };
    fetchAnnouncement();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveAnnouncement = async () => {
    setSaving(true);
    setSaveStatus("");
    try {
      const res = await updateAnnouncement(draftMessage.trim());
      setAnnouncement(res.data.message);
      setSaveStatus("Saved ✓");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (err) {
      setSaveStatus(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

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

      {isAdmin && (
        <div className="announcement-editor">
          <label className="field-label announcement-editor-label">
            Announcement for user1 &amp; user2
          </label>
          <textarea
            className="announcement-textarea"
            rows={3}
            maxLength={300}
            placeholder="e.g. Kindly watch the last two uploaded reels and make accordingly"
            value={draftMessage}
            onChange={(e) => setDraftMessage(e.target.value)}
          />
          <div className="announcement-editor-footer">
            <button
              className="btn-primary announcement-save-btn"
              onClick={handleSaveAnnouncement}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Announcement"}
            </button>
            {saveStatus && <span className="announcement-save-status">{saveStatus}</span>}
          </div>
        </div>
      )}

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

      {showAlert && (
        <AnnouncementModal message={announcement} onClose={() => setShowAlert(false)} />
      )}
    </div>
  );
}