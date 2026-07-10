import { useEffect, useRef, useState } from "react";
import UploadModal from "./UploadModal";
import PreviewModal from "./PreviewModal";
import ReactionModal from "./ReactionModal";
import {
  getImages,
  uploadImage,
  deleteImage,
  reactToImage,
  getVideos,
  uploadVideo,
  deleteVideo,
  reactToVideo,
} from "../api/api";

/**
 * mediaType: "image" | "video"
 * onBack: () => void
 */
export default function MediaSection({ mediaType, onBack }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [previewItem, setPreviewItem] = useState(null);
  const [reactionItem, setReactionItem] = useState(null);

  const longPressTimer = useRef(null);
  const longPressTriggered = useRef(false);

  const isImage = mediaType === "image";

  const fetchItems = async () => {
    setLoading(true);
    setError("");
    try {
      const res = isImage ? await getImages() : await getVideos();
      setItems(res.data);
    } catch (err) {
      setError("Failed to load data from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaType]);

  const handleFileSelected = async (file) => {
    setUploading(true);
    setError("");
    try {
      const res = isImage ? await uploadImage(file) : await uploadVideo(file);
      setItems((prev) => [res.data, ...prev]);
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleted = (id) => {
    setItems((prev) => prev.filter((i) => i._id !== id));
  };

  // --- Long-press detection (works for touch + mouse via Pointer Events) ---
  const LONG_PRESS_MS = 450;

  const startLongPress = (item) => {
    longPressTriggered.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      setReactionItem(item);
    }, LONG_PRESS_MS);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleCardClick = (item) => {
    // Suppress the click that follows a long-press so it doesn't also open the preview
    if (longPressTriggered.current) {
      longPressTriggered.current = false;
      return;
    }
    setPreviewItem(item);
  };

  const handleReactSubmit = async (emoji, comment) => {
    const res = isImage
      ? await reactToImage(reactionItem._id, emoji, comment)
      : await reactToVideo(reactionItem._id, emoji, comment);

    setItems((prev) =>
      prev.map((i) => (i._id === res.data._id ? res.data : i))
    );

    // Keep the preview in sync too, in case it's open for the same item
    setPreviewItem((prev) => (prev && prev._id === res.data._id ? res.data : prev));
  };

  return (
    <div className="section-screen">
      <header className="section-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <div className="section-title-wrap">
          <h2>{isImage ? "Images" : "Videos"}</h2>
          {!loading && (
            <span className="count-badge">
              {items.length} {isImage ? (items.length === 1 ? "image" : "images") : (items.length === 1 ? "video" : "videos")}
            </span>
          )}
        </div>
        <button className="refresh-btn" onClick={fetchItems} title="Refresh">
          ⟳
        </button>
      </header>

      {error && <p className="error-text center">{error}</p>}

      {loading ? (
        <div className="loading-box">
          <div className="spinner" />
          <p>Loading {isImage ? "images" : "videos"}...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <p>No {isImage ? "images" : "videos"} uploaded yet.</p>
        </div>
      ) : (
        <div className="media-grid">
          {items.map((item) => (
            <button
              className="media-card"
              key={item._id}
              onClick={() => handleCardClick(item)}
              onPointerDown={() => startLongPress(item)}
              onPointerUp={cancelLongPress}
              onPointerLeave={cancelLongPress}
              onPointerCancel={cancelLongPress}
              onContextMenu={(e) => e.preventDefault()}
            >
              {isImage ? (
                <img src={item.url} alt={item.originalName || "uploaded"} loading="lazy" />
              ) : (
                <>
                  <video src={item.url} playsInline muted />
                  <span className="video-play-badge">▶</span>
                </>
              )}
              {(() => {
                const emojiReactions = (item.reactions || []).filter((r) => r.emoji);
                const commentReactions = (item.reactions || []).filter((r) => r.comment);
                return (
                  <>
                    {emojiReactions.length > 0 && (
                      <span className="reaction-count-badge">
                        {emojiReactions[emojiReactions.length - 1].emoji} {emojiReactions.length}
                      </span>
                    )}
                    {commentReactions.length > 0 && (
                      <span className="comment-count-badge">
                        💬 {commentReactions.length}
                      </span>
                    )}
                  </>
                );
              })()}
            </button>
          ))}
        </div>
      )}

      <button className="fab" onClick={() => setShowModal(true)}>
        +
      </button>

      {showModal && (
        <UploadModal
          mediaType={mediaType}
          uploading={uploading}
          onFileSelected={handleFileSelected}
          onClose={() => !uploading && setShowModal(false)}
        />
      )}

      {previewItem && (
        <PreviewModal
          item={previewItem}
          mediaType={mediaType}
          onClose={() => setPreviewItem(null)}
          onDelete={isImage ? deleteImage : deleteVideo}
          onDeleted={handleDeleted}
        />
      )}

      {reactionItem && (
        <ReactionModal
          onSubmit={handleReactSubmit}
          onClose={() => setReactionItem(null)}
        />
      )}
    </div>
  );
}