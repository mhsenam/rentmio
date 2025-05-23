"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "@/components/ui/dialog";
import {
  User,
  Mail,
  Lock,
  CreditCard,
  Bell,
  Calendar,
  LogOut,
  Upload,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getInitials } from "@/lib/utils";

// Dummy booking data for demo purposes
const mockBookings = [
  {
    id: "1",
    propertyTitle: "Modern Apartment in Downtown",
    propertyImage: "/images/property1.jpg",
    checkIn: "2023-11-10",
    checkOut: "2023-11-15",
    totalPrice: 600,
    status: "upcoming",
  },
  {
    id: "2",
    propertyTitle: "Beachfront Villa with Pool",
    propertyImage: "/images/property2.jpg",
    checkIn: "2023-10-05",
    checkOut: "2023-10-10",
    totalPrice: 1250,
    status: "completed",
  },
  {
    id: "3",
    propertyTitle: "Mountain Cabin Retreat",
    propertyImage: "/images/property3.jpg",
    checkIn: "2023-09-15",
    checkOut: "2023-09-20",
    totalPrice: 750,
    status: "cancelled",
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, userData, logout, updateUserProfile } = useAuth();
  const [name, setName] = useState(userData?.displayName || "");
  const [email, setEmail] = useState(userData?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState(
    userData?.photoURL || ""
  );
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Use the new updateUserProfile function
      await updateUserProfile({ displayName: name });
      setSuccess("Profile updated successfully!");
    } catch (error: any) {
      setError(
        error.message || "An error occurred while updating your profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // In a real app, this would update the user's password in Firebase
      // Simulating success for demo
      setTimeout(() => {
        setSuccess("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setLoading(false);
      }, 1000);
    } catch (error: any) {
      setError(
        error.message || "An error occurred while updating your password"
      );
      setLoading(false);
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);

      // Revoke the old object URL if it exists and is a blob URL
      if (profileImageUrl && profileImageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(profileImageUrl);
      }
      setProfileImageUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadProfileImage = async () => {
    if (!profileImage) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Use the new updateUserProfile function to upload the photo
      await updateUserProfile({ photoFile: profileImage });
      setSuccess("Profile image updated successfully!");
    } catch (error: any) {
      setError(
        error.message || "An error occurred while uploading your profile image"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error: any) {
      setError(error.message || "Failed to log out");
    }
  };

  // Redirect to sign in if not logged in
  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You need to sign in to view your profile.
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
    <div className="container max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex flex-col items-center space-y-4 py-4">
                <div className="relative">
                  {profileImageUrl ? (
                    <div className="relative h-24 w-24 overflow-hidden rounded-full">
                      <Image
                        src={profileImageUrl}
                        alt={userData?.displayName || "User"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-semibold text-primary">
                      {getInitials(userData?.displayName || "")}
                    </div>
                  )}
                  <Dialog>
                    <DialogTrigger asChild>
                      {/* Changed to standard Button component */}
                      <Button variant="outline" size="icon" className="absolute bottom-0 right-0 rounded-full h-7 w-7">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update Profile Picture</DialogTitle>
                        <DialogDescription>
                          Upload a new profile picture.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="flex justify-center">
                          {profileImageUrl ? (
                            <div className="relative h-32 w-32 overflow-hidden rounded-full">
                              <Image
                                src={profileImageUrl}
                                alt="Profile preview"
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-semibold text-primary">
                              {getInitials(userData?.displayName || "")}
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="profile-image">Upload Image</Label>
                          <Input
                            id="profile-image"
                            type="file"
                            accept="image/*"
                            onChange={handleProfileImageChange}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={handleUploadProfileImage}
                          disabled={!profileImage || loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            "Upload"
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="text-center">
                  <h3 className="font-medium">{userData?.displayName}</h3>
                  <p className="text-sm text-gray-500">{userData?.email}</p>
                </div>
              </div>
              <div className="border-t pt-4 mt-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="mb-6 w-full justify-start">
              <TabsTrigger value="account">
                <User className="h-4 w-4 mr-2" />
                Account
              </TabsTrigger>
              <TabsTrigger value="security">
                <Lock className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="bookings">
                <Calendar className="h-4 w-4 mr-2" />
                Bookings
              </TabsTrigger>
            </TabsList>

            {/* Account Tab */}
            <TabsContent value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Update your personal information.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert variant="destructive" className="mb-6">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {success && (
                    <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="display-name">Full Name</Label>
                      <Input
                        id="display-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled
                      />
                      <p className="text-xs text-gray-500">
                        Email cannot be changed.
                      </p>
                    </div>
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Password & Security</CardTitle>
                  <CardDescription>
                    Update your password and security settings.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert variant="destructive" className="mb-6">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  {success && (
                    <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}
                  <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Account Notifications</CardTitle>
                  <CardDescription>
                    Manage your email preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="h-4 w-4" />
                        <span>Booking confirmations</span>
                      </div>
                      <input
                        type="checkbox"
                        className="toggle"
                        defaultChecked
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="h-4 w-4" />
                        <span>Booking reminders</span>
                      </div>
                      <input
                        type="checkbox"
                        className="toggle"
                        defaultChecked
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="h-4 w-4" />
                        <span>Marketing emails</span>
                      </div>
                      <input type="checkbox" className="toggle" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings">
              <Card>
                <CardHeader>
                  <CardTitle>Your Bookings</CardTitle>
                  <CardDescription>
                    View your upcoming and past bookings.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {mockBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        No bookings found
                      </h3>
                      <p className="text-gray-600">
                        You haven't made any bookings yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {mockBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg"
                        >
                          <div className="relative w-full sm:w-32 h-24 bg-gray-200 rounded-md overflow-hidden">
                            <Image
                              src={booking.propertyImage}
                              alt={booking.propertyTitle}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-medium">
                              {booking.propertyTitle}
                            </h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm">
                              <span>
                                Check-in:{" "}
                                {new Date(booking.checkIn).toLocaleDateString()}
                              </span>
                              <span>
                                Check-out:{" "}
                                {new Date(
                                  booking.checkOut
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex justify-between mt-2">
                              <span className="font-medium">
                                ${booking.totalPrice}
                              </span>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  booking.status === "upcoming"
                                    ? "bg-blue-100 text-blue-800"
                                    : booking.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {booking.status.charAt(0).toUpperCase() +
                                  booking.status.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/search")}
                  >
                    Browse Properties
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
