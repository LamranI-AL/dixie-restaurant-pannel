/** @format */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ImagePlus, User } from "lucide-react";
import { Employee } from "@/lib/types";
import Image from "next/image";
// import { Employee } from "@/types";

const phoneRegex = /^\+?[1-9]\d{1,14}$/;

const employeeSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z.string().regex(phoneRegex, "Invalid phone number format"),
  email: z.string().email("Invalid email format"),
  role: z.string().min(1, "Role is required"),
  image: z.any().optional(),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (values: EmployeeFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export default function EmployeeForm({
  employee,
  onSubmit,
  isSubmitting,
}: EmployeeFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(
    employee?.image || null,
  );
  const { toast } = useToast();

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: employee?.name || "",
      lastName: employee?.name || "",
      phone: employee?.phone || "",
      email: employee?.email || "",
      role: employee?.role || "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Image too large",
          description: "Image size should be less than 2MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue("image", file);
    }
  };

  const handleSubmit = async (values: EmployeeFormValues) => {
    try {
      await onSubmit(values);
      if (!employee) {
        form.reset();
        setImagePreview(null);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const roles = [
    { id: "manager", name: "Manager" },
    { id: "chef", name: "Chef" },
    { id: "waiter", name: "Waiter" },
    { id: "delivery", name: "Delivery Staff" },
    { id: "cashier", name: "Cashier" },
  ];

  return (
    <Card className="bg-white">
      <CardContent className="pt-6">
        <h3 className="flex items-center mb-6 text-lg font-medium text-gray-800">
          <User className="mr-2 h-5 w-5 text-gray-600" />
          General Information
        </h3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: John"
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
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Doe"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <div className="flex items-center px-3 py-2 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                            <span className="text-sm">+1</span>
                          </div>
                          <Input
                            className="rounded-l-none"
                            {...field}
                            placeholder="555-123-4567"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="example@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem
                              key={role.id}
                              value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Employee image Ratio (1:1)
                </p>
                <div className="border border-gray-200 rounded-md p-4 bg-gray-50 flex items-center justify-center h-44 mb-4">
                  {imagePreview ? (
                    <Image
                      width={96}
                      height={96}
                      src={imagePreview}
                      alt="Employee preview"
                      className="h-24 w-24 object-cover rounded-md"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-200 rounded-md flex items-center justify-center">
                      <ImagePlus className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  Employee image size max 2 MB*
                </p>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="text-sm"
                    />
                  </div>
                  <Button
                    variant="secondary"
                    size="sm">
                    Browse
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                type="button">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Employee"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
