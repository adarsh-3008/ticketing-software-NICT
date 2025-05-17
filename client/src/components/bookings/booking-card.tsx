import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingWithVenue } from "@shared/schema";
import { Eye, QrCode } from "lucide-react";
import { Link } from "wouter";
import { formatDate } from "date-fns";

type BookingCardProps = {
  booking: BookingWithVenue;
  venueImage: string;
};

export default function BookingCard({ booking, venueImage }: BookingCardProps) {
  // Format the date for display
  const formattedDate = formatDate(new Date(booking.date), "PPP");
  
  // Determine status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  // Format tickets for display
  const formatTickets = (tickets: Record<string, number>) => {
    return Object.entries(tickets)
      .map(([type, quantity]) => `${type} x ${quantity}`)
      .join(", ");
  };
  
  return (
    <Card className="border border-gray-200 hover:bg-gray-50 transition-colors duration-200">
      <CardContent className="p-4">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <div className="flex items-start">
              <div className="mr-4">
                <img 
                  src={venueImage} 
                  alt={booking.venueName} 
                  className="w-16 h-16 object-cover rounded"
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{booking.venueName}</h3>
                <p className="text-sm text-gray-600">{formattedDate}</p>
                <div className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button size="sm" className="flex items-center">
              <QrCode className="h-4 w-4 mr-1" />
              Tickets
            </Button>
          </div>
        </div>
        <div className="mt-4 border-t border-gray-200 pt-4 text-sm text-gray-600">
          <div className="flex justify-between">
            <div>
              <span className="font-medium">Booking ID:</span> 
              <span className="font-mono">{booking.bookingId}</span>
            </div>
            <div>
              <span className="font-medium">Total:</span> 
              <span>${booking.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
