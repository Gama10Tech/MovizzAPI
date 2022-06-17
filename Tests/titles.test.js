const authentication = require('./auth.js')
const titles = require('./titles.js')

async function getInfo (email, password) {
    const response = await authentication.auth({
        "email": email,
        "password": password
    })
    return {auth_key:response.data.auth_key, id:JSON.parse(atob(response.data.auth_key.split('.')[1])).id}
}

test('Titles successfully listed', async () => {
    const user = await getInfo("diogo@oliveira.pt", "123")
    const data = await titles.listTitles({
            "auth_key":user.auth_key,
      });

    expect(data.status).toBe(200);
});

test('Titles successfully found by ID', async () => {
    const user = await getInfo("diogo@oliveira.pt", "123")
    const data = await titles.listTitleByID({
            "id":"tt1028532",
            "auth_key":user.auth_key,
      });

    expect(data.data).toEqual({
        "success": true,
        "msg": {
          "poster_webp": "MV5BNzE4NDg5OWMtMzg3NC00ZDRjLTllMDMtZTRjNWZmNjBmMGZlXkEyXkFqcGdeQXVyMTMxODk2OTU@.webp",
          "banner_webp": "y6JA85N8DvoonwqDGWlgkr1jnU.webp",
          "_id": "62801be0667ae8b7df7bd48d",
          "imdb_id": "tt1028532",
          "title": "Hachi: A Dog's Tale",
          "synopsis": "Commuting by train, music professor Parker Wilson finds an Akita puppy, whose cage broke unnoticed during shipping, leaving his destination unknown, and since the station can't care for it and the dog catcher warns even such cute ones may not be adopted in the two weeks allowed, he kindly takes it home. His bossy, jealous wife Cate initially makes Parker swear it won't stay, but by the time its' clear nobody will claim him and an adoption candidate is found, she agrees to keep the dog, who won over their daughter Andy and her fiance Michael at first sight. Parker's Japanese college friend Ken inspires naming the pup Hachi(ko), and is pleasantly surprised when Parker successfully tackles the challenge to get it to fetch, which Akitas don't usually do. Hachi makes a habit of waiting for his equally doting master at the station every evening, but after a cardiac crisis, Parker dies. Hachi refuses to accept this, being moved to Michael's home as Cate moves out, waiting for a master who can never come home again, by now collectively adopted by sympathizing town-folk. The story is told in flashbacks as class assignment 'my hero' by Michael's teen son Robbie, who also gets an Akita puppy.",
          "poster": "https://imdb-api.com/images/original/MV5BNzE4NDg5OWMtMzg3NC00ZDRjLTllMDMtZTRjNWZmNjBmMGZlXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_Ratio0.7046_AL_.jpg",
          "banner": "https://imdb-api.com/posters/original/y6JA85N8DvoonwqDGWlgkr1jnU.jpg",
          "trailer": "https://www.imdb.com/video/vi2296906777",
          "year": "2009",
          "country": "UK",
          "language": "English",
          "content_rating": "G",
          "duration": "93",
          "seasons": 0,
          "platforms": [
            {
              "platform_id": {
                "_id": "627e987a5340d894c90e87ec",
                "platform_id": 8,
                "name": "Apple TV+"
              }
            },
            {
              "platform_id": {
                "_id": "627e987a5340d894c90e87e6",
                "platform_id": 2,
                "name": "Amazon Prime Video"
              }
            },
            {
              "platform_id": {
                "_id": "627e987a5340d894c90e87ea",
                "platform_id": 6,
                "name": "YouTube Premium"
              }
            }
          ],
          "episodes": [],
          "cast": [
            {
              "image_webp": "MV5BMTI2NDQ2OTY4M15BMl5BanBnXkFtZTYwNTYyNjc4.webp",
              "id": "nm0000152",
              "image": "https://imdb-api.com/images/original/MV5BMTI2NDQ2OTY4M15BMl5BanBnXkFtZTYwNTYyNjc4._V1_Ratio0.7273_AL_.jpg",
              "name": "Richard Gere",
              "asCharacter": "Parker Wilson"
            },
            {
              "image_webp": "MV5BMTU1MjIwNTk5Ml5BMl5BanBnXkFtZTcwNjA2MzQxMw@@.webp",
              "id": "nm0000260",
              "image": "https://imdb-api.com/images/original/MV5BMTU1MjIwNTk5Ml5BMl5BanBnXkFtZTcwNjA2MzQxMw@@._V1_Ratio0.7273_AL_.jpg",
              "name": "Joan Allen",
              "asCharacter": "Cate Wilson"
            },
            {
              "image_webp": "MV5BMjE0MDEyMjcxMV5BMl5BanBnXkFtZTgwMDE5MDcwMTI@.webp",
              "id": "nm0846480",
              "image": "https://imdb-api.com/images/original/MV5BMjE0MDEyMjcxMV5BMl5BanBnXkFtZTgwMDE5MDcwMTI@._V1_Ratio0.7273_AL_.jpg",
              "name": "Cary-Hiroyuki Tagawa",
              "asCharacter": "Ken"
            },
            {
              "image_webp": "MV5BMTk3OTQ1MzAxMV5BMl5BanBnXkFtZTcwNDIyOTkzMQ@@.webp",
              "id": "nm2105255",
              "image": "https://imdb-api.com/images/original/MV5BMTk3OTQ1MzAxMV5BMl5BanBnXkFtZTcwNDIyOTkzMQ@@._V1_Ratio0.7273_AL_.jpg",
              "name": "Sarah Roemer",
              "asCharacter": "Andy"
            },
            {
              "image_webp": "MV5BMTYxNzMyMDY1OV5BMl5BanBnXkFtZTcwMDU3NjYyMw@@.webp",
              "id": "nm0004517",
              "image": "https://imdb-api.com/images/original/MV5BMTYxNzMyMDY1OV5BMl5BanBnXkFtZTcwMDU3NjYyMw@@._V1_Ratio0.7727_AL_.jpg",
              "name": "Jason Alexander",
              "asCharacter": "Carl"
            },
            {
              "image_webp": "MV5BODY4ZWFmOTktMjEzMS00YmI3LTkxZDQtYzE5NmI4MDc0NTY5XkEyXkFqcGdeQXVyMjYyODEzNw@@.webp",
              "id": "nm0042805",
              "image": "https://imdb-api.com/images/original/MV5BODY4ZWFmOTktMjEzMS00YmI3LTkxZDQtYzE5NmI4MDc0NTY5XkEyXkFqcGdeQXVyMjYyODEzNw@@._V1_Ratio0.7273_AL_.jpg",
              "name": "Erick Avari",
              "asCharacter": "Jasjeet"
            },
            {
              "image_webp": "nopicture.webp",
              "id": "nm0568672",
              "image": "https://imdb-api.com/images/original/nopicture.jpg",
              "name": "Davenia McFadden",
              "asCharacter": "Mary Anne"
            },
            {
              "image_webp": "MV5BMzllOTUyMDMtNmI0Ny00NWU2LWJlOTUtMDZjYjNhMzc1NjZiXkEyXkFqcGdeQXVyMTgzOTk4MDQ@.webp",
              "id": "nm2814595",
              "image": "https://imdb-api.com/images/original/MV5BMzllOTUyMDMtNmI0Ny00NWU2LWJlOTUtMDZjYjNhMzc1NjZiXkEyXkFqcGdeQXVyMTgzOTk4MDQ@._V1_Ratio0.7273_AL_.jpg",
              "name": "Robbie Sublett",
              "asCharacter": "Michael (as Robbie Collier Sublett)"
            },
            {
              "image_webp": "nopicture.webp",
              "id": "nm2902428",
              "image": "https://imdb-api.com/images/original/nopicture.jpg",
              "name": "Kevin DeCoste",
              "asCharacter": "Ronnie (11 Years)"
            },
            {
              "image_webp": "nopicture.webp",
              "id": "nm3102089",
              "image": "https://imdb-api.com/images/original/nopicture.jpg",
              "name": "Rob Degnan",
              "asCharacter": "Teddy Barnes (as Robert Degnan)"
            },
            {
              "image_webp": "MV5BM2NmYTgzYzAtZTQzMS00ZDM0LTkyYTktN2U3MzgwZDM3OTY4XkEyXkFqcGdeQXVyMTM5MzIwNjk1.webp",
              "id": "nm2918317",
              "image": "https://imdb-api.com/images/original/MV5BM2NmYTgzYzAtZTQzMS00ZDM0LTkyYTktN2U3MzgwZDM3OTY4XkEyXkFqcGdeQXVyMTM5MzIwNjk1._V1_Ratio0.7273_AL_.jpg",
              "name": "Tora Hallström",
              "asCharacter": "Heather"
            },
            {
              "image_webp": "nopicture.webp",
              "id": "nm1983181",
              "image": "https://imdb-api.com/images/original/nopicture.jpg",
              "name": "Donna Sorbello",
              "asCharacter": "Myra"
            },
            {
              "image_webp": "nopicture.webp",
              "id": "nm2799207",
              "image": "https://imdb-api.com/images/original/nopicture.jpg",
              "name": "Frank S. Aronson",
              "asCharacter": "Milton - The Butcher (as Frank Aronson)"
            },
            {
              "image_webp": "MV5BZGJkYTMzMDktOGU0Ni00ODM1LThlN2EtNWRhZTg1MWE3M2I4XkEyXkFqcGdeQXVyMTk0ODcwNzA@.webp",
              "id": "nm3053127",
              "image": "https://imdb-api.com/images/original/MV5BZGJkYTMzMDktOGU0Ni00ODM1LThlN2EtNWRhZTg1MWE3M2I4XkEyXkFqcGdeQXVyMTk0ODcwNzA@._V1_Ratio0.7727_AL_.jpg",
              "name": "Troy Doherty",
              "asCharacter": "Sal"
            },
            {
              "image_webp": "nopicture.webp",
              "id": "nm3072916",
              "image": "https://imdb-api.com/images/original/nopicture.jpg",
              "name": "Ian Sherman",
              "asCharacter": "Student Pianist"
            },
            {
              "image_webp": "nopicture.webp",
              "id": "nm0189663",
              "image": "https://imdb-api.com/images/original/nopicture.jpg",
              "name": "Timothy Crowe",
              "asCharacter": "Evan Lock"
            },
            {
              "image_webp": "MV5BMjdmM2YyZWYtNWZkMi00ODkzLTg5MmMtNTdlMmFmNzQ4NjQzXkEyXkFqcGdeQXVyMjQwMDg0Ng@@.webp",
              "id": "nm0313402",
              "image": "https://imdb-api.com/images/original/MV5BMjdmM2YyZWYtNWZkMi00ODkzLTg5MmMtNTdlMmFmNzQ4NjQzXkEyXkFqcGdeQXVyMjQwMDg0Ng@@._V1_Ratio0.7273_AL_.jpg",
              "name": "Denece Ryland",
              "asCharacter": "Miss Latham"
            },
            {
              "image_webp": "nopicture.webp",
              "id": "nm3907328",
              "image": "https://imdb-api.com/images/original/nopicture.jpg",
              "name": "Blake Friedman",
              "asCharacter": "Student"
            },
            {
              "image_webp": "MV5BNDE5ZTk3NDAtODk3YS00NWViLTlhMmEtYmE3N2E2MGFjYTJhXkEyXkFqcGdeQXVyMjAzNzY3MjU@.webp",
              "id": "nm0928560",
              "image": "https://imdb-api.com/images/original/MV5BNDE5ZTk3NDAtODk3YS00NWViLTlhMmEtYmE3N2E2MGFjYTJhXkEyXkFqcGdeQXVyMjAzNzY3MjU@._V1_Ratio0.7273_AL_.jpg",
              "name": "Bates Wilder",
              "asCharacter": "Harry Pinow"
            },
            {
              "image_webp": "nopicture.webp",
              "id": "nm2599784",
              "image": "https://imdb-api.com/images/original/nopicture.jpg",
              "name": "Daniel Kirby",
              "asCharacter": "Commuter"
            },
            {
              "image_webp": "nopicture.webp",
              "id": "nm0188034",
              "image": "https://imdb-api.com/images/original/nopicture.jpg",
              "name": "Gloria Crist",
              "asCharacter": "Commuter #2"
            },
            {
              "image_webp": "nopicture.webp",
              "id": "nm2411206",
              "image": "https://imdb-api.com/images/original/nopicture.jpg",
              "name": "Rich Tretheway",
              "asCharacter": "Mover"
            },
            {
              "image_webp": "nopicture.webp",
              "id": "nm2540829",
              "image": "https://imdb-api.com/images/original/nopicture.jpg",
              "name": "Thomas Tynell",
              "asCharacter": "Man (as Tom Tynell)"
            },
            {
              "image_webp": "nopicture.webp",
              "id": "nm2727985",
              "image": "https://imdb-api.com/images/original/nopicture.jpg",
              "name": "Luke Allard",
              "asCharacter": "Student (uncredited)"
            },
            {
              "image_webp": "nopicture.webp",
              "id": "nm2576487",
              "image": "https://imdb-api.com/images/original/nopicture.jpg",
              "name": "Raymond Alongi",
              "asCharacter": "Train Station Commuter (uncredited)"
            },
            {
              "image_webp": "nopicture.webp",
              "id": "nm4121589",
              "image": "https://imdb-api.com/images/original/nopicture.jpg",
              "name": "John Amato",
              "asCharacter": "Commuter (uncredited)"
            },
            {
              "image_webp": "nopicture.webp",
              "id": "nm2204307",
              "image": "https://imdb-api.com/images/original/nopicture.jpg",
              "name": "Kira Arnold",
              "asCharacter": "Student (uncredited)"
            },
            {
              "image_webp": "nopicture.webp",
              "id": "nm2253765",
              "image": "https://imdb-api.com/images/original/nopicture.jpg",
              "name": "Ellen Becker-Gray",
              "asCharacter": "Town Resident / Train Commuter (uncredited)"
            },
            {
              "image_webp": "MV5BN2ZmMzJjYmUtOWFkNy00MmY5LWEzY2QtODNkNWUyMTllNWQ1XkEyXkFqcGdeQXVyNDg5NjY3OA@@.webp",
              "id": "nm2782582",
              "image": "https://imdb-api.com/images/original/MV5BN2ZmMzJjYmUtOWFkNy00MmY5LWEzY2QtODNkNWUyMTllNWQ1XkEyXkFqcGdeQXVyNDg5NjY3OA@@._V1_Ratio0.7273_AL_.jpg",
              "name": "David Boston",
              "asCharacter": "Man Passing on the Sidewalk (uncredited)"
            },
            {
              "image_webp": "nopicture.webp",
              "id": "nm2739905",
              "image": "https://imdb-api.com/images/original/nopicture.jpg",
              "name": "Gail Bruno",
              "asCharacter": "Local Resident / Commuter (uncredited)"
            },
            {
              "image_webp": "MV5BNTI5MmUyY2YtMDRmOC00M2Q4LTllYzUtYjg1MmQ4ZjllYzZiXkEyXkFqcGdeQXVyMTI3MDU5MzI3.webp",
              "id": "nm2953573",
              "image": "https://imdb-api.com/images/original/MV5BNTI5MmUyY2YtMDRmOC00M2Q4LTllYzUtYjg1MmQ4ZjllYzZiXkEyXkFqcGdeQXVyMTI3MDU5MzI3._V1_Ratio0.7273_AL_.jpg",
              "name": "Robert Capron",
              "asCharacter": "Student (uncredited)"
            },
            {
              "image_webp": "MV5BMzMxMzYyMDc4N15BMl5BanBnXkFtZTgwMjYzMjY5NzE@.webp",
              "id": "nm2799571",
              "image": "https://imdb-api.com/images/original/MV5BMzMxMzYyMDc4N15BMl5BanBnXkFtZTgwMjYzMjY5NzE@._V1_Ratio1.7727_AL_.jpg",
              "name": "Oscar J. Castillo",
              "asCharacter": "Train Station Commuter (uncredited)"
            },
            {
              "image_webp": "nopicture.webp",
              "id": "nm2865453",
              "image": "https://imdb-api.com/images/original/nopicture.jpg",
              "name": "Desiree April Connolly",
              "asCharacter": "Train Commuter (uncredited)"
            },
            {
              "image_webp": "nopicture.webp",
              "id": "nm1141100",
              "image": "https://imdb-api.com/images/original/nopicture.jpg",
              "name": "D.W. Cormier",
              "asCharacter": "Commuter (uncredited)"
            },
            {
              "image_webp": "nopicture.webp",
              "id": "nm3543954",
              "image": "https://imdb-api.com/images/original/nopicture.jpg",
              "name": "Ryan Cultrera",
              "asCharacter": "Student (uncredited)"
            },
            {
              "image_webp": "MV5BYTExNGUxNWEtMjc4OC00MTU4LWIxZTgtMjc3ZWE3YmUxODM4XkEyXkFqcGdeQXVyMTYwNjgyNjg@.webp",
              "id": "nm4119820",
              "image": "https://imdb-api.com/images/original/MV5BYTExNGUxNWEtMjc4OC00MTU4LWIxZTgtMjc3ZWE3YmUxODM4XkEyXkFqcGdeQXVyMTYwNjgyNjg@._V1_Ratio1.5000_AL_.jpg",
              "name": "Becki Dennis",
              "asCharacter": "Student (uncredited)"
            },
            {
              "image_webp": "nopicture.webp",
              "id": "nm3095965",
              "image": "https://imdb-api.com/images/original/nopicture.jpg",
              "name": "Max Derderian",
              "asCharacter": "Student (uncredited)"
            },
            {
              "image_webp": "nopicture.webp",
              "id": "nm2453729",
              "image": "https://imdb-api.com/images/original/nopicture.jpg",
              "name": "Vincent J. Earnshaw",
              "asCharacter": "Train Station Commuter (uncredited)"
            },
            {
              "image_webp": "nopicture.webp",
              "id": "nm3213379",
              "image": "https://imdb-api.com/images/original/nopicture.jpg",
              "name": "Shane Farrell",
              "asCharacter": "Dancer / Student (voice) (uncredited)"
            },
            {
              "image_webp": "nopicture.webp",
              "id": "nm3413370",
              "image": "https://imdb-api.com/images/original/nopicture.jpg",
              "name": "John Franchi",
              "asCharacter": "Commuter (uncredited)"
            },
            {
              "image_webp": "nopicture.webp",
              "id": "nm3660509",
              "image": "https://imdb-api.com/images/original/nopicture.jpg",
              "name": "Elizabeth Freeman",
              "asCharacter": "Student (uncredited)"
            },
            {
              "image_webp": "nopicture.webp",
              "id": "nm1154244",
              "image": "https://imdb-api.com/images/original/nopicture.jpg",
              "name": "Russell Gibson",
              "asCharacter": "Parkers Barber (uncredited)"
            },
            {
              "image_webp": "nopicture.webp",
              "id": "nm2648761",
              "image": "https://imdb-api.com/images/original/nopicture.jpg",
              "name": "Albert Gornie",
              "asCharacter": "Commuter (uncredited)"
            },
            {
              "image_webp": "nopicture.webp",
              "id": "nm3039524",
              "image": "https://imdb-api.com/images/original/nopicture.jpg",
              "name": "Patrick Mel Hayes",
              "asCharacter": "Commuter / Businessman (uncredited)"
            },
            {
              "image_webp": "nopicture.webp",
              "id": "nm3726530",
              "image": "https://imdb-api.com/images/original/nopicture.jpg",
              "name": "Steven Howitt",
              "asCharacter": "Theater Goer (uncredited)"
            },
            {
              "image_webp": "nopicture.webp",
              "id": "nm2617758",
              "image": "https://imdb-api.com/images/original/nopicture.jpg",
              "name": "Michael Kelly",
              "asCharacter": "Commuter (uncredited)"
            },
            {
              "image_webp": "nopicture.webp",
              "id": "nm3103971",
              "image": "https://imdb-api.com/images/original/nopicture.jpg",
              "name": "Mary Koomjian",
              "asCharacter": "Train Passenger (uncredited)"
            },
            {
              "image_webp": "MV5BMTI1ODc0MzkwM15BMl5BanBnXkFtZTYwMzk2Njcy.webp",
              "id": "nm1065752",
              "image": "https://imdb-api.com/images/original/MV5BMTI1ODc0MzkwM15BMl5BanBnXkFtZTYwMzk2Njcy._V1_Ratio0.7727_AL_.jpg",
              "name": "Rebecca Merle",
              "asCharacter": "Commuter in Train Station (uncredited)"
            },
            {
              "image_webp": "MV5BZDE3ZjlkYzEtOWYxNS00YzdiLWI5MDktM2VhNGJhNTZmNDFmXkEyXkFqcGdeQXVyMTc1NDMxODU@.webp",
              "id": "nm2873452",
              "image": "https://imdb-api.com/images/original/MV5BZDE3ZjlkYzEtOWYxNS00YzdiLWI5MDktM2VhNGJhNTZmNDFmXkEyXkFqcGdeQXVyMTc1NDMxODU@._V1_Ratio0.7273_AL_.jpg",
              "name": "Martin Montana",
              "asCharacter": "Train Station Commuter (uncredited)"
            },
            {
              "image_webp": "nopicture.webp",
              "id": "nm3206097",
              "image": "https://imdb-api.com/images/original/nopicture.jpg",
              "name": "Morgan O'Brien",
              "asCharacter": "Train Commuter (uncredited)"
            }
          ],
          "producers": [
            {
              "id": "nm1329997",
              "name": "Jeff Abberley",
              "description": "executive producer"
            },
            {
              "id": "nm1462514",
              "name": "Julia Blackman",
              "description": "executive producer"
            },
            {
              "id": "nm3026892",
              "name": "Julie Chrystyn",
              "description": "associate producer"
            },
            {
              "id": "nm3908303",
              "name": "Roxanna Farzaneh",
              "description": "associate producer"
            },
            {
              "id": "nm1894323",
              "name": "Samuel H. Frankel",
              "description": "co-executive producer (as Sam Frankel)"
            },
            {
              "id": "nm0000152",
              "name": "Richard Gere",
              "description": "producer (produced by)"
            },
            {
              "id": "nm2674932",
              "name": "Warren Goz",
              "description": "executive producer (as Warren T. Goz)"
            },
            {
              "id": "nm0426440",
              "name": "Bill Johnson",
              "description": "producer (produced by)"
            },
            {
              "id": "nm0505693",
              "name": "Paul A. Levin",
              "description": "associate producer"
            },
            {
              "id": "nm0527167",
              "name": "Tom Luse",
              "description": "co-executive producer"
            },
            {
              "id": "nm0556893",
              "name": "Paul Mason",
              "description": "executive producer"
            },
            {
              "id": "nm2670953",
              "name": "Stewart McMichael",
              "description": "executive producer"
            },
            {
              "id": "nm3154363",
              "name": "Dwight Opperman",
              "description": "associate producer"
            },
            {
              "id": "nm2146601",
              "name": "Dean Schnider",
              "description": "co-producer"
            },
            {
              "id": "nm1768446",
              "name": "Jim Seibel",
              "description": "executive producer"
            },
            {
              "id": "nm1698345",
              "name": "Shin Torisawa",
              "description": "producer: Japan"
            },
            {
              "id": "nm2232537",
              "name": "Michael Viner",
              "description": "associate producer"
            },
            {
              "id": "nm2663731",
              "name": "Vicki Shigekuni Wong",
              "description": "producer (produced by)"
            }
          ],
          "directors": [
            {
              "id": "nm0002120",
              "name": "Lasse Hallström"
            }
          ],
          "writers": [
            {
              "id": "nm2124742",
              "name": "Stephen P. Lindsey"
            },
            {
              "id": "nm0793881",
              "name": "Kaneto Shindô"
            }
          ],
          "imdb_rating": "8.1",
          "comments": [
            {
              "date": "2022-06-02T17:18:42.158Z",
              "spoiler": false,
              "_id": "6298f0f2f7e532358cea0d1e",
              "id": 2,
              "user_id": {
                "avatar": "https://c.tenor.com/Pm4S40MGsIQAAAAC/hacker-hackerman.gif",
                "_id": "627fba83be106018cb247992",
                "id": 4,
                "first_name": "Gonçalo",
                "last_name": "Gama"
              },
              "comment": "aaa"
            },
            {
              "date": "2022-06-02T17:19:31.886Z",
              "spoiler": false,
              "_id": "6298f123f7e532358cea0d3c",
              "id": 3,
              "user_id": {
                "avatar": "https://c.tenor.com/Pm4S40MGsIQAAAAC/hacker-hackerman.gif",
                "_id": "627fba83be106018cb247992",
                "id": 4,
                "first_name": "Gonçalo",
                "last_name": "Gama"
              },
              "comment": "tesdte"
            }
          ],
          "genres": [
            {
              "genre_id": {
                "_id": "627e98595340d894c90e404c",
                "genre_id": 3,
                "description": "Biography"
              }
            },
            {
              "genre_id": {
                "_id": "627e98595340d894c90e4050",
                "genre_id": 7,
                "description": "Drama"
              }
            },
            {
              "genre_id": {
                "_id": "627e98595340d894c90e4051",
                "genre_id": 8,
                "description": "Family"
              }
            }
          ],
          "movizz_rating": 0,
          "relatedQuizzes": []
        }
      });
});

test('Titles unsuccessfully found by ID ', async () => {
    const user = await getInfo("diogo@oliveira.pt", "123")
    expect(async () => await titles.listTitleByID({ 
        "id":"62801be0667ae8b7df7bd48d",
        "auth_key":user.auth_key,
    })).rejects.toThrowError(new Error("O campo imdb_id não pode estar vazio ou ser inválido"));
});

