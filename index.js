const puppeteer = require('puppeteer');
const credentials = require('./credentials');
const selectors = require('./selectors');

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
    await page.click(selectors.USERNAME_SELECTOR);
    await page.keyboard.type(credentials.username);

    await page.click(selectors.PASSWORD_SELECTOR);
    await page.keyboard.type(credentials.password);

    await page.click(selectors.SUBMIT_BUTTON_SELECTOR);

    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    console.log("giriş yapıldı");
}

async function getExamResults(page) {
    await page.click(selectors.EXAM_RESULTS_BUTTON_SELECTOR);
    await page.waitForSelector(selectors.EXAMS_PAGE_SELECTOR);

    const examResultCount = await page.evaluate((sel) => {
        return document.querySelector(sel).childElementCount / 3;
    }, selectors.EXAM_RESULTS_TABLE_SELECTOR)
    
    let allResults = [];
    for (let i = 0; i < examResultCount; i++) {
        let resultTableSelector = selectors.RESULT_HIDDEN_TABLE_SELECTOR.replace("(INDEX)", i);
        resultTableSelector += selectors.RESULT_HIDDEN_TABLE_TBODY_SELECTOR;

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

    console.log(allResults);
}

run();