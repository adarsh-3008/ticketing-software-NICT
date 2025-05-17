import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import MainLayout from "@/components/layouts/main-layout";
import { VenueWithDetails, TicketType } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Components
import BookingSteps from "@/components/booking/booking-steps";
import TicketSelection from "@/components/booking/ticket-selection";
import DateSelection from "@/components/booking/date-selection";
import CustomerDetails from "@/components/booking/customer-details";
import PaymentForm from "@/components/booking/payment-form";
import BookingConfirmation from "@/components/booking/booking-confirmation";

export default function BookingPage() {
  const params = useParams<{ id: string }>();
  const venueId = parseInt(params.id);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Booking state
  const [bookingStep, setBookingStep] = useState(1);
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [customerDetails, setCustomerDetails] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    specialRequests: ""
  });
  const [bookingId, setBookingId] = useState<string>("");
  
  // Fetch venue data
  const { data: venue, isLoading, error } = useQuery<VenueWithDetails>({
    queryKey: [`/api/venues/${venueId}`],
    enabled: !isNaN(venueId)
  });
  
  // Create booking mutation
  const bookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const res = await apiRequest("POST", "/api/bookings", bookingData);
      return await res.json();
    },
    onSuccess: (data) => {
      setBookingId(data.bookingId);
      setBookingStep(5);
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Booking confirmed!",
        description: "Your booking has been successfully processed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle ticket selection
  const handleTicketChange = (id: number, quantity: number) => {
    setSelectedTickets(prev => ({
      ...prev,
      [id]: quantity
    }));
  };
  
  // Handle date selection
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };
  
  // Handle customer details submission
  const handleCustomerDetailsSubmit = (data: any) => {
    setCustomerDetails(data);
    setBookingStep(4);
  };
  
  // Handle payment completion
  const handlePaymentComplete = async (paymentId: string) => {
    if (!venue || !selectedDate || !user) return;
    
    // Calculate total amount
    const totalAmount = Object.entries(selectedTickets).reduce((sum, [id, quantity]) => {
      const ticketType = venue.ticketTypes.find(t => t.id === parseInt(id));
      return sum + (ticketType?.price || 0) * quantity;
    }, 0);
    
    // Create booking
    const bookingData = {
      userId: user.id,
      venueId: venue.id,
      date: format(selectedDate, "yyyy-MM-dd"),
      tickets: selectedTickets,
      totalAmount,
      status: "confirmed",
      customerDetails
    };
    
    bookingMutation.mutate(bookingData);
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }
  
  if (error || !venue) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="text-center py-10">
            <p className="text-red-500">Error loading venue: {(error as Error)?.message || "Venue not found"}</p>
            <Button onClick={() => setLocation("/")} className="mt-4">
              Go Back Home
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Booking Steps */}
        <BookingSteps currentStep={bookingStep} />
        
        {/* Booking Content */}
        <Card className="overflow-hidden shadow-md">
          {/* Venue Header */}
          <div className="relative">
            <div className="absolute top-0 left-0 p-4">
              <Button 
                variant="secondary"
                size="icon"
                onClick={() => {
                  if (bookingStep === 1) {
                    setLocation("/");
                  } else {
                    setBookingStep(prev => prev - 1);
                  }
                }}
                className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full shadow-md"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
            <img 
              src={venue.image} 
              alt={venue.name} 
              className="w-full h-64 object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
              <h1 className="text-2xl font-bold text-white">{venue.name}</h1>
              <div className="flex items-center text-white">
                <span className="text-amber-400 mr-1">★</span>
                <span className="ml-1 text-sm text-amber-400 font-medium">{venue.rating}</span>
                <span className="mx-2 text-white">•</span>
                <span className="text-sm">{venue.address}</span>
              </div>
            </div>
          </div>
          
          {/* Booking Steps Content */}
          {bookingStep === 1 && (
            <TicketSelection 
              ticketTypes={venue.ticketTypes}
              selectedTickets={selectedTickets}
              onTicketChange={handleTicketChange}
              onNext={() => setBookingStep(2)}
              onCancel={() => setLocation("/")}
            />
          )}
          
          {bookingStep === 2 && (
            <DateSelection 
              availableDates={venue.availableDates}
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              onNext={() => setBookingStep(3)}
              onBack={() => setBookingStep(1)}
            />
          )}
          
          {bookingStep === 3 && (
            <CustomerDetails 
              initialData={customerDetails}
              onSubmit={handleCustomerDetailsSubmit}
              onBack={() => setBookingStep(2)}
            />
          )}
          
          {bookingStep === 4 && (
            <PaymentForm 
              venue={venue}
              selectedDate={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
              selectedTickets={selectedTickets}
              customerDetails={customerDetails}
              onPaymentComplete={handlePaymentComplete}
              onBack={() => setBookingStep(3)}
            />
          )}
          
          {bookingStep === 5 && (
            <BookingConfirmation 
              bookingId={bookingId}
              venue={venue}
              selectedDate={selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""}
              selectedTickets={selectedTickets}
              customerDetails={customerDetails}
            />
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
