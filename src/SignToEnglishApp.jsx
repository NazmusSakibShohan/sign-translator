import React, { useEffect, useRef, useState } from "react";
import {
  FilesetResolver,
  GestureRecognizer,
} from "@mediapipe/tasks-vision";

const SignTranslator = () => {
  const videoRef = useRef(null);
  const [translatedText, setTranslatedText] = useState("Detecting...");
  const gestureRecognizerRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
      );

      gestureRecognizerRef.current = await GestureRecognizer.createFromOptions(
        vision,
        {
          baseOptions: {
              modelAssetPath:"https://storage.googleapis.com/mediapipe-assets/gesture_recognizer.task",
            },

          runningMode: "VIDEO",
        }
      );

      startCamera();
    };

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        requestAnimationFrame(detectGesture);
      } catch (err) {
        setTranslatedText("Camera access denied ❌");
      }
    };

    const detectGesture = async () => {
      if (
        !gestureRecognizerRef.current ||
        !videoRef.current ||
        videoRef.current.readyState < 2
      ) {
        requestAnimationFrame(detectGesture);
        return;
      }

      const result = await gestureRecognizerRef.current.recognizeForVideo(
        videoRef.current,
        performance.now()
      );

      if (result.gestures.length > 0) {
        const gesture = result.gestures[0][0].categoryName;
        const meaning = getGestureMeaning(gesture);
        setTranslatedText(meaning);
      } else {
        setTranslatedText("Detecting...");
      }

      requestAnimationFrame(detectGesture);
    };

    init();
  }, []);

  const getGestureMeaning = (gesture) => {
    switch (gesture) {
      case "Thumb_Up":
        return "👍 Thumb Up — Yes / Good";
      case "Thumb_Down":
        return "👎 Thumb Down — No / Bad";
      case "Closed_Fist":
        return "✊ Fist — Stop / Power";
      case "Open_Palm":
        return "🖐️ Open Palm — Hello / Hi";
      case "Pointing_Up":
        return "☝️ Pointing Up — Attention / One";
      case "Victory":
        return "✌️ Victory — Peace / Two";
      case "ILoveYou":
        return "🤟 I Love You — Love";
      case "Rock":
        return "🤘 Rock Sign — Cool / Rock On";
      case "Raised_Back_Hand":
        return "🤚 Raised Hand — Wait / Halt";
      case "OK_Sign":
        return "👌 OK Sign — Perfect";
      default:
        return "🙌 Unknown Gesture";
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#121212",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", marginBottom: "20px", color: "#00bcd4" }}>
        🤖 Real-Time Sign Language Translator
      </h1>

      <video
        ref={videoRef}
        width="640"
        height="480"
        style={{
          borderRadius: "15px",
          boxShadow: "0px 0px 20px rgba(0, 188, 212, 0.5)",
          transform: "scaleX(-1)",
        }}
      />

      <h2
        style={{
          marginTop: "25px",
          fontSize: "1.8rem",
          fontWeight: "600",
          color: "#4caf50",
        }}
      >
        {translatedText}
      </h2>
    </div>
  );
};

export default SignTranslator;
