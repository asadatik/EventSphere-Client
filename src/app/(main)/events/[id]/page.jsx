import EventDetail from "@/components/allEventsPage/eventDetails/EventDetails"
import axios from "axios"


export const generateMetadata = async ({ params }) => {
    const res = await axios.get(`https://eventsphare-server-psun.onrender.com/events/${params.id}`)
    const event=res.data
    return {
        title: `${event.title}`,
        description: `${event.description}`,
        keywords:event.description.split(' ')
    }
}

const EventDetailsPage = ({ params }) => {
    const { id } = params



    return (
        <div className=" ">
            <EventDetail id={id}/>
        </div>
    )
}

export default EventDetailsPage