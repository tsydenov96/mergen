import axios from 'axios';
import { defineStore } from 'pinia'
import router from '../router';

axios.defaults.baseURL = import.meta.env.VITE_API_URL

export const useAuthStore = defineStore({
  id: 'auth',
  // namespace: true,
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) ?? null,
    userMenus: JSON.parse(localStorage.getItem('menus'))?.map((val) => (val)) ?? null,
    userRole: JSON.parse(localStorage.getItem('role')) ?? null,
    // accesToken: localStorage.getItem('accesToken') ?? null,
    // refreshToken: localStorage.getItem('refreshToken') ?? null,
    returnUrl: '',//
  }),
  actions: {
    async login(email, password) {
      try {
        const userData = { email, password }
        const user = await axios.post(`/login`, userData)
        console.log(axios.defaults.baseURL);
        //EXAMPLE TO MENU
        // Object.assign(user.data.data.user, {rules: ["USERS", "ABOUT"]});
        // Object.assign(user.data.user, {rules: ["USERS", "ROLES", "DEVICES", "EVENTS", "ADDRESS"]});
        //EXAMPLE END
        console.log(user);
        let menusList = user.data.menus
        const menus = await axios.get(
          `/menus`,
          {
            headers:{ 'Authorization': `Bearer ${ user.data.token }` }
          }
        );
        // Object.assign(user.data.user, {rules: menusList});
        // user.data.menus = menus.data.data
        // console.log(user);
        let roleId = user.data.user.roleId
        const role = await axios.get(
          '/roles',{
            headers:{ 'Authorization': `Bearer ${ user.data.token }` }
          }
        )
        console.log(menus);
        // console.log(roleId);;
        let rolesList = role.data.data.find( ({_id}) => _id === roleId );
        console.log(Object.entries(rolesList.rules));

        menusList = menus.data.data;
        menusList.forEach(elem => 
          Object.entries(rolesList.rules).forEach(rol => { 
            if(elem.name.includes(rol[0]) && rol[1][0].actions.length === 0) 
                menusList.splice(menusList.indexOf(elem), 1)
            })
        )
        console.log(menusList);

        this.userMenus = menusList;
        this.user = user;
        this.userRole = rolesList
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('menus', JSON.stringify(menusList));
        localStorage.setItem('role', JSON.stringify(this.userRole));
        
        // console.log(menusList);
        // router.push('/home')
        router.push(`/${this.userMenus[0].name.toLowerCase()}`)
      } catch (error) {
        console.log(error.message);
        // throw authErrors(error)
        throw error
      }
    },
    // async signup(username, email, password) {
    //   try {
    //     const userData = { username, email, password }
    //     const user = await axios.post(`/signup`, userData)
    //     this.user = user
    //     localStorage.setItem('user', JSON.stringify(user))
    //     router.push('/')
    //   } catch (error) {
    //     console.log(error);
    //     // throw authErrors(error)
    //     throw error
    //   }
    // },
    logout() {
      this.user = null;
      this.userRules = null
      localStorage.removeItem('user');
      localStorage.removeItem('menus');
      // router.push('/')
    },
    
  }

})
