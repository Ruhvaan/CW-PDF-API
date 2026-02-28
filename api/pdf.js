const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  let browser = null;
  
  try {
    const targetUrl = req.query.url;
    
    if (!targetUrl) {
      return res.status(400).json({ 
        success: false,
        error: 'URL parameter required'
      });
    }
    
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    
    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    const response = await page.goto(targetUrl, {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    if (!response || !response.ok()) {
      throw new Error('Failed to load URL');
    }
    
    const buffer = await page.pdf({ format: 'A4' });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.status(200).send(buffer);
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  } finally {
    if (browser) await browser.close();
  }
};
