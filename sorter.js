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
getBookGenres("To Kill a Mockingbird", "", "Harper Lee", "1960-07-11").then(genres => console.log("To Kill a Mockingbird:", genres));
getBookGenres("1984", "", "George Orwell", "1949-06-08").then(genres => console.log("1984:", genres));
getBookGenres("Pride and Prejudice", "", "Jane Austen", "1813-01-28").then(genres => console.log("Pride and Prejudice:", genres));
getBookGenres("The Great Gatsby", "", "F. Scott Fitzgerald", "1925-04-10").then(genres => console.log("The Great Gatsby:", genres));
getBookGenres("The Catcher in the Rye", "", "J.D. Salinger", "1951-07-16").then(genres => console.log("The Catcher in the Rye:", genres));
getBookGenres("Moby Dick", "", "Herman Melville", "1851-10-18").then(genres => console.log("Moby Dick:", genres));
getBookGenres("Frankenstein", "", "Mary Shelley", "1818-01-01").then(genres => console.log("Frankenstein:", genres));
getBookGenres("Brave New World", "", "Aldous Huxley", "1932-08-01").then(genres => console.log("Brave New World:", genres));
getBookGenres("The Hobbit", "", "J.R.R. Tolkien", "1937-09-21").then(genres => console.log("The Hobbit:", genres));
getBookGenres("Weird Data", "A story of unconventional data", "Different Author", "2022-12-12").then(genres => console.log("Weird Data:", genres));