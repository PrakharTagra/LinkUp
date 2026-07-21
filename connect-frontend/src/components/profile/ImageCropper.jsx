import React, { useState, useRef, useEffect } from "react";

const ImageCropper = ({ imageSrc, onCrop, onCancel, aspectRatio = 1, isCover = false }) => {
  const canvasRef = useRef();
  const imageRef = useRef();
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 300, height: 300 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Calculate constrained crop dimensions
  const getConstrainedCrop = (newCrop) => {
    const { width: containerWidth, height: containerHeight } = canvasRef.current?.getBoundingClientRect() || {};
    if (!containerWidth || !containerHeight) return newCrop;

    const minSize = isCover ? 100 : 80;
    const maxWidth = containerWidth * 0.9;
    const maxHeight = containerHeight * 0.9;

    let { x, y, width, height } = newCrop;

    // Ensure minimum size
    width = Math.max(minSize, width);
    height = Math.max(minSize, height);

    // Enforce aspect ratio
    if (aspectRatio) {
      if (width / height > aspectRatio) {
        width = height * aspectRatio;
      } else {
        height = width / aspectRatio;
      }
    }

    // Keep within bounds
    if (x + width > containerWidth) x = containerWidth - width;
    if (y + height > containerHeight) y = containerHeight - height;
    if (x < 0) x = 0;
    if (y < 0) y = 0;

    return { x, y, width, height };
  };

  const handleMouseDown = (e, handle = null) => {
    e.preventDefault();
    if (handle) {
      setIsResizing(handle);
    } else {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging && !isResizing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const deltaX = e.clientX - rect.left - crop.x - crop.width / 2;
    const deltaY = e.clientY - rect.top - crop.y - crop.height / 2;

    if (isDragging) {
      const maxX = rect.width - crop.width;
      const maxY = rect.height - crop.height;
      const newCrop = {
        x: Math.max(0, Math.min(crop.x + (e.movementX || 0), maxX)),
        y: Math.max(0, Math.min(crop.y + (e.movementY || 0), maxY)),
        width: crop.width,
        height: crop.height,
      };
      setCrop(getConstrainedCrop(newCrop));
    }

    if (isResizing) {
      let newCrop = { ...crop };

      if (isResizing.includes("e")) {
        newCrop.width = Math.max(80, crop.width + (e.movementX || 0));
      }
      if (isResizing.includes("s")) {
        newCrop.height = Math.max(80, crop.height + (e.movementY || 0));
      }
      if (isResizing.includes("w")) {
        const newWidth = crop.width - (e.movementX || 0);
        if (newWidth > 80) {
          newCrop.x = crop.x + (e.movementX || 0);
          newCrop.width = newWidth;
        }
      }
      if (isResizing.includes("n")) {
        const newHeight = crop.height - (e.movementY || 0);
        if (newHeight > 80) {
          newCrop.y = crop.y + (e.movementY || 0);
          newCrop.height = newHeight;
        }
      }

      setCrop(getConstrainedCrop(newCrop));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(null);
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [crop, isDragging, isResizing]);

  const handleImageLoad = () => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const initialSize = Math.min(rect.width, rect.height) * 0.7;
    const aspectH = isCover ? initialSize * (4 / 3) : initialSize;
    const aspectW = isCover ? initialSize : aspectH;

    setCrop({
      x: (rect.width - aspectW) / 2,
      y: (rect.height - aspectH) / 2,
      width: aspectW,
      height: aspectH,
    });
    setImageLoaded(true);
  };

  const handleCropImage = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;

    if (!image || !imageLoaded) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = crop.width * scaleX;
    offscreenCanvas.height = crop.height * scaleY;

    const ctx = offscreenCanvas.getContext("2d");
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      offscreenCanvas.width,
      offscreenCanvas.height
    );

    offscreenCanvas.toBlob((blob) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => {
        onCrop(reader.result);
      };
    }, "image/jpeg", 0.95);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
      }}
    >
      <div
        style={{
          background: "var(--bg-2)",
          borderRadius: 20,
          padding: 24,
          maxWidth: 600,
          width: "90%",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
        }}
      >
        <h3 style={{ margin: "0 0 16px 0", fontSize: 18, fontWeight: 700, color: "var(--text)" }}>
          {isCover ? "Crop Cover Photo" : "Crop Profile Photo"}
        </h3>

        {/* Canvas area */}
        <div
          ref={canvasRef}
          style={{
            position: "relative",
            width: "100%",
            height: isCover ? 300 : 400,
            background: "#000",
            borderRadius: 12,
            overflow: "hidden",
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "move",
          }}
          onMouseDown={(e) => handleMouseDown(e)}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt="crop preview"
            onLoad={handleImageLoad}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              zoom: zoom,
              userSelect: "none",
            }}
          />

          {/* Crop overlay */}
          {imageLoaded && (
            <>
              {/* Dark overlay areas */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: crop.y,
                  background: "rgba(0, 0, 0, 0.6)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: crop.y,
                  left: 0,
                  width: crop.x,
                  height: crop.height,
                  background: "rgba(0, 0, 0, 0.6)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: crop.y,
                  left: crop.x + crop.width,
                  width: "100%",
                  height: crop.height,
                  background: "rgba(0, 0, 0, 0.6)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: crop.y + crop.height,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  background: "rgba(0, 0, 0, 0.6)",
                  pointerEvents: "none",
                }}
              />

              {/* Crop frame border */}
              <div
                style={{
                  position: "absolute",
                  top: crop.y,
                  left: crop.x,
                  width: crop.width,
                  height: crop.height,
                  border: "2px solid #7C5CFC",
                  borderRadius: 8,
                  pointerEvents: "none",
                  boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.2)",
                }}
              />

              {/* Grid lines */}
              <div
                style={{
                  position: "absolute",
                  top: crop.y,
                  left: crop.x,
                  width: crop.width,
                  height: crop.height,
                  background: `
                    linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.05) 76%, transparent 77%, transparent),
                    linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.05) 76%, transparent 77%, transparent)
                  `,
                  backgroundSize: `${crop.width / 3}px ${crop.height / 3}px`,
                  pointerEvents: "none",
                }}
              />

              {/* Resize handles */}
              {["nw", "ne", "sw", "se", "n", "s", "e", "w"].map((handle) => {
                const isCorner = handle.length === 2;
                const positions = {
                  nw: { top: crop.y - 4, left: crop.x - 4 },
                  ne: { top: crop.y - 4, right: -crop.x - 4 },
                  sw: { bottom: -crop.y - 4, left: crop.x - 4 },
                  se: { bottom: -crop.y - 4, right: -crop.x - 4 },
                  n: { top: crop.y - 4, left: crop.x + crop.width / 2 - 4 },
                  s: { bottom: -crop.y - 4, left: crop.x + crop.width / 2 - 4 },
                  e: { top: crop.y + crop.height / 2 - 4, right: -crop.x - 4 },
                  w: { top: crop.y + crop.height / 2 - 4, left: crop.x - 4 },
                };

                return (
                  <div
                    key={handle}
                    onMouseDown={(e) => handleMouseDown(e, handle)}
                    style={{
                      position: "absolute",
                      ...positions[handle],
                      width: 8,
                      height: 8,
                      background: "#7C5CFC",
                      borderRadius: "50%",
                      border: "2px solid white",
                      cursor: isCorner ? `${handle}-resize` : `${handle}-resize`,
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                    }}
                  />
                );
              })}
            </>
          )}
        </div>

        {/* Zoom slider */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 600, display: "block", marginBottom: 8 }}>
            Zoom: {Math.round(zoom * 100)}%
          </label>
          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            style={{ width: "100%", cursor: "pointer" }}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-2)",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "DM Sans",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--text-3)";
              e.currentTarget.style.color = "var(--text)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--text-2)";
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleCropImage}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #7C5CFC, #9B7EFF)",
              color: "white",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "Plus Jakarta Sans",
              boxShadow: "0 4px 14px rgba(124, 92, 252, 0.3)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            Crop & Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
