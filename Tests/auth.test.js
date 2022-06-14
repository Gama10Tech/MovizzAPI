const authentication = require('./auth')

test('Successful authentication', async () => {
    const data = await authentication.auth({
          "email": "diogo@oliveira.pt",
          "password": "123"
      });
    expect(data.status).toBe(200);
});

test('Unsuccessful authentication', () => {
    expect(async () => await authentication.auth({ "email": "diogo@oliveira.pt", "password": "random password" })).rejects.toThrowError(new Error("The password entered isn't correct."));
});

