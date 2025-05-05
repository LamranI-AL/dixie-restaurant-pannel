/** @format */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
import { CalendarIcon, Eye, EyeOff, ImageIcon, Upload } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { addDeliveryman } from "@/actions/deliveryman";
import { Deliveryman } from "@/lib/types";
import { UploadButton } from "@/utils/uploadthing";
import { toast } from "sonner";
import Image from "next/image";

// Form validation schema
const formSchema = z
  .object({
    firstName: z.string().min(2, {
      message: "First name must be at least 2 characters.",
    }),
    lastName: z.string().min(2, {
      message: "Last name must be at least 2 characters.",
    }),
    email: z.string().email({
      message: "Please enter a valid email address.",
    }),
    zone: z.string().min(1, {
      message: "Please select a zone.",
    }),
    vehicle: z.string().min(1, {
      message: "Please select a vehicle.",
    }),
    identityType: z.string().min(1, {
      message: "Please select an identity type.",
    }),
    identityNumber: z.string().min(1, {
      message: "Please enter an identity number.",
    }),
    age: z.string().min(1, {
      message: "Please enter your age.",
    }),
    // birthdate: z.date({
    //   required_error: "Please select a birthdate.",
    // }),
    phone: z.string().min(1, {
      message: "Please enter a phone number.",
    }),
    password: z.string().min(8, {
      message: "Password must be at least 8 characters.",
    }),
    confirmPassword: z.string().min(8, {
      message: "Please confirm your password.",
    }),
    deliverymanType: z.string().min(1, {
      message: "Please select a deliveryman type.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function AddDeliveryman() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageIdentifier, setImageIdentifier] = useState<string | null>(null);
  const [imageProfile, setImageProfile] = useState<string | null>(null);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      zone: "",
      vehicle: "",
      identityType: "",
      identityNumber: "",
      age: "",
      deliverymanType: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });
  // Form submission handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      // Convert form data to the format needed for Firebase
      const deliverymanData: Deliveryman = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        zone: values.zone,
        vehicle: values.vehicle,
        identityType: values.identityType,
        identityNumber: values.identityNumber,
        age: values.age,
        birthdate: new Date(Date.now()).toISOString(),
        phone: values.phone,
        password: values.password, // In production, you should hash this on the server side
        // deliverymanType: values.deliverymanType,
        profileImageUrl: imageProfile as string,
        identityImageUrl: imageIdentifier as string,
        status: "inactive",
        createdAt: new Date(Date.now()),
        deliverymanImage: imageProfile as string,
        id: "0",
        updatedAt: new Date(),
        // licenseFile: licenseFile ? licenseFile.name : (null) as string,
        // createdAt: new Date().toISOString(),
      };

      const result = await addDeliveryman(deliverymanData);

      if (result.success) {
        // Redirect to deliveryman list or show success message
        toast.success("✅ Deliveryman added successfully!");
        router.push("/deliveryman/list");
        router.refresh();
      } else {
        console.error("Error adding deliveryman:", result.error);
        toast.error("❌ Failed to add deliveryman. Please try again.");

        // Handle error - show error message to user
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("🚨 An unexpected error occurred.");
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <div className="mr-2">🚚</div>
        <h1 className="text-2xl font-semibold">Add New Deliveryman</h1>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8">
          {/* General Info Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <div className="mr-2">👤</div>
                <h2 className="text-lg font-medium">General Info</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="First name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Last name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Image</FormLabel>
                  <div className="mt-1 flex items-center justify-center border rounded-md h-32 w-full">
                    {imageProfile ? (
                      <Image
                        width={100}
                        height={100}
                        src={imageProfile}
                        alt="Profile preview"
                        className="h-full object-cover rounded-md"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4 bg-gradient-to-r from-blue-200 to-blue-100 rounded-md h-full w-full">
                        <Upload className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm font-medium">
                          Drag & drop or click to upload image profile
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, WEBP up to 5MB
                        </p>
                        <UploadButton
                          endpoint="imageUploader"
                          onClientUploadComplete={(res) => {
                            console.log(res[0].ufsUrl! as any);
                            setImageProfile(res[0].ufsUrl!);
                            // form.setValue("image", res[0].ufsUrl!);
                            toast.success("Image uploaded successfully!");
                          }}
                          onUploadError={(error: Error) => {
                            console.log(error.message);
                            toast.error(error.message);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deliverymanType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deliveryman Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="freelancer">Freelancer</SelectItem>
                          <SelectItem value="permanent">Permanent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zone</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Zone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="north">North Zone</SelectItem>
                          <SelectItem value="south">South Zone</SelectItem>
                          <SelectItem value="east">East Zone</SelectItem>
                          <SelectItem value="west">West Zone</SelectItem>
                          <SelectItem value="central">Central Zone</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Identification Information */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <div className="mr-2">🪪</div>
                <h2 className="text-lg font-medium">
                  Identification Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="vehicle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Vehicle" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bicycle">Bicycle</SelectItem>
                          <SelectItem value="motorcycle">Motorcycle</SelectItem>
                          <SelectItem value="car">Car</SelectItem>
                          <SelectItem value="van">Van</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="identityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Identity Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Identity Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="passport">Passport</SelectItem>
                          <SelectItem value="idCard">ID Card</SelectItem>
                          <SelectItem value="drivingLicense">
                            Driving License
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="identityNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Identity Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Identity Number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-3">
                  <FormLabel>Identity Image</FormLabel>
                  <div className="mt-1 flex items-center justify-center border rounded-md h-48 w-full">
                    {imageIdentifier ? (
                      <Image
                        width={100}
                        height={100}
                        src={imageIdentifier}
                        alt="Identity document preview"
                        className="h-full object-cover rounded-md"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4 bg-gradient-to-r from-blue-200 to-blue-100 rounded-md h-full w-full">
                        <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm font-medium">
                          Drag & drop or click to upload
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, WEBP up to 5MB
                        </p>
                        <UploadButton
                          endpoint="imageUploader"
                          onClientUploadComplete={(res) => {
                            console.log(res[0].ufsUrl! as any);
                            setImageIdentifier(res[0].ufsUrl!);
                            // form.setValue("image", res[0].ufsUrl!);
                            toast.success("Image uploaded successfully!");
                          }}
                          onUploadError={(error: Error) => {
                            console.log(error.message);
                            toast.error(error.message);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Data */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <div className="mr-2">📋</div>
                <h2 className="text-lg font-medium">Additional Data</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enter your age</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Age"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center mb-4">
                <div className="mr-2">🔐</div>
                <h2 className="text-lg font-medium">Account Info</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <div className="flex items-center bg-gray-100 border rounded-l-md px-3">
                            <span className="text-sm">MAR +212</span>
                          </div>
                          <Input
                            type="tel"
                            className="rounded-l-none"
                            placeholder="Phone number"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Ex: 8+ Character"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Ex: 8+ Character"
                            {...field}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }>
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/deliverymen")}>
              Reset
            </Button>
            <Button
              type="submit"
              disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
