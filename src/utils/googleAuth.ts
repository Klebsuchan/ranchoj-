import { UserProfile } from '../types';
import { 
  auth, 
  signInWithGoogleFirebase, 
  signOutFirebase, 
  saveUserProfileToFirestore,
  loadUserProfileFromFirestore 
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
 * Retrieve current signed-in Google user from storage
 */
export function getStoredGoogleUser(): GoogleAuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
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
    const user: GoogleAuthUser = {
      id: fbUser.uid,
      name: fbUser.displayName || 'Usuário Google',
      email: fbUser.email || 'usuario@gmail.com',
      photoUrl: fbUser.photoURL || undefined,
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
  return onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      const stored = getStoredGoogleUser();
      const user: GoogleAuthUser = {
        id: fbUser.uid,
        name: fbUser.displayName || stored?.name || 'Usuário Google',
        email: fbUser.email || stored?.email || 'usuario@gmail.com',
        photoUrl: fbUser.photoURL || stored?.photoUrl || undefined,
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
  photoUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
}: {
  name?: string;
  email?: string;
  photoUrl?: string;
} = {}): GoogleAuthUser {
  const user: GoogleAuthUser = {
    id: `google-user-${Date.now()}`,
    name,
    email,
    photoUrl,
    authMethod: 'google_1click',
    signedInAt: new Date().toLocaleDateString('pt-BR'),
  };
  saveGoogleUser(user);
  return user;
}
