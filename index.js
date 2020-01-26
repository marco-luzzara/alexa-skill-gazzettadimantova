const express = require('express');
const app = express();

const rp = require('request-promise');
const $ = require('cheerio');

const PORT = process.env.PORT || 1234;
const URL = process.env.URL || "https://gazzettadimantova.gelocal.it/mantova";

function getTextsFromJQueryElements(jqueryObj, nstart, nend) {
    return jqueryObj.slice(nstart, nend)
        .map(function() {
            return $(this).text();
        })
        .toArray();
}

app.get('/', async (req, res) => {
    try {
        let html = await rp(URL);
        //console.log(html);

        let eyelets = getTextsFromJQueryElements($(".entry_eyelet", html), 0, 6);
        let titles = getTextsFromJQueryElements($(".entry_title", html), 0, 6);

        let articles = eyelets.map((cur, index) => {
            return {
                "eyelet": cur,
                "title": titles[index]
            }
        });

        res.json(articles);
    }
    catch (exc) {
        console.log(exc.message);
    }
});

app.listen(PORT, () =>
    console.log(`application is listening on port ${PORT}`),
);