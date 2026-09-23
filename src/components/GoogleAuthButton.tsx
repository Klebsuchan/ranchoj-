import React, { useState, useEffect, useRef } from 'react';
import { 
  getStoredGoogleUser, 
  clearGoogleSession, 
  GoogleAuthUser
} from '../utils/googleAuth';
import { LogOut, User, Check, ShieldCheck, ChevronDown } from 'lucide-react';

interface GoogleAuthButtonProps {
  onOpenProfile: () => void;
  variant?: 'header' | 'modal' | 'banner';
  className?: string;
  onUserChange?: (user: GoogleAuthUser | null) => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  onOpenProfile,
  variant = 'header',
  className = '',
  onUserChange,
}) => {
  const [currentUser, setCurrentUser] = useState<GoogleAuthUser | null>(getStoredGoogleUser());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [headerAvatarError, setHeaderAvatarError] = useState(false);
  const [bannerAvatarError, setBannerAvatarError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHeaderAvatarError(false);
    setBannerAvatarError(false);
  }, [currentUser?.photoUrl]);

  useEffect(() => {
    const handleAuthChange = (e: any) => {
      const user = e.detail as GoogleAuthUser | null;
      setCurrentUser(user);
      setHeaderAvatarError(false);
      setBannerAvatarError(false);
      if (onUserChange) onUserChange(user);
    };

    window.addEventListener('ranchoja_auth_change', handleAuthChange);
    return () => window.removeEventListener('ranchoja_auth_change', handleAuthChange);
  }, [onUserChange]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearGoogleSession();
    setIsMenuOpen(false);
  };

  // 1. Header Compact Variant
  if (variant === 'header') {
    if (currentUser) {
      return (
        <div className={`relative ${className}`} ref={menuRef}>
          <button
            id="btn-google-header-logado"
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-1.5 py-1 px-2 rounded-full border border-red-300 bg-red-50/80 hover:bg-red-100 text-slate-800 text-[11px] font-bold transition shadow-2xs active:scale-95"
            title={`Logado como ${currentUser.name} (${currentUser.email})`}
          >
            {currentUser.photoUrl && !headerAvatarError ? (
              <img
                src={currentUser.photoUrl}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onError={() => setHeaderAvatarError(true)}
                className="w-5 h-5 rounded-full object-cover border border-red-500 shrink-0"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                {currentUser.name ? currentUser.name.slice(0, 1).toUpperCase() : 'G'}
              </div>
            )}
            <span className="truncate max-w-[80px] text-[11px] font-extrabold text-slate-800">
              {currentUser.givenName || currentUser.name.split(' ')[0]}
            </span>
            <ChevronDown className="w-3 h-3 text-red-700 shrink-0" />
          </button>

          {/* Quick Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 text-slate-700 animate-in fade-in slide-in-from-top-1">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <div className="flex items-center gap-1 text-[10px] font-extrabold text-red-700 uppercase tracking-wider mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                  Conta Google Conectada
                </div>
                <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
              </div>

              <div className="px-1.5 py-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenProfile();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition"
                >
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  Meu Perfil & Localização
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  Desconectar Conta Google
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Not logged in: Show Google Sign In CTA in header
    return (
      <button
        id="btn-google-header-login"
        type="button"
        onClick={onOpenProfile}
        className={`flex items-center gap-1.5 py-1 px-2.5 rounded-full border border-slate-300 hover:border-red-400 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-bold transition shadow-2xs active:scale-95 shrink-0 ${className}`}
        title="Fazer Login com sua Conta Google para sincronizar seu rancho"
      >
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>Entrar</span>
      </button>
    );
  }

  // 2. Banner or Card Variant
  return (
    <div className={`p-4 rounded-2xl bg-white border border-slate-200 shadow-xs ${className}`}>
      {currentUser ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {currentUser.photoUrl && !bannerAvatarError ? (
              <img
                src={currentUser.photoUrl}
                alt={currentUser.name}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onError={() => setBannerAvatarError(true)}
                className="w-10 h-10 rounded-full object-cover border-2 border-red-500 shadow-2xs shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                {currentUser.name ? currentUser.name.slice(0, 1).toUpperCase() : 'G'}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-slate-900 truncate">{currentUser.name}</p>
                <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-red-100 text-red-800">
                  <Check className="w-2.5 h-2.5 text-red-600" /> Google
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition shrink-0"
          >
            Sair
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-xs text-slate-600 mb-3">
            Conecte sua conta Google para salvar suas listas, histórico de compras e alertas de preços em qualquer aparelho.
          </p>
          <button
            type="button"
            onClick={onOpenProfile}
            className="w-full min-h-[44px] inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border-2 border-slate-300 text-slate-800 font-bold text-xs sm:text-sm shadow-2xs transition active:scale-98"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Fazer Login com Google</span>
          </button>
        </div>
      )}
    </div>
  );
};
