"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Property } from "@/lib/models";
import { getPropertiesByOwner, deleteProperty } from "@/lib/propertyService";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Home,
  MoreVertical,
  Edit,
  Trash,
  Eye,
  Calendar,
  Plus,
  Star,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function MyPropertiesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [propertyToDelete, setPropertyToDelete] = useState<Property | null>(
    null
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    const fetchProperties = async () => {
      setLoading(true);
      try {
        // Use real user properties from Firestore
        const userProperties = await getPropertiesByOwner(user.uid);
        setProperties(userProperties);
      } catch (error: any) {
        console.error("Error fetching properties:", error);
        setError(error.message || "Failed to load properties");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [user, router]);

  const handleDelete = async () => {
    if (!propertyToDelete) return;

    setDeleteLoading(true);
    try {
      // Use the actual delete function
      await deleteProperty(propertyToDelete.id);

      // Remove from local state
      setProperties(properties.filter((p) => p.id !== propertyToDelete.id));
      setPropertyToDelete(null);
    } catch (error: any) {
      console.error("Error deleting property:", error);
      setError(error.message || "Failed to delete property");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter properties based on active tab
  const filteredProperties = properties.filter((property) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return property.status === "available";
    if (activeTab === "booked") return property.status === "booked";
    return true;
  });

  // If user is not authenticated, show sign-in prompt
  if (!user) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to sign in to view your properties.
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
          <h1 className="text-2xl font-bold">My Properties</h1>
          <p className="text-gray-600">
            Manage your listed properties and view booking status.
          </p>
        </div>
        <Button asChild>
          <Link href="/properties/add">
            <Plus className="h-4 w-4 mr-2" />
            Add New Property
          </Link>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="all" onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Properties</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="booked">Booked</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p>Loading your properties...</p>
            </div>
          ) : filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <Card key={property.id} className="group overflow-hidden">
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      src={property.images[0]}
                      alt={property.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    {property.featured && (
                      <div className="absolute left-3 top-3 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                        Featured
                      </div>
                    )}
                    <div className="absolute right-3 top-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="bg-black bg-opacity-60 text-white hover:bg-black hover:bg-opacity-70"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(`/properties/${property.id}`)
                            }
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Listing
                          </DropdownMenuItem>
                          {/* <DropdownMenuItem
                            onClick={() =>
                              router.push(`/properties/${property.id}/edit`)
                            }
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Property
                          </DropdownMenuItem> */}
                          {/* <DropdownMenuItem
                            onClick={() =>
                              router.push(`/properties/${property.id}/bookings`)
                            }
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            View Bookings
                          </DropdownMenuItem> */}
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => setPropertyToDelete(property)}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete Property
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold line-clamp-1">
                        {property.title}
                      </h3>
                      <div className="flex items-center text-sm">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                        <span>{property.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {property.location}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold">${property.price}</span>
                      <span className="text-sm text-gray-500">
                        per {property.priceType}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between border-t mt-2">
                    <div className="text-sm">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs ${
                          property.status === "available"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {property.status === "available" ? "Active" : "Booked"}
                      </span>
                    </div>
                    {/* <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(`/properties/${property.id}/edit`)
                      }
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Manage
                    </Button> */}
                    {/* Placeholder for a valid action, or remove if no other direct action */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => router.push(`/properties/${property.id}`)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No properties found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {activeTab === "all"
                  ? "You haven't listed any properties yet."
                  : activeTab === "active"
                  ? "You don't have any active properties."
                  : "You don't have any booked properties."}
              </p>
              <Button asChild>
                <Link href="/properties/add">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Property
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!propertyToDelete}
        onOpenChange={(open) => !open && setPropertyToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{propertyToDelete?.title}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPropertyToDelete(null)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
