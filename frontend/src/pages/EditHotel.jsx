import { useMutation, useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import * as apiClient from "../api-client";
import ManageHotelForm from "../forms/ManageHotelForm/ManageHotelForm";
const EditHotel = () => {
  const { hotelId } = useParams();

  const { data } = useQuery(
    "fetchMyHotelById",
    () => apiClient.fetchMyHotelById(hotelId || ""),
    {
      enabled: !!hotelId,
    }
  );

  const { mutate, isLoading } = useMutation(apiClient.updateMyHotelById, {
    onSuccess: () => {},
    onError: () => {},
  });

  const handleSave = (hotelFormData) => {
    mutate(hotelFormData);
  };
  return (
    <ManageHotelForm hotel={data} onSave={handleSave} isLoading={isLoading} />
  );
};

export default EditHotel;
