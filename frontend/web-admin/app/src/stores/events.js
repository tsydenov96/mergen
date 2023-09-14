import axios from "axios";
import { defineStore } from "pinia";



export const useEventsStore = defineStore({
    id: 'adressList',
    // state: () => ({}),
    actions:{
        async getEventsList(tablePage, tableLimit){
            try {
                const user = JSON.parse(localStorage.getItem('user'))
                const token = user.data.data.token
                const page = tablePage ? tablePage : 1
                const limit = tableLimit ? Number(tableLimit) : null
                const data = await axios.get(
                        `/events`, 
                        { 
                            headers: { 'Authorization': `Bearer ${ token }` }, 
                            params: {page, limit}
                        },
                    )
                    .then((response) => {return response.data})
                    //TO EXMPLE 
                    data.data.events.forEach(elem => {
                        Object.assign(elem, {user_id: "633514607a5309786336b3c0"});
                    });
                    //
                console.log(data.data);
                return data
            } catch (error) {
                console.log(error);
                throw error
            }
        }
    }
})