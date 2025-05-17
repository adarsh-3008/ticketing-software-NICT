import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Printer, Mail, Home } from "lucide-react";
import { Link } from "wouter";
import { TicketType, VenueWithDetails } from "@shared/schema";

type BookingConfirmationProps = {
  bookingId: string;
  venue: VenueWithDetails;
  selectedDate: string;
  selectedTickets: Record<string, number>;
  customerDetails: any;
};

export default function BookingConfirmation({
  bookingId,
  venue,
  selectedDate,
  selectedTickets,
  customerDetails
}: BookingConfirmationProps) {
  return (
    <div className="p-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600 mb-6">Thank you for your booking. Your tickets are ready.</p>
        
        <Card className="bg-gray-50 mb-6">
          <CardContent className="p-6">
            <div className="flex justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">{venue.name}</h3>
                <p className="text-sm text-gray-600">{selectedDate}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Booking ID:</div>
                <div className="font-mono font-medium text-gray-800">{bookingId}</div>
              </div>
            </div>
            
            <div className="mb-4">
              {venue.ticketTypes.map(ticketType => {
                const quantity = selectedTickets[ticketType.id] || 0;
                if (quantity > 0) {
                  return (
                    <div key={ticketType.id} className="flex justify-between text-sm">
                      <span>{ticketType.name} x {quantity}</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-center">
                <div className="bg-white p-3 border border-gray-200 rounded">
                  <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
                    {/* SVG QR code placeholder */}
                    <svg
                      viewBox="0 0 100 100"
                      className="w-full h-full text-gray-400"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect x="20" y="20" width="20" height="20" fill="currentColor" />
                      <rect x="60" y="20" width="20" height="20" fill="currentColor" />
                      <rect x="20" y="60" width="20" height="20" fill="currentColor" />
                      <rect x="40" y="40" width="20" height="20" fill="currentColor" />
                      <rect x="60" y="60" width="20" height="20" fill="currentColor" />
                    </svg>
                  </div>
                  <div className="mt-2 text-center text-sm text-gray-600">Scan this QR code at the venue</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <Button variant="outline" className="flex items-center justify-center">
            <Printer className="h-4 w-4 mr-2" />
            <span>Print Tickets</span>
          </Button>
          <Button variant="outline" className="flex items-center justify-center">
            <Mail className="h-4 w-4 mr-2" />
            <span>Email Tickets</span>
          </Button>
          <Link href="/">
            <Button className="flex items-center justify-center">
              <Home className="h-4 w-4 mr-2" />
              <span>Back to Home</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
