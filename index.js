const puppeteer = require('puppeteer');
const credentials = require('./credentials');

async function run() {
    const browser = await puppeteer.launch({
        headless: false
    })

    const page = await browser.newPage();

    await page.goto('https://kampus.izu.edu.tr/login');

    await login(page);

    await getExamResults(page);
}

async function login(page) {
    const USERNAME_SELECTOR = "#user_name";
    const PASSWORD_SELECTOR = "#user_pas";
    const SUBMIT_BUTTON_SELECTOR = "#LoginForm > div:nth-child(6) > button";

    await page.click(USERNAME_SELECTOR);
    await page.keyboard.type(credentials.username);

    await page.click(PASSWORD_SELECTOR);
    await page.keyboard.type(credentials.password);

    await page.click(SUBMIT_BUTTON_SELECTOR);

    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    console.log("giriş yapıldı");
}

async function getExamResults(page) {
    const EXAM_RESULTS_BUTTON_SELECTOR = "#nav > li:nth-child(2) > ul > li:nth-child(6) > a";
    const EXAM_RESULTS_TABLE_SELECTOR = "#DersDonemParcaView > div > div > div > div.widget-content > table > tbody";
    const RESULT_HIDDEN_TABLE_SELECTOR = "#tr_nt_id(INDEX)";

    await page.click(EXAM_RESULTS_BUTTON_SELECTOR);
    await page.waitForSelector('#DersDonemParcaView > div > div > div > div.widget-header > h4');

    const examResultCount = await page.evaluate((sel) => {
        return document.querySelector(sel).childElementCount / 3;
    }, EXAM_RESULTS_TABLE_SELECTOR)
    
    let allResults = [];
    for (let i = 0; i < examResultCount; i++) {
        let resultTableSelector = RESULT_HIDDEN_TABLE_SELECTOR.replace("(INDEX)", i);
        resultTableSelector += " td > div > ul > li:nth-child(2) > table > tbody";

        allResults[i] = await page.evaluate((sel) => {
            let exams = Array.from(document.querySelector(sel).children);
            let results = [];
            exams.forEach(function(exam) {
                let result = [...exam.children];
                results.push({
                    name: result[0].innerHTML,
                    grade: result[1].innerHTML
                });
            });
            return results;
        }, resultTableSelector);
    }
}

run();