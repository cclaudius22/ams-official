// scripts/ingestVisa.js
require('dotenv').config(); // Load environment variables from .env

const { buildVectorStore } = require('../src/lib/api/visaRag');

async function main() {
  try {
    await buildVectorStore();
    console.log("Vector store build complete.");
  } catch (error) {
    console.error("Error during vector store build:", error);
  }
}

main();
