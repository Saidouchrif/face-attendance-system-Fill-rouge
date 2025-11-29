import React, { useEffect, useRef, useState } from 'react';

const CameraPreview = () => {
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [stream, setStream] = useState(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // Request camera permission and start stream
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: false
        });

        // Set the stream to video element
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
        }
      } catch (err) {
        console.error('Camera access error:', err);
        setError(err.message || 'Impossible d\'accéder à la caméra');
      } finally {
        setIsLoading(false);
      }
    };

    startCamera();

    // Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-900">
      {isLoading && (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
          <p className="text-white text-sm">Chargement de la caméra...</p>
        </div>
      )}
      
      {error && (
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
            <p className="text-red-200 text-sm">{error}</p>
            <p className="text-red-300 text-xs mt-2">
              Veuillez vérifier que votre caméra est connectée et que vous avez autorisé l'accès.
            </p>
          </div>
        </div>
      )}
      
      {!isLoading && !error && (
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
  );
};

export default CameraPreview;
