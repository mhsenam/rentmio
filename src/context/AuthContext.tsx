"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
} from "firebase/auth";
import { auth, db, storage } from "@/lib/firebase";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";

interface AuthProviderProps {
  children: ReactNode;
}

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt?: any;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  initializing: boolean;
  error: string | null;
  signUp: (email: string, password: string, name: string) => Promise<UserData>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: {
    displayName?: string;
    photoFile?: File;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  initializing: true,
  error: null,
  signUp: () => Promise.resolve({} as UserData),
  signIn: () => Promise.resolve(),
  signInWithGoogle: () => Promise.resolve({} as UserCredential),
  logout: () => Promise.resolve(),
  resetPassword: () => Promise.resolve(),
  updateUserProfile: () => Promise.resolve(),
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [initializing, setInitializing] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check for persisted login state to prevent UI flicker
  useEffect(() => {
    // Check localStorage to see if we have a cached login state
    const cachedUser = localStorage.getItem("authUser");
    if (cachedUser) {
      try {
        // We just need to know there's likely a user - full data will load from Firebase
        setInitializing(true);
      } catch (e) {
        // Invalid stored data, clear it
        localStorage.removeItem("authUser");
      }
    } else {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        // Set user immediately
        setUser(user);
        let fetchedUserData: UserData | null = null;

        if (user) {
          localStorage.setItem(
            "authUser",
            JSON.stringify({
              uid: user.uid,
              email: user.email,
            })
          );

          // Fetch additional user data from Firestore
          setLoading(true); // Indicate loading user data
          try {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
              fetchedUserData = userDoc.data() as UserData;
            } else {
              // User exists in Auth, but not Firestore? Create doc.
              console.log(
                `Creating Firestore document for new user: ${user.uid}`
              );
              fetchedUserData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                createdAt: serverTimestamp(),
              };
              await setDoc(userDocRef, fetchedUserData);
            }
          } catch (error) {
            console.error(
              "Error fetching/creating user data in Firestore:",
              error
            );
            setError("Failed to load user profile data.");
            fetchedUserData = null; // Ensure userData is null if fetch fails
          } finally {
            // This block ensures state is updated regardless of Firestore success/failure
            setUserData(fetchedUserData);
            // Set loading/initializing false *after* attempting fetch
            setLoading(false);
            setInitializing(false);
          }
        } else {
          // No user logged in
          setUserData(null);
          localStorage.removeItem("authUser");
          setLoading(false);
          setInitializing(false);
        }

        // setLoading(false); // Moved inside the blocks above
        // setInitializing(false); // Moved inside the blocks above
      },
      (error) => {
        // This handles errors directly from onAuthStateChanged itself
        console.error("Auth state changed error:", error);
        setError(error.message);
        setUser(null);
        setUserData(null);
        localStorage.removeItem("authUser");
        setLoading(false);
        setInitializing(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Sign up a new user
  const signUp = async (
    email: string,
    password: string,
    name: string
  ): Promise<UserData> => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Update profile
    await updateProfile(user, {
      displayName: name,
    });

    // Create user document in Firestore
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: name,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, "users", user.uid), userData);
    return userData;
  };

  // Sign in existing user
  const signIn = async (email: string, password: string) => {
    setError(null); // Clear previous errors
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle setting user, userData, and loading/initializing state
    } catch (error: any) {
      console.error("Sign in failed:", error);
      setError(error.message); // Set error state in context
      setLoading(false);
      setInitializing(false); // Ensure loading flags are reset on error
      throw error; // Re-throw error so calling component can handle it if needed
    }
  };

  // Add a network connectivity test function
  const checkNetworkConnectivity = async (): Promise<boolean> => {
    try {
      // Try a fast network request to check connectivity
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      // Use a reliable external service for connectivity check
      const response = await fetch("https://www.google.com/generate_204", {
        method: "HEAD",
        mode: "no-cors",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return true;
    } catch (error) {
      return false;
    }
  };

  // Sign in with Google with refined error handling
  const signInWithGoogle = async (): Promise<UserCredential> => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      // No need for manual retries, Firebase handles some internally.
      // Let onAuthStateChanged handle the state updates on success.
      const userCredential = await signInWithPopup(auth, provider);
      // setLoading/setInitializing will be handled by onAuthStateChanged
      return userCredential;
    } catch (error: any) {
      console.error("Google sign-in failed:", error);
      setError(error.message); // Set error state in context
      setLoading(false);
      setInitializing(false); // Ensure loading flags are reset on error
      throw error; // Re-throw error for the calling component
    }
  };

  // Log out
  const logout = async (): Promise<void> => {
    setError(null);
    try {
      await signOut(auth);
      router.push("/");
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email: string): Promise<void> => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (data: {
    displayName?: string;
    photoFile?: File;
  }): Promise<void> => {
    setError(null);
    if (!user) throw new Error("No user logged in");

    try {
      const updates: { displayName?: string; photoURL?: string } = {};

      // Update display name if provided
      if (data.displayName) {
        updates.displayName = data.displayName;
      }

      // Upload photo if provided
      if (data.photoFile) {
        const fileRef = ref(
          storage,
          `users/${user.uid}/profile/${Date.now()}-${data.photoFile.name}`
        );
        await uploadBytes(fileRef, data.photoFile);
        const photoURL = await getDownloadURL(fileRef);
        updates.photoURL = photoURL;
      }

      // Update Firebase Auth profile
      await updateProfile(user, updates);

      // Update Firestore user document
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, updates);

      // Update local state
      setUserData((prev) => (prev ? { ...prev, ...updates } : null));

      console.log("Profile updated successfully");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setError(error.message);
      throw error;
    }
  };

  const value = {
    user,
    userData,
    loading,
    initializing,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
