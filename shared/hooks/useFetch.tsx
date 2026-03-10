import {useState, useEffect} from 'react';
import axios from 'axios';

const useFetch = () => {
  async function fetchData({pageParam = 1, options = {}, endpoint}: any) {
    try {
      const response = await axios.get(endpoint);

      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  return {fetchData};
};

export default useFetch;
