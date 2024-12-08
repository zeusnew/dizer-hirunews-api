const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to handle JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint for scraping news from HiruNews
app.get('/hirunews/news', async (req, res) => {
    const url = "http://www.hirunews.lk/sinhala/local-news.php";
    
    try {
        // Fetching the HTML of the Hiru News page
        const { data: html } = await axios.get(url);
        console.log('Page fetched successfully');

        // Load the HTML with Cheerio
        const $ = cheerio.load(html, { decodeEntities: false });
        const results = [];

        // Debug: Log the raw HTML (comment out after checking)
        // console.log(html);

        // Looping through each news article on the page
        $('div.lts-cntp').each((i, elem) => {
            const title = $(elem).find('a').text().trim(); // Extracting title text
            const link = $(elem).find('a').attr('href'); // Extracting URL
            const image = $(elem).find('img').attr('src'); // Extracting image URL

            // Log individual elements for debugging
            console.log(`Title: ${title}`);
            console.log(`Link: ${link}`);
            console.log(`Image: ${image}`);

            // Only adding news if the title and link are valid
            if (title && link) {
                results.push({
                    title,
                    url: link.startsWith('http') ? link : `http://www.hirunews.lk${link}`,
                    image: image ? (image.startsWith('http') ? image : `http://www.hirunews.lk${image}`) : null,
                });
            }
        });

        // If no articles are found, return an error message
        if (results.length === 0) {
            return res.status(404).json({ message: 'No news articles found.' });
        }

        // Sending the results as a response
        res.json({ data: results });
    } catch (error) {
        console.error('Error fetching the news:', error.message);
        res.status(500).json({ message: 'Failed to fetch news articles.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
