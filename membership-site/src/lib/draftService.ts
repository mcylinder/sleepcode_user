import { db } from './firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  Firestore 
} from 'firebase/firestore';

// Helper function to ensure db is available
const getFirestore = (): Firestore => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }
  return db;
};

export interface Draft {
  id?: string;
  title: string;
  description: string;
  instructions: string[];
  reader: string;
  suggestions: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  userId: string;
}

export interface UserSessionCount {
  availableSessions: number;
  totalSessions: number;
  usedSessions: number;
}

// Constants
const SESSIONS_AVAILABLE = 3;

// Draft CRUD operations
export const createDraft = async (draft: Omit<Draft, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const draftData = {
    ...draft,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(
    collection(getFirestore(), 'drafts', draft.userId, 'sessions'), 
    draftData
  );
  
  return docRef.id;
};

export const updateDraft = async (userId: string, draftId: string, updates: Partial<Draft>): Promise<void> => {
  const draftRef = doc(getFirestore(), 'drafts', userId, 'sessions', draftId);
  await updateDoc(draftRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const deleteDraft = async (userId: string, draftId: string): Promise<void> => {
  const draftRef = doc(getFirestore(), 'drafts', userId, 'sessions', draftId);
  await deleteDoc(draftRef);
};

export const getDraft = async (userId: string, draftId: string): Promise<Draft | null> => {
  const draftRef = doc(getFirestore(), 'drafts', userId, 'sessions', draftId);
  const draftSnap = await getDoc(draftRef);
  
  if (draftSnap.exists()) {
    return { id: draftSnap.id, ...draftSnap.data() } as Draft;
  }
  
  return null;
};

export const getUserDrafts = async (userId: string): Promise<Draft[]> => {
  const draftsRef = collection(getFirestore(), 'drafts', userId, 'sessions');
  const q = query(draftsRef, orderBy('updatedAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Draft[];
};

export const duplicateDraft = async (userId: string, draftId: string): Promise<string> => {
  const originalDraft = await getDraft(userId, draftId);
  if (!originalDraft) {
    throw new Error('Draft not found');
  }
  
  const duplicatedDraft: Omit<Draft, 'id' | 'createdAt' | 'updatedAt'> = {
    title: `${originalDraft.title} (Copy)`,
    description: originalDraft.description,
    instructions: [...originalDraft.instructions],
    reader: originalDraft.reader,
    suggestions: [...originalDraft.suggestions],
    userId: originalDraft.userId
  };
  
  return await createDraft(duplicatedDraft);
};

// Session count operations
export const getUserSessionCount = async (userId: string): Promise<UserSessionCount> => {
  const userRef = doc(getFirestore(), 'users', userId, 'sessionCount', 'default');
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as UserSessionCount;
  }
  
  // Initialize with default values
  const defaultCount: UserSessionCount = {
    availableSessions: SESSIONS_AVAILABLE,
    totalSessions: SESSIONS_AVAILABLE,
    usedSessions: 0
  };
  
  return defaultCount;
};

export const updateUserSessionCount = async (userId: string, updates: Partial<UserSessionCount>): Promise<void> => {
  const userRef = doc(getFirestore(), 'users', userId, 'sessionCount', 'default');
  await updateDoc(userRef, updates);
};

export const decrementAvailableSessions = async (userId: string): Promise<void> => {
  const userRef = doc(getFirestore(), 'users', userId, 'sessionCount', 'default');
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const currentData = userSnap.data() as UserSessionCount;
    await updateDoc(userRef, {
      availableSessions: Math.max(0, currentData.availableSessions - 1),
      usedSessions: currentData.usedSessions + 1
    });
  }
};

// Auto-save helper
export const hasContentChanged = (currentDraft: Draft, savedDraft: Draft | null): boolean => {
  if (!savedDraft) return true;
  
  return (
    currentDraft.title !== savedDraft.title ||
    currentDraft.description !== savedDraft.description ||
    currentDraft.reader !== savedDraft.reader ||
    JSON.stringify(currentDraft.instructions) !== JSON.stringify(savedDraft.instructions) ||
    JSON.stringify(currentDraft.suggestions) !== JSON.stringify(savedDraft.suggestions)
  );
}; 