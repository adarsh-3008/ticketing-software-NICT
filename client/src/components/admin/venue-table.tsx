import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Power } from "lucide-react";
import { VenueWithDetails } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

export default function VenueTable() {
  const { data: venues, isLoading, error } = useQuery<VenueWithDetails[]>({
    queryKey: ["/api/venues"],
  });
  
  if (isLoading) {
    return <div>Loading venues...</div>;
  }
  
  if (error) {
    return <div>Error loading venues: {(error as Error).message}</div>;
  }
  
  if (!venues || venues.length === 0) {
    return <div>No venues found.</div>;
  }
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Venue</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Bookings</TableHead>
            <TableHead>Revenue</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {venues.map((venue) => (
            <TableRow key={venue.id}>
              <TableCell>
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img 
                      src={venue.image} 
                      alt={venue.name} 
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{venue.name}</div>
                    <div className="text-sm text-gray-500">{venue.address}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={venue.isActive ? "success" : "destructive"}>
                  {venue.isActive ? "Active" : "Inactive"}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {/* Mock data for example */}
                {Math.floor(Math.random() * 100)}
              </TableCell>
              <TableCell className="text-sm text-gray-500">
                {/* Mock data for example */}
                ${(Math.floor(Math.random() * 5000) + 1000).toFixed(2)}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant={venue.isActive ? "destructive" : "outline"} size="sm">
                    <Power className="h-4 w-4 mr-1" />
                    {venue.isActive ? "Disable" : "Enable"}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
