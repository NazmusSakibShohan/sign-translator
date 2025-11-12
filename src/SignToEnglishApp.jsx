import React, { useEffect, useRef, useState } from "react";
import {
  FilesetResolver,
  GestureRecognizer,
} from "@mediapipe/tasks-vision";

const SignTranslator = () => {
  const videoRef = useRef(null);
  const [translatedText, setTranslatedText] = useState("Loading camera...");
  const gestureRecognizerRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
        );

        gestureRecognizerRef.current = await GestureRecognizer.createFromOptions(
          vision,
          {
            baseOptions: {
              modelAssetPath:
                "https://storage.googleapis.com/mediapipe-assets/gesture_recognizer.task",
            },
            runningMode: "VIDEO",
          }
        );

        startCamera();
      } catch (error) {
        console.error("Model load error:", error);
        setTranslatedText("⚠️ Model loading failed!");
      }
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
        setTranslatedText("No gesture detected...");
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-950 text-white text-center">
      <div className="flex flex-col items-center justify-center space-y-6">
        <h1 className="text-4xl font-extrabold text-green-400 drop-shadow-lg">
          🤖 Real-Time Sign Language Translator
        </h1>
        <video
          ref={videoRef}
          width="640"
          height="480"
          className="rounded-2xl shadow-2xl border-4 border-green-500"
          style={{ transform: "scaleX(-1)" }}
        />
        <h2 className="text-2xl font-semibold text-green-400 animate-pulse mt-4">
          {translatedText}
        </h2>
      </div>
    </div>
  );
};

export default SignTranslator;
