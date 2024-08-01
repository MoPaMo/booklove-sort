const axios = require('axios');

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const CATEGORIES = [
  "Non-Fiction", "Mystery", "Young Adults", "Classics", "Adventure", "Horror", 
  "Self-Help", "LGBT+", "Romance", "Thriller", "Fantasy", "Sci-Fi", 
  "Comedy", "Historical", "Biography", "Philosophy"
];

async function getBookGenres(name, description, author, releaseDate) {
  const prompt = `
    Given the following book details:
    Name: ${name}
    Description: ${description}
    Author: ${author}
    Release Date: ${releaseDate}

    Please assign two +- one genres: ${CATEGORIES.join(", ")}. 
    Return as an array of strings named genres in JSON. order by importance, use Uncategorized if no genre matches
  `;

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
      n: 1,
      stop: null,
      temperature: 0.7,
      response_format: { type: "json_object" },
      
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      }
    });

    const completion = response.data.choices[0].message.content.trim();
    console.log(completion);
    const genres = JSON.parse(completion).genres
    return genres;
  } catch (error) {
    console.error('Error fetching genres from OpenAI:', error.response ? error.response.data : error.message);
    return [];
  }
}

// Example usage
const bookDetails = {
  name: 'Lord Of The Rings',
  description: '',
  author: 'JRRTolkien',
  releaseDate: ''
};

getBookGenres(bookDetails.name, bookDetails.description, bookDetails.author, bookDetails.releaseDate)
  .then(genres => console.log('Assigned Genres:', genres))
  .catch(error => console.error('Error:', error));

getBookGenres("It starts with us", "", "Colleen Hoover", "2023-01-01").then(genres => console.log(genres))