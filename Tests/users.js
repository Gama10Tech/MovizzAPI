const axios = require("axios");

exports.addFav = async function(data) {
        try {
                return await axios.post('http://127.0.0.1:3000/api/users/' + data.id + '/favourites', {
                    title: data.title
                },{
                    headers: {
                        Authorization : "Bearer " + data.auth_key
                    }
                });
        } catch (err) {
                // A API, seja em status code 400 ou 500, devolve sempre uma propriedade "msg" na resposta
                throw new Error(err.response.data.msg);
        }
}