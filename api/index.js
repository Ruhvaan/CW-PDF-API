const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/pdf', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('URL is required');

  let browser;
  try {
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(targetUrl, { waitUntil: 'networkidle2' });
    const buffer = await page.pdf({ format: 'A4' });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.send(buffer);
  } catch (e) {
    res.status(500).send(e.message);
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
