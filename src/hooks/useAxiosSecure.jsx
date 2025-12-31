
import axios from 'axios';

 const axiosSecure = axios.create({
    baseURL: 'https://eventsphare-server-psun.onrender.com',
    headers: {
        Authorization: `Bearer ${localStorage?.getItem('token')}` 
    }
});

export default  axiosSecure