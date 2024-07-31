require('dotenv').config();
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const categories = [
  "Non-Fiction", "Mystery", "Young Adults", "Classics", "Adventure", "Horror", 
  "Self-Help", "LGBT+", "Romance", "Thriller", "Fantasy", "Sci-Fi", 
  "Comedy", "Historical", "Biography", "Philosophy"
];

async function categorizeBook(name, description, releaseYear, author) {
  

  try {
    
const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: `Choose up to three categories that best fit the book:${categories.join(', ')}`}],
    model: "gpt-4o-mini-2024-07-18",
  }, {role:"user", content:`Book Information:\nName: ${name}\nDescription: ${description}\nRelease Year: ${releaseYear}\nAuthor: ${author}`}]});


    const categoriesResponse = completion.choices[0];
    console.log(`Selected Categories: ${categoriesResponse}`);
  } catch (error) {
    console.error('Error:', error);
  }
  
}

// debug
categorizeBook(
  "To Kill a Mockingbird",
  "A novel about the serious issues of rape and racial inequality.",
  1960,
  "Harper Lee"
);
