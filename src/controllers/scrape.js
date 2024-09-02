const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = 'src/data/metacritic.json';
const cron = ('node-cron');

const currentYearURL = 'https://www.metacritic.com/browse/game/all/all/current-year/';

const bestCurrentYear = async (req, res, next) => {
    try {
        const response = await axios.get(currentYearURL);
        
        const $ = cheerio.load(response.data);

        const titles = $('.c-finderProductCard_titleHeading').map((_, title) => {
            const $title = $(title);
            return $title.text();
        }).toArray();
        
        // Split and trim titles
        const cleanedTitles = titles.map(title => title.split('. ')[1]);

        writeJSON(path, cleanedTitles);
        
        console.log(cleanedTitles)
    } catch (error) {
        console.log(error);
    }
}

function writeJSON(path, data) {
    try {
        const currentYear = data;

        const jsonData = JSON.stringify(currentYear, null, 2);

        fs.writeFileSync(path, jsonData);
    } catch (error) {
        console.log(error);
    }
}

module.exports = { bestCurrentYear }