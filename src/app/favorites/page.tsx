"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Property } from "@/lib/models";
import { PropertyCard } from "@/components/ui/property-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, Heart, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getFavoriteProperties } from "@/lib/favoriteService";

export default function FavoritesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const fetchedFavorites = await getFavoriteProperties(user.uid);
        setFavorites(fetchedFavorites);
      } catch (error: any) {
        console.error("Error fetching favorites:", error);
        setError(error.message || "Failed to load favorites");
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, router]);

  const handleRemoveFavorite = async (propertyId: string) => {
    // In a real app, this would remove the property from the user's favorites in Firebase
    // For now, we'll just remove it from the state
    setFavorites(favorites.filter((property) => property.id !== propertyId));
  };

  // If user is not authenticated, show sign-in prompt
  if (!user) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to sign in to view your favorites.
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
    <div className="container max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Your Favorite Properties</h1>
          <p className="text-gray-600">
            View and manage your saved properties.
          </p>
        </div>
        <Button asChild>
          <Link href="/search">
            <Search className="h-4 w-4 mr-2" />
            Find More Properties
          </Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p>Loading your favorites...</p>
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((property) => (
            <div key={property.id} className="relative">
              <PropertyCard property={property} />
              <button
                className="absolute top-4 right-4 p-2 bg-white bg-opacity-80 rounded-full shadow hover:bg-opacity-100 transition-all z-10"
                onClick={() => handleRemoveFavorite(property.id)}
                aria-label="Remove from favorites"
              >
                <Heart className="h-5 w-5 text-red-600 fill-red-600" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            You haven't saved any properties as favorites yet. Browse properties
            and click the heart icon to add them to your favorites.
          </p>
          <Button asChild>
            <Link href="/search">
              <Search className="h-4 w-4 mr-2" />
              Browse Properties
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
