import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { sendTrainingFrame } from "../../services/faceService";

const TOTAL_SAMPLES = 20; 

export default function TrainFace() {
  const { id } = useParams();          
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState(
    "Placez le visage de l'employé dans le cadre, puis lancez l'entraînement."
  );

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setIsCameraReady(true);
        }
      } catch (err) {
        console.error(err);
        setMessage("Impossible d'accéder à la caméra.");
      }
    }

    startCamera();

    // cleanup
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((t) => t.stop());
      }
    };
  }, []);

  const captureOneFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);

    try {
      await sendTrainingFrame(Number(id), dataUrl);
      setCount((prev) => prev + 1);
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de l'envoi d'une capture. Vérifiez le backend.");
    }
  };

  const startTraining = async () => {
    if (!isCameraReady) return;

    setIsCapturing(true);
    setMessage("L'entraînement est en cours... Bougez doucement la tête (gauche, droite, haut, bas).");

    let localCount = 0;

    while (localCount < TOTAL_SAMPLES) {

      await new Promise((res) => setTimeout(res, 600));

      await captureOneFrame();
      localCount += 1;
    }

    setIsCapturing(false);
    setMessage(
      "Entraînement terminé ! Le profil facial de l'employé est enregistré."
    );
  };

  const finishAndBack = () => {
    navigate("/employees");
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Entraînement du modèle facial
          </h1>
          <p className="text-slate-600">
            Employé ID : <span className="font-semibold">{id}</span>
          </p>
        </div>

        {/* Camera + instructions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-900">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
              />
            
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-4 border-emerald-400 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.7)]" />
              </div>
            </div>

            <p className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-4">
              {message}
            </p>

            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Captures prises :{" "}
                <span className="font-semibold text-slate-900">
                  {count} / {TOTAL_SAMPLES}
                </span>
              </div>

              <button
                onClick={startTraining}
                disabled={!isCameraReady || isCapturing}
                className="px-5 py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center space-x-2"
              >
                <span>{isCapturing ? "Entraînement..." : "Lancer l'entraînement"}</span>
              </button>
            </div>
          </div>

          {/* Instructions détaillées */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-5">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                Comment positionner le visage ?
              </h2>
              <ul className="space-y-2 text-sm text-slate-700 list-disc list-inside">
                <li>Regardez bien la caméra.</li>
                <li>Gardez un bon éclairage sur le visage.</li>
                <li>Tournez doucement la tête vers la gauche puis vers la droite.</li>
                <li>Levez un peu la tête, puis baissez-la légèrement.</li>
                <li>Restez dans le cadre vert jusqu'à la fin de l'entraînement.</li>
              </ul>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <p className="text-sm text-emerald-800">
                Une fois l'entraînement terminé, l'employé pourra utiliser le
                système de pointage automatique par reconnaissance faciale.
              </p>
              <button
                onClick={finishAndBack}
                className="mt-4 inline-flex items-center px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow"
              >
                Terminer et revenir à la liste des employés
              </button>
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
