
import axios from 'axios';

 const axiosSecure = axios.create({
    baseURL: 'https://event-sphare-server-one.vercel.app',
    headers: {
        Authorization: `Bearer ${localStorage?.getItem('token')}` 
    }
});

export default  axiosSecure