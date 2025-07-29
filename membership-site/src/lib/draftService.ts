import { db } from './firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  setDoc,
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

export interface Session {
  id?: string;
  title: string;
  description: string;
  instructions: string[];
  reader: string;
  suggestions: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  userId: string;
  status: 'in_edit' | 'to_render' | 'recorded';
}

export interface UserSessionCount {
  availableSessions: number;
  totalSessions: number;
  usedSessions: number;
}



// Session CRUD operations
export const createSession = async (session: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const sessionData = {
    ...session,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(
    collection(getFirestore(), 'users', session.userId, 'sessions'), 
    sessionData
  );
  
  return docRef.id;
};

export const updateSession = async (userId: string, sessionId: string, updates: Partial<Session>): Promise<void> => {
  const sessionRef = doc(getFirestore(), 'users', userId, 'sessions', sessionId);
  await updateDoc(sessionRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
};

export const deleteSession = async (userId: string, sessionId: string): Promise<void> => {
  const sessionRef = doc(getFirestore(), 'users', userId, 'sessions', sessionId);
  await deleteDoc(sessionRef);
};

export const getSession = async (userId: string, sessionId: string): Promise<Session | null> => {
  const sessionRef = doc(getFirestore(), 'users', userId, 'sessions', sessionId);
  const sessionSnap = await getDoc(sessionRef);
  
  if (sessionSnap.exists()) {
    return { id: sessionSnap.id, ...sessionSnap.data() } as Session;
  }
  
  return null;
};

export const getUserSessions = async (userId: string): Promise<Session[]> => {
  const sessionsRef = collection(getFirestore(), 'users', userId, 'sessions');
  const q = query(sessionsRef, orderBy('updatedAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Session[];
};

export const duplicateSession = async (userId: string, sessionId: string): Promise<string> => {
  const originalSession = await getSession(userId, sessionId);
  if (!originalSession) {
    throw new Error('Session not found');
  }
  
  const duplicatedSession: Omit<Session, 'id' | 'createdAt' | 'updatedAt'> = {
    title: `${originalSession.title} (Copy)`,
    description: originalSession.description,
    instructions: [...originalSession.instructions],
    reader: originalSession.reader,
    suggestions: [...originalSession.suggestions],
    userId: originalSession.userId,
    status: 'in_edit'
  };
  
  return await createSession(duplicatedSession);
};

// Session count operations - using draft_count field from user document
export const getUserSessionCount = async (userId: string): Promise<UserSessionCount> => {
  const userRef = doc(getFirestore(), 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const userData = userSnap.data();
    const availableSessions = Number(userData.draft_count) || 0;
    
    return {
      availableSessions,
      totalSessions: availableSessions,
      usedSessions: 0
    };
  }
  
  // Return default values if user document doesn't exist
  return {
    availableSessions: 0,
    totalSessions: 0,
    usedSessions: 0
  };
};

export const updateUserSessionCount = async (userId: string, updates: Partial<UserSessionCount>): Promise<void> => {
  const userRef = doc(getFirestore(), 'users', userId);
  await updateDoc(userRef, updates);
};

export const decrementAvailableSessions = async (userId: string): Promise<void> => {
  const userRef = doc(getFirestore(), 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const userData = userSnap.data();
    const currentAvailableSessions = Number(userData.draft_count) || 0;
    const newAvailableSessions = Math.max(0, currentAvailableSessions - 1);
    
    await updateDoc(userRef, {
      draft_count: newAvailableSessions
    });
  }
  // If user document doesn't exist, don't try to create it - just return
  // The user will have the default session count anyway
};

// Auto-save helper
export const hasContentChanged = (currentSession: Session, savedSession: Session | null): boolean => {
  if (!savedSession) return true;
  
  return (
    currentSession.title !== savedSession.title ||
    currentSession.description !== savedSession.description ||
    currentSession.reader !== savedSession.reader ||
    JSON.stringify(currentSession.instructions) !== JSON.stringify(savedSession.instructions) ||
    JSON.stringify(currentSession.suggestions) !== JSON.stringify(savedSession.suggestions)
  );
}; 