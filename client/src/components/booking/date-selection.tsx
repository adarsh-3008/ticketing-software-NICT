import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

type DateSelectionProps = {
  availableDates: string[];
  selectedDate: Date | undefined;
  onDateChange: (date: Date) => void;
  onNext: () => void;
  onBack: () => void;
};

export default function DateSelection({
  availableDates,
  selectedDate,
  onDateChange,
  onNext,
  onBack
}: DateSelectionProps) {
  // Convert string dates to Date objects
  const availableDateObjects = availableDates.map(dateStr => {
    console.log("Available date string:", dateStr);
    // Use a more explicit date parsing to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(num => parseInt(num));
    return new Date(year, month - 1, day);
  });
  
  console.log("Available date objects:", availableDateObjects);
  
  // Disable dates that are not in the available dates list
  const isDateUnavailable = (date: Date) => {
    // Use a simpler comparison approach
    return !availableDateObjects.some(availableDate => 
      availableDate.getFullYear() === date.getFullYear() &&
      availableDate.getMonth() === date.getMonth() &&
      availableDate.getDate() === date.getDate()
    );
  };
  
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Date</h2>
      
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onDateChange(date)}
          disabled={isDateUnavailable}
          className="rounded-md border"
        />
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <span className="inline-block w-4 h-4 bg-primary rounded-full mr-2"></span>
            <span>Available Dates</span>
          </div>
          <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
            <p className="text-sm text-blue-700">
              <strong>Note:</strong> Only selected dates are available for booking based on venue capacity and scheduled events. 
              This month's available dates: 10th, 15th, 20th, and 25th.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!selectedDate}
        >
          Continue to Customer Details
        </Button>
      </div>
    </div>
  );
}
