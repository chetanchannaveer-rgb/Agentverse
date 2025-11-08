import BookingSiteCard from '../BookingSiteCard';

export default function BookingSiteCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <BookingSiteCard
        name="Expedia"
        description="Compare flights, hotels, and vacation packages from multiple providers"
        url="https://www.expedia.com"
        category="Travel"
      />
      <BookingSiteCard
        name="OpenTable"
        description="Reserve tables at restaurants worldwide with instant confirmation"
        url="https://www.opentable.com"
        category="Dining"
      />
      <BookingSiteCard
        name="Eventbrite"
        description="Discover and book tickets for local events, concerts, and conferences"
        url="https://www.eventbrite.com"
        category="Events"
      />
      <BookingSiteCard
        name="Booking.com"
        description="Find and book hotels, apartments, and unique accommodations"
        url="https://www.booking.com"
        category="Hotels"
      />
    </div>
  );
}
