"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getProperties, addTestProperty } from "@/lib/propertyService";
import { Property } from "@/lib/models";

export default function DebugPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProperties();
      setProperties(result.properties);
      setMessage(`Found ${result.properties.length} properties`);
    } catch (err: any) {
      console.error("Error fetching properties:", err);
      setError(err.message || "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTestProperty = async () => {
    setLoading(true);
    setError(null);
    try {
      const id = await addTestProperty();
      setMessage(`Added test property with ID: ${id}`);
      // Refresh the properties list
      fetchProperties();
    } catch (err: any) {
      console.error("Error adding test property:", err);
      setError(err.message || "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Property Debug Page</h1>

      <div className="flex gap-4 mb-6">
        <Button onClick={fetchProperties} disabled={loading}>
          {loading ? "Loading..." : "Fetch Properties"}
        </Button>
        <Button
          onClick={handleAddTestProperty}
          disabled={loading}
          variant="outline"
        >
          Add Test Property
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-2">
          Properties ({properties.length})
        </h2>
        {properties.length === 0 ? (
          <p className="text-gray-500">No properties found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {properties.map((property) => (
              <div key={property.id} className="border p-4 rounded">
                <h3 className="font-bold">{property.title}</h3>
                <p className="text-sm text-gray-600">{property.description}</p>
                <div className="mt-2">
                  <p>
                    Price: ${property.price}/{property.priceType}
                  </p>
                  <p>Location: {property.location}</p>
                  <p>Status: {property.status}</p>
                  <p>Bedrooms: {property.bedrooms}</p>
                  <p>Bathrooms: {property.bathrooms}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
