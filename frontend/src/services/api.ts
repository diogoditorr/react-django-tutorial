import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8001",
    validateStatus: status => status < 500,
    withCredentials: true
});

export default api;
