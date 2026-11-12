// this is for handling the api calls so that we have to not repeat the same
// process again and again 

import {useState} from "react";
// it's a function taking a callfxn cb and options related to it
const useFetch = (cb, options = {}) => {
  // created 3 states inside it
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const fn = async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await cb(options, ...args);
      setData(response);
      setError(null);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return {data, loading, error, fn};
};

export default useFetch;
