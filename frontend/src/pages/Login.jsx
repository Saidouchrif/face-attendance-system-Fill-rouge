import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginRequest, isAuthenticated } from '../services/authService';
import ecoleImage from '../images/ecole-image.jpg';
import logo2 from '../images/logo2.jpg';
import { usePageTitle } from '../hooks/usePageTitle';

// Login page: UI + logic
const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState('fr');
  usePageTitle('Connexion Admin');

  const texts = {
    fr: {
      heroSubtitle: 'Portail administrateur',
      heroTitleLine1: 'Connexion à',
      heroTitleHighlight: "l'espace d'administration",
      heroDescription:
        "Accédez au tableau de bord pour gérer la présence du personnel et consulter les rapports.",
      cardBadge: 'CONNEXION ADMIN',
      cardTitle: 'Connexion',
      cardSubtitle: 'Entrez vos identifiants pour accéder à l\'administration.',
      emailLabel: 'Email',
      emailPlaceholder: 'admin@example.com',
      passwordLabel: 'Mot de passe',
      passwordPlaceholder: '••••••',
      loginButton: 'Se connecter',
      signingIn: 'Connexion...',
      help: 'Aide & support',
    },
    ar: {
      heroSubtitle: 'بوابة الإدارة',
      heroTitleLine1: 'ولوج إلى',
      heroTitleHighlight: 'مساحة الإدارة',
      heroDescription:
        'ادخل إلى لوحة التحكم لإدارة حضور الموظفين وعرض التقارير.',
      cardBadge: 'ولوج الإدارة',
      cardTitle: 'تسجيل الدخول',
      cardSubtitle: 'أدخل معرفاتك للوصول إلى الإدارة.',
      emailLabel: 'البريد الإلكتروني',
      emailPlaceholder: 'admin@example.com',
      passwordLabel: 'كلمة المرور',
      passwordPlaceholder: '••••••',
      loginButton: 'تسجيل الدخول',
      signingIn: 'جاري تسجيل الدخول...',
      help: 'المساعدة والدعم',
    },
  };

  const t = texts[lang];
  const isArabic = lang === 'ar';

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError(isArabic ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور.' : 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      await loginRequest(email, password);
      // On success, navigate to dashboard with replace to clean history
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || (isArabic ? 'فشل تسجيل الدخول.' : 'Login failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="min-h-screen flex flex-col lg:flex-row bg-slate-900"
    >
      {/* Left side: background image + gradient overlay + hero text */}
      <div className="relative w-full lg:w-1/2 h-80 lg:h-auto overflow-hidden">
        <img
          src={ecoleImage}
          alt="Ecole"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-indigo-900/80 to-sky-700/80" />

        <div className="relative z-10 flex h-full flex-col items-center lg:items-end justify-center px-6 py-10 lg:px-14 text-white">
          <div
            className={`max-w-xl space-y-4 text-center ${
              isArabic ? 'lg:text-right' : 'lg:text-left'
            }`}
          >
            <p className="text-sm md:text-base text-sky-200/80">
              {t.heroSubtitle}
            </p>
            <h1 className="text-3xl md:text-4xl xl:text-5xl font-extrabold leading-snug drop-shadow-md">
              {t.heroTitleLine1}
              <span className="block text-sky-300">{t.heroTitleHighlight}</span>
            </h1>
            <p className="text-sm md:text-base text-sky-100/80 leading-relaxed">
              {t.heroDescription}
            </p>
          </div>
        </div>
      </div>

      {/* Right side: white login card */}
      <div className="flex w-full lg:w-1/2 items-center justify-center bg-slate-50 px-4 py-10 lg:px-10">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 px-6 py-8 md:px-8 md:py-10">
          {/* Logo centered above the form */}
          <div className="flex justify-center mb-6">
            <img
              src={logo2}
              alt="Logo"
              className="h-20 w-auto object-contain"
            />
          </div>

          <div className="mb-8 text-center">
            <p className="text-xs font-semibold text-slate-500 tracking-[0.2em] uppercase mb-2">
              {t.cardBadge}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
              {t.cardTitle}
            </h2>
            <p className="text-sm text-slate-500">
              {t.cardSubtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                {t.emailLabel}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                {t.passwordLabel}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-colors text-sm"
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl shadow-md transform transition duration-200 hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? t.signingIn : t.loginButton}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between text-[11px] md:text-xs text-slate-400">
            <button
              type="button"
              className="hover:text-slate-600 transition-colors"
            >
              {t.help}
            </button>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setLang('fr')}
                className={`hover:text-slate-600 transition-colors ${
                  lang === 'fr' ? 'text-slate-800 font-semibold' : ''
                }`}
              >
                Français
              </button>
              <span className="h-3 w-px bg-slate-300" />
              <button
                type="button"
                onClick={() => setLang('ar')}
                className={`hover:text-slate-600 transition-colors ${
                  lang === 'ar' ? 'text-slate-800 font-semibold' : ''
                }`}
              >
                العربية
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
