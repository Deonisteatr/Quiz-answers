import {Form} from "./components/form.js";
import {Choice} from "./components/choice.js";
import {Test} from "./components/test.js";
import {Result} from "./components/result.js";
import {Auth} from "./services/auth.js";
import {Answer} from "./components/answer.js";

export class Router {
    constructor() {
        this.contentElement = document.getElementById('content');
        this.stylesElement = document.getElementById('styles');
        this.pageTitleElement = document.getElementById('page-title');
        this.profileElement = document.getElementById('profile');
        this.profileFullNameElement = document.getElementById('profile-full-name');

        this.routes = [
            {
                route: '#/',
                pageTitle: 'Главная',
                template: 'templates/index.html',
                styles: 'css/index.css',
                load: () => {
                },
            },
            {
                route: '#/signup',
                pageTitle: 'Регистрация',
                template: 'templates/signup.html',
                styles: 'css/form.css',
                load: () => {
                    new Form('signup');
                },
            },
            {
                route: '#/login',
                pageTitle: 'Вход в систему',
                template: 'templates/login.html',
                styles: 'css/form.css',
                load: () => {
                    new Form('login');
                },
            },
            {
                route: '#/choice',
                pageTitle: 'Выбор теста',
                template: 'templates/choice.html',
                styles: 'css/choice.css',
                load: () => {
                    new Choice()
                },
            },
            {
                route: '#/test',
                pageTitle: 'Прохождение теста',
                template: 'templates/test.html',
                styles: 'css/test.css',
                load: () => {
                    new Test()
                },
            },
            {
                route: '#/result',
                pageTitle: 'Результаты',
                template: 'templates/result.html',
                styles: 'css/result.css',
                load: () => {
                    new Result()
                },
            },
            {
                route: '#/answer',
                pageTitle: 'Правильные ответы',
                template: 'templates/answer.html',
                styles: 'css/answer.css',
                load: () => {
                    new Answer()
                },
            },
        ];
    }

    // Создаем функцию перехода на нужную страницу (route)
    async openRoute() {
        const urlRout = window.location.hash.split('?')[0]; //hash - это то, что в адресной строке после слеша
        if (urlRout === '#/logout') {
            await Auth.logout();
            window.location.hash = '#/';
            return;
        }

        const newRoute = this.routes.find(item => {
            return item.route === urlRout;
        });
        // Если роут не найдется
        if (!newRoute) {
            window.location.hash = '#/'; //переместим пользователя на какую-то страницу(в данном случае на главную
            return;
        }

        // Если роут найден загружаем следующее:
        this.contentElement.innerHTML =
            await fetch(newRoute.template).then(response => response.text()); //адрес страницы html
        this.stylesElement.setAttribute('href', newRoute.styles); //адрес страницы css
        this.pageTitleElement.innerText = newRoute.pageTitle; //title страницы в шапке

        const userInfo = Auth.getUserInfo();
        const accessToken = localStorage.getItem(Auth.accessTokenKey);
        if (userInfo && accessToken) {
            this.profileElement.style.display = 'flex';
            this.profileFullNameElement.innerText = userInfo.fullName;
        } else {
            this.profileElement.style.display = 'none';
        }

        newRoute.load(); //компонент скрипта

    }
}