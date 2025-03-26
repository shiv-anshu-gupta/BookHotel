import { useQuery } from "@tanstack/react-query";
import * as apiClient from "../api-client";
import LatestDestinationCard from "../components/LatestDestinationCard";

const Home = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["fetchQuery"],
    queryFn: apiClient.fetchHotels,
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error fetching hotels: {error.message}</p>;

  const topRowHotels = data?.slice(0, 2) || [];
  const bottomRowHotels = data?.slice(2) || [];

  return (
    <div className="space-y-3">
      <h2 className="text-3xl font-bold">Latest Destination</h2>
      <p>Most recent destinations added by our hotels</p>
      <div className="grid gap-4">
        <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
          {topRowHotels.map((hotel) => (
            <LatestDestinationCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {bottomRowHotels.map((hotel) => (
            <LatestDestinationCard key={hotel.id} hotel={hotel} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
