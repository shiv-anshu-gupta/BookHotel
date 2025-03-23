import ManageHotelForm from "../forms/ManageHotelForm/ManageHotelForm";
import * as apiClient from "../api-client";
import { useAppContext } from "../context/AppContext";
import { useMutation } from "react-query";
const AddHotel = () => {
  const { showToast } = useAppContext();
  const { mutate, isLoading } = useMutation(apiClient.addMyHotel, {
    onSuccess: () => {
      showToast({ message: "Hotel Saved!", type: "SUCCESS" });
    },
    onerror: () => {
      showToast({
        message: "Error Saving Hotel",
        type: "Error",
      });
    },
  });

  const handleSave = (hotelFormData) => {
    mutate(hotelFormData);
  };
  return <ManageHotelForm onSave={handleSave} isLoading={isLoading} />;
};

export default AddHotel;
