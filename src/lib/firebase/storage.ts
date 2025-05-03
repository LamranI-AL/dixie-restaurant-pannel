import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject, 
  listAll, 
  ListResult 
} from 'firebase/storage';
import { storage } from './config';

// Function to upload a file to Firebase Storage
export const uploadFile = async (
  file: File,
  path: string
): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

// Function to upload multiple files
export const uploadMultipleFiles = async (
  files: File[],
  basePath: string
): Promise<string[]> => {
  try {
    const uploadPromises = files.map((file, index) => {
      const filePath = `${basePath}/${Date.now()}-${index}-${file.name}`;
      return uploadFile(file, filePath);
    });
    
    return Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw error;
  }
};

// Function to delete a file from Firebase Storage
export const deleteFile = async (url: string): Promise<void> => {
  try {
    // Extract the path from the URL
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Function to delete multiple files
export const deleteMultipleFiles = async (urls: string[]): Promise<void> => {
  try {
    const deletePromises = urls.map((url) => deleteFile(url));
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting multiple files:', error);
    throw error;
  }
};

// Function to list all files in a directory
export const listFiles = async (path: string): Promise<string[]> => {
  try {
    const directoryRef = ref(storage, path);
    const result: ListResult = await listAll(directoryRef);
    
    const downloadURLPromises = result.items.map((itemRef) => getDownloadURL(itemRef));
    return Promise.all(downloadURLPromises);
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};