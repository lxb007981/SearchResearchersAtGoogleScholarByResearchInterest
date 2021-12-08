const puppeteer = require('puppeteer');

(async() => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto('https://scholar.google.com/citations?view_op=view_org&hl=zh-CN&org=7549334305653538480');
    let scrapedData = [];
    let count = 0;
    let MAX_COUNT = Number.MAX_SAFE_INTEGER;
    let data = await scrapeCurrentPage();
    await page.close();

    console.log(data.flat());
    console.log(count)
    await browser.close();
    async function scrapeCurrentPage() {
        const names = await page.$$eval('.gs_ai_t', (divs) => {
            let searchPattern = /.*vision.*/i
            divs = divs.filter(div => {
                let nodeList = [...div.querySelectorAll('.gs_ai_int > .gs_ai_one_int')];
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
            return scrapeCurrentPage(); // Call this function recursively
        }
        return scrapedData;
    }
})();