import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layouts/main-layout";
import BookingCard from "@/components/bookings/booking-card";
import { BookingWithVenue } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  
  const { data: bookings, isLoading, error } = useQuery<BookingWithVenue[]>({
    queryKey: ["/api/bookings"],
  });
  
  // Filter bookings based on status
  const upcomingBookings = bookings?.filter(b => b.status === "confirmed") || [];
  const pastBookings = bookings?.filter(b => b.status === "completed") || [];
  const cancelledBookings = bookings?.filter(b => b.status === "cancelled") || [];
  
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h1>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="border-b border-gray-200 w-full justify-start rounded-none">
              <TabsTrigger value="upcoming" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Upcoming
              </TabsTrigger>
              <TabsTrigger value="past" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Past
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Cancelled
              </TabsTrigger>
            </TabsList>
            
            <div className="p-4">
              {isLoading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center py-10">
                  <p className="text-red-500">Error loading bookings: {(error as Error).message}</p>
                </div>
              ) : (
                <>
                  <TabsContent value="upcoming" className="mt-0 space-y-4">
                    {upcomingBookings.length === 0 ? (
                      <div className="text-center py-10">
                        <p className="text-gray-500">You don't have any upcoming bookings.</p>
                      </div>
                    ) : (
                      upcomingBookings.map(booking => (
                        <BookingCard 
                          key={booking.id} 
                          booking={booking} 
                          venueImage="https://images.unsplash.com/photo-1582650625112-567c10c93dc4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300"
                        />
                      ))
                    )}
                  </TabsContent>
                  
                  <TabsContent value="past" className="mt-0 space-y-4">
                    {pastBookings.length === 0 ? (
                      <div className="text-center py-10">
                        <p className="text-gray-500">You don't have any past bookings.</p>
                      </div>
                    ) : (
                      pastBookings.map(booking => (
                        <BookingCard 
                          key={booking.id} 
                          booking={booking} 
                          venueImage="https://images.unsplash.com/photo-1568480289356-5a75d0bdd3a9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300"
                        />
                      ))
                    )}
                  </TabsContent>
                  
                  <TabsContent value="cancelled" className="mt-0 space-y-4">
                    {cancelledBookings.length === 0 ? (
                      <div className="text-center py-10">
                        <p className="text-gray-500">You don't have any cancelled bookings.</p>
                      </div>
                    ) : (
                      cancelledBookings.map(booking => (
                        <BookingCard 
                          key={booking.id} 
                          booking={booking}
                          venueImage="https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=300"
                        />
                      ))
                    )}
                  </TabsContent>
                </>
              )}
            </div>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
