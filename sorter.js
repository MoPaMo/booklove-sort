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
  const prompt = `Book Information:\nName: ${name}\nDescription: ${description}\nRelease Year: ${releaseYear}\nAuthor: ${author}\n\nCategories: ${categories.join(', ')}\n\nChoose up to three categories that best fit the book:`;

  try {
    const response = await openai.createCompletion({
      model: "gpt-4o-mini-2024-07-18",
      prompt: prompt,
      max_tokens: 100,
    });

    const categoriesResponse = response.data.choices[0].text.trim();
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
