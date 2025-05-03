import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryConstraint,
  DocumentData,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// Generic function to get a document by ID
export const getDocument = async <T>(
  collectionName: string,
  docId: string
): Promise<T | null> => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnapshot = await getDoc(docRef);
    
    if (docSnapshot.exists()) {
      const data = docSnapshot.data();
      return { id: docSnapshot.id, ...data } as T;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error getting ${collectionName} document:`, error);
    throw error;
  }
};

// Generic function to get documents from a collection
export const getDocuments = async <T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> => {
  try {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...constraints);
    const querySnapshot = await getDocs(q);
    
    const documents = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
    
    return documents;
  } catch (error) {
    console.error(`Error getting ${collectionName} documents:`, error);
    throw error;
  }
};

// Function to create a new document with auto-generated ID
export const addDocument = async <T extends DocumentData>(
  collectionName: string,
  data: T
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error(`Error adding ${collectionName} document:`, error);
    throw error;
  }
};

// Function to create a document with a specific ID
export const setDocument = async <T extends DocumentData>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> => {
  try {
    await setDoc(doc(db, collectionName, docId), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error setting ${collectionName} document:`, error);
    throw error;
  }
};

// Function to update a document
export const updateDocument = async <T extends Partial<DocumentData>>(
  collectionName: string,
  docId: string,
  data: T
): Promise<void> => {
  try {
    await updateDoc(doc(db, collectionName, docId), {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error updating ${collectionName} document:`, error);
    throw error;
  }
};

// Function to delete a document
export const deleteDocument = async (
  collectionName: string,
  docId: string
): Promise<void> => {
  try {
    await deleteDoc(doc(db, collectionName, docId));
  } catch (error) {
    console.error(`Error deleting ${collectionName} document:`, error);
    throw error;
  }
};

// Function to paginate documents
export const paginateDocuments = async <T>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  lastVisible: DocumentData | null = null,
  pageSize: number = 10
): Promise<{ data: T[]; lastVisible: DocumentData | null }> => {
  try {
    let queryConstraints = [...constraints, orderBy('createdAt', 'desc'), limit(pageSize)];
    
    if (lastVisible) {
      queryConstraints.push(startAfter(lastVisible));
    }
    
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef, ...queryConstraints);
    const querySnapshot = await getDocs(q);
    
    const documents = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
    
    const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1] || null;
    
    return {
      data: documents,
      lastVisible: newLastVisible
    };
  } catch (error) {
    console.error(`Error paginating ${collectionName} documents:`, error);
    throw error;
  }
};

// Helper function to convert Firestore timestamp to Date
export const timestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};

// Helper function to filter documents by restaurant ID
export const getRestaurantDocuments = async <T>(
  collectionName: string,
  restaurantId: string,
  additionalConstraints: QueryConstraint[] = []
): Promise<T[]> => {
  const constraints = [where('restaurantId', '==', restaurantId), ...additionalConstraints];
  return getDocuments<T>(collectionName, constraints);
};