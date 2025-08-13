/** @format */

"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { getAllGalleryItems } from "@/actions/restaurantGallery";
import { restaurantGallery } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageIcon, Loader2, Plus, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { addGalleryItem } from "@/actions/restaurantGallery";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { uploadImage } from "@/utils/uploadthing";

// Define predefined categories
const GALLERY_CATEGORIES = [
  "Food",
  "Interior",
  "Exterior",
  "Events",
  "Staff",
  "Custom",
];

const formSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  category: z.string().min(1, "Please select a category"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  customCategory: z.string().optional(),
  image: z.string().min(1, "Please upload an image"),
});

type FormValues = z.infer<typeof formSchema>;

export const RestaurantGallery = () => {
  // Gallery display states
  const [galleryItems, setGalleryItems] = useState<restaurantGallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUpload, setImage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "",
      description: "",
      customCategory: "",
      image: "",
    },
  });

  const watchCategory = form.watch("category");

  // Fetch gallery items
  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      const response = await getAllGalleryItems();

      if (response.success) {
        setGalleryItems(response.galleryItems as any);

        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(response?.galleryItems?.map((item) => item.category)),
        );
        setCategories(uniqueCategories);
      } else {
        setError(response?.error as any);
      }
    } catch (err) {
      setError("Failed to fetch gallery items");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const uploadedUrl = await uploadImage(file);
      setImage(uploadedUrl);
      form.setValue("image", uploadedUrl);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Upload failed");
    }
  };

  // When dialog closes, refresh gallery
  useEffect(() => {
    if (!dialogOpen) {
      fetchGalleryItems();
    }
  }, [dialogOpen]);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      // Use custom category if selected
      const finalCategory =
        values.category === "Custom" ? values.customCategory : values.category;

      const galleryData: Omit<restaurantGallery, "id" | "createdAt"> = {
        title: values.title,
        category: finalCategory || "Uncategorized",
        description: values.description,
        image: imageUpload,
      };

      const result = await addGalleryItem(
        galleryData as Omit<restaurantGallery, "id">,
      );

      if (result.success) {
        toast.success("Gallery item added successfully!");
        form.reset();
        setImage("");
        setDialogOpen(false); // Close dialog after successful submission
      } else {
        toast.error(result.error || "Failed to add gallery item");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter gallery items based on selected category
  const filteredItems =
    selectedTab === "all"
      ? galleryItems
      : galleryItems.filter((item) => item.category === selectedTab);

  // Loading state
  if (loading && galleryItems.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error && galleryItems.length === 0) {
    return (
      <div className="text-center p-4 bg-red-50 text-red-500 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Restaurant Gallery</h2>
        <Dialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="default">
              <Plus className="h-4 w-4 mr-2" />
              Add New Image
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            {/* Add Gallery Form */}
            <DialogTitle>Add New Gallery Item </DialogTitle>
            <div className="p-4">
              {/* <h2 className="text-xl font-bold mb-4">Add New Gallery Item</h2> */}

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4">
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image</FormLabel>
                        <FormControl className="bg-gradient-to-t from-slate-950 to-slate-500 rounded-sm">
                          <div className="flex flex-col items-center justify-center py-4">
                            <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                            <p className="text-sm font-medium">
                              Drag & drop or click to upload
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              PNG, JPG, WEBP up to 5MB
                            </p>
                            <Button onClick={() => fileInputRef.current?.click()}>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Image
                            </Button>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </div>
                        </FormControl>
                        {imageUpload && (
                          <div className="mt-2 relative w-full h-48">
                            <Image
                              src={imageUpload}
                              alt="Uploaded preview"
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter image title"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {GALLERY_CATEGORIES.map((category) => (
                              <SelectItem
                                key={category}
                                value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchCategory === "Custom" && (
                    <FormField
                      control={form.control}
                      name="customCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom Category</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter custom category"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter image description"
                            className="resize-none"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Gallery Item"}
                  </Button>
                </form>
              </Form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Gallery Display with Tabs */}
      <Tabs
        defaultValue="all"
        value={selectedTab}
        onValueChange={setSelectedTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedTab}>
          {filteredItems.length === 0 ? (
            <div className="text-center p-8 bg-gray-50 rounded-md">
              No images found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden">
                  <div className="aspect-square relative">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.category}</p>
                    <p className="mt-2 line-clamp-2 text-sm">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RestaurantGallery;
