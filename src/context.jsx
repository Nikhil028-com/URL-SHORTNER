/* eslint-disable react/prop-types */
// this file is for state management and handling state of the user
// inside this we will fetch current's logged in user session
import {createContext, useContext, useEffect} from "react";
import {getCurrentUser} from "./db/apiAuth";
import useFetch from "./hooks/use-fetch";

const UrlContext = createContext();

const UrlProvider = ({children}) => {
  const {data: user, loading, fn: fetchUser} = useFetch(getCurrentUser);
  // this line is just to check if the user is currentlu logged in or not
  const isAuthenticated = user?.role === "authenticated";

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UrlContext.Provider value={{user, fetchUser, loading, isAuthenticated}}>
      {children}
    </UrlContext.Provider>
  );
};

export const UrlState = () => {
  // to access the state of the app
  return useContext(UrlContext);
};

export default UrlProvider;
