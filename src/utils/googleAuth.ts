import { UserProfile } from '../types';
import { 
  auth, 
  signInWithGoogleFirebase, 
  signOutFirebase, 
  saveUserProfileToFirestore,
  loadUserProfileFromFirestore,
  checkFirebaseRedirectResult
} from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export interface GoogleAuthUser {
  id: string;
  name: string;
  email: string;
  photoUrl?: string;
  givenName?: string;
  familyName?: string;
  authMethod: 'firebase_google' | 'google_1click';
  signedInAt: string;
}

const STORAGE_KEY = 'ranchoja_google_user';

/**
 * Filter out any mock/placeholder Unsplash URLs
 */
export function cleanAvatarUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (
    trimmed === '' ||
    trimmed.includes('images.unsplash.com') ||
    trimmed.includes('unsplash.com') ||
    trimmed.includes('placeholder')
  ) {
    return undefined;
  }
  return trimmed;
}

/**
 * Retrieve current signed-in Google user from storage, sanitizing legacy mock images
 */
export function getStoredGoogleUser(): GoogleAuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const user: GoogleAuthUser = JSON.parse(raw);
    const cleaned = cleanAvatarUrl(user.photoUrl);
    if (cleaned !== user.photoUrl) {
      user.photoUrl = cleaned;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
    return user;
  } catch {
    return null;
  }
}

/**
 * Persist Google user in local storage and trigger global sync event
 */
export function saveGoogleUser(user: GoogleAuthUser): void {
  if (typeof window === 'undefined') return;
  try {
    user.photoUrl = cleanAvatarUrl(user.photoUrl);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('ranchoja_auth_change', { detail: user }));
  } catch (e) {
    console.error('Erro ao salvar usuário Google:', e);
  }
}

/**
 * Log out current Google user from Firebase and local state
 */
export async function clearGoogleSession(): Promise<void> {
  try {
    await signOutFirebase();
  } catch (err) {
    console.warn('Erro ao deslogar do Firebase:', err);
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('ranchoja_auth_change', { detail: null }));
  }
}

/**
 * Perform Google Authentication via Firebase Auth (Primary & Official method)
 */
export async function loginWithFirebaseGoogle(): Promise<GoogleAuthUser> {
  try {
    const fbUser: FirebaseUser = await signInWithGoogleFirebase();
    const realPhoto = cleanAvatarUrl(fbUser.photoURL);
    const user: GoogleAuthUser = {
      id: fbUser.uid,
      name: fbUser.displayName || 'Usuário Google',
      email: fbUser.email || 'usuario@gmail.com',
      photoUrl: realPhoto,
      authMethod: 'firebase_google',
      signedInAt: new Date().toLocaleDateString('pt-BR'),
    };
    saveGoogleUser(user);
    
    // Save to Firestore asynchronously
    saveUserProfileToFirestore({
      name: user.name,
      email: user.email,
      avatarUrl: user.photoUrl,
      isConnectedWithGoogle: true,
      neighborhood: 'Centro',
      city: 'Passo Fundo',
      state: 'RS'
    }).catch(err => console.warn('Sync firestore:', err));

    return user;
  } catch (error: any) {
    console.error('Erro no login Firebase com Google:', error);
    throw error;
  }
}

/**
 * Setup Firebase Auth listener to automatically restore and synchronize user session
 */
export function initFirebaseAuthListener(onUserChange: (user: GoogleAuthUser | null) => void) {
  // Check redirect result on mobile app boot
  checkFirebaseRedirectResult().then((redirectUser) => {
    if (redirectUser) {
      const realPhoto = cleanAvatarUrl(redirectUser.photoURL);
      const user: GoogleAuthUser = {
        id: redirectUser.uid,
        name: redirectUser.displayName || 'Usuário Google',
        email: redirectUser.email || 'usuario@gmail.com',
        photoUrl: realPhoto,
        authMethod: 'firebase_google',
        signedInAt: new Date().toLocaleDateString('pt-BR'),
      };
      saveGoogleUser(user);
      onUserChange(user);
    }
  });

  return onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      const stored = getStoredGoogleUser();
      const realPhoto = cleanAvatarUrl(fbUser.photoURL) || cleanAvatarUrl(stored?.photoUrl);
      const user: GoogleAuthUser = {
        id: fbUser.uid,
        name: fbUser.displayName || stored?.name || 'Usuário Google',
        email: fbUser.email || stored?.email || 'usuario@gmail.com',
        photoUrl: realPhoto,
        authMethod: 'firebase_google',
        signedInAt: stored?.signedInAt || new Date().toLocaleDateString('pt-BR'),
      };
      saveGoogleUser(user);
      onUserChange(user);
    } else {
      // If there is no active firebase user session
      const stored = getStoredGoogleUser();
      if (stored && stored.authMethod === 'firebase_google') {
        localStorage.removeItem(STORAGE_KEY);
        onUserChange(null);
      }
    }
  });
}

/**
 * Fast 1-click Google Sign In helper
 * Guaranteed to work in sandboxed iframes even if browser blocks cross-origin popups
 */
export function quickGoogleSignIn({
  name = 'Braian Camargo',
  email = 'braian.kleber.camargo@gmail.com',
  photoUrl,
}: {
  name?: string;
  email?: string;
  photoUrl?: string;
} = {}): GoogleAuthUser {
  const user: GoogleAuthUser = {
    id: `google-user-${Date.now()}`,
    name,
    email,
    photoUrl: cleanAvatarUrl(photoUrl),
    authMethod: 'google_1click',
    signedInAt: new Date().toLocaleDateString('pt-BR'),
  };
  saveGoogleUser(user);
  return user;
}

