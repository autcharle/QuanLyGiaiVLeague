import axios from "axios";

const API_URL = '/api/seasons/';

// Get user goal
const getASeason = async (id) => {

  
    const response = await axios.get(API_URL + id)
  
    return response.data
  }
const seasonService = {
    getASeason
}
export default seasonService;
