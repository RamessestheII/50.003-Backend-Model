//import api from './api';
import axios from "axios";
// store our JWT in LS and set axios headers if we do have a token

const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
    //localStorage.setItem('token', token);
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
    //localStorage.removeItem('token');
  }
};

export default setAuthToken;
