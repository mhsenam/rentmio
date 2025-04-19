"use client";

import { db } from "./firebase";
import { Property } from "./models";
import { getProperty } from "./propertyService";
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

const FAVORITES_COLLECTION = "favorites";

// Add a property to user's favorites
export const addFavorite = async (
  userId: string,
  propertyId: string
): Promise<string> => {
  try {
    const favoriteData = {
      userId,
      propertyId,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, FAVORITES_COLLECTION),
      favoriteData
    );
    return docRef.id;
  } catch (error) {
    console.error("Error adding favorite:", error);
    throw error;
  }
};

// Remove a property from user's favorites
export const removeFavorite = async (
  userId: string,
  propertyId: string
): Promise<void> => {
  try {
    const favoritesQuery = query(
      collection(db, FAVORITES_COLLECTION),
      where("userId", "==", userId),
      where("propertyId", "==", propertyId)
    );

    const snapshot = await getDocs(favoritesQuery);

    if (snapshot.empty) {
      throw new Error("Favorite not found");
    }

    // Should only be one match, but loop through just in case
    const deletePromises = snapshot.docs.map((docSnapshot) =>
      deleteDoc(doc(db, FAVORITES_COLLECTION, docSnapshot.id))
    );

    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error removing favorite:", error);
    throw error;
  }
};

// Check if a property is in user's favorites
export const isFavorite = async (
  userId: string,
  propertyId: string
): Promise<boolean> => {
  try {
    const favoritesQuery = query(
      collection(db, FAVORITES_COLLECTION),
      where("userId", "==", userId),
      where("propertyId", "==", propertyId)
    );

    const snapshot = await getDocs(favoritesQuery);
    return !snapshot.empty;
  } catch (error) {
    console.error("Error checking favorite status:", error);
    throw error;
  }
};

// Get all favorite properties for a user
export const getFavoriteProperties = async (
  userId: string
): Promise<Property[]> => {
  try {
    const favoritesQuery = query(
      collection(db, FAVORITES_COLLECTION),
      where("userId", "==", userId)
    );

    const snapshot = await getDocs(favoritesQuery);

    if (snapshot.empty) {
      return [];
    }

    // Get full property details for each favorite
    const favoritePropertiesPromises = snapshot.docs.map(
      async (docSnapshot) => {
        const propertyId = docSnapshot.data().propertyId;
        return getProperty(propertyId);
      }
    );

    const favoriteProperties = await Promise.all(favoritePropertiesPromises);

    // Filter out any nulls (properties that couldn't be fetched)
    return favoriteProperties.filter(
      (property): property is Property => property !== null
    );
  } catch (error) {
    console.error("Error getting favorite properties:", error);
    return [];
  }
};
