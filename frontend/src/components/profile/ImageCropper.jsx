import React, { useState, useRef, useEffect, useCallback } from "react";

/**
 * ImageCropper Component
 * Provides precise pixel-accurate cropping for Avatars (1:1) and Cover Banners.
 * Solves container-offset desync, handle placement bugs, and letterbox distortions.
 */
const ImageCropper = ({
  imageSrc,
  onCrop,
  onCancel,
  aspectRatio = 1,
  isCover = false,
}) => {
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Crop rectangle relative to containerRef: { x, y, width, height }
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 200, height: 200 });
  const [imgBounds, setImgBounds] = useState({ left: 0, top: 0, width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  // Interaction tracking
  const dragRef = useRef({
    active: false,
    mode: null, // "move" or handle string ("nw", "se", etc.)
    startX: 0,
    startY: 0,
    initialCrop: { x: 0, y: 0, width: 0, height: 0 },
  });

  // Calculate actual rendered image rectangle inside container
  const computeImageBounds = useCallback(() => {
    const container = containerRef.current;
    const img = imageRef.current;
    if (!container || !img) return null;

    const cRect = container.getBoundingClientRect();
    const iRect = img.getBoundingClientRect();

    const bounds = {
      left: Math.round(iRect.left - cRect.left),
      top: Math.round(iRect.top - cRect.top),
      width: Math.round(iRect.width),
      height: Math.round(iRect.height),
    };

    setImgBounds(bounds);
    return bounds;
  }, []);

  // Initialize crop box to center of image
  const initializeCrop = useCallback(
    (bounds) => {
      if (!bounds || bounds.width <= 0 || bounds.height <= 0) return;

      const targetAspect = aspectRatio || (isCover ? 3.2 : 1);
      let cropW, cropH;

      if (bounds.width / bounds.height > targetAspect) {
        // Image is wider than crop aspect ratio
        cropH = Math.round(bounds.height * 0.85);
        cropW = Math.round(cropH * targetAspect);
      } else {
        // Image is taller than crop aspect ratio
        cropW = Math.round(bounds.width * 0.85);
        cropH = Math.round(cropW / targetAspect);
      }

      const cropX = Math.round(bounds.left + (bounds.width - cropW) / 2);
      const cropY = Math.round(bounds.top + (bounds.height - cropH) / 2);

      setCrop({
        x: cropX,
        y: cropY,
        width: Math.max(60, cropW),
        height: Math.max(60, cropH),
      });
      setImageLoaded(true);
    },
    [aspectRatio, isCover]
  );

  const handleImageLoad = () => {
    const bounds = computeImageBounds();
    if (bounds) {
      initializeCrop(bounds);
    }
  };

  // Recalculate on window resize
  useEffect(() => {
    const handleResize = () => {
      const bounds = computeImageBounds();
      if (bounds && !imageLoaded) {
        initializeCrop(bounds);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [computeImageBounds, initializeCrop, imageLoaded]);

  // Pointer Down (Mouse or Touch)
  const handlePointerDown = (clientX, clientY, mode) => {
    dragRef.current = {
      active: true,
      mode: mode,
      startX: clientX,
      startY: clientY,
      initialCrop: { ...crop },
    };
  };

  // Pointer Move
  const handlePointerMove = useCallback(
    (clientX, clientY) => {
      const drag = dragRef.current;
      if (!drag.active) return;

      const dx = clientX - drag.startX;
      const dy = clientY - drag.startY;
      const initial = drag.initialCrop;
      const targetAspect = aspectRatio || 1;

      if (drag.mode === "move") {
        // Constrain movement strictly within image bounds
        const minX = imgBounds.left;
        const maxX = imgBounds.left + imgBounds.width - initial.width;
        const minY = imgBounds.top;
        const maxY = imgBounds.top + imgBounds.height - initial.height;

        const nextX = Math.max(minX, Math.min(initial.x + dx, maxX));
        const nextY = Math.max(minY, Math.min(initial.y + dy, maxY));

        setCrop((prev) => ({ ...prev, x: nextX, y: nextY }));
      } else if (drag.mode) {
        // Resizing with aspect ratio lock
        let newW = initial.width;
        let newH = initial.height;
        let newX = initial.x;
        let newY = initial.y;

        const mode = drag.mode;
        const minSize = 60;

        if (mode.includes("e")) {
          newW = Math.max(minSize, initial.width + dx);
          newH = Math.round(newW / targetAspect);
        } else if (mode.includes("w")) {
          newW = Math.max(minSize, initial.width - dx);
          newH = Math.round(newW / targetAspect);
          newX = initial.x + (initial.width - newW);
        } else if (mode.includes("s")) {
          newH = Math.max(minSize, initial.height + dy);
          newW = Math.round(newH * targetAspect);
        } else if (mode.includes("n")) {
          newH = Math.max(minSize, initial.height - dy);
          newW = Math.round(newH * targetAspect);
          newY = initial.y + (initial.height - newH);
        }

        // Clamp to image boundary
        if (newX < imgBounds.left) {
          newW -= (imgBounds.left - newX);
          newX = imgBounds.left;
          newH = Math.round(newW / targetAspect);
        }
        if (newY < imgBounds.top) {
          newH -= (imgBounds.top - newY);
          newY = imgBounds.top;
          newW = Math.round(newH * targetAspect);
        }
        if (newX + newW > imgBounds.left + imgBounds.width) {
          newW = imgBounds.left + imgBounds.width - newX;
          newH = Math.round(newW / targetAspect);
        }
        if (newY + newH > imgBounds.top + imgBounds.height) {
          newH = imgBounds.top + imgBounds.height - newY;
          newW = Math.round(newH * targetAspect);
        }

        if (newW >= minSize && newH >= minSize) {
          setCrop({
            x: Math.round(newX),
            y: Math.round(newY),
            width: Math.round(newW),
            height: Math.round(newH),
          });
        }
      }
    },
    [imgBounds, aspectRatio]
  );

  const handlePointerUp = useCallback(() => {
    dragRef.current.active = false;
  }, []);

  // Window listeners for smooth drag outside elements
  useEffect(() => {
    const onMouseMove = (e) => handlePointerMove(e.clientX, e.clientY);
    const onMouseUp = () => handlePointerUp();
    const onTouchMove = (e) => {
      if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchEnd = () => handlePointerUp();

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [handlePointerMove, handlePointerUp]);

  // Perform Pixel-Perfect Crop
  const handleCropImage = () => {
    const img = imageRef.current;
    if (!img || !imgBounds.width || !imgBounds.height) return;

    // Calculate source rect on the original unscaled image
    const scaleX = img.naturalWidth / imgBounds.width;
    const scaleY = img.naturalHeight / imgBounds.height;

    const sx = Math.max(0, Math.round((crop.x - imgBounds.left) * scaleX));
    const sy = Math.max(0, Math.round((crop.y - imgBounds.top) * scaleY));
    const sw = Math.min(img.naturalWidth - sx, Math.round(crop.width * scaleX));
    const sh = Math.min(img.naturalHeight - sy, Math.round(crop.height * scaleY));

    // Target output dimensions
    const outW = isCover ? 1200 : 400;
    const targetAspect = aspectRatio || (isCover ? 3.2 : 1);
    const outH = Math.round(outW / targetAspect);

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);

    const croppedBase64 = canvas.toDataURL("image/jpeg", 0.92);
    onCrop(croppedBase64);
  };

  const handles = [
    { id: "nw", style: { left: crop.x - 6, top: crop.y - 6, cursor: "nwse-resize" } },
    { id: "ne", style: { left: crop.x + crop.width - 6, top: crop.y - 6, cursor: "nesw-resize" } },
    { id: "sw", style: { left: crop.x - 6, top: crop.y + crop.height - 6, cursor: "nesw-resize" } },
    { id: "se", style: { left: crop.x + crop.width - 6, top: crop.y + crop.height - 6, cursor: "nwse-resize" } },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(10, 11, 20, 0.85)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#151624",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: 20,
          padding: 24,
          maxWidth: 620,
          width: "100%",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.6)",
          userSelect: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "Plus Jakarta Sans" }}>
              {isCover ? "Adjust Cover Photo" : "Adjust Profile Photo"}
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "rgba(255, 255, 255, 0.6)" }}>
              {isCover
                ? "Drag or resize the frame to select your banner area."
                : "Drag or resize the frame to center your avatar."}
            </p>
          </div>
          <button
            onClick={onCancel}
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              color: "#ccc",
              fontSize: 16,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>

        {/* Cropping Canvas Frame */}
        <div
          ref={containerRef}
          style={{
            position: "relative",
            width: "100%",
            height: isCover ? 280 : 360,
            background: "#080911",
            borderRadius: 14,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "inset 0 2px 10px rgba(0, 0, 0, 0.5)",
          }}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Source preview"
            onLoad={handleImageLoad}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
              pointerEvents: "none",
              display: "block",
            }}
          />

          {imageLoaded && (
            <>
              {/* Dark Shading Around Crop Rect */}
              {/* Top */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: crop.y,
                  background: "rgba(0, 0, 0, 0.65)",
                  pointerEvents: "none",
                }}
              />
              {/* Bottom */}
              <div
                style={{
                  position: "absolute",
                  top: crop.y + crop.height,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0, 0, 0, 0.65)",
                  pointerEvents: "none",
                }}
              />
              {/* Left */}
              <div
                style={{
                  position: "absolute",
                  top: crop.y,
                  left: 0,
                  width: crop.x,
                  height: crop.height,
                  background: "rgba(0, 0, 0, 0.65)",
                  pointerEvents: "none",
                }}
              />
              {/* Right */}
              <div
                style={{
                  position: "absolute",
                  top: crop.y,
                  left: crop.x + crop.width,
                  right: 0,
                  height: crop.height,
                  background: "rgba(0, 0, 0, 0.65)",
                  pointerEvents: "none",
                }}
              />

              {/* Crop Box Window (Draggable) */}
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  handlePointerDown(e.clientX, e.clientY, "move");
                }}
                onTouchStart={(e) => {
                  if (e.touches[0]) handlePointerDown(e.touches[0].clientX, e.touches[0].clientY, "move");
                }}
                style={{
                  position: "absolute",
                  left: crop.x,
                  top: crop.y,
                  width: crop.width,
                  height: crop.height,
                  cursor: "grab",
                  border: "2px solid #9B7EFF",
                  boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.5), 0 0 20px rgba(124, 92, 252, 0.35)",
                  borderRadius: isCover ? 8 : 16,
                  overflow: "hidden",
                }}
              >
                {/* Avatar Circular Preview Guide */}
                {!isCover && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "50%",
                      border: "1.5px dashed rgba(255, 255, 255, 0.6)",
                      pointerEvents: "none",
                    }}
                  />
                )}

                {/* Grid Lines for Banner Framing */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gridTemplateRows: "1fr 1fr 1fr",
                    pointerEvents: "none",
                  }}
                >
                  <div style={{ borderRight: "1px solid rgba(255,255,255,0.12)", borderBottom: "1px solid rgba(255,255,255,0.12)" }} />
                  <div style={{ borderRight: "1px solid rgba(255,255,255,0.12)", borderBottom: "1px solid rgba(255,255,255,0.12)" }} />
                  <div style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }} />
                  <div style={{ borderRight: "1px solid rgba(255,255,255,0.12)", borderBottom: "1px solid rgba(255,255,255,0.12)" }} />
                  <div style={{ borderRight: "1px solid rgba(255,255,255,0.12)", borderBottom: "1px solid rgba(255,255,255,0.12)" }} />
                  <div style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }} />
                  <div style={{ borderRight: "1px solid rgba(255,255,255,0.12)" }} />
                  <div style={{ borderRight: "1px solid rgba(255,255,255,0.12)" }} />
                  <div />
                </div>
              </div>

              {/* Corner Resize Handles */}
              {handles.map(({ id, style }) => (
                <div
                  key={id}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handlePointerDown(e.clientX, e.clientY, id);
                  }}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    if (e.touches[0]) handlePointerDown(e.touches[0].clientX, e.touches[0].clientY, id);
                  }}
                  style={{
                    position: "absolute",
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    backgroundColor: "#fff",
                    border: "3px solid #7C5CFC",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.4)",
                    zIndex: 10,
                    ...style,
                  }}
                />
              ))}
            </>
          )}
        </div>

        {/* Modal Action Controls */}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 20 }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              border: "1px solid rgba(255, 255, 255, 0.15)",
              background: "transparent",
              color: "#ccc",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "DM Sans",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCropImage}
            style={{
              padding: "10px 24px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #7C5CFC, #9B7EFF)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "Plus Jakarta Sans",
              boxShadow: "0 4px 16px rgba(124, 92, 252, 0.4)",
            }}
          >
            Crop & Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
