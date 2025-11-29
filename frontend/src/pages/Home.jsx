import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ecoleImage from '../images/ecole-image.jpg';
import logo2 from '../images/logo2.jpg';
import { usePageTitle } from '../hooks/usePageTitle';

const Home = () => {
  const [lang, setLang] = useState('fr');
  usePageTitle('Accueil | Ecole');

  const texts = {
    fr: {
      heroSubtitle: 'Système de suivi des entrées et sorties du personnel',
      heroTitleLine1: 'Bienvenue dans le système',
      heroTitleHighlight: 'de présence du personnel',
      heroDescription:
        "Une solution numérique pour suivre la présence des employés de l'établissement de manière moderne et efficace.",
      cardBadge: 'SYSTÈME DE PRÉSENCE DU PERSONNEL',
      cardTitle: 'Accès rapide',
      cardSubtitle: 'Choisissez une opération à effectuer pour le personnel.',
      entree: 'Enregistrer l\'heure d\'entrée',
      sortie: 'Enregistrer l\'heure de sortie',
      login: 'Login Administrateur',
      help: 'Aide & support',
    },
    ar: {
      heroSubtitle: 'نظام تتبع حضور وانصراف الموظفين',
      heroTitleLine1: 'مرحبًا بك في نظام',
      heroTitleHighlight: 'حضور موظفي المؤسسة',
      heroDescription:
        'حل رقمي لمتابعة حضور وانصراف موظفي المؤسسة التعليمية بطريقة حديثة وسهلة الاستخدام.',
      cardBadge: 'نظام حضور الموظفين',
      cardTitle: 'ولوج سريع',
      cardSubtitle: 'اختر العملية التي تريد تنفيذها الخاصة بالموظفين.',
      entree: 'تسجيل ساعة الدخول',
      sortie: 'تسجيل ساعة الخروج',
      login: 'ولوج الإدارة',
      help: 'المساعدة والدعم',
    },
  };

  const t = texts[lang];
  const isArabic = lang === 'ar';

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

      {/* Right side: white login-like card with actions */}
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

          <div className="space-y-4">
            <Link
              to="/entree"
              className="block w-full bg-gradient-to-r from-[#ff7e00] to-[#ffa500] text-white font-semibold text-sm md:text-base py-3.5 rounded-xl shadow-md transform transition duration-200 hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff7e00] text-center"
            >
              {t.entree}
            </Link>

            <Link
              to="/sortie"
              className="block w-full bg-gradient-to-r from-[#ff7e00] to-[#ffa500] text-white font-semibold text-sm md:text-base py-3.5 rounded-xl shadow-md transform transition duration-200 hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff7e00] text-center"
            >
              {t.sortie}
            </Link>

            <div className="pt-2 border-t border-slate-100 mt-2">
              <Link
                to="/login"
                className="block w-full bg-slate-900 text-white font-semibold text-sm md:text-base py-3.5 rounded-xl shadow-md transform transition duration-200 hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-800 text-center"
              >
                {t.login}
              </Link>
            </div>
          </div>

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

export default Home;

