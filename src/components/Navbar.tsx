"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Home,
  Search,
  Plus,
  LogIn,
  LogOut,
  User,
  Menu,
  Heart,
  MessageSquare,
  Settings,
  HelpCircle,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Navbar() {
  const { user, userData, logout, loading, initializing } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // Get user's initials for avatar fallback
  const getInitials = () => {
    if (!userData?.displayName) return "U";
    return userData.displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Temporary state while checking auth
  const isInitializing = initializing;
  const isAuthenticated = !!user;

  // Debug authentication once on mount
  useEffect(() => {
    console.log("Auth state:", {
      user: !!user,
      userData: !!userData,
      isAuthenticated,
      isInitializing,
    });
  }, [user, userData, isAuthenticated, isInitializing]);

  // Override scroll lock behavior for dropdown
  useEffect(() => {
    // This class will be added to prevent scroll lock
    document.documentElement.classList.add("no-modal-lock");

    return () => {
      document.documentElement.classList.remove("no-modal-lock");
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-background border-b shadow-sm"> {/* Changed bg-white to bg-background */}
      {/* Desktop Navigation - Hidden on mobile */}
      <div className="hidden md:flex h-16 items-center justify-between px-4">
        <Link href="/" className="font-bold text-xl text-primary">
          RentMe
        </Link>

        {/* Desktop Center Nav */}
        <nav className="flex items-center space-x-6">
          <Link
            href="/"
            className={`text-sm font-medium ${
              pathname === "/"
                ? "text-primary"
                : "text-gray-600 hover:text-primary"
            }`}
          >
            Home
          </Link>
          <Link
            href="/search"
            className={`text-sm font-medium ${
              pathname === "/search"
                ? "text-primary"
                : "text-gray-600 hover:text-primary"
            }`}
          >
            Find Properties
          </Link>
          {isAuthenticated && (
            <Link
              href="/properties/add"
              className={`text-sm font-medium ${
                pathname === "/properties/add"
                  ? "text-primary"
                  : "text-gray-600 hover:text-primary"
              }`}
            >
              List Property
            </Link>
          )}
          <Link
            href="/about"
            className={`text-sm font-medium ${
              pathname === "/about"
                ? "text-primary"
                : "text-gray-600 hover:text-primary"
            }`}
          >
            About
          </Link>
        </nav>

        {/* Desktop Right Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isInitializing ? (
            // Show a subtle loading state instead of flickering buttons
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full opacity-50 cursor-wait"
            >
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
            </Button>
          ) : isAuthenticated ? (
            <>
              {/* Debug info - remove when fixed */}
              <div className="hidden">{`User: ${user?.uid}, Auth: ${isAuthenticated}`}</div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full relative"
                    onClick={() => {
                      console.log("Avatar clicked - desktop");
                    }}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={userData?.photoURL || undefined}
                        alt={userData?.displayName || "User"}
                      />
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                    {/* Keep the green indicator dot */}
                    <span className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-3 h-3 border-2 border-white"></span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 z-[100]"
                  sideOffset={8}
                >
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => router.push("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => router.push("/my-properties")}
                    >
                      <Home className="mr-2 h-4 w-4" />
                      <span>My Properties</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/favorites")}>
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Favorites</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/messages")}>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>Messages</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                {/* <DropdownMenuItem onClick={() => router.push("/help")}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help & Support</span>
                </DropdownMenuItem> */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center justify-between h-14 px-4">
        <Link href="/" className="font-bold text-lg text-primary">
          RentMe
        </Link>

        {isInitializing ? (
          // Show a subtle loading state for mobile too
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full opacity-50 cursor-wait"
          >
            <div className="h-5 w-5 rounded-full bg-gray-200 animate-pulse" />
          </Button>
        ) : (
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="px-0">
              <SheetHeader className="px-4">
                <SheetTitle className="text-left">Menu</SheetTitle>
              </SheetHeader>

              {isAuthenticated ? (
                <div className="flex items-center gap-3 mb-4 px-4 py-3 border-b">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={userData?.photoURL || undefined}
                      alt={userData?.displayName || "User"}
                    />
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{userData?.displayName}</span>
                    <span className="text-xs text-gray-500">
                      {userData?.email}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2 px-4 mb-4 pb-4 border-b">
                  <Button asChild>
                    <Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>
                      Sign in
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/sign-up" onClick={() => setIsMenuOpen(false)}>
                      Sign up
                    </Link>
                  </Button>
                </div>
              )}

              <nav className="space-y-1">
                <div className="px-4 py-3">
                  <ThemeToggle />
                </div>
                <Link
                  href="/"
                  className={`flex items-center px-4 py-3 text-sm ${
                    pathname === "/"
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Home className="mr-3 h-4 w-4" />
                  Home
                </Link>
                <Link
                  href="/search"
                  className={`flex items-center px-4 py-3 text-sm ${
                    pathname === "/search"
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Search className="mr-3 h-4 w-4" />
                  Find Properties
                </Link>

                {isAuthenticated && (
                  <>
                    <Link
                      href="/properties/add"
                      className={`flex items-center px-4 py-3 text-sm ${
                        pathname === "/properties/add"
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Plus className="mr-3 h-4 w-4" />
                      List Property
                    </Link>
                    <Link
                      href="/my-properties"
                      className={`flex items-center px-4 py-3 text-sm ${
                        pathname === "/my-properties"
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Home className="mr-3 h-4 w-4" />
                      My Properties
                    </Link>
                    <Link
                      href="/favorites"
                      className={`flex items-center px-4 py-3 text-sm ${
                        pathname === "/favorites"
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Heart className="mr-3 h-4 w-4" />
                      Favorites
                    </Link>
                    <Link
                      href="/profile"
                      className={`flex items-center px-4 py-3 text-sm ${
                        pathname === "/profile"
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="mr-3 h-4 w-4" />
                      Profile
                    </Link>
                  </>
                )}

                <Link
                  href="/about"
                  className={`flex items-center px-4 py-3 text-sm ${
                    pathname === "/about"
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <HelpCircle className="mr-3 h-4 w-4" />
                  About
                </Link>

                {isAuthenticated && (
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center px-4 py-3 text-sm w-full text-left hover:bg-gray-100"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Log out
                  </button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t flex justify-around py-2"> {/* Changed bg-white to bg-background */}
        <Link
          href="/"
          className={`flex flex-col items-center p-2 ${
            pathname === "/" ? "text-primary" : "text-gray-500"
          }`}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link
          href="/search"
          className={`flex flex-col items-center p-2 ${
            pathname === "/search" ? "text-primary" : "text-gray-500"
          }`}
        >
          <Search className="h-5 w-5" />
          <span className="text-xs mt-1">Search</span>
        </Link>
        {isAuthenticated && (
          <Link
            href="/properties/add"
            className={`flex flex-col items-center p-2 ${
              pathname === "/properties/add" ? "text-primary" : "text-gray-500"
            }`}
          >
            <Plus className="h-5 w-5" />
            <span className="text-xs mt-1">Add</span>
          </Link>
        )}
        <Link
          href={isAuthenticated ? "/favorites" : "/sign-in"}
          className={`flex flex-col items-center p-2 ${
            pathname === "/favorites" ? "text-primary" : "text-gray-500"
          }`}
        >
          <Heart className="h-5 w-5" />
          <span className="text-xs mt-1">Favorites</span>
        </Link>
        <Link
          href={isAuthenticated ? "/profile" : "/sign-in"}
          className={`flex flex-col items-center p-2 ${
            pathname === "/profile" ? "text-primary" : "text-gray-500"
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </header>
  );
}
