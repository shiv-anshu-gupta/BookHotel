const StarRatingFilter = ({ selectedStars, onChange }) => {
  return (
    <div className="border-b border-slate-300">
      <h4 className="text-md font-semibold mb-2">Property Rating</h4>
      {["5", "4", "3", "2", "1"].map((star) => (
        <label key={star} className="flex items-center space-x-2">
          <input
            type="checkbox"
            value={star}
            className="rounded"
            checked={selectedStars.includes(star)}
            onChange={onChange}
          />
          <span>{star} Stars</span>
        </label>
      ))}
    </div>
  );
};

export default StarRatingFilter;
