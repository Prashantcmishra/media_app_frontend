import { useState } from "react";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

/**
 * Bottom-sheet reaction picker, opened via long-press on a media card.
 *
 * onSubmit: (emoji, comment) => Promise
 * onClose: () => void
 */
export default function ReactionModal({ onSubmit, onClose }) {
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!selectedEmoji) return;
    setSending(true);
    setError("");
    try {
      await onSubmit(selectedEmoji, comment.trim());
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't send reaction. Try again.");
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet reaction-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <h3 className="modal-title">React</h3>

        <div className="emoji-grid">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              className={`emoji-btn ${selectedEmoji === emoji ? "selected" : ""}`}
              onClick={() => setSelectedEmoji(emoji)}
              disabled={sending}
            >
              {emoji}
            </button>
          ))}
        </div>

        <textarea
          className="reaction-comment-input"
          placeholder="Add a short comment (optional)"
          maxLength={200}
          rows={2}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={sending}
        />

        {error && <p className="error-text center">{error}</p>}

        <div className="reaction-modal-actions">
          <button className="modal-cancel-btn" onClick={onClose} disabled={sending}>
            Cancel
          </button>
          <button
            className="btn-primary reaction-send-btn"
            onClick={handleSend}
            disabled={!selectedEmoji || sending}
          >
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}