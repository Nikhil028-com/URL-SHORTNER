import {useNavigate} from "react-router-dom";
import {useEffect} from "react";
import {UrlState} from "@/context";
import {BarLoader} from "react-spinners";

function RequireAuth({children}) {
  const navigate = useNavigate();

  const {loading, isAuthenticated} = UrlState();

  useEffect(() => {
    // means if user is not logged in then route them to login page 
    // they are not allowed to go to dashboard without login
    if (!isAuthenticated && loading === false) navigate("/auth");
  }, [isAuthenticated, loading]);

  if (loading) return <BarLoader width={"100%"} color="#36d7b7" />;

  if (isAuthenticated) return children;
}

export default RequireAuth;
