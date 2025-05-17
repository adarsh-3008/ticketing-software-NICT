import { useState } from "react";
import MainLayout from "@/components/layouts/main-layout";
import VenueTable from "@/components/admin/venue-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("venues");
  const { user, isAdmin } = useAuth();
  
  // Redirect if not admin
  if (!isAdmin) {
    return <Redirect to="/" />;
  }
  
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <div className="mt-4 sm:mt-0">
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              <span>Add New Venue</span>
            </Button>
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <Tabs defaultValue="venues" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="border-b border-gray-200 w-full justify-start rounded-none">
              <TabsTrigger value="venues" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Venues
              </TabsTrigger>
              <TabsTrigger value="bookings" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Bookings
              </TabsTrigger>
              <TabsTrigger value="users" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Users
              </TabsTrigger>
              <TabsTrigger value="reports" className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
                Reports
              </TabsTrigger>
            </TabsList>
            
            <div className="p-4">
              <TabsContent value="venues" className="mt-0">
                <VenueTable />
              </TabsContent>
              
              <TabsContent value="bookings" className="mt-0">
                <div className="text-center py-10">
                  <p className="text-gray-500">Bookings management coming soon.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="users" className="mt-0">
                <div className="text-center py-10">
                  <p className="text-gray-500">User management coming soon.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="reports" className="mt-0">
                <div className="text-center py-10">
                  <p className="text-gray-500">Reports coming soon.</p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
