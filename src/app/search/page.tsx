"use client";

import { useState, useEffect } from "react";
import { Property, PropertyFilter } from "@/lib/models";
import { getProperties } from "@/lib/propertyService";
import { PropertyCard } from "@/components/ui/property-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Filter, Search as SearchIcon, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

export default function SearchPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState<
    QueryDocumentSnapshot<DocumentData> | undefined
  >(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<PropertyFilter>({});
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Property type options
  const propertyTypes = [
    "Apartment",
    "House",
    "Condo",
    "Villa",
    "Cabin",
    "Loft",
    "Studio",
    "Penthouse",
  ];

  // Bedroom and bathroom options
  const bedroomOptions = [1, 2, 3, 4, "5+"];
  const bathroomOptions = [1, 2, 3, "4+"];

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async (newFilters?: PropertyFilter) => {
    setLoading(true);
    try {
      const filtersToUse = newFilters || filters;
      const result = await getProperties(filtersToUse, undefined, 8);
      setProperties(result.properties);
      setLastVisible(result.lastVisible || undefined);
      setHasMore(result.properties.length === 8);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    try {
      const result = await getProperties(filters, lastVisible, 8);
      setProperties([...properties, ...result.properties]);
      setLastVisible(result.lastVisible || undefined);
      setHasMore(result.properties.length === 8);
    } catch (error) {
      console.error("Error loading more properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const newFilters: PropertyFilter = {
      ...filters,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
    };
    setFilters(newFilters);
    fetchProperties(newFilters);
    setShowMobileFilters(false);
  };

  const clearFilters = () => {
    setFilters({});
    setPriceRange([0, 1000]);
    fetchProperties({});
    setShowMobileFilters(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, searchTerm: e.target.value });
  };

  const handleBedroomChange = (value: string) => {
    if (value === "any") {
      // Remove bedrooms filter
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { bedrooms, ...rest } = filters;
      setFilters(rest);
      return;
    }

    const bedrooms = value === "5+" ? 5 : parseInt(value);
    setFilters({ ...filters, bedrooms });
  };

  const handleBathroomChange = (value: string) => {
    if (value === "any") {
      // Remove bathrooms filter
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { bathrooms, ...rest } = filters;
      setFilters(rest);
      return;
    }

    const bathrooms = value === "4+" ? 4 : parseInt(value);
    setFilters({ ...filters, bathrooms });
  };

  const handlePropertyTypeChange = (value: string) => {
    if (value === "any") {
      // Remove property type filter
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { propertyType, ...rest } = filters;
      setFilters(rest);
      return;
    }

    setFilters({ ...filters, propertyType: value });
  };

  // Filter sidebar component
  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-3">Price Range</h3>
        <div className="px-2">
          <Slider
            value={priceRange}
            min={0}
            max={1000}
            step={10}
            onValueChange={setPriceRange}
            className="my-6"
          />
          <div className="flex items-center justify-between">
            <span>${priceRange[0]}</span>
            <span>${priceRange[1]}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">Property Type</h3>
        <Select
          value={filters.propertyType}
          onValueChange={handlePropertyTypeChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any type</SelectItem>
            {propertyTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="font-medium mb-3">Bedrooms</h3>
        <Select
          value={filters.bedrooms?.toString()}
          onValueChange={handleBedroomChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            {bedroomOptions.map((option) => (
              <SelectItem key={option.toString()} value={option.toString()}>
                {option} {option === "5+" ? "or more" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="font-medium mb-3">Bathrooms</h3>
        <Select
          value={filters.bathrooms?.toString()}
          onValueChange={handleBathroomChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            {bathroomOptions.map((option) => (
              <SelectItem key={option.toString()} value={option.toString()}>
                {option} {option === "4+" ? "or more" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 pt-4">
        <Button className="w-full" onClick={applyFilters}>
          Apply Filters
        </Button>
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Clear Filters
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Find Your Perfect Property</h1>

      {/* Search and filter bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by location, property name..."
            className="pl-10"
            value={filters.searchTerm || ""}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex gap-2">
          {/* Mobile filter button */}
          <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="md:hidden flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterSidebar />
              </div>
            </SheetContent>
          </Sheet>

          <Button onClick={applyFilters}>Search</Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters sidebar - desktop only */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-20">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            <FilterSidebar />
          </div>
        </div>

        {/* Property listings */}
        <div className="flex-grow">
          {loading && properties.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading properties...</p>
            </div>
          ) : properties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <div key={property.id}>
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>

              {hasMore && (
                <div className="text-center mt-8">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Load More"}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <div className="mb-4">
                <X className="h-12 w-12 text-gray-400 mx-auto" />
              </div>
              <h3 className="text-lg font-medium mb-2">No properties found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filters to find what you&apos;re
                looking for.
              </p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
