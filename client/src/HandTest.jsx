import { useEffect, useRef } from "react";
import { GestureRecognizer, FilesetResolver } from "@mediapipe/tasks-vision";

export default function HandTest() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let recognizer;
    let animationId;

    async function start() {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
      );
      recognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
        },
        runningMode: "VIDEO",
        numHands: 1,
      });

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");

      function loop() {
        const result = recognizer.recognizeForVideo(
          videoRef.current,
          performance.now()
        );
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (result.landmarks.length > 0) {
          const tip = result.landmarks[0][8]; // index fingertip
          ctx.fillStyle = "red";
          ctx.beginPath();
          ctx.arc(tip.x * canvas.width, tip.y * canvas.height, 10, 0, Math.PI * 2);
          ctx.fill();

          const gesture = result.gestures[0]?.[0]?.categoryName;
          console.log("gesture:", gesture);
        }
        animationId = requestAnimationFrame(loop);
      }
      loop();
    }

    start();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div style={{ position: "relative", width: 640 }}>
      <video ref={videoRef} style={{ width: 640, transform: "scaleX(-1)" }} />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 640,
          transform: "scaleX(-1)",
        }}
      />
    </div>
  );
}