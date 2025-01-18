import { useNavigate } from "react-router-dom";

const SellerCard = ({ seller }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/seller/${seller.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="border border-gray-500 p-4 rounded-lg cursor-pointer hover:shadow-sm hover:shadow-white"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-white">{seller.name}</h3>
          <p>{seller.location}</p>
          <p>{seller.category}</p>
        </div>
        <div className="w-24 h-24 rounded-full bg-gray-200 border-2 border-primary overflow-hidden">
          <img
            src={seller.profilePicture || "/default-profile.png"}
            // alt={seller.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>     
    </div>
  );
};

export default SellerCard;
