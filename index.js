const express = require('express');
const app = express();

const rp = require('request-promise');
const $ = require('cheerio');

const PORT = process.env.PORT || 1234;
const URL = process.env.URL || "https://gazzettadimantova.gelocal.it/mantova";

function sanitizeText(text) {
    return text.replaceAll('\n', '').replaceAll('\t', '').replaceAll(/\s{2,}/g, '').replaceAll(/<img src=.*?>/g, '')
}

function getArticleBodyPromise(url) {
    return new Promise(async (resolve, reject) => {
        try {
            let html = await rp(url);
            let subtitle = $(".story__hero__summary", html).text();
            let firstParagraph = $(".story__text", html).text();

            resolve({
                subtitle: sanitizeText(subtitle),
                firstParagraph: sanitizeText(firstParagraph)
            });
        }
        catch (exc) {
            reject(exc);
        }
    });
}

async function getInfoFromEntryTitle(jqueryObj, nstart, nend) {
    return await Promise.all(
        jqueryObj.slice(nstart, nend)
            .map(function () {
                let title = $(this).text();

                let externalUrl = $(this).find('a').attr('href');
                console.log(externalUrl);

                return getArticleBodyPromise(externalUrl).then(body => {
                    return {
                        title: sanitizeText(title),
                        subtitle: body.subtitle,
                        firstParagraph: body.firstParagraph
                    }
                }).catch(err => {
                    throw new Error(err.message);
                })
            }).toArray()
    );
}

app.get('/news', async (req, res) => {
    try {
        let nstart = parseInt(req.query.start);
        let nend = parseInt(req.query.end);

        let html = await rp(URL);

        let articles = await getInfoFromEntryTitle($(".entry__title", html), nstart, nend);

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
