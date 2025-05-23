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
import { getFunctions, httpsCallable } from "firebase/functions";
import { storage } from "./firebase"; // Import Firebase storage
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

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

// Get all properties with optional filtering OR search via Firebase Function
export const getProperties = async (
  filters?: PropertyFilter,
  lastVisible?: QueryDocumentSnapshot<DocumentData> | string, // Can now be string for function pagination
  pageSize: number = 10
): Promise<{
  properties: Property[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | string | null; // Can now be string
}> => {
  try {
    // If searchTerm is present, use the Firebase Function for search
    if (filters?.searchTerm && filters.searchTerm.trim() !== "") {
      const functions = getFunctions(); // Get Firebase Functions instance
      const searchPropertiesFn = httpsCallable(functions, 'searchProperties');

      // Prepare data for the function
      const functionData: { 
        searchTerm: string; 
        filters: Omit<PropertyFilter, 'searchTerm'>;
        pageSize: number;
        lastVisibleId?: string;
      } = {
        searchTerm: filters.searchTerm,
        filters: { ...filters, searchTerm: undefined }, // Pass other filters, remove searchTerm
        pageSize: pageSize,
      };

      if (typeof lastVisible === 'string') {
        functionData.lastVisibleId = lastVisible;
      }
      
      console.log("Calling searchProperties Firebase Function with data:", functionData);
      const result = await searchPropertiesFn(functionData);
      const data = result.data as { properties: Property[]; lastVisibleId: string | null };
      
      console.log("Received from Firebase Function:", data);
      // Ensure properties always have an id, even if coming from a function that might not structure it perfectly
      const propertiesWithId = data.properties.map(p => ({ ...p, id: p.id || 'unknown-id' }))  as Property[];
      return { properties: propertiesWithId, lastVisible: data.lastVisibleId };
    }

    // Original Firestore query logic if no searchTerm
    const collectionRef = collection(db, PROPERTIES_COLLECTION);
    let queryRef = query(collectionRef);
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
      if (filters.location) { 
        constraints.push(where("location.city", "==", filters.location));
      }
    }
    constraints.push(where("status", "==", "available"));
    constraints.push(orderBy("createdAt", "desc"));
    constraints.push(limit(pageSize));

    if (lastVisible && typeof lastVisible !== 'string' && lastVisible.id) { // Ensure it's a QueryDocumentSnapshot
      constraints.push(startAfter(lastVisible));
    }

    queryRef = query(queryRef, ...constraints);
    const querySnapshot = await getDocs(queryRef);
    let properties: Property[] = [];
    let newLastVisibleDoc: QueryDocumentSnapshot<DocumentData> | null = null;

    if (!querySnapshot.empty) {
      properties = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Property)
      );
      newLastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    }
    
    // FOR DEBUGGING: Log the number of properties found (direct Firestore query)
    console.log(`Found ${properties.length} properties via direct query`);

    return { properties, lastVisible: newLastVisibleDoc };

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

// New function to upload an image file to Firebase Storage
export const uploadImageToStorage = async (
  file: File,
  pathPrefix: string, // e.g., `property_images/${propertyId}` or `user_avatars/${userId}`
  fileName: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  if (!file) {
    throw new Error("No file provided for upload.");
  }
  // Basic client-side validation for image type (optional, can be enhanced)
  if (!file.type.startsWith("image/")) {
      throw new Error("File is not an image.");
  }
  // Basic client-side validation for image size (e.g., 5MB limit before server optimization)
  const MAX_SIZE_MB = 5;
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      throw new Error(`File size exceeds ${MAX_SIZE_MB}MB. Please upload a smaller image.`);
  }

  const storageRef = ref(storage, `${pathPrefix}/${fileName}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) {
          onProgress(Math.round(progress));
        }
        console.log("Upload is " + progress + "% done");
      },
      (error) => {
        console.error("Upload failed:", error);
        // Handle specific errors here if needed (e.g., permissions)
        switch (error.code) {
          case 'storage/unauthorized':
            reject(new Error("Permission denied. Check storage rules."));
            break;
          case 'storage/canceled':
            reject(new Error("Upload canceled."));
            break;
          default:
            reject(new Error("Image upload failed. Please try again."));
        }
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        } catch (error) {
          console.error("Failed to get download URL:", error);
          reject(new Error("Could not get image URL after upload."));
        }
      }
    );
  });
};


// Delete an image from Firebase Storage by URL
export const deleteImageFromStorage = async (imageUrl: string): Promise<void> => {
  if (!imageUrl.startsWith("https://firebasestorage.googleapis.com/")) {
    console.warn("Not a Firebase Storage URL, skipping delete:", imageUrl);
    return; // Not a Firebase Storage URL
  }
  try {
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
    console.log("Image deleted successfully from Firebase Storage:", imageUrl);
  } catch (error: any) {
    // It's okay if the object doesn't exist (e.g., already deleted)
    if (error.code === 'storage/object-not-found') {
      console.warn("Image not found in storage, may have already been deleted:", imageUrl);
    } else {
      console.error("Error deleting image from Firebase Storage:", error);
      throw error; // Re-throw other errors
    }
  }
};


// Add a new property (modified to handle File objects for images)
export const addProperty = async (
  propertyData: Omit<Property, "id" | "createdAt" | "updatedAt" | "images">,
  imageFiles: File[], // Expect File objects instead of Base64 strings
  onImageUploadProgress?: (progress: number, imageIndex: number) => void // For overall progress
): Promise<string> => {
  if (!imageFiles || imageFiles.length === 0) {
    throw new Error("At least one image is required to create a property.");
  }

  // 1. Create the property document in Firestore without image URLs first to get an ID.
  //    Or, generate a client-side ID if preferred, but server ID is safer for uniqueness.
  const tempPropertyData = {
    ...propertyData,
    images: [], // Initialize with empty array
    status: "pending_images", // Temporary status
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const propertyDocRef = await addDoc(
    collection(db, PROPERTIES_COLLECTION),
    tempPropertyData
  );
  const propertyId = propertyDocRef.id;

  // 2. Upload images to Firebase Storage
  const imageUrls: string[] = [];
  try {
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      // Generate a unique file name or use user's file name (ensure sanitization if so)
      const uniqueFileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const imageUrl = await uploadImageToStorage(
        file,
        `property_images/${propertyId}`,
        uniqueFileName,
        (progress) => {
          if (onImageUploadProgress) {
            // Calculate overall progress if needed or just pass individual
            const overallProgress = ((i + progress / 100) / imageFiles.length) * 100;
            onImageUploadProgress(Math.round(overallProgress), i);
          }
        }
      );
      imageUrls.push(imageUrl);
    }

    // 3. Update the property document with the image URLs and set status to available
    await updateDoc(propertyDocRef, {
      images: imageUrls,
      status: "available", // Set status to available after images are uploaded
      updatedAt: serverTimestamp(),
    });

    return propertyId;
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
