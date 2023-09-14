import axios from "axios";
import { defineStore } from "pinia";



export const useDevicesStore = defineStore({
    id: 'devicesList',
    // state: () => ({}),
    actions:{
        async getDevicesList(tablePage, tableLimit){
            try {
                const user = JSON.parse(localStorage.getItem('user'))
                const token = user.data.token
                const page = tablePage ? tablePage : 1
                const limit = tableLimit ? Number(tableLimit) : null
                const data = await axios.get(
                        `/devices`, 
                        { 
                            headers: { 'Authorization': `Bearer ${ token }` }, 
                            params: {page, limit}
                        },
                    )
                    .then((response) => {return response.data})
                    //TO EXMPLE 
                console.log(data);
                // data.data.forEach(elem => {
                //     Object.assign(elem, {user_id: "6396c409e3a5ad930a38acd6"});
                // });
                //
                console.log(data.data);
                return data
            } catch (error) {
                console.log(error.message);
                throw error
            }
        },
        async setDevice(newDevice){
            try {                
                const user = JSON.parse(localStorage.getItem('user'))
                const token = user.data.token
                const data = await axios.post(
                    '/devices',
                    newDevice,
                    {
                        headers: { 'Authorization': `Bearer ${ token }` }
                    },
                )
                .then((response) => {return response.data})
                console.log(data);
                return data
            } catch (error) {
                console.log(error.message);
                throw error;
            }
        },
        async deleteDevice(deviceId){
            try {
                const user = JSON.parse(localStorage.getItem('user'))
                const token = user.data.token
                const data = await axios.delete(
                    `/devices/${deviceId}`,
                    {
                        headers: { 'Authorization': `Bearer ${ token }` }
                    }
                )
                .then((response) => {return response.data})
                console.log(data);
                return data
            } catch (error) {
                console.log(error.message);
            }
        }
    }
})