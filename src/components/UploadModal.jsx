import { useRef, useState } from "react";

/**
 * A bottom-sheet style modal (mobile-friendly) that lets the user either:
 *  1. Take a photo/video directly using the device camera
 *  2. Browse/select an existing file from the device gallery/storage
 *
 * mediaType: "image" | "video"
 * onFileSelected: (file) => void
 * onClose: () => void
 */
export default function UploadModal({ mediaType, onFileSelected, onClose, uploading }) {
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [previewName, setPreviewName] = useState("");

  const accept = mediaType === "image" ? "image/*" : "video/*";

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewName(file.name);
      onFileSelected(file);
    }
    // reset so selecting the same file again still fires onChange
    e.target.value = "";
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />
        <h3 className="modal-title">
          Upload {mediaType === "image" ? "Image" : "Video"}
        </h3>

        {uploading ? (
          <div className="uploading-box">
            <div className="spinner" />
            <p>Uploading{previewName ? `: ${previewName}` : "..."}</p>
          </div>
        ) : (
          <div className="modal-options">
            <button
              className="modal-option-btn"
              onClick={() => cameraInputRef.current.click()}
            >
              <span className="modal-icon">📷</span>
              Take {mediaType === "image" ? "Photo" : "Video"} (Camera)
            </button>

            <button
              className="modal-option-btn"
              onClick={() => galleryInputRef.current.click()}
            >
              <span className="modal-icon">🗂️</span>
              Choose from Device
            </button>

            <button className="modal-cancel-btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        )}

        {/* capture="environment" opens the native camera app directly on mobile browsers */}
        <input
          ref={cameraInputRef}
          type="file"
          accept={accept}
          capture="environment"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {/* No "capture" attribute -> opens normal file/gallery picker */}
        <input
          ref={galleryInputRef}
          type="file"
          accept={accept}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}