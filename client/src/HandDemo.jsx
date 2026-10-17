import { useEffect, useRef, useState } from "react";
import { useHandTracking } from "./hooks/useHandTracking";

const COLORS = ["#e63946", "#000000", "#2a9d8f", "#3a86ff", "#ffbe0b"];

export default function HandDemo() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const lastPoint = useRef(null);
  const [color, setColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(6);

  const { gesture, cursor, pinchDistance, handVisible } =
    useHandTracking(videoRef);

  // pinch dial: map pinchDistance onto a brush size
  useEffect(() => {
    if (gesture === "size") {
      const t = Math.min(Math.max((pinchDistance - 0.1) / 1.0, 0), 1);
      setBrushSize(Math.round(3 + t * 27));
    }
  }, [gesture, pinchDistance]);

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
      lastPoint.current = null; // lift the pen
    }
  }, [cursor, gesture, handVisible, color, brushSize]);

  function clearCanvas() {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
  }

  return (
    <div>
      <div
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
            opacity: 0.8,
          }}
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
        />
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

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: c,
              border: c === color ? "3px solid white" : "1px solid gray",
            }}
          />
        ))}
        <button onClick={clearCanvas}>Clear</button>
      </div>
    </div>
  );
}