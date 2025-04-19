"use client";

import * as React from "react";
import { UsersIcon, PlusIcon, MinusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type GuestType = "adults" | "children" | "infants" | "pets";

interface GuestCount {
  adults: number;
  children: number;
  infants: number;
  pets: number;
}

interface GuestSelectorProps {
  displayStyle?: "default" | "inline";
}

export function GuestSelector({
  displayStyle = "default",
}: GuestSelectorProps) {
  const [guestCount, setGuestCount] = React.useState<GuestCount>({
    adults: 0,
    children: 0,
    infants: 0,
    pets: 0,
  });

  const incrementGuest = (type: GuestType) => {
    setGuestCount((prev) => ({
      ...prev,
      [type]: prev[type] + 1,
    }));
  };

  const decrementGuest = (type: GuestType) => {
    setGuestCount((prev) => ({
      ...prev,
      [type]: Math.max(0, prev[type] - 1),
    }));
  };

  const totalGuests =
    guestCount.adults + guestCount.children + guestCount.infants;

  const displayText =
    totalGuests === 0
      ? "Add guests"
      : totalGuests === 1
      ? "1 guest"
      : `${totalGuests} guests`;

  if (displayStyle === "inline") {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <span className="text-sm text-gray-500 cursor-pointer">
            {displayText}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="center">
          <div className="p-4 space-y-6">
            {/* Adults */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Adults</h3>
                <p className="text-sm text-gray-500">Ages 13 or above</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => decrementGuest("adults")}
                  disabled={guestCount.adults === 0}
                  className="h-8 w-8 rounded-full p-0 flex items-center justify-center border border-gray-300"
                  variant="outline"
                >
                  <MinusIcon className="h-4 w-4" />
                </Button>
                <span className="w-5 text-center">{guestCount.adults}</span>
                <Button
                  onClick={() => incrementGuest("adults")}
                  className="h-8 w-8 rounded-full p-0 flex items-center justify-center border border-gray-300"
                  variant="outline"
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Children */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Children</h3>
                <p className="text-sm text-gray-500">Ages 2–12</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => decrementGuest("children")}
                  disabled={guestCount.children === 0}
                  className="h-8 w-8 rounded-full p-0 flex items-center justify-center border border-gray-300"
                  variant="outline"
                >
                  <MinusIcon className="h-4 w-4" />
                </Button>
                <span className="w-5 text-center">{guestCount.children}</span>
                <Button
                  onClick={() => incrementGuest("children")}
                  className="h-8 w-8 rounded-full p-0 flex items-center justify-center border border-gray-300"
                  variant="outline"
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Infants */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Infants</h3>
                <p className="text-sm text-gray-500">Under 2</p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => decrementGuest("infants")}
                  disabled={guestCount.infants === 0}
                  className="h-8 w-8 rounded-full p-0 flex items-center justify-center border border-gray-300"
                  variant="outline"
                >
                  <MinusIcon className="h-4 w-4" />
                </Button>
                <span className="w-5 text-center">{guestCount.infants}</span>
                <Button
                  onClick={() => incrementGuest("infants")}
                  className="h-8 w-8 rounded-full p-0 flex items-center justify-center border border-gray-300"
                  variant="outline"
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Pets */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Pets</h3>
                <p className="text-sm text-gray-500 underline cursor-pointer">
                  Bringing a service animal?
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={() => decrementGuest("pets")}
                  disabled={guestCount.pets === 0}
                  className="h-8 w-8 rounded-full p-0 flex items-center justify-center border border-gray-300"
                  variant="outline"
                >
                  <MinusIcon className="h-4 w-4" />
                </Button>
                <span className="w-5 text-center">{guestCount.pets}</span>
                <Button
                  onClick={() => incrementGuest("pets")}
                  className="h-8 w-8 rounded-full p-0 flex items-center justify-center border border-gray-300"
                  variant="outline"
                >
                  <PlusIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between border-gray-300 text-left font-normal"
        >
          <div className="flex items-center">
            <UsersIcon className="mr-2 h-4 w-4 text-gray-500" />
            <span>{displayText}</span>
          </div>
          <div className="opacity-60">▼</div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 space-y-6">
          {/* Adults */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Adults</h3>
              <p className="text-sm text-gray-500">Ages 13 or above</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => decrementGuest("adults")}
                disabled={guestCount.adults === 0}
                className="h-8 w-8 rounded-full p-0 flex items-center justify-center border border-gray-300"
                variant="outline"
              >
                <MinusIcon className="h-4 w-4" />
              </Button>
              <span className="w-5 text-center">{guestCount.adults}</span>
              <Button
                onClick={() => incrementGuest("adults")}
                className="h-8 w-8 rounded-full p-0 flex items-center justify-center border border-gray-300"
                variant="outline"
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Children */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Children</h3>
              <p className="text-sm text-gray-500">Ages 2–12</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => decrementGuest("children")}
                disabled={guestCount.children === 0}
                className="h-8 w-8 rounded-full p-0 flex items-center justify-center border border-gray-300"
                variant="outline"
              >
                <MinusIcon className="h-4 w-4" />
              </Button>
              <span className="w-5 text-center">{guestCount.children}</span>
              <Button
                onClick={() => incrementGuest("children")}
                className="h-8 w-8 rounded-full p-0 flex items-center justify-center border border-gray-300"
                variant="outline"
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Infants */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Infants</h3>
              <p className="text-sm text-gray-500">Under 2</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => decrementGuest("infants")}
                disabled={guestCount.infants === 0}
                className="h-8 w-8 rounded-full p-0 flex items-center justify-center border border-gray-300"
                variant="outline"
              >
                <MinusIcon className="h-4 w-4" />
              </Button>
              <span className="w-5 text-center">{guestCount.infants}</span>
              <Button
                onClick={() => incrementGuest("infants")}
                className="h-8 w-8 rounded-full p-0 flex items-center justify-center border border-gray-300"
                variant="outline"
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Pets */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Pets</h3>
              <p className="text-sm text-gray-500 underline cursor-pointer">
                Bringing a service animal?
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => decrementGuest("pets")}
                disabled={guestCount.pets === 0}
                className="h-8 w-8 rounded-full p-0 flex items-center justify-center border border-gray-300"
                variant="outline"
              >
                <MinusIcon className="h-4 w-4" />
              </Button>
              <span className="w-5 text-center">{guestCount.pets}</span>
              <Button
                onClick={() => incrementGuest("pets")}
                className="h-8 w-8 rounded-full p-0 flex items-center justify-center border border-gray-300"
                variant="outline"
              >
                <PlusIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
