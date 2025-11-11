import React, { useEffect, useRef, useState } from "react";
import {
  FilesetResolver,
  GestureRecognizer,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

const SignTranslator = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
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
            modelAssetPath: "/models/gesture_recognizer.task",
          },
          runningMode: "VIDEO",
        }
      );

      startCamera();
    };

    const startCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      videoRef.current.play();

      requestAnimationFrame(detectGesture);
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <video
        ref={videoRef}
        width="640"
        height="480"
        className="rounded-2xl shadow-lg"
        style={{ transform: "scaleX(-1)" }}
      />
      <canvas
        ref={canvasRef}
        width="640"
        height="480"
        className="absolute top-0"
      ></canvas>
      <h1 className="mt-5 text-2xl font-bold">
        {translatedText}
      </h1>
    </div>
  );
};

export default SignTranslator;
