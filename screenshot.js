const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // Navigate to the app
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });

  // Wait for the canvas to render
  await page.waitForTimeout(2000);

  // Take screenshot
  await page.screenshot({ path: '/home/user/SEAM-VIZ/screenshot.png', fullPage: false });

  console.log('Screenshot saved to screenshot.png');

  await browser.close();
})();
