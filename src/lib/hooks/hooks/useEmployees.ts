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
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase/config";
import { Category, Employee } from "@/lib/types";

export function useEmployees() {
  const queryClient = useQueryClient();

  const fetchEmployees = async () => {
    const snapshot = await getDocs(collection(db, "employees"));
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Employee[];
  };

  const fetchEmployee = async (id: string) => {
    const docRef = doc(db, "employees", id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      throw new Error("Employee not found");
    }
    return { id: snapshot.id, ...snapshot.data() } as Employee;
  };

  const createEmployee = async (employee: Omit<Employee, "id">) => {
    let imageUrl = "";

    if (employee.image) {
      const storageRef = ref(
        storage,
        `employee-images/${Date.now()}-${employee.image}`,
      );
      await uploadBytes(storageRef, employee.image as any);
      imageUrl = await getDownloadURL(storageRef);
    }

    const employeeWithImage = { ...employee, imageUrl, image: null };
    const docRef = doc(collection(db, "employees"));
    await setDoc(docRef, employeeWithImage);
    return { id: docRef.id, ...employeeWithImage } as any;
  };

  const updateEmployee = async ({
    id,
    ...data
  }: Partial<Employee> & { id: string }) => {
    let imageUrl = data.image;

    if (data.image) {
      const storageRef = ref(
        storage,
        `employee-images/${Date.now()}-${data.image}`,
      );
      await uploadBytes(storageRef, data.image as any);
      imageUrl = await getDownloadURL(storageRef);
    }

    const employeeWithImage = { ...data, imageUrl, image: null };
    await updateDoc(doc(db, "employees", id), employeeWithImage);
    return { id, ...employeeWithImage } as any;
  };

  const deleteEmployee = async (id: string) => {
    await deleteDoc(doc(db, "employees", id));
    return id;
  };

  const {
    data: employees = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["employees"],
    queryFn: fetchEmployees,
  });

  const getEmployeeQuery = (id: string) => ({
    queryKey: ["employee", id],
    queryFn: () => fetchEmployee(id),
  });

  const employeeByIdQuery = (id: string) => useQuery(getEmployeeQuery(id));

  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateEmployee,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", data.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["employee", id] });
    },
  });

  return {
    employees,
    isLoading,
    error,
    getEmployee: employeeByIdQuery,
    createEmployee: createMutation.mutate,
    updateEmployee: updateMutation.mutate,
    deleteEmployee: deleteMutation.mutate,
    createEmployeeLoading: createMutation.isPending,
    updateEmployeeLoading: updateMutation.isPending,
    deleteEmployeeLoading: deleteMutation.isPending,
  };
}
