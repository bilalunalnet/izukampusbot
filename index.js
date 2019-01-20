const puppeteer = require('puppeteer');
const credentials = require('./credentials');
const selectors = require('./selectors');
const database = require('./database');

async function run() {
    const browser = await puppeteer.launch({
        //headless: false
    })

    const page = await browser.newPage();

    await page.goto('https://kampus.izu.edu.tr/login');

    await login(page);

    await getAndWriteExamResults(page);

    await browser.close();

    process.exit();
}

async function login(page) {
    await page.click(selectors.USERNAME_SELECTOR);
    await page.keyboard.type(credentials.username);

    await page.click(selectors.PASSWORD_SELECTOR);
    await page.keyboard.type(credentials.password);

    await page.click(selectors.SUBMIT_BUTTON_SELECTOR);

    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    console.log(" > Logged in.");
}

async function getAndWriteExamResults(page) {
    console.log(" > Checking for new results.");
    await page.click(selectors.EXAM_RESULTS_BUTTON_SELECTOR);
    await page.waitForSelector(selectors.EXAMS_PAGE_SELECTOR);

    const examResultCount = await page.evaluate((sel) => {
        return document.querySelector(sel).childElementCount / 3;
    }, selectors.EXAM_RESULTS_TABLE_SELECTOR)
    
    for (let i = 0; i < examResultCount; i++) {
        let resultTableSelector = selectors.RESULT_HIDDEN_TABLE_SELECTOR.replace("(INDEX)", i);
        let resultTableTbodySelector = resultTableSelector + selectors.RESULT_HIDDEN_TABLE_TBODY_SELECTOR;
        let lectureNameSelector = selectors.RESULT_LECTURE_NAME.replace("INDEX", (i * 3) + 1)

        let lectureName = await page.evaluate((lectureNameSelector) => {
            return document.querySelector(lectureNameSelector).innerText;
        }, lectureNameSelector);

        let allResults = await page.evaluate((sel) => {
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
        }, resultTableTbodySelector);

        writeResultsToDB(lectureName, allResults);
    }
}

function writeResultsToDB(lectureName, results) {
    results.forEach(function(result) {
        database.addNewResult(lectureName, result["name"], result['grade']);
    });
}

run();