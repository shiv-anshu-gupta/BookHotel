import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import * as apiClient from "../api-client";
import ManageHotelForm from "../forms/ManageHotelForm/ManageHotelForm";

const EditHotel = () => {
  const { hotelId } = useParams();

  // ✅ Corrected useQuery for React Query v5
  const { data } = useQuery({
    queryKey: ["fetchMyHotelById", hotelId], // ✅ Using array format for better caching
    queryFn: () => apiClient.fetchMyHotelById(hotelId || ""),
    enabled: !!hotelId, // ✅ Only fetch if hotelId exists
  });

  // ✅ Corrected useMutation for React Query v5
  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: apiClient.updateMyHotelById,
    onSuccess: () => {
      console.log("Hotel updated successfully");
    },
    onError: (error) => {
      console.error("Error updating hotel:", error);
    },
  });

  const handleSave = (hotelFormData) => {
    mutate(hotelFormData);
  };

  return (
    <ManageHotelForm hotel={data} onSave={handleSave} isLoading={isLoading} />
  );
};

export default EditHotel;
