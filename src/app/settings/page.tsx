"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Moon, Sun, User, Bell, Lock, LogOut } from "lucide-react";

export default function SettingsPage() {
  const { user, userData, logout } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("account");

  useEffect(() => {
    if (!user) {
      router.push("/sign-in");
    }
  }, [user, router]);

  if (!user || !userData) {
    return null; // Will redirect in useEffect
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid grid-cols-4 gap-4 w-full max-w-lg">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Sun className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Update your account details and profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={userData.photoURL || ""} />
                  <AvatarFallback>
                    {userData.displayName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="font-medium text-lg">{userData.displayName}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <Button size="sm" variant="outline" className="mt-2">
                    Change Profile Photo
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      defaultValue={userData.displayName || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      defaultValue={user.email || ""}
                      disabled
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself"
                    defaultValue={userData.bio || ""}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the website looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Theme</Label>
                    <p className="text-sm text-gray-500">
                      Choose between light and dark theme
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sun className="h-5 w-5 text-gray-500" />
                    <Switch
                      checked={theme === "dark"}
                      onCheckedChange={(checked) =>
                        setTheme(checked ? "dark" : "light")
                      }
                    />
                    <Moon className="h-5 w-5 text-gray-500" />
                  </div>
                </div>

                <div className="border-t pt-3 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Color Scheme</Label>
                      <p className="text-sm text-gray-500">
                        Select your preferred accent color
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="h-8 w-8 rounded-full bg-blue-500 p-0"
                        variant="outline"
                      />
                      <Button
                        className="h-8 w-8 rounded-full bg-green-500 p-0"
                        variant="outline"
                      />
                      <Button
                        className="h-8 w-8 rounded-full bg-purple-500 p-0"
                        variant="outline"
                      />
                      <Button
                        className="h-8 w-8 rounded-full bg-red-500 p-0"
                        variant="outline"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose what type of notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col">
                    <Label
                      className="flex items-center gap-2"
                      htmlFor="email-notifications"
                    >
                      Email Notifications
                    </Label>
                    <p className="text-sm text-gray-500">
                      Receive emails about your account activity
                    </p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col">
                    <Label
                      className="flex items-center gap-2"
                      htmlFor="message-notifications"
                    >
                      New Message Notifications
                    </Label>
                    <p className="text-sm text-gray-500">
                      Receive notifications when someone sends you a message
                    </p>
                  </div>
                  <Switch id="message-notifications" defaultChecked />
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <div className="flex flex-col">
                    <Label
                      className="flex items-center gap-2"
                      htmlFor="booking-notifications"
                    >
                      Booking Updates
                    </Label>
                    <p className="text-sm text-gray-500">
                      Notifications about your bookings and reservations
                    </p>
                  </div>
                  <Switch id="booking-notifications" defaultChecked />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and privacy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Button variant="outline" className="w-full sm:w-auto">
                  Change Password
                </Button>

                <div className="border-t pt-4 mt-2">
                  <h3 className="text-lg font-medium mb-3">Privacy</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="public-profile" defaultChecked />
                      <Label htmlFor="public-profile">
                        Make my profile visible to other users
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="show-activity" />
                      <Label htmlFor="show-activity">
                        Show my activity status
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full sm:w-auto"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
              <Button variant="destructive" className="w-full sm:w-auto">
                Delete Account
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
