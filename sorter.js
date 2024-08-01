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

    Please assign one, maximum three genres from the following list: ${CATEGORIES.join(", ")}. 
    Return the genres as an array of strings in JSON. 
  `;

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 100,
      n: 1,
      stop: null,
      temperature: 0.7,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      }
    });

    const completion = response.data.choices[0].message.content.trim();
    console.log(completion);
    const genres = JSON.parse(completion)

    return genres;
  } catch (error) {
    console.error('Error fetching genres from OpenAI:', error.response ? error.response.data : error.message);
    return [];
  }
}

// Example usage
const bookDetails = {
  name: 'To Kill a Mockingbird',
  description: 'A novel about the serious issues of rape and racial inequality.',
  author: 'Harper Lee',
  releaseDate: '1960-07-11'
};

getBookGenres(bookDetails.name, bookDetails.description, bookDetails.author, bookDetails.releaseDate)
  .then(genres => console.log('Assigned Genres:', genres))
  .catch(error => console.error('Error:', error));