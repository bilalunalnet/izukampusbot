const puppeteer = require('puppeteer');
const credentials = require('./credentials');

async function run() {
    const browser = await puppeteer.launch({
        headless: false
    })

    const page = await browser.newPage();

    await page.goto('https://kampus.izu.edu.tr/login');

    await login(page);
}

async function login(page) {
    const USERNAME_SELECTOR = "#user_name";
    const PASSWORD_SELECTOR = "#user_pas";
    const SUBMIT_BUTTON_SELECTOR = "#LoginForm > div:nth-child(6) > button";
    const LOGGED_IN_CHECK_SELECTOR = "#nav > li:nth-child(2) > ul > li:nth-child(6) > a";

    await page.click(USERNAME_SELECTOR);
    await page.keyboard.type(credentials.username);

    await page.click(PASSWORD_SELECTOR);
    await page.keyboard.type(credentials.password);

    await page.click(SUBMIT_BUTTON_SELECTOR);

    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    console.log("giriş yapıldı");
}

run();