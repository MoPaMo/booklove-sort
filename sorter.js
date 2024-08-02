const { Pool } = require('pg');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

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
    Return as an array of strings named genres in JSON. Order by importance, use Uncategorized if no genre matches
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
    const genres = JSON.parse(completion).genres;
    return genres;
  } catch (error) {
    console.error('Error fetching genres from OpenAI:', error.response ? error.response.data : error.message);
    return [];
  }
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  }
});

async function fetchBooksWithoutGenres() {
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT b.id, b.title, b.description, b.author, b.release_year 
      FROM books b
      LEFT JOIN bookgenres bg ON b.id = bg.book_id
      WHERE bg.book_id IS NULL;
    `);
    return res.rows;
  } finally {
    client.release();
  }
}

async function processBooksAndAddGenres() {
  const books = await fetchBooksWithoutGenres();

  for (const book of books) {
    const genres = await getBookGenres(book.title, book.description, book.author, book.release_year);
    await addGenresToBook(book.id, genres);
  }
}

async function addGenresToBook(bookId, genres) {
  const client = await pool.connect();
  try {
    for (const genreName of genres) {
      let genreId = await getGenreId(client, genreName);
      if (!genreId) {
        genreId = await createGenre(client, genreName);
      }
      await client.query('INSERT INTO bookgenres (id, book_id, genre_id) VALUES ($1, $2, $3)', [uuidv4(), bookId, genreId]);
    }
  } finally {
    client.release();
  }
}

async function getGenreId(client, genreName) {
  const res = await client.query('SELECT id FROM genres WHERE name = $1', [genreName]);
  return res.rows[0] ? res.rows[0].id : null;
}

async function createGenre(client, genreName) {
  const id = uuidv4();
  await client.query('INSERT INTO genres (id, name) VALUES ($1, $2)', [id, genreName]);
  return id;
}

processBooksAndAddGenres()
  .then(() => console.log('Finished processing books and adding genres.'))
  .catch(error => console.error('Error:', error));