import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import VenueCard from "./venue-card";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VenueWithDetails } from "@shared/schema";

export default function VenueList() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: venues, isLoading, error } = useQuery<VenueWithDetails[]>({
    queryKey: ["/api/venues"],
  });
  
  const filteredVenues = venues?.filter(venue => 
    venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.address.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Error loading venues: {(error as Error).message}</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Popular Venues</h1>
        <div className="mt-4 sm:mt-0">
          <form onSubmit={handleSearch} className="flex rounded-md shadow-sm">
            <div className="relative flex items-stretch flex-grow focus-within:z-10">
              <Input
                type="text"
                placeholder="Search venues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-r-none"
              />
            </div>
            <Button type="submit" className="rounded-l-none">
              <Search className="h-4 w-4 mr-2" />
              <span>Search</span>
            </Button>
          </form>
        </div>
      </div>
      
      {filteredVenues?.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No venues found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues?.map(venue => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      )}
    </div>
  );
}
