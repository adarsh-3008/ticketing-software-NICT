import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TicketType } from "@shared/schema";
import { Plus, Minus } from "lucide-react";

type TicketSelectionProps = {
  ticketTypes: TicketType[];
  selectedTickets: Record<string, number>;
  onTicketChange: (id: number, quantity: number) => void;
  onNext: () => void;
  onCancel: () => void;
};

export default function TicketSelection({
  ticketTypes,
  selectedTickets,
  onTicketChange,
  onNext,
  onCancel
}: TicketSelectionProps) {
  
  const calculateTotal = () => {
    return ticketTypes.reduce((sum, ticketType) => {
      const quantity = selectedTickets[ticketType.id] || 0;
      return sum + (ticketType.price * quantity);
    }, 0);
  };
  
  const totalQuantity = Object.values(selectedTickets).reduce((sum, quantity) => sum + quantity, 0);
  
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Tickets</h2>
      <div className="space-y-4">
        {ticketTypes.map(ticketType => (
          <div key={ticketType.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-800">{ticketType.name}</h3>
              <p className="text-gray-600">₹{ticketType.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  const currentQuantity = selectedTickets[ticketType.id] || 0;
                  if (currentQuantity > 0) {
                    onTicketChange(ticketType.id, currentQuantity - 1);
                  }
                }}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="mx-3 w-8 text-center">
                {selectedTickets[ticketType.id] || 0}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  const currentQuantity = selectedTickets[ticketType.id] || 0;
                  onTicketChange(ticketType.id, currentQuantity + 1);
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t pt-4">
        <div className="flex justify-between text-lg font-semibold text-gray-800">
          <span>Total</span>
          <span>₹{calculateTotal().toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={onNext} 
          disabled={totalQuantity === 0}
        >
          Continue to Date Selection
        </Button>
      </div>
    </div>
  );
}
