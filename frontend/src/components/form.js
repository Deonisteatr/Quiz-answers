import {CustomHttp} from "../services/custom-http.js";
import {Auth} from "../services/auth.js";
import config from "../../config/config.js";

export class Form {

    constructor(page) {// Добавили параметр "page"
        //создаем валидацию наших полей формы
        this.agreeElement = null;
        this.processElement = null;
        this.page = page; //Добавили переменную "page"

        const accessToken = localStorage.getItem(Auth.accessTokenKey);
        if (accessToken) {
            location.href = '#/choice';
            return;
        }

        //сперва создаем массив fields - в котором будет содержаться каждое наше текстовое поле
        this.fields = [
            {
                name: 'email',
                id: 'email',
                element: null,
                regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                valid: false,
            },
            {
                name: 'password',
                id: 'password',
                element: null,
                regex: /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
                valid: false,
            },
        ];

        if (this.page === 'signup') {
            this.fields.unshift({
                    name: 'name',
                    id: 'name',
                    element: null,
                    regex: /^[А-Я][а-я]+\s*$/,
                    valid: false,  //свойство для проверки валидности поля
                },
                {
                    name: 'lastName',
                    id: 'last-name',
                    element: null,
                    regex: /^[А-Я][а-я]+\s*$/,
                    valid: false,
                },)
        }

        const that = this; //"that" - переменная для замыкания (в нее будет попадать объект "Form")
        this.fields.forEach(item => {
            // инициализируем каждое поле
            item.element = document.getElementById(item.id);
            // вешаем обработчик события - изменения поля
            item.element.onchange = function () {
                that.validateField.call(that, item, this);
            }
        });
        this.processElement = document.getElementById('process');
        this.processElement.onclick = function () {
            that.processForm();
        };

        if (this.page === 'signup') {
            this.agreeElement = document.getElementById('agree');
            // Вешаем обработчик на чекбокс
            this.agreeElement.onchange = function () {
                that.validateForm();
            }
        }
    }

    //Cоздаем отдельную функцию для валидации каждого поля
    validateField(field, element) {
        if (!element.value || !element.value.match(field.regex)) {
            element.parentNode.style.borderColor = 'red'; //окрашиваем рамку родительского элемента в красный
            field.valid = false;
        } else {
            element.parentNode.removeAttribute('style'); //удаляем красную рамку
            field.valid = true;
        }
        this.validateForm();
    }

    // Создаем функцию для валидации всей формы
    validateForm() {
        const validForm = this.fields.every(item => item.valid);
        const isValid = this.agreeElement ? this.agreeElement.checked && validForm : validForm;
        // Активируем кнопку при условии:
        if (isValid) {
            this.processElement.removeAttribute('disabled');
        } else {
            this.processElement.setAttribute('disabled', 'disabled');
        }
        return isValid;
    }

    //Создаем функцию "processForm", которая будет собирать данные полей и перекидывать их через url(),
    // а также обеспечит переход на следующую страницу
    async processForm() {
        if (this.validateForm()) {
            const email = this.fields.find(item => item.name === 'email').element.value;
            const password = this.fields.find(item => item.name === 'password').element.value;

            // Создаем соответствующие запросы для каждой из страниц
            if (this.page === 'signup') {

                try {
                    // Запрос для "signup"
                    const result = await CustomHttp.request(config.host + '/signup', 'POST', {
                        name: this.fields.find(item => item.name === 'name').element.value,
                        lastName: this.fields.find(item => item.name === 'lastName').element.value,
                        email: email,
                        password: password,
                    })

                    if (result) {
                        if (result.error || !result.user) {
                            throw new Error(result.message);
                        }

                        const loginResult = await CustomHttp.request(config.host + '/login', 'POST', {
                            email: email,
                            password: password,
                        });
                        if (loginResult) {
                            if (loginResult.error || !loginResult.accessToken || !loginResult.refreshToken
                            || !loginResult.fullName || !loginResult.userId) {
                                throw new Error(loginResult.message);
                            }
                            Auth.setTokens(loginResult.accessToken, loginResult.refreshToken);
                            location.href = '#/choice';
                            Auth.setUserInfo({
                                fullName: loginResult.fullName,
                                userId: loginResult.userId,
                                email: loginResult.email,
                            })
                        }
                    }
                } catch (error) {
                    console.log(error);
                }
            } else {
                try {
                    // Запрос для "login"
                    const result = await CustomHttp.request(config.host + '/login', 'POST', {
                        email: email,
                        password: password,
                    })

                    if (result) {
                        if (result.error || !result.accessToken || !result.refreshToken
                            || !result.fullName || !result.userId) {
                            throw new Error(result.message);
                        }

                        Auth.setTokens(result.accessToken, result.refreshToken);
                        Auth.setUserInfo({
                            fullName: result.fullName,
                            userId: result.userId,
                            email: email,
                        })
                        location.href = '#/choice';
                    }
                } catch (error) {
                    console.log(error);
                }
            }

        }
    }
}
