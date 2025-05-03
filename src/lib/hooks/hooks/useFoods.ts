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
  addDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase/config";
import { Food } from "@/lib/types";
// import { Food } from "@/";

export function useFoods() {
  const queryClient = useQueryClient();

  const fetchFoods = async () => {
    const snapshot = await getDocs(collection(db, "foods"));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Food[];
  };

  const fetchFood = async (id: string) => {
    const docRef = doc(db, "foods", id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      throw new Error("Food not found");
    }
    return { id: snapshot.id, ...snapshot.data() } as Food;
  };

  const createFood = async (food: Omit<Food, "id">) => {
    let imageUrl = "";

    if (food.image) {
      const storageRef = ref(
        storage,
        `food-images/${Date.now()}-${food.image}`,
      );
      await uploadBytes(storageRef, food.image as any);
      imageUrl = await getDownloadURL(storageRef);
    }

    const foodWithImage = { ...food, imageUrl, image: null };
    const docRef = await addDoc(collection(db, "foods"), foodWithImage);
    return { id: docRef.id, ...foodWithImage } as any;
  };

  const updateFood = async ({
    id,
    ...data
  }: Partial<Food> & { id: string }) => {
    let imageUrl = data.image;

    if (data.image) {
      const storageRef = ref(
        storage,
        `food-images/${Date.now()}-${data.image}`,
      );
      await uploadBytes(storageRef, data.image as any);
      imageUrl = await getDownloadURL(storageRef);
    }

    const foodWithImage = { ...data, imageUrl, image: null };
    await updateDoc(doc(db, "foods", id), foodWithImage);
    return { id, ...foodWithImage } as any;
  };

  const deleteFood = async (id: string) => {
    await deleteDoc(doc(db, "foods", id));
    return id;
  };

  const getFoodsByCategory = async (categoryId: string) => {
    const q = query(
      collection(db, "foods"),
      where("categoryId", "==", categoryId),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Food[];
  };

  const {
    data: foods = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["foods"],
    queryFn: fetchFoods,
  });

  const getFoodQuery = (id: string) => ({
    queryKey: ["food", id],
    queryFn: () => fetchFood(id),
  });

  const foodByIdQuery = (id: string) => useQuery(getFoodQuery(id));

  const getFoodsByCategoryQuery = (categoryId: string) => ({
    queryKey: ["foods", "category", categoryId],
    queryFn: () => getFoodsByCategory(categoryId),
  });

  const foodsByCategoryQuery = (categoryId: string) =>
    useQuery(getFoodsByCategoryQuery(categoryId));

  const createMutation = useMutation({
    mutationFn: createFood,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["foods"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateFood,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["foods"] });
      queryClient.invalidateQueries({ queryKey: ["food", data.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFood,
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["foods"] });
      queryClient.invalidateQueries({ queryKey: ["food", id] });
    },
  });

  return {
    foods,
    isLoading,
    error,
    getFood: foodByIdQuery,
    getFoodsByCategory: foodsByCategoryQuery,
    createFood: createMutation.mutate,
    updateFood: updateMutation.mutate,
    deleteFood: deleteMutation.mutate,
    createFoodLoading: createMutation.isPending,
    updateFoodLoading: updateMutation.isPending,
    deleteFoodLoading: deleteMutation.isPending,
  };
}
