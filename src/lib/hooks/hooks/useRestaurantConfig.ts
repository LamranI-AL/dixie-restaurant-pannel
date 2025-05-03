/** @format */

import { db, storage } from "@/lib/firebase/config";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { db, storage } from "@/lib/firebase";
import { RestaurantConfig, MetaData } from "@/lib/types";

export function useRestaurantConfig() {
  const queryClient = useQueryClient();
  const configDocRef = doc(db, "restaurant", "config");
  const metaDataDocRef = doc(db, "restaurant", "metadata");

  const fetchConfig = async () => {
    const snapshot = await getDoc(configDocRef);
    if (!snapshot.exists()) {
      // Return default config if none exists
      return {
        temporarilyClosed: false,
        scheduledDelivery: true,
        homeDelivery: true,
        takeaway: true,
        veg: true,
        nonVeg: true,
        subscriptionBasedOrder: false,
        cutlery: true,
        instantOrder: true,
        halalTagStatus: false,
        extraPackagingCharge: true,
        dineIn: true,
        packagingChargeType: "optional",
        packagingChargeAmount: 2,
        minimumOrderAmount: 0,
        minimumDineInTime: 0,
        minimumDineInTimeUnit: "min",
        gstEnabled: false,
        cuisines: ["Italian", "Spanish"],
        tags: [],
      } as any;
    }
    return snapshot.data() as RestaurantConfig;
  };

  const updateConfig = async (config: Partial<RestaurantConfig>) => {
    const currentConfig = await fetchConfig();
    const updatedConfig = { ...currentConfig, ...config };
    await setDoc(configDocRef, updatedConfig);
    return updatedConfig;
  };

  // const fetchMetaData = async () => {
  //   const snapshot = await getDoc(metaDataDocRef);
  //   if (!snapshot.exists()) {
  //     // Return default metadata if none exists
  //     return {
  //       default: {
  //         title: "Hungry Puppets Restaurant: Where Flavor and Fun Meet",
  //         description: "Satisfy your cravings and indulge in a culinary adventure at Hungry Puppets Restaurant. Our menu is a symphony of taste, offering a delightful blend of flavors that excite both",
  //       },
  //       english: {
  //         title: "",
  //         description: "",
  //       },
  //       bengali: {
  //         title: "",
  //         description: "",
  //       },
  //       arabic: {
  //         title: "",
  //         description: "",
  //       },
  //       image: "",
  //     } as MetaData;
  //   }
  //   return snapshot.data() as any;
  // };

  const updateMetaData = async (metaData: MetaData) => {
    let imageUrl = metaData.image;

    if (typeof metaData.image === "object" && metaData.image !== null) {
      const storageRef = ref(storage, `restaurant/meta-image-${Date.now()}`);
      await uploadBytes(storageRef, metaData.image);
      imageUrl = await getDownloadURL(storageRef);
    }

    const updatedMetaData = { ...metaData, image: imageUrl };
    await setDoc(metaDataDocRef, updatedMetaData);
    return updatedMetaData;
  };

  const {
    data: config,
    isLoading: configLoading,
    error: configError,
  } = useQuery({
    queryKey: ["restaurantConfig"],
    queryFn: fetchConfig,
  });

  // const { data: metaData, isLoading: metaDataLoading, error: metaDataError } = useQuery({
  //   queryKey: ["restaurantMetaData"],
  //   queryFn: fetchMetaData,
  // });

  const updateConfigMutation = useMutation({
    mutationFn: updateConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurantConfig"] });
    },
  });

  const updateMetaDataMutation = useMutation({
    mutationFn: updateMetaData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurantMetaData"] });
    },
  });

  return {
    config,
    configLoading,
    configError,
    // metaData,
    // metaDataLoading,
    // metaDataError,
    updateConfig: updateConfigMutation.mutate,
    updateMetaData: updateMetaDataMutation.mutate,
    updateConfigLoading: updateConfigMutation.isPending,
    updateMetaDataLoading: updateMetaDataMutation.isPending,
  };
}
