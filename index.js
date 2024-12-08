const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

// Hiru News URL
const hiruUrl = 'https://www.hirunews.lk/';

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

async function scrapeHiruNews() {
  try {
    const response = await axios.get(hiruUrl);
    if (response.status === 200) {
      const $ = cheerio.load(response.data);
      let newsList = [];

      $('.latest-news-slide .item').each((i, el) => {
        const title = $(el).find('.caption h2 a').text().trim();
        const description = $(el).find('.caption p').text().trim();
        const image = $(el).find('img').attr('src');
        const link = hiruUrl + $(el).find('.caption h2 a').attr('href');

        newsList.push({
          title,
          description,
          image,
          link,
        });
      });

      return newsList;
    }
  } catch (error) {
    console.error('Error scraping Hiru News:', error);
    return [];
  }
}

// Route for Hiru News
app.get('/hiru-news', async (req, res) => {
  try {
    const newsData = await scrapeHiruNews();
    res.json({
      powered_by: 'DIZER',
      data: newsData,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching Hiru News' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
