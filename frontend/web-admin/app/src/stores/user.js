import axios from 'axios';
import { defineStore } from 'pinia';
import { useAuthStore } from './auth';



export const useUserStore = defineStore({
    id: 'userInfo',
    state: () => ({
        // user: JSON.parse(localStorage.getItem('user')) ?? null,
        // userRules: JSON.parse(localStorage.getItem('user')).data?.data.user.rules ?? null,
    }),
    actions:{
        async getUser(){
            try {
                const user = JSON.parse(localStorage.getItem('user'))
                const token = user.data.token
                console.log(token);
                const data = await axios.get(`/me`, {headers: { 'Authorization': `Bearer ${ token }`},  }).then((response) => {return response.data})
                console.log(data.data);
                return data
            } catch (error) {
                console.log(error);
            }
        },
        // async getUserRules(){
        //     try{
        //         const user = JSON.parse(localStorage.getItem('user'))
        //         this.userRules = user.data.data.user.rules
        //         return this.userRules
        //     } catch(error) {
        //         console.log(`GetRulesUser${error}`);
        //     }
        // }
    }

})
