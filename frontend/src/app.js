import {Router} from "./router.js";

class App {
    constructor() {
        this.router = new Router()
        window.addEventListener('DOMContentLoaded', this.handleRouteChanging.bind(this));
        window.addEventListener('hashchange', this.handleRouteChanging.bind(this));  // 'popstate' - специальное событие будет возникать при смене url
    }

    handleRouteChanging() {
        this.router.openRoute();
    }


}

(new App());