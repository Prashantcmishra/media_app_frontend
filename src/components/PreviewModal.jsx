import { useState } from "react";

/**
 * Full-screen preview for a single image/video with Delete, Download, Share actions.
 *
 * item: { _id, url, originalName }
 * mediaType: "image" | "video"
 * onClose: () => void
 * onDeleted: (id) => void   // called after successful delete so parent can remove it from the grid
 * onDelete: (id) => Promise  // actual delete API call, passed down from MediaSection
 */
export default function PreviewModal({ item, mediaType, onClose, onDelete, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false); // covers download/share in-flight state
  const [error, setError] = useState("");

  const isImage = mediaType === "image";
  const fileName =
    item.originalName || `${mediaType}-${item._id}.${isImage ? "jpg" : "mp4"}`;

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete this ${mediaType} permanently? This can't be undone.`
    );
    if (!confirmed) return;

    setDeleting(true);
    setError("");
    try {
      await onDelete(item._id);
      onDeleted(item._id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed. Please try again.");
      setDeleting(false);
    }
  };

  const handleDownload = async () => {
    setBusy(true);
    setError("");
    try {
      // Cross-origin URLs ignore the <a download> attribute unless we fetch
      // the bytes ourselves and download from a same-origin blob URL.
      const response = await fetch(item.url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback: just open it in a new tab so the user can save it manually
      window.open(item.url, "_blank");
    } finally {
      setBusy(false);
    }
  };

  const handleShare = async () => {
    setBusy(true);
    setError("");
    try {
      if (navigator.share) {
        // Try native share sheet with the actual file (best experience on mobile)
        try {
          const response = await fetch(item.url);
          const blob = await response.blob();
          const file = new File([blob], fileName, { type: blob.type });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: "Shared from Media App",
            });
            return;
          }
        } catch (e) {
          // fall through to link-sharing below
        }

        // Fallback: share just the link
        await navigator.share({ url: item.url, title: "Shared from Media App" });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(item.url);
        alert("Link copied to clipboard!");
      } else {
        window.open(item.url, "_blank");
      }
    } catch (err) {
      // AbortError happens if user cancels the native share sheet - not a real error
      if (err.name !== "AbortError") {
        setError("Share failed. Link opened in a new tab instead.");
        window.open(item.url, "_blank");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="preview-overlay" onClick={onClose}>
      <div className="preview-content" onClick={(e) => e.stopPropagation()}>
        <button className="preview-close-btn" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <div className="preview-media-wrap">
          {isImage ? (
            <img src={item.url} alt={item.originalName || "preview"} />
          ) : (
            <video src={item.url} controls autoPlay playsInline />
          )}
        </div>

        {error && <p className="error-text preview-error">{error}</p>}

        <div className="preview-actions">
          <button className="preview-action-btn" onClick={handleDownload} disabled={busy}>
            <span className="preview-action-icon">⬇️</span>
            Download
          </button>

          <button className="preview-action-btn" onClick={handleShare} disabled={busy}>
            <span className="preview-action-icon">📤</span>
            Share
          </button>

          <button
            className="preview-action-btn danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            <span className="preview-action-icon">🗑️</span>
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}