import React, { useState, useEffect, useRef } from "react";

export default function FacePunch() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState(null);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // ----------------------------------
  // START CAMERA
  // ----------------------------------
  const startCamera = async () => {
    try {
      setError(null);

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      // 1) Activate camera (renders the video)
      setCameraActive(true);

      // 2) SET VIDEO SRC after render
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 50);

      setStream(mediaStream);

    } catch (err) {
      console.error("Camera Error:", err);
      setError("⚠️ Erreur caméra : " + err.message);
    }
  };

  // ----------------------------------
  // STOP CAMERA
  // ----------------------------------
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
    setRecognitionResult(null);
  };

  // ----------------------------------
  // CAPTURE + RECOGNITION
  // ----------------------------------
  const captureAndRecognize = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setCapturing(true);
    setError(null);

    try {
      // 1) Capture frame
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to image blob
      const blob = await new Promise(resolve =>
        canvas.toBlob(resolve, "image/jpeg", 0.95)
      );

      const formData = new FormData();
      formData.append("image", blob, "face.jpg");

      // Send to backend
      const response = await fetch("http://localhost:8000/api/recognize-face", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setRecognitionResult({
          employee: data.employee,
          confidence: data.confidence,
          timestamp: new Date().toLocaleString("fr-FR"),
        });
      } else {
        setError(data.message || "Aucun visage reconnu.");
      }
    } catch (err) {
      console.error(err);
      setError("⚠️ Erreur serveur : " + err.message);
    }

    setCapturing(false);
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <h1 className="text-3xl font-bold mb-4">Reconnaissance Faciale AI</h1>

        {/* CAMERA BLOCK */}
        <div className="bg-white rounded-xl shadow-xl border overflow-hidden">

          {/* VIDEO DISPLAY */}
          <div className="p-4 bg-black">
            <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
              
              {/* VIDEO ALWAYS RENDERED */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />

              {/* Overlay inactive */}
              {!cameraActive && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-xl">
                  Caméra inactive
                </div>
              )}
            </div>

            <canvas ref={canvasRef} className="hidden"></canvas>
          </div>

          {/* BUTTONS */}
          <div className="p-4 bg-slate-100 flex justify-center gap-4">

            {!cameraActive ? (
              <button
                onClick={startCamera}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold"
              >
                Activer la caméra
              </button>
            ) : (
              <>
                <button
                  onClick={captureAndRecognize}
                  disabled={capturing}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold disabled:opacity-50"
                >
                  {capturing ? "Analyse..." : "Capturer & Reconnaître"}
                </button>

                <button
                  onClick={stopCamera}
                  className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold"
                >
                  Arrêter
                </button>
              </>
            )}
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl">
            {error}
          </div>
        )}

        {/* RESULT MODAL */}
        {recognitionResult && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
            <div className="bg-white p-8 rounded-xl shadow-xl w-96">

              <h2 className="text-2xl font-bold text-green-600 mb-4">
                ✔ Employé Identifié
              </h2>

              <p><b>Nom :</b> {recognitionResult.employee.first_name} {recognitionResult.employee.last_name}</p>
              <p><b>Matricule :</b> {recognitionResult.employee.matricule}</p>
              <p><b>Confiance :</b> {recognitionResult.confidence}%</p>

              <button
                onClick={() => setRecognitionResult(null)}
                className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-xl"
              >
                Fermer
              </button>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
