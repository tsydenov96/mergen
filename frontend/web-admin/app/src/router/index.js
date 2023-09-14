import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth';
import HomeView from '@/views/HomeView.vue';
import LoginView from '@/views/LoginView.vue';
import UserListView from '@/views/UserListView.vue';
import AboutView from '@/views/AboutView.vue';
import RolesView from '@/views/RolesView.vue';
import DevicesView from '@/views/DevicesView.vue';
import StatisticsView from '@/views/StatisticsView.vue';
import EventsView from '@/views/EventsView.vue';
import AddressView from '@/views/AddressView.vue';
import SettingsView from '@/views/SettingsView.vue';
import PurchasesView from '@/views/PurchasesView.vue';
import ControlView from '@/views/ControlView.vue';
import MapView from '@/views/MapView.vue';
import Error500 from '@/components/Error500.vue';

const views = {
    STATISTICS: StatisticsView,
	DEVICES: DevicesView,
    USERS: UserListView, 
    ROLES: RolesView,
    MAP: MapView,
    PURCHASES: PurchasesView,
	ADDRESSES: AddressView,
    CONTROL: ControlView,
	EVENTS: EventsView,
    // ABOUT: AboutView,
    // HOME: HomeView,
}

const userRoutes = [
    // {
    //     path: '/',
    //     name: 'home',
    //     component: HomeView
    // },
    {
        path: '/login',
        name: 'login',
        component: LoginView
    },
    {
        path: '/settings',
        name: 'settings',
        component: SettingsView
    },
    {
        path: '/:pathMatch(.*)*',
        component: HomeView
    },
    // {
    //     path: '/error500',
    //     component: Error500
    // },
    
    
]
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    linkActiveClass: 'active',
    routes: userRoutes,
});

function menuInit(menusList, rolesList){
    console.log(menusList);
    menusList.forEach(elem => {
        userRoutes.unshift({
            path: `/${elem.name.toLowerCase()}`,
            name: `${elem.name.toLowerCase()}`,
            // name: `${elem[0] + elem.slice(1).toLowerCase()}`,
            component: views[elem.name]
        })
        router.addRoute({
            path: `/${elem.name.toLowerCase()}`,
            name: `${elem.name.toLowerCase()}`,
            // name: `${elem[0] + elem.slice(1).toLowerCase()}`,
            component: views[elem.name]
        })
        // console.log(views[elem].__name);
    });
    // console.log(userRoutes);
}

router.beforeEach(async (to) => {
    // console.log(router);
    const publicPage = ['/login'];
    const authRequired = !publicPage.includes(to.path);
    const auth = useAuthStore();
    
    if(auth.user && (!userRoutes.find(i => i.name === auth.userMenus[0].name.toLowerCase()))){
        let uMenus = auth.userMenus
        let uRoles = auth.userRole
        console.log(`Menus ${uMenus}`);
        console.log(`Roles ${uRoles}`);
        menuInit(uMenus, uRoles)
        router.push(to.path)
    }

    if(authRequired && !auth.user){
        console.log(auth);
        auth.returnUrl = to.fullPath;
        
        return '/login';
    } 
    else if(to.path === '/login' && auth.user){
        return false
        // router.go(-1)
    }
    // console.log(userRoutes?.find(item => item.path === from.path));
    // console.log(router.options.routes);
});

export default router
