import { useSearchContext } from "../context/SearchContext";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import * as apiClient from "../api-client";
import SearchResultsCard from "../components/SearchResultsCard";
import Pagination from "../components/Pagination";
import StarRatingFilter from "../components/StarRatingFilter";
import HotelTypesFilter from "../components/HotelTypesFilter";
import FacilitiesFilter from "../components/FacilitiesFilter";
import PriceFilter from "../components/PriceFilter";

const Search = () => {
  const search = useSearchContext();
  const [page, setPage] = useState(1);
  const [selectedStars, setSelectedStars] = useState([]);
  const [selectedHotelTypes, setSelectedHotelTypes] = useState([]);
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [selectedPrice, setSelectedPrice] = useState();
  const [sortOption, setSortOption] = useState("");

  const searchParams = {
    destination: search.destination || "",
    checkIn: search.checkIn ? search.checkIn.toISOString() : null,
    checkOut: search.checkOut ? search.checkOut.toISOString() : null,
    adultCount: search.adultCount?.toString() || "1",
    childCount: search.childCount?.toString() || "0",
    page: page.toString(),
    stars: selectedStars,
    types: selectedHotelTypes,
    facilities: selectedFacilities,
    maxPrice: selectedPrice?.toString(),
    sortOption,
  };

  // ✅ Updated useQuery for React Query v5
  const { data, isError, error, isLoading } = useQuery({
    queryKey: ["SearchHotels", searchParams], // Corrected query key structure
    queryFn: () => apiClient.searchHotels(searchParams),
    keepPreviousData: true, // Keeps previous data while fetching new data
    onError: (err) => console.error("Error fetching hotels:", err),
  });

  const handleStarsChange = (event) => {
    const starRating = event.target.value;
    setSelectedStars((prevStars) =>
      event.target.checked
        ? [...prevStars, starRating]
        : prevStars.filter((star) => star !== starRating)
    );
  };

  const handleHotelTypeChange = (event) => {
    const hotelType = event.target.value;
    setSelectedHotelTypes((prevHotelTypes) =>
      event.target.checked
        ? [...prevHotelTypes, hotelType]
        : prevHotelTypes.filter((type) => type !== hotelType)
    );
  };

  const handleFacilityChange = (event) => {
    const facility = event.target.value;
    setSelectedFacilities((prevFacilities) =>
      event.target.checked
        ? [...prevFacilities, facility]
        : prevFacilities.filter((prevFacility) => prevFacility !== facility)
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-5">
      {/* Sidebar with filters */}
      <div className="rounded-lg border border-slate-300 p-5 h-fit sticky top-10">
        <div className="space-y-5">
          <h3 className="text-lg font-semibold border-b border-slate-300 pb-5">
            Filter by:
          </h3>
          <StarRatingFilter
            selectedStars={selectedStars}
            onChange={handleStarsChange}
          />
          <HotelTypesFilter
            selectedHotelTypes={selectedHotelTypes}
            onChange={handleHotelTypeChange}
          />
          <FacilitiesFilter
            selectedFacilities={selectedFacilities}
            onChange={handleFacilityChange}
          />
          <PriceFilter
            selectedPrice={selectedPrice}
            onChange={(value) => setSelectedPrice(value)}
          />
        </div>
      </div>

      {/* Results Section */}
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">
            {data?.pagination?.total ?? 0} Hotels found{" "}
            {search.destination ? `in ${search.destination}` : ""}
          </span>

          <select
            value={sortOption}
            onChange={(event) => setSortOption(event.target.value)}
            className="p-2 border rounded-md"
          >
            <option value="">Sort By</option>
            <option value="starRating">Star Rating</option>
            <option value="pricePerNightAsc">
              Price Per Night (low to high)
            </option>
            <option value="pricePerNightDesc">
              Price Per Night (high to low)
            </option>
          </select>
        </div>

        {/* ✅ Loading State */}
        {isLoading && <p>Loading hotels...</p>}

        {/* ✅ Error State */}
        {isError && <p className="text-red-500">Error: {error.message}</p>}

        {/* ✅ Results Section */}
        {!isLoading &&
        !isError &&
        Array.isArray(data?.data) &&
        data.data.length > 0 ? (
          data.data.map((hotel) => (
            <SearchResultsCard key={hotel.id} hotel={hotel} />
          ))
        ) : (
          <p>No hotels found.</p>
        )}

        {/* ✅ Pagination */}
        {data?.pagination?.pages > 1 && (
          <Pagination
            page={data?.pagination?.page || 1}
            pages={data?.pagination?.pages || 1}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
};

export default Search;
