// Создаем класс Choice
import {UrlManager as urlManager} from "../utils/url-manager.js";
import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {Auth} from "../services/auth.js";

export class Choice {

    constructor() {
        // Создаем пустой массив для размещения распарсенных данных из полученного "JSON"
        this.quizzes = [];
        this.testResult = [];
        this.routeParams = urlManager.getQueryParams();

        this.init();
    }

    async init() {
        try {
            // Запрос для "signup"
            const result = await CustomHttp.request(config.host + '/tests');

            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }

                this.quizzes = result;
            }
        } catch (error) {
            return console.log(error);
        }

        const userInfo = Auth.getUserInfo();
        if (userInfo) {
            try {
                const result = await CustomHttp.request(config.host + '/tests/results?userId=' + userInfo.userId);
                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }

                    this.testResult = result;
                } else {
                    location.href = '#/';
                }
            } catch (error) {
                return console.log(error);
            }
        }

        this.processQuizzes();
    }

    processQuizzes() {
        const choiceOptionsElement = document.getElementById('choice-options');
        if (this.quizzes && this.quizzes.length > 0) {
            this.quizzes.forEach(quiz => {
                const that = this;
                const choiceOptionElement = document.createElement('article');
                choiceOptionElement.className = 'choice-option';
                choiceOptionElement.setAttribute('data-id', quiz.id);
                // И добавляем к этому полю обработчик события по клику
                choiceOptionElement.onclick = function () {
                    that.chooseQuiz(this);
                };

                const choiceOptionTextElement = document.createElement('p');
                choiceOptionTextElement.className = 'choice-option-text';
                choiceOptionTextElement.innerText = quiz.name;

                const choiceOptionArrowElement = document.createElement('picture');
                choiceOptionArrowElement.className = 'choice-option-arrow';

                const result = this.testResult.find(item => item.testId === quiz.id);
                if (result) {
                    const choiceOptionResultElement = document.createElement('div');
                    choiceOptionResultElement.className = 'choice-option-result';
                    choiceOptionResultElement.innerHTML = '<div>Результат</div><div>' + result.score + '/' + result.total + '</div>';
                    choiceOptionElement.appendChild(choiceOptionResultElement);
                }

                const choiceOptionImageElement = document.createElement('img');
                choiceOptionImageElement.setAttribute('src', 'static/image/arrow.png');
                choiceOptionImageElement.setAttribute('alt', 'стрелка');

                choiceOptionArrowElement.appendChild(choiceOptionImageElement);
                choiceOptionElement.appendChild(choiceOptionTextElement);
                choiceOptionElement.appendChild(choiceOptionArrowElement);

                choiceOptionsElement.appendChild(choiceOptionElement);
            });
        }
    }

    chooseQuiz(element) {
        const dataId = element.getAttribute('data-id');
        if (dataId) {
            location.href = '#/test?id=' + dataId;
        }
    }
}
