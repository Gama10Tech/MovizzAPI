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
    })).rejects.toThrowError(new Error("The ID specified does not belong to any title."));
});

test('Info of the user successfully updated', async () => {
    const user = await getInfo("diogo@oliveira.pt", "123")
    const data = await users.updateUser({
            "id": user.id,
            "auth_key":user.auth_key,
            "first_name": "DiogoAlex",
            "last_name" : "FerreiraOliveira",
            "email": "diogo@oliveira.pt",
            "password": "123",
            "dob": "2001-10-19",
            "is_admin": "true",
            "is_locked": "false"
      });

    expect(data.status).toBe(201);
});

test('Info of the user unsuccessfully updated', async () => {
    const user = await getInfo("diogo@oliveira.pt", "123")
    expect(async () => await users.updateUser({ 
        "id": user.id,
        "auth_key":user.auth_key,
        "first_name": "DiogoAlex",
        "last_name" : "FerreiraOliveira",
        "email": "diogo@oliveira.pt",
        "dob": "2001-10-19",
        "is_admin": "true",
        "is_locked": "false"
    })).rejects.toThrowError(new Error("O campo password não pode estar vazio ou ser inválido"));
});

