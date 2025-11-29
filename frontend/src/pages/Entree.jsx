import React from 'react';
import { Link } from 'react-router-dom';
import CameraPreview from '../components/CameraPreview';
import { usePageTitle } from '../hooks/usePageTitle';
import logo2 from '../images/logo2.jpg';

const Entree = () => {
  usePageTitle('Enregistrement de l\'heure d\'entrée');

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
              <CameraPreview />
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <button
                className="w-full sm:w-auto bg-gradient-to-r from-[#ff7e00] to-[#ffa500] text-white font-semibold py-3 px-8 rounded-xl shadow-lg transform transition duration-200 hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff7e00]"
              >
                Enregistrer l'entrée
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
