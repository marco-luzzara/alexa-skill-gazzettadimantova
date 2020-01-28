const express = require('express');
const app = express();

const rp = require('request-promise');
const $ = require('cheerio');

const PORT = process.env.PORT || 1234;
const URL = process.env.URL || "https://gazzettadimantova.gelocal.it/mantova";

async function getLinesFromArticle(articleUrl) {
    let html = await rp(articleUrl);
    let lines = $(".entry_subtitle", html).text();

    return lines;
}

function getArticleInfo(url) {
    return new Promise(async (resolve, reject) => {
        try {
            let subtitle = await getLinesFromArticle(url);
            resolve(subtitle);
        }
        catch(exc) {
            reject(exc);
        }
    });
}

async function getInfoFromEntryTitle(jqueryObj, nstart, nend) {
    return await Promise.all(
            jqueryObj.slice(nstart, nend)
            .map(function() {
                let title = $(this).text();

                let externalUrl = $(this).find('a').attr('href');
                console.log(externalUrl);

                return getArticleInfo(externalUrl).then(subtitle => {
                    return {
                        "title": title,
                        "subtitle": subtitle
                    }
                })
            }).toArray()
        );
}

app.get('/news', async (req, res) => {
    try {
        let nstart = parseInt(req.query.start);
        let nend = parseInt(req.query.end);

        let html = await rp(URL);

        let articles = await getInfoFromEntryTitle($(".entry_title", html), nstart, nend);

        res.json(articles);
    }
    catch (exc) {
        console.log(exc.message);
        res.send(exc.message);
    }
});

app.listen(PORT, () =>
    console.log(`application is listening on port ${PORT}`),
);