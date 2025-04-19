"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { addProperty, uploadPropertyImage } from "@/lib/propertyService";
import { Property } from "@/lib/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Home, Plus, X, Upload, Loader2, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const propertyTypes = [
  "Apartment",
  "House",
  "Condo",
  "Villa",
  "Cabin",
  "Loft",
  "Studio",
  "Penthouse",
];

const availableAmenities = [
  "WiFi",
  "Air conditioning",
  "Kitchen",
  "Washer",
  "Dryer",
  "TV",
  "Pool",
  "Hot tub",
  "Free parking",
  "Gym",
  "Elevator",
  "Fireplace",
  "Balcony",
  "Garden",
  "Beach access",
  "Mountain view",
  "Lake access",
  "Breakfast included",
  "Pets allowed",
  "Smoking allowed",
];

// Form schema with validation
const formSchema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(100, "Title must not exceed 100 characters"),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(2000, "Description must not exceed 2000 characters"),
  price: z
    .number()
    .min(10, "Price must be at least $10")
    .max(10000, "Price must not exceed $10,000"),
  priceType: z.string().min(1, "Price type is required"),
  location: z.string().min(3, "Location is required"),
  bedrooms: z.number().min(1, "At least 1 bedroom is required"),
  bathrooms: z.number().min(1, "At least 1 bathroom is required"),
  area: z.number().min(1, "Area is required"),
  propertyType: z.string().min(1, "Property type is required"),
  amenities: z.array(z.string()).min(1, "At least one amenity is required"),
});

export default function AddPropertyPage() {
  const router = useRouter();
  const { user, userData } = useAuth();
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 100,
      priceType: "night",
      location: "",
      bedrooms: 1,
      bathrooms: 1,
      area: 500,
      propertyType: "",
      amenities: [],
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);

      // Check if any file exceeds the size limit (1MB)
      const oversizedFiles = selectedFiles.filter(
        (file) => file.size > 1024 * 1024
      );
      if (oversizedFiles.length > 0) {
        setError(
          `${oversizedFiles.length} file(s) exceed the 1MB size limit. Please compress your images before uploading.`
        );
        return;
      }

      if (images.length + selectedFiles.length > 10) {
        setError("You can upload a maximum of 10 images");
        return;
      }

      // Create preview URLs for display
      const newImageUrls = selectedFiles.map((file) =>
        URL.createObjectURL(file)
      );
      setImageUrls([...imageUrls, ...newImageUrls]);
      setImages([...images, ...selectedFiles]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    const newImageUrls = [...imageUrls];

    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newImageUrls[index]);

    newImages.splice(index, 1);
    newImageUrls.splice(index, 1);

    setImages(newImages);
    setImageUrls(newImageUrls);
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    if (images.length === 0) {
      setError("At least one image is required");
      return;
    }

    setError("");
    setLoading(true);
    setImageUploadProgress(0);

    try {
      // Upload images
      const uploadedImageUrls: string[] = [];

      // Upload one image at a time with progress tracking
      for (let i = 0; i < images.length; i++) {
        const imageUrl = await uploadPropertyImage(
          images[i],
          undefined,
          (progress) => {
            // Calculate overall progress: completed files + current file progress
            const overallProgress = Math.round(
              (i / images.length) * 100 + progress / images.length
            );
            setImageUploadProgress(overallProgress);
          }
        );
        uploadedImageUrls.push(imageUrl);
      }

      // Set to 100% after all uploads are done
      setImageUploadProgress(100);

      // Create property object
      const propertyData: Omit<Property, "id" | "createdAt" | "updatedAt"> = {
        ...data,
        images: uploadedImageUrls,
        hostName: userData?.displayName || "Host",
        hostImage: userData?.photoURL || "/images/default-avatar.jpg",
        ownerId: user.uid,
        ownerName: userData?.displayName || "Host",
        rating: 0,
        reviews: 0,
        reviewCount: 0,
        guests: data.bedrooms * 2, // Assuming 2 guests per bedroom
        featured: false,
        status: "available",
        type: data.propertyType || "Apartment",
        availability: {
          startDate: new Date().toISOString(),
          endDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ).toISOString(),
        },
      };

      // Add property to database
      const propertyId = await addProperty(propertyData);
      console.log("Property added with ID:", propertyId);

      setSuccess(true);
      setTimeout(() => {
        router.push("/my-properties");
      }, 2000);
    } catch (error: any) {
      console.error("Error adding property:", error);
      setError(error.message || "Failed to add property");
    } finally {
      setLoading(false);
    }
  };

  // Redirect to sign in if not logged in
  if (!user) {
    return (
      <div className="container max-w-5xl mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to sign in to list a property.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              onClick={() => router.push("/sign-in")}
              className="w-full sm:w-auto"
            >
              Sign In
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto px-4 py-10">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-2xl">List your property</CardTitle>
          <CardDescription>
            Fill in the details below to list your property on our platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success ? (
            <div className="bg-green-50 p-6 rounded-lg text-center">
              <div className="text-green-600 text-xl font-medium mb-2">
                Property Added Successfully!
              </div>
              <p className="text-green-700 mb-4">
                Your property has been added to our listings.
              </p>
              <Button onClick={() => router.push("/my-properties")}>
                View My Properties
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* Basic Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Basic Information</h3>
                    <p className="text-sm text-gray-600">
                      Provide essential details about your property.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Cozy two-bedroom apartment near the beach"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A catchy title helps your listing stand out.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your property, including special features and nearby attractions..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Detailed descriptions help guests know what to expect.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="propertyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a property type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {propertyTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Miami Beach, FL" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Property Details */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Property Details</h3>
                    <p className="text-sm text-gray-600">
                      Add specific details about your property.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bedrooms</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bathrooms</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              step={0.5}
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="area"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Area (sq ft)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Price Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Price Information</h3>
                    <p className="text-sm text-gray-600">
                      Set the pricing for your property.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                                $
                              </span>
                              <Input
                                type="number"
                                min={0}
                                className="pl-7"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select price type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="night">Per Night</SelectItem>
                              <SelectItem value="week">Per Week</SelectItem>
                              <SelectItem value="month">Per Month</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Amenities */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Amenities</h3>
                    <p className="text-sm text-gray-600">
                      Select the amenities available at your property.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="amenities"
                    render={({ field }) => (
                      <FormItem>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {availableAmenities.map((amenity) => (
                            <div
                              key={amenity}
                              className={`rounded-md border p-3 cursor-pointer ${
                                field.value.includes(amenity)
                                  ? "bg-primary/10 border-primary"
                                  : "hover:bg-gray-100"
                              }`}
                              onClick={() => {
                                if (field.value.includes(amenity)) {
                                  field.onChange(
                                    field.value.filter((a) => a !== amenity)
                                  );
                                } else {
                                  field.onChange([...field.value, amenity]);
                                }
                              }}
                            >
                              <div className="flex items-center space-x-2">
                                <div
                                  className={`w-5 h-5 rounded-full flex items-center justify-center ${
                                    field.value.includes(amenity)
                                      ? "bg-primary text-white"
                                      : "border"
                                  }`}
                                >
                                  {field.value.includes(amenity) && (
                                    <Check className="w-3 h-3" />
                                  )}
                                </div>
                                <span>{amenity}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Property Images */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Property Images</h3>
                    <p className="text-sm text-gray-600">
                      Upload high-quality images of your property. Maximum 10
                      images. Each image must be under 1MB.
                    </p>
                  </div>

                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    {images.length === 0 ? (
                      <div className="space-y-4">
                        <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <Upload className="w-6 h-6 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Drop your images here or browse
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Support JPG, PNG, GIF (Max 5MB per file)
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const input =
                              document.getElementById("image-upload");
                            if (input) input.click();
                          }}
                        >
                          Browse Files
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {imageUrls.map((url, index) => (
                            <div
                              key={index}
                              className="relative aspect-square rounded-md overflow-hidden group"
                            >
                              <Image
                                src={url}
                                alt={`Property image ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                              <button
                                type="button"
                                className="absolute top-2 right-2 bg-black bg-opacity-70 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeImage(index)}
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          {images.length < 10 && (
                            <button
                              type="button"
                              className="aspect-square rounded-md border-2 border-dashed flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-gray-700 hover:border-gray-300"
                              onClick={() => {
                                const input =
                                  document.getElementById("image-upload");
                                if (input) input.click();
                              }}
                            >
                              <Plus className="w-6 h-6" />
                              <span className="text-xs">Add More</span>
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {images.length}/10 images uploaded
                        </p>
                      </div>
                    )}
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t">
                  <Button
                    type="submit"
                    className="w-full sm:w-auto"
                    disabled={loading}
                  >
                    {loading && (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {imageUploadProgress < 100 ? (
                          <>Uploading images ({imageUploadProgress}%)</>
                        ) : (
                          <>Saving property...</>
                        )}
                      </>
                    )}
                    {!loading && "List My Property"}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
