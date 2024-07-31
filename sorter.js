import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const categories = [
  "Non-Fiction", "Mystery", "Young Adults", "Classics", "Adventure", "Horror", 
  "Self-Help", "LGBT+", "Romance", "Thriller", "Fantasy", "Sci-Fi", 
  "Comedy", "Historical", "Biography", "Philosophy"
];

async function categorizeBook(name, description, releaseYear, author) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        { role: "system", content: `You are a helpful assistant designed to output JSON. Choose up to three categories that best fit the book: ${categories.join(', ')}` },
        { role: "user", content: `Book Information:\nName: ${name}\nDescription: ${description}\nRelease Year: ${releaseYear}\nAuthor: ${author}` }
      ],
      response_format: { type: "json_object" }
    });

    const categoriesResponse = completion.choices[0].message.content.categories;
    console.log(`Selected Categories: ${categoriesResponse.join(', ')}`);
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