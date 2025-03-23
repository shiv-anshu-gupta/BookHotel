import { hotelTypes } from "../config/hotel-options-config";

const HotelTypesFilter = ({ selectedHotelTypes, onChange }) => {
  return (
    <div className="border-b border-slate-300 pb-5">
      <h4 className="text-md font-semibold mb-2">Hotel Type</h4>
      {hotelTypes.map((type) => (
        <label key={type} className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="rounded"
            value={type}
            checked={selectedHotelTypes.includes(type)}
            onChange={onChange} // Add this to handle changes
          />
          <span>{type}</span>
        </label>
      ))}
    </div>
  );
};

export default HotelTypesFilter;
