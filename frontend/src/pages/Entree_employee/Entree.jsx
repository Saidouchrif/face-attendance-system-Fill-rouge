import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePageTitle } from '../../hooks/usePageTitle';
import logo2 from '../../images/logo2.jpg';

const Entree = () => {
  usePageTitle('Enregistrement de l\'heure d\'entrée');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cameraError, setCameraError] = useState('');
  const [stream, setStream] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Start camera
  React.useEffect(() => {
    const startCamera = async () => {
      try {
        setIsLoading(true);
        setCameraError('');
        
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: false
        });

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
        }
      } catch (err) {
        console.error('Camera access error:', err);
        setCameraError(err.message || 'Impossible d\'accéder à la caméra');
      } finally {
        setIsLoading(false);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Capture image and send to API
  const handleCheckIn = async () => {
    if (!videoRef.current || processing) return;
    
    setProcessing(true);
    setError(null);
    setResult(null);
    
    try {
      // Create canvas to capture image
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);
      
      // Convert to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
      
      // Create form data
      const formData = new FormData();
      formData.append('image', blob, 'capture.jpg');
      
      // Send to API
      const response = await fetch('http://localhost:8000/api/presence/check-in', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(data);
      } else {
        setError(data.message || 'Erreur lors de l\'enregistrement');
      }
    } catch (err) {
      console.error('Check-in error:', err);
      setError('Erreur de connexion au serveur');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      {/* Header with logo and navigation */}
      <header className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700/50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              src={logo2}
              alt="Logo"
              className="h-10 w-auto object-contain"
            />
            <h1 className="text-white text-lg font-semibold">
              Enregistrement d'entrée
            </h1>
          </div>
          
          <nav className="flex items-center space-x-4">
            <Link
              to="/"
              className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
            >
              Accueil
            </Link>
            <Link
              to="/sortie"
              className="text-slate-300 hover:text-white transition-colors text-sm font-medium"
            >
              Enregistrer sortie
            </Link>
            <Link
              to="/login"
              className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              Admin
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content with camera preview */}
      <main className="flex-1 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-indigo-900/95" />
        
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 py-8">
          <div className="w-full max-w-4xl">
            {/* Instructions */}
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Positionnez votre visage
              </h2>
              <p className="text-slate-300 text-sm md:text-base">
                Veuillez vous placer devant la caméra pour enregistrer votre heure d'entrée
              </p>
            </div>

            {/* Camera preview container */}
            <div className="relative w-full aspect-video bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
              <div className="w-full h-full flex items-center justify-center bg-slate-900">
                {isLoading && (
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
                    <p className="text-white text-sm">Chargement de la caméra...</p>
                  </div>
                )}
                
                {cameraError && (
                  <div className="text-center max-w-md mx-auto px-4">
                    <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                      <p className="text-red-200 text-sm">{cameraError}</p>
                      <p className="text-red-300 text-xs mt-2">
                        Veuillez vérifier que votre caméra est connectée et que vous avez autorisé l'accès.
                      </p>
                    </div>
                  </div>
                )}
                
                {!isLoading && !cameraError && (
                  <div className="w-full h-full flex items-center justify-center">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover rounded-lg shadow-2xl"
                      style={{ maxWidth: '100%', maxHeight: '100%' }}
                    />
                  </div>
                )}
              </div>
            </div>
            
            {/* Result/Error Messages */}
            {result && (
              <div className="mt-6 bg-green-500/20 border border-green-500/50 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-green-300 mb-2">{result.message}</h3>
                    <div className="text-green-200 space-y-1">
                      <p><span className="font-semibold">Employé:</span> {result.employee.first_name} {result.employee.last_name}</p>
                      <p><span className="font-semibold">Matricule:</span> {result.employee.matricule}</p>
                      <p><span className="font-semibold">Poste:</span> {result.employee.poste}</p>
                      <p><span className="font-semibold">Heure d'entrée:</span> {result.presence.check_in_time}</p>
                      <p><span className="font-semibold">Statut:</span> {
                        result.presence.status === 'late' ? 'En retard' : 
                        result.presence.status === 'out_of_hours' ? 'Hors horaire' : 
                        'À l\'heure'
                      }</p>
                      <p><span className="font-semibold">Confiance:</span> {result.confidence}%</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mt-6 bg-red-500/20 border border-red-500/50 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-red-300 mb-2">Erreur</h3>
                    <p className="text-red-200">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <button
                onClick={handleCheckIn}
                disabled={processing || isLoading || cameraError || result}
                className="w-full sm:w-auto bg-gradient-to-r from-[#ff7e00] to-[#ffa500] text-white font-semibold py-3 px-8 rounded-xl shadow-lg transform transition duration-200 hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff7e00] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Traitement...</span>
                  </>
                ) : (
                  <span>Enregistrer l'entrée</span>
                )}
              </button>
              
              <Link
                to="/"
                className="w-full sm:w-auto bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-8 rounded-xl shadow-lg transform transition duration-200 hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-600 text-center"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Entree;
