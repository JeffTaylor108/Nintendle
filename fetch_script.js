const fs = require('fs').promises;

const franchises = ['Pokemon', 'Mario', 'Zelda','Kirby', 'Pikmin', 'Metroid', 'Fire Emblem', 'Animal Crossing', 'Smash Bros']; 
let searchTerm = franchises[0];

const apiGenreURL = 'https://api.thegamesdb.net/v1/Genres?apikey=6fb386e1d16b897ddc25ddbd9e2e93e0efedadc9e89093d7419258c8633e2560';
const apiPlatformURL = 'https://api.thegamesdb.net/v1/Platforms?apikey=6fb386e1d16b897ddc25ddbd9e2e93e0efedadc9e89093d7419258c8633e2560';
let apiGamesURL = `https://api.thegamesdb.net/v1.1/Games/ByGameName?apikey=6fb386e1d16b897ddc25ddbd9e2e93e0efedadc9e89093d7419258c8633e2560&name=${searchTerm}&fields=genres&filter%5Bplatform%5D=2%2C%203%2C%204%2C%205%2C%206%2C%207%2C%208%2C%209%2C%2038%2C%2041%2C%204912%2C%204971&include=boxart`;

const apiKey = '' // replace with private key

async function fetchGenreAPI() {
    try {
        const response = await fetch(apiGenreURL);
        if (!response.ok) {
            throw new Error('Failed to fetch genre data');
        }
        const data = await response.json();

        await fs.writeFile('genres.json', JSON.stringify(data, null, 2));

        console.log('Genre data saved');
    } catch (error) {
        console.log('Error: ', error);
    }
}

async function fetchPlatformAPI() {
    try {
        const response = await fetch(apiPlatformURL);
        if (!response.ok) {
            throw new Error('Failed to fetch platform data');
        }
        const data = await response.json();

        await fs.writeFile('platforms.json', JSON.stringify(data, null, 2));

        console.log('Platform data saved');
    } catch (error) {
        console.log('Error: ', error);
    }
}

async function fetchGamesAPI() {
    try {
        let response = await fetch(apiGamesURL);
        if (!response.ok) {
            throw new Error('Failed to fetch game data');
        }

        let data = await response.json();

        await fs.writeFile('games.json', `{\n"games": [\n`);
        await fs.writeFile('games_boxart.json', `{\n"include": {\n"boxart": {\n"base_url": \n${JSON.stringify(data.include.boxart.base_url, null, 2)},\n"boxart_data": [\n`);

        for (let i = 0; i < franchises.length; i++) {
            let searchTerm = franchises[i];
            apiGamesURL = `https://api.thegamesdb.net/v1.1/Games/ByGameName?apikey=6fb386e1d16b897ddc25ddbd9e2e93e0efedadc9e89093d7419258c8633e2560&name=${searchTerm}&fields=genres&filter%5Bplatform%5D=2%2C%203%2C%204%2C%205%2C%206%2C%207%2C%208%2C%209%2C%2038%2C%2041%2C%204912%2C%204971&include=boxart`;

            response = await fetch(apiGamesURL);
            if (!response.ok) {
                throw new Error('Failed to fetch game data');
            }

            data = await response.json();

            while (apiGamesURL) {
                for (let game of data.data.games) {
                    await fs.appendFile('games.json', JSON.stringify(game, null, 2) + ',\n');
                }
    
                await fs.appendFile('games_boxart.json', JSON.stringify(data.include.boxart.data, null, 2) + ',\n');
                
                if (data.pages.next == null) {
                    break;
                }
                else {
                    apiGamesURL = await data.pages.next;
                
                    response = await fetch(apiGamesURL);
                    if (!response.ok) {
                        throw new Error('Failed to fetch game data');
                    }
                    data = await response.json();
                }
            }
        }

        await fs.appendFile('games.json', `\n]\n}`);
        await fs.appendFile('games_boxart.json', `\n]\n}\n}\n}`);

        console.log('Game data saved');
    } catch (error) {
        console.log('Error: ', error);
    }
}

//fetchGamesAPI();
//fetchPlatformAPI();
//fetchGenreAPI();