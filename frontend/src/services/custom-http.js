import {Auth} from "./auth.js";

export class CustomHttp {
    static async request(url, method = 'GET', body = null) {

        const params = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        };

        let token = localStorage.getItem(Auth.accessTokenKey);
        if (token) {
            params.headers['x-access-token'] = token;
        }

        if (body) {
            params.body = JSON.stringify(body);
        }

        const response = await fetch(url, params);

        // И проверяя статус ответа с бэкенда делаем обработку ответа
        if (response.status < 200 || response.status >= 300) {
            // Если срок "accessToken" истёк
            if (response.status === 401) {
               const result = await Auth.processUnauthorizedResponse();
               if (result) {
               return await this.request(url, method, body);
               } else {
                   return null;
               }
            }
            // Выводим сообщение об ошибке
            throw new Error(response.message);
        }

        return await response.json();
    }
}