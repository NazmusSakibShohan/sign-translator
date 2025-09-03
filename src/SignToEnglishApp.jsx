import React, { useEffect, useRef, useState } from "react";
import { GestureRecognizer, FilesetResolver } from "@mediapipe/tasks-vision";

export default function SignToEnglishApp() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [recognizer, setRecognizer] = useState(null);
  const [translatedText, setTranslatedText] = useState("");

  useEffect(() => {
    async function loadModel() {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
      );

      const gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "/models/gesture_recognizer.task",
        },
        runningMode: "VIDEO",
      });

      setRecognizer(gestureRecognizer);
    }

    loadModel();
  }, []);

  useEffect(() => {
    async function enableCamera() {
      if (!videoRef.current) return;

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;

      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play();
        predictLoop();
      };
    }

    enableCamera();
  }, [recognizer]);

  async function predictLoop() {
    if (!recognizer || !videoRef.current) return;

    const video = videoRef.current;
    const prediction = recognizer.recognizeForVideo(video, Date.now());

    if (prediction.gestures.length > 0) {
      const gesture = prediction.gestures[0][0].categoryName;
      setTranslatedText(gesture);
    }

    requestAnimationFrame(predictLoop);
  }

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h1>🤟 Sign Language to English Translator</h1>
      <video ref={videoRef} width="640" height="480" autoPlay muted playsInline></video>
      <canvas ref={canvasRef} width="640" height="480" style={{ display: "none" }}></canvas>
      <h2>📝 Translation: {translatedText}</h2>
    </div>
  );
}
