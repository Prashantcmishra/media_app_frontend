import { useEffect, useState } from "react";
import UploadModal from "./UploadModal";
import { getImages, uploadImage, getVideos, uploadVideo } from "../api/api";

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

  return (
    <div className="section-screen">
      <header className="section-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <h2>{isImage ? "Images" : "Videos"}</h2>
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
            <div className="media-card" key={item._id}>
              {isImage ? (
                <img src={item.url} alt={item.originalName || "uploaded"} loading="lazy" />
              ) : (
                <video src={item.url} controls playsInline />
              )}
            </div>
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
    </div>
  );
}
