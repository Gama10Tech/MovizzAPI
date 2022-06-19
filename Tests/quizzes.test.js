const authentication = require('./auth.js')
const quizzes = require('./quizzes.js')

async function getInfo (email, password) {
    const response = await authentication.auth({
        "email": email,
        "password": password
    })
    return {auth_key:response.data.auth_key, id:JSON.parse(atob(response.data.auth_key.split('.')[1])).id}
}

test('Quizzes listed successfully', async () => {
    const user = await getInfo("diogo@oliveira.pt", "123")
    const data = await quizzes.listQuizzes({
            "auth_key":user.auth_key,
      });

    expect(data.status).toBe(200);
});

