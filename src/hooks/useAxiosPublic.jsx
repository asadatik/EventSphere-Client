import axios from "axios";

const axiosPublic = axios.create({
    baseURL: "https://eventsphare-server-psun.onrender.com"
})

const useAxiosPublic = () => {
    return axiosPublic;
}

export default useAxiosPublic;