import { useRef } from "react";
import { useHandTracking } from "./hooks/useHandTracking";

export default function HandTest() {
  const videoRef = useRef(null);
  const { gesture, cursor, pinchDistance } = useHandTracking(videoRef);

  return (
    <div style={{ position: "relative", width: 640 }}>
      <video ref={videoRef} style={{ width: 640, transform: "scaleX(-1)" }} />
      <div
        style={{
          position: "absolute",
          left: `${cursor.x * 100}%`,
          top: `${cursor.y * 100}%`,
          width: 20,
          height: 20,
          marginLeft: -10,
          marginTop: -10,
          borderRadius: "50%",
          background: "red",
        }}
      />
      <h2>gesture: {gesture}</h2>
      <p>pinchDistance: {pinchDistance.toFixed(2)}</p>
    </div>
  );
}