import { useEffect, useState } from "react";
import { GestureRecognizer, FilesetResolver } from "@mediapipe/tasks-vision";

const GESTURE_MAP = {
  Pointing_Up: "draw",
  Closed_Fist: "erase",
  Open_Palm: "palette",
  Victory: "idle",
};
const SMOOTHING_FRAMES = 4;   // average the last 4 cursor positions
const DEBOUNCE_FRAMES = 5;    // a new gesture must hold 5 frames
const PINCH_ON = 0.3;

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export function useHandTracking(videoRef) {
  const [state, setState] = useState({
    gesture: "none",
    cursor: { x: 0.5, y: 0.5 },
    pinchDistance: 1,
    handVisible: false,
  });

  useEffect(() => {
    let recognizer;
    let animationId;
    let stream;
    let stopped = false;

    const recent = [];          // last few cursor positions
    let stable = "none";        // the gesture we're currently reporting
    let pinching = false;
    let candidate = "none";     // the gesture trying to take over
    let count = 0;              // how many frames the candidate has held

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

      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (stopped) return stream.getTracks().forEach((t) => t.stop());
      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();

      function loop() {
        const result = recognizer.recognizeForVideo(video, performance.now());
        let raw = "none";
        let pinch = 1;
        const handVisible = result.landmarks.length > 0;

        if (result.landmarks.length > 0) {
          const lm = result.landmarks[0];
          const tip = lm[8];

          // cursor: mirror x so it matches the mirrored video, then smooth
          recent.push({ x: 1 - tip.x, y: tip.y });
          if (recent.length > SMOOTHING_FRAMES) recent.shift();

          // pinch distance, divided by hand size so it works near or far
          const handSize = dist(lm[0], lm[9]);
          pinch = dist(lm[4], lm[8]) / handSize;
          // middle finger extended? (tip farther from wrist than its middle knuckle)
          const middleUp = dist(lm[12], lm[0]) > dist(lm[10], lm[0]);

          const name = result.gestures[0]?.[0]?.categoryName;
        if (pinching) {
        // leave size mode on any deliberate gesture
        if (middleUp || name === "Pointing_Up" || name === "Closed_Fist") {
            pinching = false;
        }
        } else if (pinch < PINCH_ON && !middleUp) {
        pinching = true;
        }
        raw = pinching ? "size" : GESTURE_MAP[name] || "none";
        } else {
          recent.length = 0;
          pinching = false;
        }

        // debounce: only switch after the new gesture holds a few frames
        if (raw === stable) {
          candidate = stable;
          count = 0;
        } else if (raw === candidate) {
          count++;
        const needed = stable === "draw" ? 1 : DEBOUNCE_FRAMES;
        if (count >= needed) {
            stable = raw;
            count = 0;
          }
        } else {
          candidate = raw;
          count = 1;
        }
        if (recent.length > 0) {
        const avg = recent.reduce(
            (s, p) => ({ x: s.x + p.x / recent.length, y: s.y + p.y / recent.length }),
            { x: 0, y: 0 }
        );
        setState({ gesture: stable, cursor: avg, pinchDistance: pinch, handVisible });
        } else {
        setState((s) => ({ ...s, gesture: "none", handVisible: false }));
        }

        animationId = requestAnimationFrame(loop);
      }
      loop();
    }

    start();
    return () => {
      stopped = true;
      cancelAnimationFrame(animationId);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [videoRef]);

  return state;
}