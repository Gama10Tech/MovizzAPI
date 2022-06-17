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

exports.updateUser = async function(data) {
    try {
            return await axios.patch('http://127.0.0.1:3000/api/users/' + data.id , {
                first_name: data.first_name,
                last_name: data.last_name,
                email: data.email,
                password: data.password,
                dob: data.dob,
                is_admin: data.is_admin,
                is_locked: data.is_locked
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