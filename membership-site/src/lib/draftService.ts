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

// Session interface
export interface Session {
  id?: string;
  title: string;
  description: string;
  reader: string;
  instructions: string[];
  suggestions: string[];
  userId: string;
  status: 'in_edit' | 'to_render' | 'rendering' | 'completed';
  // Optional storage path for rendered audio asset
  audioPath?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// User session count interface
export interface UserSessionCount {
  availableSessions: number;
  totalSessionsUsed: number;
  draftCount: number;
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
  
  // Update draft count when creating a new session
  await updateDraftCount(session.userId, 1);
  
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
  
  // Update draft count when deleting a session
  await updateDraftCount(userId, -1);
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

export const duplicateSession = async (userId: string, sessionId: string): Promise<void> => {
  const originalSession = await getSession(userId, sessionId);
  if (!originalSession) throw new Error('Session not found');
  
  const duplicatedSession: Omit<Session, 'id' | 'createdAt' | 'updatedAt'> = {
    ...originalSession,
    title: `${originalSession.title} (Copy)`,
    status: 'in_edit'
  };
  
  await createSession(duplicatedSession);
};

// Helper function to update draft count
const updateDraftCount = async (userId: string, change: number): Promise<void> => {
  const userRef = doc(getFirestore(), 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const userData = userSnap.data();
    const currentDraftCount = Number(userData.draftCount) || 0;
    const newDraftCount = Math.max(0, currentDraftCount + change);
    
    await updateDoc(userRef, {
      draftCount: newDraftCount
    });
  }
};

// Session count operations
export const getUserSessionCount = async (userId: string): Promise<UserSessionCount> => {
  const userRef = doc(getFirestore(), 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const userData = userSnap.data();
    
    return {
      availableSessions: Number(userData.availableSessions) || 0,
      totalSessionsUsed: Number(userData.totalSessionsUsed) || 0,
      draftCount: Number(userData.draftCount) || 0
    };
  }
  
  // Return default values if user document doesn't exist
  return {
    availableSessions: 0,
    totalSessionsUsed: 0,
    draftCount: 0
  };
};

export const decrementAvailableSessions = async (userId: string): Promise<void> => {
  const userRef = doc(getFirestore(), 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const userData = userSnap.data();
    const currentAvailableSessions = Number(userData.availableSessions) || 0;
    const currentTotalSessionsUsed = Number(userData.totalSessionsUsed) || 0;
    
    if (currentAvailableSessions > 0) {
      await updateDoc(userRef, {
        availableSessions: currentAvailableSessions - 1,
        totalSessionsUsed: currentTotalSessionsUsed + 1
      });
    }
  }
};

// Decrement draft count when a session moves to rendering
export const decrementDraftCount = async (userId: string): Promise<void> => {
  const userRef = doc(getFirestore(), 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const userData = userSnap.data();
    const currentDraftCount = Number(userData.draftCount) || 0;
    const newDraftCount = Math.max(0, currentDraftCount - 1);
    
    await updateDoc(userRef, {
      draftCount: newDraftCount
    });
  }
};

// Check if content has changed for auto-save
export const hasContentChanged = (originalSession: Session, currentContent: string): boolean => {
  const originalContent = JSON.stringify({
    title: originalSession.title,
    description: originalSession.description,
    reader: originalSession.reader,
    instructions: originalSession.instructions,
    suggestions: originalSession.suggestions
  });
  
  return originalContent !== currentContent;
}; 