import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  limit,
  orderBy,
} from "firebase/firestore";

// Interface for categories
export interface Category {
  id: string;
  name: string;
  image: string;
  count: number;
}

// Interface for experiences
export interface Experience {
  id: string;
  title: string;
  image: string;
  price: number;
  rating: number;
  reviewCount: number;
  location: string;
}

/**
 * Fetches categories from Firestore
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const categoriesRef = collection(db, "categories");
    const snapshot = await getDocs(categoriesRef);

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "",
        image: data.image || "",
        count: data.count || 0,
      };
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

/**
 * Fetches experiences from Firestore
 */
export async function getExperiences(limitCount = 4): Promise<Experience[]> {
  try {
    const experiencesRef = collection(db, "experiences");
    const q = query(
      experiencesRef,
      orderBy("rating", "desc"),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "",
        image: data.image || "",
        price: data.price || 0,
        rating: data.rating || 0,
        reviewCount: data.reviewCount || 0,
        location: data.location || "",
      };
    });
  } catch (error) {
    console.error("Error fetching experiences:", error);
    return [];
  }
}
