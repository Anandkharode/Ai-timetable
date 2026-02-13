import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.clear();      // remove token
    navigate("/login", { replace: true });
    window.location.reload();  // re-check auth
  }, [navigate]);

  return <h3>Logging out...</h3>;
}

export default Logout;
