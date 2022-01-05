const puppeteer = require('puppeteer');

const scrapedData = [];
let count = 0;
const MAX_COUNT = Number.MAX_SAFE_INTEGER;

(async() => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto('https://scholar.google.com/citations?view_op=view_org&org=4497256714731484767&hl=zh-CN');
    const data = await scrapePage(page); // recursively scrape all pages
    await page.close();

    console.log(data.flat());
    console.log(count)
    browser.close();
})();

async function scrapePage(page) {
    const names = await page.$$eval('.gs_ai_t', (divs) => {
        const searchPattern = /.*computer vision.*/i
        divs = divs.filter(div => {
            const nodeList = [...div.querySelectorAll('.gs_ai_int > .gs_ai_one_int')];
            for (const node of nodeList) {
                if (searchPattern.exec(node.innerText) != null) {
                    return true
                }
            }
        });
        divs = divs.map(div => div.querySelector('.gs_ai_name').innerText);
        return divs;
    });
    if (names.length > 0) {
        scrapedData.push(names);
    }
    let nextButtonExist = false;
    try {
        await page.$eval('button.gs_btnPR', a => a.textContent);
        nextButtonExist = true;
    } catch (err) {
        nextButtonExist = false;
    }
    if (nextButtonExist && count < MAX_COUNT) {
        await page.click('button.gs_btnPR');
        await page.waitForTimeout(500);
        count += 1;
        console.clear(); 
        console.log(`page-num: ${count}`)
        return scrapePage(page); // Call this function recursively
    }
    return scrapedData;
}
