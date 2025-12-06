import React, { useState, useEffect, useRef } from 'react';

export default function FacePunch() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState(null);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Start camera
  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Impossible d\'accéder à la caméra. Veuillez vérifier les permissions.');
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    setRecognitionResult(null);
  };

  // Capture and recognize face
  const captureAndRecognize = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setCapturing(true);
    setError(null);

    try {
      // Draw video frame to canvas
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
      
      // Create FormData
      const formData = new FormData();
      formData.append('image', blob, 'face.jpg');

      // Send to backend API for face recognition
      const response = await fetch('http://localhost:5000/api/recognize-face', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        if (data.success && data.employee) {
          setRecognitionResult({
            success: true,
            employee: data.employee,
            confidence: data.confidence,
            timestamp: new Date().toLocaleString('fr-FR')
          });
        } else {
          setError(data.message || 'Aucun employé reconnu. Veuillez réessayer.');
        }
      } else {
        setError(data.message || 'Erreur lors de la reconnaissance faciale.');
      }
    } catch (err) {
      console.error('Recognition error:', err);
      setError('Erreur de connexion au serveur. Veuillez vérifier que le backend est actif.');
    } finally {
      setCapturing(false);
    }
  };

  const handleCloseResult = () => {
    setRecognitionResult(null);
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
            Reconnaissance Faciale AI
          </h1>
          <p className="text-slate-600 text-base lg:text-lg">
            Pointage automatique par reconnaissance faciale en temps réel
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-500 rounded-xl flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Instructions</h3>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold mt-0.5">1.</span>
                  <span>Cliquez sur <strong>"Activer la caméra"</strong> pour démarrer</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold mt-0.5">2.</span>
                  <span>Positionnez votre visage face à la caméra</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold mt-0.5">3.</span>
                  <span>Cliquez sur <strong>"Capturer et Reconnaître"</strong></span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold mt-0.5">4.</span>
                  <span>Le système AI identifiera automatiquement l'employé</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Camera Section */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Camera Header */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Caméra de reconnaissance faciale</span>
              </h2>
              <div className="flex items-center space-x-2">
                <div className={`w-2.5 h-2.5 rounded-full ${cameraActive ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></div>
                <span className="text-sm font-medium text-slate-600">
                  {cameraActive ? 'Caméra active' : 'Caméra inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Camera Display */}
          <div className="p-6 bg-slate-900">
            <div className="relative bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
              {!cameraActive ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6">
                  <div className="p-6 bg-slate-800 rounded-full">
                    <svg className="w-16 h-16 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-slate-400 text-lg">Caméra non activée</p>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {/* Face detection overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-64 border-4 border-blue-500 rounded-full opacity-50 animate-pulse"></div>
                  </div>
                </>
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Camera Controls */}
          <div className="px-6 py-5 bg-slate-50 border-t border-slate-200">
            <div className="flex flex-wrap gap-4 justify-center">
              {!cameraActive ? (
                <button
                  onClick={startCamera}
                  className="group relative px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-3"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Activer la caméra</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={captureAndRecognize}
                    disabled={capturing}
                    className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {capturing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Reconnaissance en cours...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Capturer et Reconnaître</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={stopCamera}
                    className="px-6 py-4 bg-slate-700 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Arrêter</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-red-800 font-semibold mb-1">Erreur</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recognition Result Modal */}
      {recognitionResult && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={handleCloseResult}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8 rounded-t-2xl relative">
              <button
                onClick={handleCloseResult}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 bg-white/20 backdrop-blur-sm rounded-full animate-bounce">
                  <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white text-center mb-2">
                Reconnaissance réussie !
              </h2>
              <p className="text-white/90 text-center text-lg">
                Employé identifié par le système AI
              </p>
            </div>

            {/* Employee Info */}
            <div className="p-6">
              {/* Employee Identity */}
              <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-slate-200">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl flex-shrink-0">
                  <span className="text-white text-3xl font-bold">
                    {recognitionResult.employee.first_name?.[0]}{recognitionResult.employee.last_name?.[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-1">
                    {recognitionResult.employee.first_name} {recognitionResult.employee.last_name}
                  </h3>
                  <p className="text-slate-600 font-medium">{recognitionResult.employee.matricule}</p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase">Email</p>
                      <p className="text-sm font-bold text-slate-900">{recognitionResult.employee.email}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase">Téléphone</p>
                      <p className="text-sm font-bold text-slate-900">{recognitionResult.employee.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase">Poste</p>
                      <p className="text-sm font-bold text-slate-900">{recognitionResult.employee.poste}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase">Département</p>
                      <p className="text-sm font-bold text-slate-900">{recognitionResult.employee.departement}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recognition Details */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4 border border-blue-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-600 font-medium uppercase mb-1">Confiance AI</p>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${recognitionResult.confidence || 95}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{recognitionResult.confidence || 95}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 font-medium uppercase mb-1">Horodatage</p>
                    <p className="text-sm font-bold text-slate-900">{recognitionResult.timestamp}</p>
                  </div>
                </div>
              </div>

              {/* Success Message */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-green-900">Pointage enregistré avec succès</p>
                    <p className="text-xs text-green-700">L'employé a été identifié et le pointage a été sauvegardé dans le système</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 rounded-b-2xl border-t border-slate-200 flex justify-end space-x-3">
              <button
                onClick={handleCloseResult}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
