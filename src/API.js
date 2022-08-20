import axios from 'axios';

let axiosOpts = {
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60 * 1000,
}

if (!process.env.production)
{
  axiosOpts = {
    ...axiosOpts,
    withCredentials: true,
  }
}

const API = axios.create(axiosOpts);

export default API;