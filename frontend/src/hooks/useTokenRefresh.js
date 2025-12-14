import { useEffect, useRef } from 'react';
import { refreshAccessToken, logout } from '../services/authService';
import { useNavigate } from 'react-router-dom';

/**
 * Hook pour rafraîchir automatiquement le token avant son expiration.
 * Rafraîchit le token 5 minutes avant l'expiration (55 minutes après le login).
 */
export function useTokenRefresh() {
  const navigate = useNavigate();
  const refreshTimerRef = useRef(null);

  useEffect(() => {
    // Fonction pour décoder le JWT et obtenir le temps d'expiration
    const getTokenExpiration = (token) => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000; // Convertir en millisecondes
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    };

    // Fonction pour planifier le rafraîchissement
    const scheduleTokenRefresh = () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      const expirationTime = getTokenExpiration(token);
      if (!expirationTime) return;

      const currentTime = Date.now();
      const timeUntilExpiration = expirationTime - currentTime;
      
      // Rafraîchir 5 minutes avant l'expiration (300000 ms = 5 minutes)
      const refreshTime = timeUntilExpiration - 300000;

      // Si le token expire dans moins de 5 minutes, rafraîchir immédiatement
      const delay = refreshTime > 0 ? refreshTime : 0;

      console.log(`Token refresh scheduled in ${Math.round(delay / 1000 / 60)} minutes`);

      // Nettoyer le timer précédent
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }

      // Planifier le rafraîchissement
      refreshTimerRef.current = setTimeout(async () => {
        try {
          console.log('Refreshing access token...');
          await refreshAccessToken();
          console.log('Token refreshed successfully');
          
          // Replanifier le prochain rafraîchissement
          scheduleTokenRefresh();
        } catch (error) {
          console.error('Failed to refresh token:', error);
          // Si le rafraîchissement échoue, déconnecter l'utilisateur
          logout();
          navigate('/login');
        }
      }, delay);
    };

    // Démarrer le rafraîchissement automatique
    scheduleTokenRefresh();

    // Nettoyer le timer au démontage du composant
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, [navigate]);
}
