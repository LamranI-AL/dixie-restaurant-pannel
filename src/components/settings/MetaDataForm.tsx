/** @format */

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { MetaData } from "@/lib/types";
// import { MetaData } from "@/types";

interface MetaDataFormProps {
  metadata: MetaData;
  onUpdate: (metadata: MetaData) => Promise<void>;
  isUpdating: boolean;
}

export default function MetaDataForm({
  metadata,
  onUpdate,
  isUpdating,
}: MetaDataFormProps) {
  const [localMetadata, setLocalMetadata] = useState<MetaData>(metadata);
  const [activeLanguage, setActiveLanguage] = useState<
    "default" | "english" | "bengali" | "arabic"
  >("default");

  const handleChange = (field: keyof MetaData["name"], value: string) => {
    setLocalMetadata((prev) => ({
      ...prev,
      // [language]: {
      //   // ...prev[language],
      //   [field]: value,
      // },
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLocalMetadata((prev) => ({
          ...prev,
          image: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    await onUpdate(localMetadata);
  };

  return (
    <Card className="bg-white border-gray-200 mb-6">
      <CardContent className="p-5">
        <div className="flex items-center mb-6">
          <Globe className="mr-2 h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-medium text-gray-800">
            Restaurant Meta Data
          </h2>
        </div>

        <Tabs
          value={activeLanguage}
          onValueChange={(value) =>
            setActiveLanguage(
              value as "default" | "english" | "bengali" | "arabic",
            )
          }
          className="mb-6">
          <TabsList className="w-full border-b border-gray-200 rounded-none bg-transparent mb-4">
            <TabsTrigger
              value="default"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              Default
            </TabsTrigger>
            <TabsTrigger
              value="english"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              English(EN)
            </TabsTrigger>
            <TabsTrigger
              value="bengali"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              Bengali - বাংলা(BN)
            </TabsTrigger>
            <TabsTrigger
              value="arabic"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              Arabic - عربي
            </TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="mb-4">
                <Label
                  htmlFor={`title-${activeLanguage}`}
                  className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Title (
                  {activeLanguage.charAt(0).toUpperCase() +
                    activeLanguage.slice(1)}
                  )
                </Label>
                {/* <Input
                  id={`title-${activeLanguage}`}
                  value={localMetadata[activeLanguage].title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="w-full"
                /> */}
              </div>

              <div>
                <Label
                  htmlFor={`description-${activeLanguage}`}
                  className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description (
                  {activeLanguage.charAt(0).toUpperCase() +
                    activeLanguage.slice(1)}
                  )
                </Label>
                {/* <Textarea
                  id={`description-${activeLanguage}`}
                  rows={4}
                  value={localMetadata[activeLanguage].description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="w-full"
                /> */}
              </div>
            </div>

            <div>
              <h3 className="text-center text-sm font-medium text-gray-700 mb-2">
                Restaurant Meta Image
              </h3>
              <p className="text-xs text-gray-500 text-center mb-2">
                Meta image(1:1)
              </p>
              <div className="flex justify-center mb-4">
                {localMetadata.image ? (
                  <img
                    src={localMetadata.image! ?? ""}
                    alt="Restaurant logo"
                    className="w-40 h-40 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-40 h-40 bg-red-600 flex items-center justify-center rounded-md">
                    <h2 className="text-white text-2xl font-bold text-center">
                      Hungry
                      <br />
                      PUPPETS
                    </h2>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-sm"
                />
                <Button
                  className="w-full"
                  onClick={handleSave}
                  disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
