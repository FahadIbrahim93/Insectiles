import { db, auth } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export let userData = {
  uid: '',
  bestScore: 0,
  bestWave: 0,
  bestCombo: 0,
  runs: 0,
  achievements: [] as string[],
  totalGemsCollected: 0,
  totalKills: 0
};

export let unlockedAchievements = new Set<string>();

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function loadUserData(uid: string) {
  const path = `users/${uid}`;
  try {
    const docRef = doc(db, 'users', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      userData = { ...userData, ...data, uid };
      unlockedAchievements = new Set(userData.achievements || []);
    } else {
      userData.uid = uid;
      await saveUserData(uid);
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserData(uid: string) {
  const path = `users/${uid}`;
  try {
    userData.uid = uid;
    userData.achievements = Array.from(unlockedAchievements);
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, userData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
