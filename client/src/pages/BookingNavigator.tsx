import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import BookingSiteCard from "@/components/BookingSiteCard";
import { Search, Sparkles, IndianRupee, Calendar, MapPin } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BookingNavigator() {
  const [query, setQuery] = useState("");
  const [budget, setBudget] = useState("");
  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState("");
  const [detectedIntent, setDetectedIntent] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Indian booking sites for domestic and international travel
  const bookingSites = {
    packages: [
      { name: "MakeMyTrip", description: "India's leading travel portal - Complete holiday packages with flights, hotels, and sightseeing", url: "https://www.makemytrip.com/holidays-india/", category: "Package Deals" },
      { name: "Yatra", description: "Trusted Indian travel site - Customizable packages with EMI options and instant confirmation", url: "https://www.yatra.com/holidays", category: "Package Deals" },
      { name: "Goibibo", description: "Budget-friendly packages with goCash rewards - Save up to 25% on holiday bookings", url: "https://www.goibibo.com/holidays/", category: "Package Deals" },
      { name: "Cleartrip", description: "Simple and transparent packages - No hidden charges with 24/7 customer support", url: "https://www.cleartrip.com/holidays", category: "Package Deals" },
    ],
    flights: [
      { name: "MakeMyTrip Flights", description: "Compare domestic and international flights - Zero cancellation fee on select bookings", url: "https://www.makemytrip.com/flights/", category: "Flights" },
      { name: "Yatra Flights", description: "Best airfare deals with flexible date search - Instant refunds on cancellations", url: "https://www.yatra.com/flights", category: "Flights" },
      { name: "Goibibo Flights", description: "Lowest flight fares with goCash+ benefits - Get free meal vouchers on select bookings", url: "https://www.goibibo.com/flights/", category: "Flights" },
      { name: "EaseMyTrip", description: "Zero convenience fee on flight bookings - Save extra with 'Double Seat' option", url: "https://www.easemytrip.com/flights.html", category: "Flights" },
    ],
    hotels: [
      { name: "MakeMyTrip Hotels", description: "1M+ hotels in India and abroad - Pay at hotel option with price match guarantee", url: "https://www.makemytrip.com/hotels/", category: "Hotels" },
      { name: "Yatra Hotels", description: "Budget to luxury stays with eCash rewards - Free cancellation on most properties", url: "https://www.yatra.com/hotels", category: "Hotels" },
      { name: "OYO Rooms", description: "India's largest hotel chain - Standardized rooms with guaranteed hygiene at best prices", url: "https://www.oyorooms.com/", category: "Budget Hotels" },
      { name: "Treebo Hotels", description: "Premium budget hotels with free breakfast - Quality stays starting from ₹999/night", url: "https://www.treebohotels.com/", category: "Budget Hotels" },
    ],
    trains: [
      { name: "IRCTC", description: "Official Indian Railways booking - Book train tickets, check PNR status, and view live running status", url: "https://www.irctc.co.in/", category: "Train Tickets" },
      { name: "RailYatri", description: "Train ticket booking with AI-powered seat prediction - Check train schedule, PNR, and platform info", url: "https://www.railyatri.in/", category: "Train Tickets" },
      { name: "Confirmtkt", description: "Alternative train tickets when waitlisted - Get confirmed tickets through tatkal and premium tatkal", url: "https://www.confirmtkt.com/", category: "Train Tickets" },
      { name: "MakeMyTrip Trains", description: "Book IRCTC train tickets with zero payment gateway charges - Easy cancellation and refunds", url: "https://www.makemytrip.com/railways/", category: "Train Tickets" },
    ],
    restaurants: [
      { name: "Zomato", description: "Discover and book restaurants across India - Get deals, reviews, and instant table reservations", url: "https://www.zomato.com/", category: "Dining" },
      { name: "Dineout", description: "Reserve tables at 50,000+ restaurants in India - Get up to 50% off on total bill", url: "https://www.dineout.co.in/", category: "Dining" },
      { name: "EazyDiner", description: "Premium restaurant reservations with exclusive offers - Earn EazyPoints on every booking", url: "https://www.eazydiner.com/", category: "Dining" },
    ],
    events: [
      { name: "BookMyShow", description: "India's largest ticketing platform - Book movie tickets, concerts, sports, and events", url: "https://in.bookmyshow.com/", category: "Events" },
      { name: "Paytm Insider", description: "Discover curated events, concerts, and experiences - Exclusive access to limited shows", url: "https://insider.in/", category: "Events" },
      { name: "Explara", description: "Book tickets for conferences, workshops, and professional events across India", url: "https://www.explara.com/", category: "Event Tickets" },
    ],
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // TODO: Replace with actual intent detection from backend AI agent
    setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      const hasBudget = budget.trim().length > 0;
      const hasMultipleNeeds = (lowerQuery.includes("flight") || lowerQuery.includes("fly")) && 
                               (lowerQuery.includes("hotel") || lowerQuery.includes("stay"));
      
      // Train booking intent detection
      if (lowerQuery.includes("train") || lowerQuery.includes("railway") || lowerQuery.includes("irctc") || 
          lowerQuery.includes("railyatri") || lowerQuery.includes("pnr")) {
        setDetectedIntent("trains");
      }
      // If budget is provided or query mentions package/trip/vacation, show packages
      else if (hasBudget || hasMultipleNeeds || lowerQuery.includes("package") || 
          lowerQuery.includes("trip") || lowerQuery.includes("vacation")) {
        setDetectedIntent("packages");
      } else if (lowerQuery.includes("flight") || lowerQuery.includes("fly")) {
        setDetectedIntent("flights");
      } else if (lowerQuery.includes("hotel") || lowerQuery.includes("stay") || lowerQuery.includes("accommodation")) {
        setDetectedIntent("hotels");
      } else if (lowerQuery.includes("restaurant") || lowerQuery.includes("dinner") || lowerQuery.includes("eat")) {
        setDetectedIntent("restaurants");
      } else if (lowerQuery.includes("event") || lowerQuery.includes("concert") || lowerQuery.includes("show") || lowerQuery.includes("ticket")) {
        setDetectedIntent("events");
      } else {
        setDetectedIntent("packages");
      }
      setIsAnalyzing(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  return (
    <div className="min-h-screen">
      <div className="py-12 px-8 border-b">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Travel Planner</h1>
          <p className="text-muted-foreground mb-8">
            AI-powered travel planning with budget-based navigation to official booking sites
          </p>

          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor="destination" className="text-sm mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Destination
                </Label>
                <Input
                  id="destination"
                  placeholder="e.g., Goa, Manali, Kerala, Dubai"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  data-testid="input-destination"
                />
              </div>
              <div>
                <Label htmlFor="dates" className="text-sm mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Travel Dates
                </Label>
                <Input
                  id="dates"
                  placeholder="e.g., Next month, Dec 15-22"
                  value={dates}
                  onChange={(e) => setDates(e.target.value)}
                  data-testid="input-dates"
                />
              </div>
              <div>
                <Label htmlFor="budget" className="text-sm mb-2 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4" />
                  Budget (Optional)
                </Label>
                <Input
                  id="budget"
                  type="text"
                  placeholder="e.g., ₹150000, ₹200000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  data-testid="input-budget"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <Label htmlFor="query" className="text-sm mb-2 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Travel Request
              </Label>
              <Input
                id="query"
                placeholder="Describe your trip (e.g., 'Book a train to Mumbai' or 'Plan a trip to Goa with ₹50000 budget')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-12 text-base"
                data-testid="input-booking-query"
              />
            </div>

            <Button 
              onClick={handleAnalyze} 
              disabled={!query.trim() || isAnalyzing}
              className="w-full h-12"
              data-testid="button-analyze"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isAnalyzing ? "Planning Your Trip..." : "Plan My Trip"}
            </Button>

            {detectedIntent && (
              <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                <p className="text-sm font-medium mb-1">
                  Trip Plan Ready: <span className="text-primary capitalize">{detectedIntent === "packages" ? "Complete Package Deals" : detectedIntent}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {budget && `Budget: ${budget} • `}
                  {destination && `Destination: ${destination} • `}
                  {dates && `Dates: ${dates} • `}
                  Navigate to official booking sites below
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {detectedIntent && (
        <div className="py-8 px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-semibold mb-2">Official Booking Sites</h2>
            <p className="text-muted-foreground mb-6">
              Click to navigate to trusted booking platforms. {budget && `Sites below are optimized for budget-conscious travelers.`}
            </p>
            
            <Tabs defaultValue={detectedIntent} className="w-full">
              <TabsList>
                <TabsTrigger value="packages">Package Deals</TabsTrigger>
                <TabsTrigger value="flights">Flights</TabsTrigger>
                <TabsTrigger value="trains">Train Tickets</TabsTrigger>
                <TabsTrigger value="hotels">Hotels</TabsTrigger>
                <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
              </TabsList>
              
              {Object.entries(bookingSites).map(([category, sites]) => (
                <TabsContent key={category} value={category} className="mt-6">
                  {category === "packages" && budget && (
                    <Card className="p-4 mb-4 bg-green-500/10 border-green-500/20">
                      <p className="text-sm font-medium text-green-700 dark:text-green-400">
                        💡 Budget Tip: Package deals (flight + hotel) typically save 10-30% compared to booking separately. 
                        Best value for trips 3+ nights.
                      </p>
                    </Card>
                  )}
                  {category === "trains" && (
                    <Card className="p-4 mb-4 bg-blue-500/10 border-blue-500/20">
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                        🚂 Train Travel Tip: Book early for confirmed tickets. Use IRCTC for official bookings, RailYatri for predictions, 
                        and Confirmtkt for waitlisted alternatives. Check train running status before departure.
                      </p>
                    </Card>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sites.map((site) => (
                      <BookingSiteCard key={site.name} {...site} />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      )}

      {!detectedIntent && (
        <div className="py-16 px-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-center">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">1. Describe Your Trip</h3>
                <p className="text-sm text-muted-foreground">
                  Tell us where you want to go, when, and your budget
                </p>
              </Card>
              <Card className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">2. AI Analyzes Intent</h3>
                <p className="text-sm text-muted-foreground">
                  Our agent detects what you need and finds the best sites
                </p>
              </Card>
              <Card className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">3. Navigate to Book</h3>
                <p className="text-sm text-muted-foreground">
                  Click to go to official sites with your search parameters
                </p>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
