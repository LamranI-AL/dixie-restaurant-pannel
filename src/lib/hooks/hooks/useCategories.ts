/** @format */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Category } from "@/lib/types";

export function useCategories() {
  const queryClient = useQueryClient();

  const fetchCategories = async () => {
    const snapshot = await getDocs(collection(db, "categories"));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Category[];
  };

  const fetchCategory = async (id: string) => {
    const docRef = doc(db, "categories", id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      throw new Error("Category not found");
    }
    return { id: snapshot.id, ...snapshot.data() } as Category;
  };

  // Updated to accept imageUrl instead of handling file uploads
  const createCategory = async ({
    name,
    status,
    imageUrl = "https://domine.exo", // Now accept imageUrl directly
  }: Omit<Category, "id" | "image"> & { imageUrl?: string }) => {
    const categoryData = { name, status, imageUrl };
    const docRef = doc(collection(db, "categories"));
    await setDoc(docRef, categoryData);
    return { id: docRef.id, ...categoryData } as any;
  };

  // Updated to accept imageUrl instead of handling file uploads
  const updateCategory = async ({
    id,
    name,
    status,
  }: Partial<Omit<Category, "image">> & { id: string }) => {
    const updateData: Record<string, any> = {};

    if (name !== undefined) updateData.name = name;
    // if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    // if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    await updateDoc(doc(db, "categories", id), updateData);
    return { id, ...updateData } as Partial<Category> & { id: string };
  };

  const deleteCategory = async (id: string) => {
    await deleteDoc(doc(db, "categories", id));
    return id;
  };

  const {
    data: categories = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const getCategoryQuery = (id: string) => ({
    queryKey: ["category", id],
    queryFn: () => fetchCategory(id),
  });

  const categoryByIdQuery = (id: string) => useQuery(getCategoryQuery(id));

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["category", data.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["category", id] });
    },
  });

  return {
    categories,
    isLoading,
    error,
    getCategory: categoryByIdQuery,
    createCategory: createMutation.mutate,
    updateCategory: updateMutation.mutate,
    deleteCategory: deleteMutation.mutate,
    createCategoryLoading: createMutation.isPending,
    updateCategoryLoading: updateMutation.isPending,
    deleteCategoryLoading: deleteMutation.isPending,
  };
}
