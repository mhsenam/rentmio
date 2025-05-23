"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Property } from "@/lib/models";
import { getProperty } from "@/lib/propertyService";
import { mockProperties } from "@/lib/data";
import { formatDate, formatCurrency } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { addDays, format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AirbnbCalendar } from "@/components/ui/airbnb-calendar";
import { GuestSelector } from "@/components/ui/guest-selector";
import {
  Bed,
  Bath,
  Home,
  Users,
  Check,
  Heart,
  Share,
  Star,
  Map,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from "lucide-react";
import { createConversation, Participant } from "@/lib/messageService";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const { user, userData } = useAuth();
  const router = useRouter();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 5),
  });
  const [guestCount, setGuestCount] = useState({
    adults: 1,
    children: 0,
    infants: 0,
    pets: 0,
  });
  const [initialMessage, setInitialMessage] = useState("");
  const [messageLoading, setMessageLoading] = useState(false);

  // Calculate total guests
  const totalGuests = guestCount.adults + guestCount.children;

  // Calculate number of nights and total price
  const nights =
    dateRange?.from && dateRange?.to
      ? Math.round(
          (dateRange.to.getTime() - dateRange.from.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  const totalPrice = property ? property.price * nights : 0;
  const serviceFee = Math.round(totalPrice * 0.12);
  const cleaningFee = 60;
  const grandTotal = totalPrice + serviceFee + cleaningFee;

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        // For development, use mock data
        const foundProperty = mockProperties.find((p) => p.id === id);
        if (foundProperty) {
          setProperty(foundProperty);
        } else {
          // In production, use Firebase
          // const propertyData = await getProperty(id as string);
          // setProperty(propertyData);
        }
      } catch (error) {
        console.error("Error fetching property:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  const nextImage = () => {
    if (property?.images) {
      setActiveImageIndex((prev) =>
        prev === property.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (property?.images) {
      setActiveImageIndex((prev) =>
        prev === 0 ? property.images.length - 1 : prev - 1
      );
    }
  };

  const handleContactHost = async () => {
    if (!user || !userData || !property) return;

    setMessageLoading(true);
    try {
      // Create participants array
      const participants: Participant[] = [
        {
          id: user.uid,
          displayName: userData.displayName || "User",
          photoURL: userData.photoURL || undefined,
        },
        {
          id: property.ownerId || "mock-owner-id", // For mock data
          displayName: property.hostName,
          photoURL: property.hostImage,
        },
      ];

      // Create a new conversation
      const conversationId = await createConversation(
        participants,
        id as string,
        property.title
      );

      // Redirect to messages page
      router.push(
        `/messages?conversation=${conversationId}&message=${encodeURIComponent(
          initialMessage
        )}`
      );
    } catch (error) {
      console.error("Error creating conversation:", error);
    } finally {
      setMessageLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-6">
            The property you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link href="/search">Back to Search</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Property Title and Actions */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          {property.title}
        </h1>
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center gap-2 mb-2 md:mb-0">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
              <span className="font-medium">{property.rating}</span>
              <span className="mx-1">·</span>
              <span className="text-gray-600 underline">
                {property.reviews} reviews
              </span>
            </div>
            <span className="mx-1">·</span>
            <span className="text-gray-600">{property.location}</span>
          </div>
          <div className="flex gap-2"> {/* Reduced gap slightly for ghost buttons */}
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <Share className="h-4 w-4" /> Share
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <Heart className="h-4 w-4" /> Save
            </Button>
          </div>
        </div>
      </div>

      {/* Property Images */}
      <div className="mb-8 relative">
        <div className="relative h-[300px] md:h-[450px] overflow-hidden rounded-lg">
          {property.images && property.images.length > 0 && (
            <>
              <Image
                src={property.images[activeImageIndex]}
                alt={property.title}
                fill
                className="object-cover"
              />
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </>
          )}
        </div>
        {/* Thumbnail navigation - for desktop */}
        {property.images && property.images.length > 1 && (
          <div className="hidden md:flex gap-2 mt-2">
            {property.images.map((image, index) => (
              <div
                key={index}
                className={`relative w-16 h-16 rounded-md cursor-pointer overflow-hidden ${
                  index === activeImageIndex ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setActiveImageIndex(index)}
              >
                <Image
                  src={image}
                  alt={`${property.title} - image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Property Details */}
        <div className="md:col-span-2">
          {/* Host Info */}
          <div className="mb-6 pb-6 border-b">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold mb-1">
                  Hosted by {property.hostName}
                </h2>
                <div className="text-gray-600">
                  {property.bedrooms} bedrooms • {property.bathrooms} bathrooms
                  • {property.area} sq ft
                </div>
              </div>
              <div className="relative h-14 w-14 overflow-hidden rounded-full">
                <Image
                  src={property.hostImage}
                  alt={property.hostName}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            {user && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="mt-4 flex items-center gap-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Contact Host
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Message to {property.hostName}</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <Textarea
                      value={initialMessage}
                      onChange={(e) => setInitialMessage(e.target.value)}
                      placeholder={`Hello ${property.hostName}, I'm interested in your property "${property.title}"...`}
                      className="min-h-[120px]"
                    />
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                      onClick={handleContactHost}
                      disabled={messageLoading}
                    >
                      {messageLoading ? (
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <MessageCircle className="h-4 w-4 mr-2" />
                      )}
                      Send Message
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Property Description */}
          <div className="mb-6 pb-6 border-b">
            <h2 className="text-xl font-bold mb-4">About this space</h2>
            <p className="text-gray-600 mb-4">{property.description}</p>
          </div>

          {/* Property Features */}
          <div className="mb-6 pb-6 border-b">
            <h2 className="text-xl font-bold mb-4">Property highlights</h2>
            {/* Adjusted grid for better mobile responsiveness */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Bed className="h-6 w-6 text-gray-600" />
                <div>
                  <p className="font-medium">{property.bedrooms} Bedrooms</p>
                  <p className="text-sm text-gray-600">
                    Sleeps {property.bedrooms * 2} guests
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Bath className="h-6 w-6 text-gray-600" />
                <div>
                  <p className="font-medium">{property.bathrooms} Bathrooms</p>
                  <p className="text-sm text-gray-600">
                    {property.bathrooms > 1
                      ? "Full bathrooms"
                      : "Full bathroom"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Home className="h-6 w-6 text-gray-600" />
                <div>
                  <p className="font-medium">{property.area} sq ft</p>
                  <p className="text-sm text-gray-600">Living space</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-gray-600" />
                <div>
                  <p className="font-medium">{property.propertyType}</p>
                  <p className="text-sm text-gray-600">Property type</p>
                </div>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="mb-6 pb-6 border-b">
            <h2 className="text-xl font-bold mb-4">Amenities</h2>
            {/* Adjusted grid for better mobile responsiveness */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {property.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Map Placeholder */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4">Location</h2>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center p-4">
                <Map className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                <p className="font-medium">{property.location}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Exact location provided after booking
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Card */}
        <div className="md:col-span-1">
          <Card className="sticky top-20 shadow-lg border-gray-200">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <span className="text-2xl font-bold">${property.price}</span>
                  <span className="text-gray-600">/{property.priceType}</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                  <span className="font-medium">{property.rating}</span>
                  <span className="mx-1 text-gray-600">·</span>
                  <span className="text-gray-600">
                    {property.reviews} reviews
                  </span>
                </div>
              </div>

              {/* Date Range Picker */}
              <div className="mb-6 border rounded-lg overflow-hidden">
                <div className="grid grid-cols-2 divide-x">
                  <div className="p-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      CHECK-IN
                    </label>
                    <div className="text-sm">
                      {dateRange?.from
                        ? format(dateRange.from, "MMM d, yyyy")
                        : "Add date"}
                    </div>
                  </div>
                  <div className="p-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      CHECKOUT
                    </label>
                    <div className="text-sm">
                      {dateRange?.to
                        ? format(dateRange.to, "MMM d, yyyy")
                        : "Add date"}
                    </div>
                  </div>
                </div>

                {/* Calendar Component */}
                <AirbnbCalendar
                  value={dateRange}
                  onChange={setDateRange}
                  className="border-t"
                />
              </div>

              {/* Guest Selector */}
              <div className="mb-6 border rounded-lg overflow-hidden">
                <div className="p-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    GUESTS
                  </label>
                  <GuestSelector />
                </div>
              </div>

              {/* Booking Button */}
              <Button className="w-full mb-4">
                {user ? "Reserve Now" : "Sign in to Book"}
              </Button>

              {/* Price Details */}
              {nights > 0 && (
                <div className="border-t pt-4 mt-2">
                  <h3 className="font-bold mb-3">Price details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>
                        ${property.price} x {nights} nights
                      </span>
                      <span>${totalPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Cleaning fee</span>
                      <span>${cleaningFee}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Service fee</span>
                      <span>${serviceFee}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-3 border-t mt-3">
                      <span>Total</span>
                      <span>${grandTotal}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
