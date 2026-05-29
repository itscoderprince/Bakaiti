import { useState, useRef, useEffect, useCallback } from "react";
import { X, ZoomIn, RotateCw, Check, Move } from "lucide-react";

/**
 * ImageAdjuster: Reusable, responsive, visual image cropping/adjustment modal.
 * Uses mouse/touch dragging, a zoom slider, and 90-degree rotations.
 * Outputs a high-resolution cropped base64 string.
 *
 * @param {string} imageSrc - Base64 or object URL of the selected image.
 * @param {string} mode - "circle" (for profile pic) or "rect" (for posts).
 * @param {string} initialAspectRatio - "1:1", "4:5", "16:9", or "free".
 * @param {function} onCrop - Callback when image is cropped successfully. Returns base64.
 * @param {function} onClose - Callback when modal is closed.
 */
export default function ImageAdjuster({
  imageSrc,
  mode = "rect",
  initialAspectRatio = "1:1",
  onCrop,
  onClose,
}) {
  const [aspectRatio, setAspectRatio] = useState(initialAspectRatio);
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
  const [windowHeight, setWindowHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 800
  );

  const containerRef = useRef(null);
  const imgRef = useRef(null);

  // Reset parameters when imageSrc changes
  useEffect(() => {
    setScale(1);
    setRotate(0);
    setPosition({ x: 0, y: 0 });
    setImageLoaded(false);
  }, [imageSrc]);

  // Listen to window resize to dynamically scale viewport height
  useEffect(() => {
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Determine viewport scale factor based on screen height to prevent button overflow
  const isSmallScreen = windowHeight < 760;
  const scaleFactor = isSmallScreen ? (windowHeight < 620 ? 0.55 : 0.72) : 1;

  // Viewport dimensions for cropping container
  const baseViewportWidth = 320;
  const viewportWidth = baseViewportWidth * scaleFactor;
  let viewportHeight = viewportWidth; // 1:1 default

  if (mode !== "circle") {
    if (aspectRatio === "4:5") {
      viewportHeight = viewportWidth * 1.25;
    } else if (aspectRatio === "16:9") {
      viewportHeight = viewportWidth * 0.5625;
    }
  }

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setImgDimensions({ width: naturalWidth, height: naturalHeight });
    setImageLoaded(true);
  };

  // Drag handlers for panning
  const handleStart = (clientX, clientY) => {
    setDragging(true);
    setDragStart({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleMove = useCallback(
    (clientX, clientY) => {
      if (!dragging) return;
      // Calculate boundaries/limits if needed, but standard panning allows free movement
      setPosition({
        x: clientX - dragStart.x,
        y: clientY - dragStart.y,
      });
    },
    [dragging, dragStart]
  );

  const handleEnd = () => {
    setDragging(false);
  };

  // Mouse events
  const onMouseDown = (e) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const onMouseMove = (e) => {
    handleMove(e.clientX, e.clientY);
  };

  // Touch events
  const onTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    handleStart(e.touches[0].clientX, e.touches[0].clientY);
  };

  const onTouchMove = (e) => {
    if (e.touches.length !== 1) return;
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  };

  // Handle Rotation
  const handleRotate = () => {
    setRotate((prev) => (prev + 90) % 360);
  };

  // Perform canvas cropping and export
  const handleSave = () => {
    if (!imageLoaded) return;

    const img = imgRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Output dimensions (high resolution)
    let targetWidth = 1080;
    let targetHeight = 1080;

    if (mode === "circle") {
      targetWidth = 400;
      targetHeight = 400;
    } else {
      if (aspectRatio === "4:5") {
        targetHeight = 1350;
      } else if (aspectRatio === "16:9") {
        targetHeight = 608;
      }
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Drawing calculations
    const canvasScale = targetWidth / viewportWidth;
    const { width: naturalWidth, height: naturalHeight } = imgDimensions;

    // Calculate base scale (cover style: crop short edge, scale long edge)
    const baseScale = Math.max(
      viewportWidth / naturalWidth,
      viewportHeight / naturalHeight
    );

    // Apply translations and scaling to canvas context
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.translate(position.x * canvasScale, position.y * canvasScale);
    ctx.rotate((rotate * Math.PI) / 180);

    const finalScale = baseScale * scale * canvasScale;
    ctx.scale(finalScale, finalScale);

    // Center and draw image
    ctx.drawImage(
      img,
      -naturalWidth / 2,
      -naturalHeight / 2,
      naturalWidth,
      naturalHeight
    );

    // Output Base64 string
    const croppedBase64 = canvas.toDataURL("image/jpeg", 0.9);
    onCrop(croppedBase64);
  };

  // Styles for current aspect ratio
  const maskStyle =
    mode === "circle"
      ? "rounded-full ring-2 ring-primary ring-offset-2 ring-offset-zinc-950"
      : "rounded-lg border border-white/40 shadow-inner";

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none">
      {/* Container Panel */}
      <div className="w-full max-w-md bg-zinc-900/90 border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <header className="flex h-14 items-center justify-between px-6 border-b border-white/5">
          <h3 className="font-semibold text-white">Adjust Photo</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Viewport Editor Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 bg-zinc-950/40 relative min-h-0">
          <div
            ref={containerRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={handleEnd}
            className="relative overflow-hidden flex items-center justify-center cursor-move"
            style={{
              width: `${viewportWidth}px`,
              height: `${viewportHeight}px`,
            }}
          >
            {/* Viewport crop mask */}
            <div
              className={`absolute inset-0 z-10 pointer-events-none ${maskStyle}`}
              style={{
                boxShadow: "0 0 0 9999px rgba(9, 9, 11, 0.75)",
              }}
            />

            {/* Grid overlay for cropping guides (hidden in circle mode) */}
            {mode !== "circle" && (
              <div className="absolute inset-0 z-10 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-30 border border-white/20">
                <div className="border-r border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-b border-white/20" />
                <div className="border-r border-white/20" />
                <div className="border-r border-white/20" />
                <div />
              </div>
            )}

            {/* Drag instruction overlay */}
            {!dragging && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-black/60 backdrop-blur-md text-[10px] text-zinc-300 font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                <Move className="h-3 w-3" />
                <span>Drag to reposition</span>
              </div>
            )}

            {/* Target Image */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Adjustable"
              onLoad={handleImageLoad}
              className="max-w-none origin-center pointer-events-none select-none"
              style={{
                // Ensure image covers viewport by default
                width: imgDimensions.width
                  ? `${
                      imgDimensions.width *
                      Math.max(
                        viewportWidth / imgDimensions.width,
                        viewportHeight / imgDimensions.height
                      )
                    }px`
                  : "auto",
                height: imgDimensions.height
                  ? `${
                      imgDimensions.height *
                      Math.max(
                        viewportWidth / imgDimensions.width,
                        viewportHeight / imgDimensions.height
                      )
                    }px`
                  : "auto",
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotate}deg)`,
                transition: dragging ? "none" : "transform 0.15s ease-out",
              }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 md:p-6 border-t border-white/5 space-y-4 md:space-y-5 bg-zinc-900/60 backdrop-blur-xl">
          
          {/* Aspect Ratio Selector (if post mode) */}
          {mode !== "circle" && (
            <div className="flex justify-center gap-2">
              {[
                { label: "1:1 Square", val: "1:1" },
                { label: "4:5 Portrait", val: "4:5" },
                { label: "16:9 Landscape", val: "16:9" },
              ].map((ratio) => (
                <button
                  key={ratio.val}
                  type="button"
                  onClick={() => {
                    setAspectRatio(ratio.val);
                    setPosition({ x: 0, y: 0 });
                    setScale(1);
                  }}
                  className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-xl border transition-all ${
                    aspectRatio === ratio.val
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-white/5 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  } cursor-pointer`}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          )}

          {/* Zoom and Rotate Panel */}
          <div className="space-y-4">
            {/* Zoom Slider */}
            <div className="flex items-center gap-3">
              <ZoomIn className="h-4 w-4 text-zinc-400" />
              <input
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <span className="text-[10px] font-mono text-zinc-500 min-w-[24px]">
                {Math.round(scale * 100)}%
              </span>
            </div>

            {/* Rotate control */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-400 font-medium">Rotation</span>
              <button
                type="button"
                onClick={handleRotate}
                className="h-8 px-3 rounded-lg border border-white/5 bg-zinc-800/40 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCw className="h-3.5 w-3.5" />
                Rotate 90°
              </button>
            </div>
          </div>

          {/* Submit/Cancel Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 rounded-xl border border-white/5 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 h-10 rounded-xl bg-primary hover:brightness-110 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Check className="h-4 w-4" />
              Apply Adjustment
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
