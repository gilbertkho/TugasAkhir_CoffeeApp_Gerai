import axios from 'axios';
import urlConfig from './backend';

export default axios.create({
  baseURL: urlConfig.urlBackend,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});
