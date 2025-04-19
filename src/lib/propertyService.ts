"use client";

import { db } from "./firebase";
import { Property, PropertyFilter, Category, Experience } from "./models";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase/firestore";

const PROPERTIES_COLLECTION = "properties";

// Get a single property by ID
export const getProperty = async (id: string): Promise<Property | null> => {
  try {
    const propertyDoc = await getDoc(doc(db, PROPERTIES_COLLECTION, id));

    if (!propertyDoc.exists()) {
      return null;
    }

    return {
      id: propertyDoc.id,
      ...propertyDoc.data(),
    } as Property;
  } catch (error) {
    console.error("Error getting property:", error);
    throw error;
  }
};

// Get all properties with optional filtering
export const getProperties = async (
  filters?: PropertyFilter,
  lastVisible?: QueryDocumentSnapshot<DocumentData>,
  pageSize: number = 10
): Promise<{
  properties: Property[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
}> => {
  try {
    const collectionRef = collection(db, PROPERTIES_COLLECTION);
    let queryRef = query(collectionRef);

    // Build query based on filters
    const constraints = [];

    if (filters) {
      if (filters.minPrice !== undefined) {
        constraints.push(where("price", ">=", filters.minPrice));
      }

      if (filters.maxPrice !== undefined) {
        constraints.push(where("price", "<=", filters.maxPrice));
      }

      if (filters.bedrooms !== undefined) {
        constraints.push(where("bedrooms", ">=", filters.bedrooms));
      }

      if (filters.bathrooms !== undefined) {
        constraints.push(where("bathrooms", ">=", filters.bathrooms));
      }

      if (filters.propertyType) {
        constraints.push(where("propertyType", "==", filters.propertyType));
      }

      // Location queries are more complex and might require a more sophisticated approach
      // This is a simplified version
      if (filters.location) {
        constraints.push(where("location.city", "==", filters.location));
      }
    }

    // Always filter for available properties by default
    constraints.push(where("status", "==", "available"));

    // Add ordering
    constraints.push(orderBy("createdAt", "desc"));

    // Add pagination
    constraints.push(limit(pageSize));

    if (lastVisible) {
      constraints.push(startAfter(lastVisible));
    }

    // FOR DEBUGGING: Log the constraints being applied
    console.log("Applying query constraints:", constraints);

    queryRef = query(queryRef, ...constraints);
    const querySnapshot = await getDocs(queryRef);
    let properties: Property[] = [];
    let newLastVisible = null;

    if (!querySnapshot.empty) {
      properties = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Property)
      );

      // Client-side filtering for searchTerm if provided
      if (filters?.searchTerm) {
        const searchTermLower = filters.searchTerm.toLowerCase();
        properties = properties.filter(
          (property) =>
            property.title.toLowerCase().includes(searchTermLower) ||
            property.description.toLowerCase().includes(searchTermLower) ||
            property.location.toLowerCase().includes(searchTermLower)
        );
      }

      // Get the last document for pagination
      newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
    }

    // FOR DEBUGGING: Log the number of properties found
    console.log(`Found ${properties.length} properties`);

    return { properties, lastVisible: newLastVisible };
  } catch (error) {
    console.error("Error getting properties:", error);
    throw error;
  }
};

// TEMPORARY: Debug function to add a test property
export const addTestProperty = async () => {
  try {
    const testProperty = {
      title: "Test Property",
      description: "This is a test property for debugging",
      location: "Test City",
      price: 500,
      priceType: "night",
      images: ["https://via.placeholder.com/800x600"],
      bedrooms: 2,
      bathrooms: 1,
      guests: 4,
      amenities: ["WiFi", "AC"],
      ownerId: "test-owner-id",
      ownerName: "Test Owner",
      ownerImage: "https://via.placeholder.com/100x100",
      featured: true,
      rating: 4.5,
      reviewCount: 10,
      latitude: 40.7128,
      longitude: -74.006,
      type: "Apartment",
      status: "available",
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, PROPERTIES_COLLECTION),
      testProperty
    );

    console.log("Test property added with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding test property:", error);
    throw error;
  }
};

// Get featured properties
export const getFeaturedProperties = async (): Promise<Property[]> => {
  try {
    const q = query(
      collection(db, "properties"),
      where("featured", "==", true),
      limit(4)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Property;
    });
  } catch (error) {
    console.error("Error fetching featured properties:", error);
    return [];
  }
};

// Convert an image file to Base64 string
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error: ProgressEvent<FileReader>) => reject(error);
  });
};

// Optimize image size for Firestore storage
const optimizeImage = (file: File, maxWidth = 1200): Promise<File> => {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return resolve(file); // Return original if cannot optimize
    }

    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round(height * (maxWidth / width));
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw resized image to canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to JPEG format (can adjust quality as needed)
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file); // Return original if compression fails
            return;
          }

          // Create new file from blob
          const optimizedFile = new File([blob], file.name, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });

          resolve(optimizedFile);
        },
        "image/jpeg",
        0.7 // Adjust quality (0-1) to balance size and quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // Return original if optimization fails
    };

    img.src = url;
  });
};

// Upload a property image as Base64 string
export const uploadPropertyImage = async (
  file: File,
  propertyId?: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    // Track progress for UI consistency with previous implementation
    if (onProgress) onProgress(10);

    // Check file size - limit to 1MB for Base64 storage
    if (file.size > 1024 * 1024) {
      // Try to optimize the image first instead of rejecting immediately
      if (onProgress) onProgress(20);
      const optimizedFile = await optimizeImage(file);

      // If still too large after optimization, then reject
      if (optimizedFile.size > 1024 * 1024) {
        throw new Error(
          "File size exceeds 1MB limit even after optimization. Please use a smaller image."
        );
      }

      file = optimizedFile;
    }

    // Convert file to Base64
    if (onProgress) onProgress(50);
    const base64String = await convertToBase64(file);
    if (onProgress) onProgress(90);

    if (onProgress) onProgress(100);
    return base64String;
  } catch (error) {
    console.error("Error processing image:", error);
    throw error;
  }
};

// Delete a property image - since we're now storing images in Firestore
// as part of the property document, we don't need a separate delete function
// This is kept for API compatibility but doesn't need to do anything
export const deletePropertyImage = async (/* imageUrl */): Promise<void> => {
  // No need to actually delete anything since the image is stored in Firestore
  // and will be removed when the property document is updated
  return;
};

// Add a new property
export const addProperty = async (
  property: Omit<Property, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  try {
    const propertyData = {
      ...property,
      status: "available", // Ensure default status is set
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, PROPERTIES_COLLECTION),
      propertyData
    );

    return docRef.id;
  } catch (error) {
    console.error("Error adding property:", error);
    throw error;
  }
};

// Update an existing property
export const updateProperty = async (
  id: string,
  property: Partial<Property>
): Promise<void> => {
  try {
    const propertyRef = doc(db, PROPERTIES_COLLECTION, id);

    await updateDoc(propertyRef, {
      ...property,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating property:", error);
    throw error;
  }
};

// Delete a property
export const deleteProperty = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, PROPERTIES_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting property:", error);
    throw error;
  }
};

// Get properties by owner
export const getPropertiesByOwner = async (
  ownerId: string
): Promise<Property[]> => {
  try {
    const q = query(
      collection(db, PROPERTIES_COLLECTION),
      where("ownerId", "==", ownerId),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    const properties: Property[] = [];

    querySnapshot.forEach((doc) => {
      properties.push({ id: doc.id, ...doc.data() } as Property);
    });

    return properties;
  } catch (error) {
    console.error("Error getting owner properties:", error);
    throw error;
  }
};

export const getCategories = async (): Promise<Category[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "categories"));
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
      } as Category;
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};

export const getExperiences = async (): Promise<Experience[]> => {
  try {
    const q = query(
      collection(db, "experiences"),
      orderBy("createdAt", "desc"),
      limit(4)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Experience;
    });
  } catch (error) {
    console.error("Error fetching experiences:", error);
    return [];
  }
};
