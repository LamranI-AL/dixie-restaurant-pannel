/** @format */

// /** @format */

// "use client";

// import React, { useEffect, useState } from "react";
// import Image from "next/image";
// import { getAllGalleryItems } from "@/actions/restaurantGallery";
// import { restaurantGallery } from "@/lib/types";
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
// // import { AddGalleryForm } from "./add-gallery-form";
// import { Card, CardContent } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Loader2 } from "lucide-react";
// import { DialogTitle } from "@radix-ui/react-dialog";
// import RestaurantGallery1 from "./add-gallery-form";

// export const RestaurantGallery = () => {
//   const [galleryItems, setGalleryItems] = useState<restaurantGallery[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [categories, setCategories] = useState<string[]>([]);
//   const [selectedTab, setSelectedTab] = useState("all");

//   useEffect(() => {
//     const fetchGalleryItems = async () => {
//       try {
//         setLoading(true);
//         const response = await getAllGalleryItems();

//         if (response.success) {
//           setGalleryItems(response.galleryItems as restaurantGallery[]);

//           // Extract unique categories
//           const uniqueCategories = Array.from(
//             new Set(response?.galleryItems?.map((item) => item.category)),
//           );
//           setCategories(uniqueCategories);
//         } else {
//           setError(response.error as any);
//         }
//       } catch (err) {
//         setError("Failed to fetch gallery items");
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchGalleryItems();
//   }, []);
//   console.log("galleryItems", galleryItems);
//   // Filter gallery items based on selected category
//   const filteredItems =
//     selectedTab === "all"
//       ? galleryItems
//       : galleryItems.filter((item) => item.category === selectedTab);
//   console.log("filteredItems", filteredItems);
//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <Loader2 className="h-8 w-8 animate-spin text-primary" />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="text-center p-4 bg-red-50 text-red-500 rounded-md">
//         {error}
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto py-8">
//       <div className="flex justify-between items-center mb-6">
//         {/* <h2 className="text-3xl font-bold">Restaurant Gallery</h2> */}
//         <Dialog>
//           <DialogTrigger asChild>
//             <Button variant="default">Ajouter une image</Button>
//           </DialogTrigger>
//           <DialogContent className="sm:max-w-[500px]">
//             <DialogTitle className="text-lg font-semibold mb-4">
//               Ajouter une image
//             </DialogTitle>
//             <RestaurantGallery1 />
//           </DialogContent>
//         </Dialog>
//       </div>

//       <Tabs
//         defaultValue="all"
//         value={selectedTab}
//         onValueChange={setSelectedTab}>
//         <TabsList className="mb-6">
//           <TabsTrigger value="all">All</TabsTrigger>
//           {categories.map((category) => (
//             <TabsTrigger
//               key={category}
//               value={category}>
//               {category}
//             </TabsTrigger>
//           ))}
//         </TabsList>

//         <TabsContent value={selectedTab}>
//           {filteredItems.length === 0 ? (
//             <div className="text-center p-8 bg-gray-50 rounded-md">
//               No images found in this category.
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//               {filteredItems.map((item) => (
//                 <Card
//                   key={item.id}
//                   className="overflow-hidden">
//                   <div className="aspect-square relative">
//                     <Image
//                       src={item.image}
//                       alt={item.title}
//                       fill
//                       className="object-cover"
//                     />
//                   </div>
//                   <CardContent className="p-4">
//                     <h3 className="font-semibold text-lg">{item.title}</h3>
//                     <p className="text-sm text-gray-500">{item.category}</p>
//                     <p className="mt-2 line-clamp-2 text-sm">
//                       {item.description}
//                     </p>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           )}
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

// export default RestaurantGallery;
