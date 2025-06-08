import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function useUserIdParser() {
  const location = useLocation();


  useEffect(() => {
    
    const params = new URLSearchParams(location.search);
    const userId = params.get("userId");

    if (userId) {
      localStorage.setItem("userId", userId);
     console.log("iddddddddd",localStorage.getItem("userId"))
    
    }

  }, [location]);
}
