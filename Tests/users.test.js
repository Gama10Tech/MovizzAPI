const { get } = require('../routes/users.routes.js');
const authentication = require('./auth.js')
const users = require('./users.js')

async function getInfo (email, password) {
    const response = await authentication.auth({
        "email": email,
        "password": password
    })
    return {auth_key:response.data.auth_key, id:JSON.parse(atob(response.data.auth_key.split('.')[1])).id}
}

test('Like added successfully', async () => {
    const user = await getInfo("diogo@oliveira.pt", "123")
    const data = await users.addFav({
            "id": user.id,
            "auth_key":user.auth_key,
            "title": "62801be0667ae8b7df7bd48f"
      });

    expect(data.status).toBe(201);
});

test('Like added Unsuccessfully', async () => {
    const user = await getInfo("diogo@oliveira.pt", "123")
    expect(async () => await users.addFav({ 
        "id": user.id,
        "auth_key":user.auth_key,
        "title": "62801be0667ae8b7df7bd48a" 
    })).rejects.toThrowError();
});
