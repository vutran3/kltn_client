import axios from "axios";
const { VITE_APP_API_URI } = import.meta.env;

const instance = axios.create({
    baseURL: VITE_APP_API_URI
});

export default instance;
