import { useNavigate } from "react-router-dom";
import { Home, AlertCircle } from "lucide-react";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-[50%] animate-pulse">
         <img src="/images/svgs/401-unauthorized.svg" alt="" />
      </div>
    </div>
  );
};

export default Unauthorized;