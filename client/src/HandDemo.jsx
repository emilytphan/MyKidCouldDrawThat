import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useHandTracking } from "./hooks/useHandTracking";

const COLORS = [
  "#e63946", // red
  "#f77f00", // orange
  "#ffd60a", // yellow
  "#38b000", // green
  "#3a86ff", // blue
  "#6a4c93", // purple
  "#ff69b4", // pink
  "#8b5a2b", // brown
  "#000000", // black
  "#ffffff", // white
];

const HOVER_MS = 500; // hover this long to pick a color (0 = instant)
const MIN_ERASER = 28; // eraser never gets smaller than this (fits the sponge)

const HandDemo = forwardRef(function HandDemo(props, ref) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const swatchRefs = useRef([]);
  const lastPoint = useRef(null);
  const justPicked = useRef(false);
  const [color, setColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(6);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [hovered, setHovered] = useState(-1);

  const eraserSize = Math.max(brushSize, MIN_ERASER);

  const { gesture, cursor, pinchDistance, handVisible } =
    useHandTracking(videoRef);

  // lets the game screen call getImage() and clear()
  useImperativeHandle(ref, () => ({
    getImage() {
      const src = canvasRef.current;
      const out = document.createElement("canvas");
      out.width = src.width;
      out.height = src.height;
      const ctx = out.getContext("2d");
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, out.width, out.height);
      ctx.drawImage(src, 0, 0);
      return out.toDataURL("image/png");
    },
    clear() {
      const c = canvasRef.current;
      c.getContext("2d").clearRect(0, 0, c.width, c.height);
    },
  }));

  // pinch dial: brush size
  useEffect(() => {
    if (gesture === "size") {
      const t = Math.min(Math.max((pinchDistance - 0.1) / 1.0, 0), 1);
      setBrushSize(Math.round(3 + t * 27));
    }
  }, [gesture, pinchDistance]);

  // palette: open on palm, track which swatch the fingertip is over
  useEffect(() => {
    if (gesture !== "palette") justPicked.current = false;
    if (!handVisible) return;

    if (gesture === "palette" && !justPicked.current) setPaletteOpen(true);
    if (!paletteOpen && gesture !== "palette") return;

    const wrap = wrapperRef.current.getBoundingClientRect();
    const px = wrap.left + cursor.x * wrap.width;
    const py = wrap.top + cursor.y * wrap.height;
    const pad = 8;
    const index = swatchRefs.current.findIndex((el) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return (
        px >= r.left - pad && px <= r.right + pad &&
        py >= r.top - pad && py <= r.bottom + pad
      );
    });
    setHovered(index);

    // pointing, fist, or peace sign closes it without picking
    if (paletteOpen && (gesture === "draw" || gesture === "erase" || gesture === "idle")) {
      setPaletteOpen(false);
      setHovered(-1);
    }
  }, [cursor, gesture, handVisible, paletteOpen]);

  // pick the color after hovering on one swatch for HOVER_MS
  useEffect(() => {
    if (!paletteOpen || hovered < 0) return;
    const id = setTimeout(() => {
      setColor(COLORS[hovered]);
      justPicked.current = true; // don't reopen while palm is still up
      setPaletteOpen(false);
      setHovered(-1);
    }, HOVER_MS);
    return () => clearTimeout(id);
  }, [hovered, paletteOpen]);

  // draw / erase
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const x = cursor.x * canvas.width;
    const y = cursor.y * canvas.height;

    if (handVisible && gesture === "draw") {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      if (lastPoint.current) {
        ctx.beginPath();
        ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
      lastPoint.current = { x, y };
    } else if (handVisible && gesture === "erase") {
      ctx.clearRect(x - eraserSize / 2, y - eraserSize / 2, eraserSize, eraserSize);
      lastPoint.current = null;
    } else {
      lastPoint.current = null; // lift the pen
    }
  }, [cursor, gesture, handVisible, color, brushSize, eraserSize]);

  function clearCanvas() {
    const c = canvasRef.current;
    c.getContext("2d").clearRect(0, 0, c.width, c.height);
  }

  return (
    <div>
      <div
        ref={wrapperRef}
        style={{
          position: "relative",
          width: 640,
          maxWidth: "100%",
          background: "white",
        }}
      >
        <video
          ref={videoRef}
          style={{
            width: "100%",
            transform: "scaleX(-1)",
            display: "block",
            opacity: 0.4,
          }}
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
        />

        {/* palette, bottom right */}
        <div
          style={{
            position: "absolute",
            right: 65,
            bottom: 30,
            display: "grid",
            gridTemplateColumns: "repeat(2, 28px)",
            gap: 8,
            padding: 8,
            borderRadius: 12,
            background: "rgba(30,30,40,0.85)",
            opacity: paletteOpen ? 1 : 0,
            pointerEvents: paletteOpen ? "auto" : "none",
            transition: "opacity 0.15s",
          }}
        >
          {COLORS.map((c, i) => (
            <div
              key={c}
              ref={(el) => (swatchRefs.current[i] = el)}
              onClick={() => {
                setColor(c);
                setPaletteOpen(false);
              }}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: c,
                border:
                  hovered === i
                    ? "3px solid white"
                    : c === color
                    ? "2px solid #aaa"
                    : "1px solid #555",
                transform: hovered === i ? "scale(1.25)" : "scale(1)",
                transition: "transform 0.1s",
              }}
            />
          ))}
        </div>

        {/* cursor: pencil when drawing, eraser when erasing */}
        {handVisible && (
          <div
            style={{
              position: "absolute",
              left: `${cursor.x * 100}%`,
              top: `${cursor.y * 100}%`,
              width: 0,
              height: 0,
              pointerEvents: "none",
            }}
          >
            {gesture === "erase" ? (
              <div
                style={{
                  position: "absolute",
                  width: eraserSize,
                  height: eraserSize,
                  transform: "translate(-50%, -50%)",
                  border: "2px solid #555",
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: Math.max(14, eraserSize * 0.6),
                  lineHeight: 1,
                  overflow: "hidden",
                }}
              >
                🧽
              </div>
            ) : (
              <>
                {/* brush dot, shows color and size */}
                <div
                  style={{
                    position: "absolute",
                    width: brushSize,
                    height: brushSize,
                    transform: "translate(-50%, -50%)",
                    borderRadius: "50%",
                    background: color,
                    border: "2px solid white",
                  }}
                />
                {/* pencil, tip at the dot */}
                {gesture === "draw" && (
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      bottom: 0,
                      fontSize: 28,
                      lineHeight: 1,
                    }}
                  >
                    ✏️
                  </span>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {!handVisible && <p>Show your hand to the camera</p>}
      <p>gesture: {gesture}</p>
      <button onClick={clearCanvas}>Clear</button>
    </div>
  );
});

export default HandDemo;