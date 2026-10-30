import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {Auth} from "../services/auth";
import {UrlManager as urlManager} from "../utils/url-manager.js";

export class Answer {
    constructor() {
        //Создаем пустой массив для данных пользователя
        this.userData = [];
        // Создаем объект данных прохождения теста
        this.testResult = null;
        this.routeParams = urlManager.getQueryParams();

        this.init();
    }

    async init() {
        const userInfo = await Auth.getUserInfo();
        if (!userInfo || !userInfo.userId) {
            location.href = '#/';
            return;
        }

        this.userData = [
            {fullName: userInfo.fullName},
            {userId: userInfo.userId},
            {email: userInfo.email}
        ];

        if (!this.routeParams.id) {
            location.href = '#/';
            return;
        }

        try {
            // Запрос для "test"
            const result = await CustomHttp.request(
                config.host + '/tests/' + this.routeParams.id + '/result/details?userId=' +
            userInfo.userId);

            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }

                this.testResult = result;
                this.showSubtitle();
                this.showQuestion();
            }
        } catch (error) {
            console.log(error);
        }
    }

    // Создаем актуальные подзаголовки на странице
    showSubtitle() {
        // Имя теста
        if (this.testResult && this.testResult.test || this.testResult.test.name) {
        document.getElementById('subtitle-span').innerHTML = this.testResult.test.name;
        }
        // Кто проходил
        document.getElementById('test-user').innerHTML = this.userData[0].fullName +
            ', ' + this.userData[2].email;
        // Ссылка обратно к результату
        const backLink = document.getElementById('answer-link');
        if (backLink) {
            backLink.href = '#/result?id=' + this.routeParams.id;
        }
    }

    // Создаем функцию, которая отобразит ответы на странице
    showQuestion() {
        const answersContainer = document.getElementById('answers-container');
        if (!answersContainer || !this.testResult || !this.testResult.test || !this.testResult.test.questions) return;

        answersContainer.innerHTML = ''; // очищаем статическую разметку

        this.testResult.test.questions.forEach((question, index) => {

            // Создаём блок вопроса
            const questionArticle = document.createElement('article');
            questionArticle.className = 'answer-answer';

            // Заголовок вопроса
            const questionTitle = document.createElement('h3');
            questionTitle.className = 'answer-question-title';
            questionTitle.innerHTML = `<span>Вопрос ${index.id}:</span> ${question.question}`;
            questionArticle.appendChild(questionTitle);

            // Варианты ответов
            const variantsContainer = document.createElement('section');
            variantsContainer.className = 'answer-variants';

            // Перебираем ответы и заполняем поля
            question.answers.forEach((answer) => {
                const variant = document.createElement('p');
                variant.className = 'answer-variant';
                variant.innerText = answer.answer;

                //Ищем ответы с флагами correct и задаем классы
                if (answer.hasOwnProperty('correct')) {
                    if (answer.correct === true) {
                        variant.classList.add('correct');
                    } else {
                        variant.classList.add('incorrect');
                    }
                }

                variantsContainer.appendChild(variant);

            });

            questionArticle.appendChild(variantsContainer);
            answersContainer.appendChild(questionArticle);
        });
    }
}
