"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchIcon, HeartIcon, StarIcon } from "lucide-react";
import { GuestSelector } from "@/components/ui/guest-selector";
import { AirbnbCalendar } from "@/components/ui/airbnb-calendar";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import { getFeaturedProperties } from "@/lib/propertyService";
import { Property } from "@/lib/models";
import {
  getCategories,
  getExperiences,
  Category,
  Experience,
} from "@/lib/dataService";

export default function Home() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2025, 3, 11), // Apr 11, 2025
    to: new Date(2025, 3, 17), // Apr 17, 2025
  });
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingExperiences, setLoadingExperiences] = useState(true);

  useEffect(() => {
    const fetchFeaturedProperties = async () => {
      setLoadingProperties(true);
      try {
        const fetchedProperties = await getFeaturedProperties();
        setFeaturedProperties(fetchedProperties);
      } catch (error) {
        console.error("Error fetching properties:", error);
        setFeaturedProperties([]);
      } finally {
        setLoadingProperties(false);
      }
    };

    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const fetchedCategories = await getCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    const fetchExperiences = async () => {
      setLoadingExperiences(true);
      try {
        const fetchedExperiences = await getExperiences();
        setExperiences(fetchedExperiences);
      } catch (error) {
        console.error("Error fetching experiences:", error);
        setExperiences([]);
      } finally {
        setLoadingExperiences(false);
      }
    };

    fetchFeaturedProperties();
    fetchCategories();
    fetchExperiences();
  }, []);

  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Section with Search */}
      <section className="relative w-full">
        <div className="relative h-[280px] md:h-[500px] w-full">
          <Image
            src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80"
            alt="Hero Image"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-6 text-center">
              Find your next adventure
            </h1>
            <p className="text-lg md:text-2xl mb-4 md:mb-8 text-center max-w-3xl">
              Discover cozy homes, unique experiences, and hidden gems around
              the world.
            </p>
          </div>
        </div>

        {/* Search Box */}
        <div className="max-w-5xl mx-auto px-4 relative -mt-16 md:-mt-24">
          <div className="bg-white rounded-xl shadow-xl p-4 md:p-6">
            <Tabs defaultValue="stays" className="w-full">
              {/* Tabs - Desktop and Mobile */}
              <TabsList className="mb-4 md:mb-6 w-full grid grid-cols-3 md:w-auto md:inline-flex md:justify-start">
                <TabsTrigger value="stays" className="text-xs md:text-base">
                  Stays
                </TabsTrigger>
                <TabsTrigger
                  value="experiences"
                  className="text-xs md:text-base"
                >
                  Experiences
                </TabsTrigger>
                <TabsTrigger value="online" className="text-xs md:text-base">
                  Online Experiences
                </TabsTrigger>
              </TabsList>

              <TabsContent value="stays">
                {/* Mobile Search UI - Revised */}
                <div className="md:hidden space-y-4">
                  <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
                    {/* Where */}
                    <div className="p-3">
                      <label
                        htmlFor="mobile-where"
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        Where
                      </label>
                      <input
                        id="mobile-where"
                        type="text"
                        placeholder="Search destinations"
                        className="w-full border-0 p-0 focus:ring-0 text-sm placeholder-gray-400"
                      />
                    </div>

                    {/* Check in / Check out - Uses AirbnbCalendar directly with mobile trigger */}
                    <AirbnbCalendar
                      value={dateRange}
                      onChange={setDateRange}
                      align="center" // Align popover center for mobile
                      triggerContent={
                        <div className="grid grid-cols-2 divide-x divide-gray-200">
                          <div className="p-3 cursor-pointer">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Check in
                            </label>
                            <span className="text-sm">
                              {dateRange?.from
                                ? format(dateRange.from, "MMM d, yyyy")
                                : "Add date"}
                            </span>
                          </div>
                          <div className="p-3 cursor-pointer">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Check out
                            </label>
                            <span className="text-sm">
                              {dateRange?.to
                                ? format(dateRange.to, "MMM d, yyyy")
                                : "Add date"}
                            </span>
                          </div>
                        </div>
                      }
                    />

                    {/* Who - Mobile Guest Selector Trigger */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="p-3 cursor-pointer">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Who
                          </label>
                          <GuestSelector displayStyle="inline" />
                        </div>
                      </PopoverTrigger>
                      {/* PopoverContent for GuestSelector is handled within the component */}
                    </Popover>
                  </div>

                  <Button className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-base font-medium">
                    <SearchIcon className="w-5 h-5 mr-2" />
                    Search
                  </Button>
                </div>

                {/* Desktop Search Bar */}
                <div className="hidden md:flex h-[66px] items-center rounded-full border border-gray-200 bg-white shadow-sm overflow-hidden">
                  {/* Where */}
                  <div className="flex-1 h-full">
                    <div className="px-6 py-2 h-full flex flex-col justify-center">
                      <label className="text-xs font-bold">Where</label>
                      <input
                        type="text"
                        placeholder="Search destinations"
                        className="border-0 p-0 h-auto text-sm focus:outline-none bg-transparent w-full"
                      />
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-8 w-px bg-gray-200"></div>

                  {/* Check in - Desktop */}
                  <div className="flex-1 h-full">
                    <AirbnbCalendar
                      value={dateRange}
                      onChange={setDateRange}
                      align="start"
                      triggerContent={
                        <div className="px-6 py-2 h-full flex flex-col justify-center cursor-pointer w-full">
                          <label className="text-xs font-bold">Check in</label>
                          <span className="text-sm text-gray-500">
                            {dateRange?.from
                              ? format(dateRange.from, "MMM d, yyyy")
                              : "Add dates"}
                          </span>
                        </div>
                      }
                    />
                  </div>

                  {/* Divider */}
                  <div className="h-8 w-px bg-gray-200"></div>

                  {/* Check out - Desktop */}
                  <div className="flex-1 h-full">
                    <AirbnbCalendar
                      value={dateRange}
                      onChange={setDateRange}
                      align="start"
                      triggerContent={
                        <div className="px-6 py-2 h-full flex flex-col justify-center cursor-pointer w-full">
                          <label className="text-xs font-bold">Check out</label>
                          <span className="text-sm text-gray-500">
                            {dateRange?.to
                              ? format(dateRange.to, "MMM d, yyyy")
                              : "Add dates"}
                          </span>
                        </div>
                      }
                    />
                  </div>

                  {/* Divider */}
                  <div className="h-8 w-px bg-gray-200"></div>

                  {/* Who (Using Popover) */}
                  <div className="flex-1 h-full">
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="px-6 py-2 h-full flex flex-col justify-center cursor-pointer">
                          <label className="text-xs font-bold">Who</label>
                          <GuestSelector displayStyle="inline" />
                        </div>
                      </PopoverTrigger>
                      {/* Content managed internally by GuestSelector */}
                    </Popover>
                  </div>

                  {/* Search Button */}
                  <div className="p-3 mr-2">
                    <Button className="h-12 w-12 rounded-full bg-rose-500 hover:bg-rose-600 text-white">
                      <SearchIcon className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="experiences">
                <div className="text-center py-6 md:py-10">
                  <p>Find local activities led by expert hosts.</p>
                </div>
              </TabsContent>

              <TabsContent value="online">
                <div className="text-center py-6 md:py-10">
                  <p>
                    Join unique interactive experiences from the comfort of
                    home.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 md:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
            Explore nearby
          </h2>

          {loadingCategories ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="flex items-center space-x-3 p-2 md:p-4 rounded-xl animate-pulse"
                >
                  <div className="relative h-14 w-14 md:h-20 md:w-20 rounded-lg bg-gray-200"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/search?category=${category.name}`}
                  className="flex items-center space-x-3 p-2 md:p-4 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="relative h-14 w-14 md:h-20 md:w-20 rounded-lg overflow-hidden">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm md:text-base">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 text-xs md:text-sm">
                      {category.count} properties
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No categories available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-8 md:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
            Featured properties
          </h2>

          {loadingProperties ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-48 bg-gray-200 animate-pulse"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 animate-pulse w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 animate-pulse w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProperties.map((property) => (
                <Link
                  key={property.id}
                  href={`/properties/${property.id}`}
                  className="block"
                >
                  <Card className="overflow-hidden h-full transition-transform hover:scale-[1.02]">
                    <div className="relative h-48">
                      <Image
                        src={property.images[0]}
                        alt={property.title}
                        fill
                        className="object-cover"
                      />
                      <button className="absolute top-3 right-3 text-white hover:text-red-500 transition-colors">
                        <HeartIcon className="h-6 w-6" />
                      </button>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium truncate">
                          {property.title}
                        </h3>
                        <div className="flex items-center min-w-fit ml-2">
                          <StarIcon className="h-4 w-4 text-amber-500 mr-1" />
                          <span className="text-sm">
                            {property.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {property.location}
                      </p>
                      <p className="text-gray-700 font-medium">
                        <span className="font-semibold">${property.price}</span>{" "}
                        / {property.priceType}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No featured properties available yet.
              </p>
              <Link href="/search">
                <Button className="mt-4">Browse All Properties</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Experiences */}
      <section className="py-8 md:py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
            Experiences
          </h2>

          {loadingExperiences ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-48 bg-gray-200 animate-pulse"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 animate-pulse w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 animate-pulse w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : experiences.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {experiences.map((experience) => (
                <Link
                  key={experience.id}
                  href={`/experiences/${experience.id}`}
                  className="block"
                >
                  <Card className="overflow-hidden h-full transition-transform hover:scale-[1.02]">
                    <div className="relative h-44 md:h-48">
                      <Image
                        src={experience.image}
                        alt={experience.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium line-clamp-1">
                          {experience.title}
                        </h3>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        {experience.location}
                      </p>
                      <div className="flex justify-between items-center">
                        <p className="text-gray-700 font-medium">
                          <span className="font-semibold">
                            ${experience.price}
                          </span>{" "}
                          / person
                        </p>
                        <div className="flex items-center">
                          <StarIcon className="h-4 w-4 text-amber-500 mr-1" />
                          <span className="text-sm">{experience.rating}</span>
                          <span className="text-gray-500 text-xs ml-1">
                            ({experience.reviewCount})
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No experiences available yet.</p>
              <Link href="/search">
                <Button className="mt-4">Browse Properties</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Product Column */}
            <div>
              <h3 className="font-bold text-sm uppercase mb-4">Product</h3>
              <nav className="flex flex-col space-y-3">
                <Link href="#" className="text-gray-600 hover:underline">
                  Features
                </Link>
                <Link href="#" className="text-gray-600 hover:underline">
                  Pricing
                </Link>
                <Link href="#" className="text-gray-600 hover:underline">
                  Documentation
                </Link>
              </nav>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="font-bold text-sm uppercase mb-4">Company</h3>
              <nav className="flex flex-col space-y-3">
                <Link href="#" className="text-gray-600 hover:underline">
                  About
                </Link>
                <Link href="#" className="text-gray-600 hover:underline">
                  Blog
                </Link>
                <Link href="#" className="text-gray-600 hover:underline">
                  Careers
                </Link>
              </nav>
            </div>

            {/* Legal Column */}
            <div>
              <h3 className="font-bold text-sm uppercase mb-4">Legal</h3>
              <nav className="flex flex-col space-y-3">
                <Link href="#" className="text-gray-600 hover:underline">
                  Privacy
                </Link>
                <Link href="#" className="text-gray-600 hover:underline">
                  Terms
                </Link>
              </nav>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-gray-200 flex items-center justify-center">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold mr-3">
                R
              </div>
              <p className="text-gray-600 text-sm">
                © 2025 RentMe. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
