"use client";

import * as React from "react";
import { format, addMonths, subMonths } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AirbnbCalendarProps {
  value: DateRange | undefined;
  onChange: (value: DateRange | undefined) => void;
  onOpenChange?: (open: boolean) => void;
  triggerContent: React.ReactNode;
  align?: "start" | "center" | "end";
}

export function AirbnbCalendar({
  value,
  onChange,
  onOpenChange,
  triggerContent,
  align = "center",
}: AirbnbCalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());

  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  return (
    <Popover onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{triggerContent}</PopoverTrigger>
      <PopoverContent
        className="w-auto md:w-auto p-0 bg-white max-w-[calc(100vw-24px)] md:max-w-none"
        align={align}
        sideOffset={8}
      >
        <div className="p-2 md:p-4 pb-0 w-full">
          <Tabs defaultValue="dates" className="mb-4 w-full">
            <TabsList className="grid w-full grid-cols-3 h-[45px] p-1 bg-gray-100 rounded-full">
              <TabsTrigger
                value="dates"
                className="rounded-full data-[state=active]:bg-white text-xs md:text-sm"
              >
                Dates
              </TabsTrigger>
              <TabsTrigger
                value="months"
                className="rounded-full data-[state=active]:bg-white text-xs md:text-sm"
              >
                Months
              </TabsTrigger>
              <TabsTrigger
                value="flexible"
                className="rounded-full data-[state=active]:bg-white text-xs md:text-sm"
              >
                Flexible
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dates" className="mt-4 w-full">
              <div className="flex flex-col md:grid md:grid-cols-2 md:space-x-4 w-full">
                <div className="w-full">
                  {/* Mobile Month Navigation */}
                  <div className="flex justify-between items-center mb-2 md:hidden">
                    <button
                      onClick={goToPreviousMonth}
                      className="p-1 rounded-full hover:bg-gray-100"
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    <h3 className="text-sm font-semibold">
                      {format(currentMonth, "MMMM yyyy")}
                    </h3>

                    <button
                      onClick={goToNextMonth}
                      className="p-1 rounded-full hover:bg-gray-100"
                      aria-label="Next month"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Desktop Month Title (No Navigation) */}
                  <div className="hidden md:flex justify-center mb-1">
                    <h3 className="text-sm md:text-base font-semibold">
                      {format(currentMonth, "MMMM yyyy")}
                    </h3>
                  </div>

                  <Calendar
                    mode="range"
                    defaultMonth={currentMonth}
                    month={currentMonth}
                    onMonthChange={setCurrentMonth}
                    selected={value}
                    onSelect={onChange}
                    numberOfMonths={1}
                    showOutsideDays={false}
                    className="p-0 w-full"
                    classNames={{
                      months: "flex flex-col w-full",
                      month: "space-y-1 md:space-y-2 w-full",
                      caption:
                        "flex justify-center relative items-center w-full",
                      caption_label: "hidden",
                      nav: "hidden", // Hide default navigation
                      table: "w-full border-collapse",
                      head_row: "flex w-full justify-between",
                      head_cell:
                        "text-[10px] md:text-xs flex-1 font-medium text-center text-gray-500",
                      row: "flex w-full mt-1 justify-between",
                      cell: "relative flex-1 h-8 md:h-9 text-center text-xs md:text-sm p-0 rounded-full focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-gray-100",
                      day: "h-8 w-8 md:h-9 md:w-9 mx-auto p-0 font-normal aria-selected:opacity-100 rounded-full flex items-center justify-center",
                      day_selected:
                        "bg-black text-white hover:bg-black hover:text-white focus:bg-black focus:text-white",
                      day_today: "bg-gray-100",
                      day_outside: "text-gray-300",
                      day_disabled: "text-gray-300",
                      day_range_middle:
                        "aria-selected:bg-gray-100 aria-selected:text-black",
                      day_hidden: "invisible",
                    }}
                  />
                </div>

                <div className="hidden md:block mt-4 md:mt-0">
                  <div className="flex justify-center mb-1">
                    <h3 className="text-base font-semibold">
                      {format(addMonths(currentMonth, 1), "MMMM yyyy")}
                    </h3>
                  </div>
                  <Calendar
                    mode="range"
                    defaultMonth={addMonths(currentMonth, 1)}
                    month={addMonths(currentMonth, 1)}
                    onMonthChange={(month) =>
                      setCurrentMonth(subMonths(month, 1))
                    }
                    selected={value}
                    onSelect={onChange}
                    numberOfMonths={1}
                    showOutsideDays={false}
                    className="p-0"
                    classNames={{
                      months: "flex flex-col",
                      month: "space-y-2",
                      caption: "flex justify-center relative items-center",
                      caption_label: "hidden",
                      nav: "hidden",
                      table: "w-full border-collapse",
                      head_row: "flex w-full",
                      head_cell:
                        "text-xs w-10 font-medium text-center text-gray-500",
                      row: "flex w-full mt-1",
                      cell: "relative h-9 w-10 text-center text-sm p-0 rounded-full focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-gray-100",
                      day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rounded-full flex items-center justify-center",
                      day_selected:
                        "bg-black text-white hover:bg-black hover:text-white focus:bg-black focus:text-white",
                      day_today: "bg-gray-100",
                      day_outside: "text-gray-300",
                      day_disabled: "text-gray-300",
                      day_range_middle:
                        "aria-selected:bg-gray-100 aria-selected:text-black",
                      day_hidden: "invisible",
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-start mt-4 space-x-2 overflow-x-auto pb-4">
                <div className="border border-gray-300 rounded-full px-3 md:px-4 py-1 md:py-2 text-xs md:text-sm font-medium">
                  Exact dates
                </div>
                <div className="border border-gray-300 rounded-full px-3 md:px-4 py-1 md:py-2 text-xs md:text-sm font-medium">
                  ± 1 day
                </div>
                <div className="border border-gray-300 rounded-full px-3 md:px-4 py-1 md:py-2 text-xs md:text-sm font-medium">
                  ± 2 days
                </div>
                <div className="border border-gray-300 rounded-full px-3 md:px-4 py-1 md:py-2 text-xs md:text-sm font-medium">
                  ± 3 days
                </div>
              </div>
            </TabsContent>

            <TabsContent
              value="months"
              className="h-[400px] flex items-center justify-center text-center"
            >
              <div className="text-gray-500">
                <p>Monthly stay options will appear here</p>
              </div>
            </TabsContent>

            <TabsContent
              value="flexible"
              className="h-[400px] flex items-center justify-center text-center"
            >
              <div className="text-gray-500">
                <p>Flexible date options will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </PopoverContent>
    </Popover>
  );
}
