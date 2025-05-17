import MainLayout from "@/components/layouts/main-layout";
import VenueList from "@/components/venues/venue-list";

export default function HomePage() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <VenueList />
      </div>
    </MainLayout>
  );
}
