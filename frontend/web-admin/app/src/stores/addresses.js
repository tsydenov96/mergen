import axios from "axios";
import { defineStore } from "pinia";



export const useAddressesStore = defineStore({
    id: 'adressesList',
    // state: () => ({}),
    actions:{
        async getAdressesList(tablePage, tableLimit){
            try {
                const user = JSON.parse(localStorage.getItem('user'))
                const token = user.data.token
                const page = tablePage ? tablePage : 1
                const limit = tableLimit ? Number(tableLimit) : null
                const data = await axios.get(
                        `/addresses`, 
                        { 
                            headers: { 'Authorization': `Bearer ${ token }` }, 
                            params: {page, limit}
                        },
                    )
                    .then((response) => {return response.data})
                console.log(data.data);
                return data
            } catch (error) {
                console.log(error);
                throw error
            }
        },
        async getAddresses(){
            try {
                const user = JSON.parse(localStorage.getItem('user'))
                const token = user.data.token
                // const page = tablePage ? tablePage : 1
                // const limit = tableLimit ? Number(tableLimit) : null
                const data = await axios.get(
                    `/addresses`, 
                    { 
                        headers: { 'Authorization': `Bearer ${ token }` }
                    },
                )
                    .then((response) => {return response.data})
                // data.data.forEach(item => item.polygon = item.polygon.map(pol => pol = [pol.lat, pol.long]) )
                console.log(data.data);
                return data
            } catch (error) {
                console.log(error.message);
                throw error
            }
        },
        async setAddress(newAddress){
            try {                
                const user = JSON.parse(localStorage.getItem('user'))
                const token = user.data.token
                const data = await axios.post(
                    '/addresses',
                    newAddress,
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
        }
    }
})

/*export const addressSchema = z.object({
  polygon: z.array(z.object({
    lat: z.number(),
    long: z.number(),
  })),
  city: z.string(),
  district: z.string(),
  devices: z.array(z.object({
    lat: z.number(),
    long: z.number(),
    deviceId: idPreprocess,
  })).default([]).optional(),
  adminId: idPreprocess.optional(),
}).merge(resourceSchema)
*/