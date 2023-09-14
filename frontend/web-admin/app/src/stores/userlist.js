import axios from "axios";
import { defineStore } from "pinia";



export const useUserlistStore = defineStore({
    id: 'userList',
    // state: () => ({}),
    actions:{
        async getUserlist(tablePage, tableLimit){
            try {
                const user = JSON.parse(localStorage.getItem('user'))
                const token = user.data.token
                const page = tablePage ? tablePage : 1
                const limit = tableLimit ? Number(tableLimit) : null
                const data = await axios.get(
                    `/users`, 
                    { 
                        headers: { 'Authorization': `Bearer ${ token }` }, 
                        params: {page, limit} 
                    }
                    )
                    .then((response) => {return response.data})
                console.log(data.data);
                return data
            } catch (error) {
                console.log(error);
                throw error
            }
        },
        async setAccess(_id, access){
            try {
                const user = JSON.parse(localStorage.getItem('user'))
                const token = user.data.token
                // const userData = user.data.data.user
                const headers = { "Authorization": `Bearer ${ token }` } 
                const resData = await axios.put(`/users/permit/${_id}`, {'access': access}, {headers})
                .then((response) => {return response.data})
                // console.log(user.data.data.user);
                // console.log(resData);

            } catch (error) {
                console.log(error.message);
                throw error;
            }
        }
    }
})