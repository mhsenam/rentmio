import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="max-w-md mx-auto rounded-lg overflow-hidden shadow-xl bg-white p-8">
        <div className="relative w-full h-48 mb-6">
          <Image
            src="/images/404-house.svg"
            alt="House not found"
            fill
            className="object-contain"
            priority
          />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Oops! Property Not Found
        </h1>

        <p className="text-gray-600 mb-8">
          We couldn't find the property you were looking for. It might have been
          rented out or moved to a new location.
        </p>

        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/">Browse Available Properties</Link>
          </Button>

          <div className="flex items-center justify-center space-x-4">
            <Link
              href="/search"
              className="text-primary hover:underline text-sm"
            >
              Search Properties
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/contact"
              className="text-primary hover:underline text-sm"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 text-gray-500 text-sm">
        <p>Looking for something specific? Try using our search feature.</p>
      </div>
    </div>
  );
}
