import Image from "next/image";
import { Property } from "@/lib/models";
import { Star } from "lucide-react";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow-md">
      <div className="relative h-[240px] w-full overflow-hidden sm:h-[200px]">
        <Image
          src={property.images[0]}
          alt={property.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {property.featured && (
          <div className="absolute left-3 top-3 rounded-md bg-black bg-opacity-50 px-2 py-1 text-xs font-medium text-white">
            Featured
          </div>
        )}
      </div>
      <div className="flex flex-grow flex-col p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="line-clamp-1 text-base font-medium text-gray-900 sm:text-lg">
            {property.title}
          </h3>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{property.rating}</span>
            <span className="text-xs text-gray-500">({property.reviews})</span>
          </div>
        </div>
        <p className="mb-2 line-clamp-2 text-sm text-gray-600">
          {property.description}
        </p>
        <div className="text-sm text-gray-500">{property.location}</div>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-md bg-gray-100 px-2 py-1 text-xs">
            {property.bedrooms} {property.bedrooms === 1 ? "bed" : "beds"}
          </span>
          <span className="rounded-md bg-gray-100 px-2 py-1 text-xs">
            {property.bathrooms} {property.bathrooms === 1 ? "bath" : "baths"}
          </span>
          <span className="rounded-md bg-gray-100 px-2 py-1 text-xs">
            {property.area} sq ft
          </span>
        </div>
        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative h-8 w-8 overflow-hidden rounded-full">
                <Image
                  src={property.hostImage}
                  alt={property.hostName}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="text-xs">{property.hostName}</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-semibold">${property.price}</span>
              <span className="text-sm text-gray-600">
                /{property.priceType}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
