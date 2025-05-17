import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VenueWithDetails } from "@shared/schema";
import { Star, MapPin } from "lucide-react";

type VenueCardProps = {
  venue: VenueWithDetails;
}

export default function VenueCard({ venue }: VenueCardProps) {
  const minPrice = Math.min(...venue.ticketTypes.map(t => t.price));
  
  return (
    <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative h-48">
        <img 
          src={venue.image} 
          alt={venue.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-semibold text-gray-800">{venue.name}</h2>
          <div className="flex items-center text-amber-500">
            <Star className="h-4 w-4 fill-current" />
            <span className="ml-1 text-sm">{venue.rating?.toFixed(1) || '0.0'}</span>
          </div>
        </div>
        <p className="mt-2 text-gray-600 text-sm line-clamp-2">{venue.description}</p>
        <div className="mt-3 flex items-center text-sm text-gray-500">
          <MapPin className="h-4 w-4 text-gray-400 mr-1" />
          <span>{venue.address}</span>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <span>From </span>
            <span className="font-semibold text-gray-800">₹{minPrice.toFixed(2)}</span>
          </div>
          <Link href={`/venues/${venue.id}`}>
            <Button>
              Book Now
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
