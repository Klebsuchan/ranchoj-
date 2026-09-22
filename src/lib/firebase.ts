import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut as fbSignOut, 
  GoogleAuthProvider, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocFromServer,
  collection, 
  onSnapshot,
  query
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile } from '../types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firebaseConfig.firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

/**
 * Validate connection to Firestore on boot
 */
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Verifique a conexão do Firebase.");
    }
  }
}

// Test connection on module load
testConnection();

/**
 * Sign in with Google using Firebase Authentication popup, with mobile redirect fallback
 */
export async function signInWithGoogleFirebase(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.warn('Firebase Google Auth popup error:', error?.code, error?.message);
    // If popup was blocked by mobile browser, fallback to redirect flow
    if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/popup-closed-by-user' || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (redirectErr) {
        console.warn('Firebase Google Auth redirect error:', redirectErr);
      }
    }
    throw error;
  }
}

/**
 * Check if the user returned from a mobile redirect login
 */
export async function checkFirebaseRedirectResult(): Promise<FirebaseUser | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      return result.user;
    }
  } catch (err) {
    console.warn('Erro ao verificar redirect do Google Firebase:', err);
  }
  return null;
}

/**
 * Sign out from Firebase Authentication
 */
export async function signOutFirebase(): Promise<void> {
  await fbSignOut(auth);
}

/**
 * Clean any mocked unsplash URLs
 */
function sanitizeAvatarUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.includes('images.unsplash.com') || url.includes('unsplash')) {
    return undefined;
  }
  return url;
}

/**
 * Save user profile to Firestore
 */
export async function saveUserProfileToFirestore(userProfile: Partial<UserProfile>): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  const userDocRef = doc(db, 'users', currentUser.uid);
  try {
    const cleanAvatar = sanitizeAvatarUrl(userProfile.avatarUrl) || sanitizeAvatarUrl(currentUser.photoURL) || '';
    await setDoc(userDocRef, {
      uid: currentUser.uid,
      name: userProfile.name || currentUser.displayName || 'Usuário RanchoJá',
      email: userProfile.email || currentUser.email || '',
      avatarUrl: cleanAvatar,
      neighborhood: userProfile.neighborhood || 'Centro',
      city: userProfile.city || 'Passo Fundo',
      state: userProfile.state || 'RS',
      radiusKm: userProfile.radiusKm || 10,
      monthlyBudget: userProfile.monthlyBudget || 1500,
      familyMembers: userProfile.familyMembers || 3,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${currentUser.uid}`);
  }
}

/**
 * Load user profile from Firestore
 */
export async function loadUserProfileFromFirestore(): Promise<Partial<UserProfile> | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  const userDocRef = doc(db, 'users', currentUser.uid);
  try {
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data() as Partial<UserProfile>;
      if (data.avatarUrl) {
        data.avatarUrl = sanitizeAvatarUrl(data.avatarUrl);
      }
      return data;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}`);
    return null;
  }
}

