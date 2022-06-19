const axios = require("axios");

exports.listQuizzes = async function(data) {
        try {
            return await axios.get('http://127.0.0.1:3000/api/quizzes',{
                headers: {
                    Authorization : "Bearer " + data.auth_key
                }
            });
        } catch (err) {
                // A API, seja em status code 400 ou 500, devolve sempre uma propriedade "msg" na resposta
                throw new Error(err.response.data.msg);
        }
}