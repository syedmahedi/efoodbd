import { useNavigate } from "react-router-dom";

const SellerCard = ({ seller }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/seller/${seller.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="border p-4 rounded-lg cursor-pointer hover:shadow-md"
    >
      <h3 className="text-xl font-bold">{seller.name}</h3>
      <p>{seller.location}</p>
      <p>{seller.category}</p>
    </div>
  );
};

export default SellerCard;
