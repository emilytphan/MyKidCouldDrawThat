import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useHandTracking } from "./hooks/useHandTracking";

const COLORS = [  "#e63946", // red
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

const HandDemo = forwardRef(function HandDemo(props, ref) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);
  const swatchRefs = useRef([]);
  const lastPoint = useRef(null);
  const [color, setColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(6);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [hovered, setHovered] = useState(-1);

  const { gesture, cursor, pinchDistance, handVisible } =
    useHandTracking(videoRef);

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

  // palette: open on palm, hover with fingertip, peace sign picks + closes
  useEffect(() => {
    if (!handVisible) return;
    const open = paletteOpen || gesture === "palette";
    if (!open) return;
    if (gesture === "palette") setPaletteOpen(true);

    // which swatch is under the fingertip?
    const wrap = wrapperRef.current.getBoundingClientRect();
    const px = wrap.left + cursor.x * wrap.width;
    const py = wrap.top + cursor.y * wrap.height;
    const pad = 8; // forgiving hit area
    const index = swatchRefs.current.findIndex((el) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return (
        px >= r.left - pad && px <= r.right + pad &&
        py >= r.top - pad && py <= r.bottom + pad
      );
    });
    setHovered(index);

    if (paletteOpen && gesture === "idle") {
      if (index >= 0) setColor(COLORS[index]);
      setPaletteOpen(false);
      setHovered(-1);
    } else if (paletteOpen && (gesture === "draw" || gesture === "erase")) {
      setPaletteOpen(false);
      setHovered(-1);
    }
  }, [cursor, gesture, handVisible, paletteOpen]);

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
      ctx.clearRect(x - brushSize * 2, y - brushSize * 2, brushSize * 4, brushSize * 4);
      lastPoint.current = null;
    } else {
      lastPoint.current = null;
    }
  }, [cursor, gesture, handVisible, color, brushSize]);

  function clearCanvas() {
    const c = canvasRef.current;
    c.getContext("2d").clearRect(0, 0, c.width, c.height);
  }

  return (
    <div>
      <div
        ref={wrapperRef}
        style={{ position: "relative", width: 640, maxWidth: "100%", background: "white" }}
      >
        <video
          ref={videoRef}
          style={{ width: "100%", transform: "scaleX(-1)", display: "block", opacity: 0.4 }}
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
            right: 16,
            bottom: 60,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            padding: 10,
            borderRadius: 14,
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
              onClick={() => { setColor(c); setPaletteOpen(false); }}
              style={{
                width: 28,
                height: 26,
                borderRadius: "50%",
                background: c,
                border: hovered === i ? "4px solid white" : c === color ? "3px solid #aaa" : "2px solid #555",
                transform: hovered === i ? "scale(1.25)" : "scale(1)",
                transition: "transform 0.1s",
              }}
            />
          ))}
        </div>

        {handVisible && (
          <div
            style={{
              position: "absolute",
              left: `${cursor.x * 100}%`,
              top: `${cursor.y * 100}%`,
              width: brushSize,
              height: brushSize,
              marginLeft: -brushSize / 2,
              marginTop: -brushSize / 2,
              borderRadius: "50%",
              background: color,
              border: "2px solid white",
              pointerEvents: "none",
            }}
          />
        )}
      </div>

      {!handVisible && <p>Show your hand to the camera</p>}
      <p>gesture: {gesture}</p>
      <button onClick={clearCanvas}>Clear</button>
    </div>
  );
});

export default HandDemo;