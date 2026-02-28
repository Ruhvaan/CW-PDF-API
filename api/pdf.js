const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  let browser;
  try {
    const { url, format = 'A4', scale = 1, margin } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: true,
      timeout: 30000,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    const pdfOptions = {
      format: format,
      scale: parseFloat(scale),
      displayHeaderFooter: false,
      printBackground: true,
    };

    if (margin) {
      const marginObj = JSON.parse(margin);
      pdfOptions.margin = marginObj;
    }

    const pdf = await page.pdf(pdfOptions);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdf.length);
    res.send(pdf);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({
      error: 'Failed to generate PDF',
      message: error.message,
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};
