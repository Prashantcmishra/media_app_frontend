/**
 * Centered popup shown to non-admin users when the admin has an active announcement.
 * message: string
 * onClose: () => void
 */
export default function AnnouncementModal({ message, onClose }) {
  return (
    <div className="announcement-overlay" onClick={onClose}>
      <div className="announcement-modal" onClick={(e) => e.stopPropagation()}>
        <span className="announcement-modal-icon">📢</span>
        <h3 className="announcement-modal-title">Announcement</h3>
        <p className="announcement-modal-message">{message}</p>
        <button className="btn-primary announcement-ok-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}