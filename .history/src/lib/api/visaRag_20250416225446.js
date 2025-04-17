// src/lib/api/visaRag.js

// Required dependencies:
//   npm install openai pdf-parse

const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

// Path to the PDF and vector store
const PDF_PATH = path.join(process.cwd(), 'public', 'docs', 'visa_ragchat.pdf'); // Make sure this PDF exists
const VECTOR_STORE_PATH = path.join(process.cwd(), 'public', 'docs', 'visa_ragchat_vectors.json');

// --- Configuration & Data ---
// Load your visa type definitions. Ensure this path is correct and accessible.
// If it's a TS file, you might need a JS version or handle the import differently.
// Example: const { ukVisaTypes } = require('@/lib/mockvisas.js'); // Adjust path as needed
// For this example, we'll define a placeholder here:
const ukVisaTypes = [
  { id: 'skilled_worker', name: 'Skilled Worker Visa' },
  { id: 'student_visa', name: 'Student Visa' },
  { id: 'family_visa', name: 'Family Visa' },
  // Add all your relevant visa types with their unique IDs
];


// --- Helper Functions ---

/**
 * Splits text into chunks of a maximum size.
 * Tries to split at sentence boundaries if possible, otherwise by character count.
 * @param {string} text - The text to chunk.
 * @param {number} [maxChunkSize=1000] - Maximum characters per chunk.
 * @returns {string[]} - An array of text chunks.
 */
function chunkText(text, maxChunkSize = 1000) {
  const sentences = text.match(/[^.!?]+[.!?]*\s*/g) || []; // Simple sentence split
  const chunks = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length <= maxChunkSize) {
      currentChunk += sentence;
    } else {
      // If the current chunk is not empty, push it
      if (currentChunk) {
        chunks.push(currentChunk.trim());
      }
      // If the sentence itself is larger than maxChunkSize, split it crudely
      if (sentence.length > maxChunkSize) {
         let sentencePart = sentence;
         while (sentencePart.length > maxChunkSize) {
            chunks.push(sentencePart.slice(0, maxChunkSize));
            sentencePart = sentencePart.slice(maxChunkSize);
         }
         currentChunk = sentencePart; // Start next chunk with the remainder
      } else {
          currentChunk = sentence; // Start next chunk with the current sentence
      }
    }
  }

  // Add the last chunk if it exists
  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  // Fallback if sentence splitting failed or text is very short
  if (chunks.length === 0 && text.length > 0) {
      let start = 0;
      while (start < text.length) {
          const end = Math.min(start + maxChunkSize, text.length);
          chunks.push(text.slice(start, end));
          start = end;
      }
  }

  return chunks;
}

/**
 * Computes cosine similarity between two vectors (arrays of numbers).
 * @param {number[]} a - First vector.
 * @param {number[]} b - Second vector.
 * @returns {number} - Cosine similarity (between -1 and 1).
 */
function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length || a.length === 0) {
    return 0; // Return 0 for invalid input
  }
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const normProduct = Math.sqrt(normA) * Math.sqrt(normB);
  return normProduct === 0 ? 0 : dot / normProduct; // Avoid division by zero
}


/**
 * *** ACTION REQUIRED: Implement this function based on your PDF structure ***
 * Determines the relevant visaTypeId for a given text chunk or page.
 * @param {string} text - The text content of the chunk or page.
 * @param {number} pageNumber - The page number the text is from.
 * @param {Array<{id: string, name: string}>} allVisaTypes - Your defined visa types.
 * @returns {string | null} - The matching visaTypeId, or null if general/unidentifiable.
 */
function determineVisaTypeForChunk(text, pageNumber, allVisaTypes) {
  const lowerText = text.toLowerCase();

  // --- Example Logic (Replace with your specific rules) ---

  // 1. Keyword Matching (adjust keywords and IDs)
  if (lowerText.includes('skilled worker visa') || lowerText.includes('tier 2')) {
      return 'skilled_worker';
  }
  if (lowerText.includes('student visa') || lowerText.includes('tier 4')) {
      return 'student_visa';
  }
  if (lowerText.includes('family visa') || lowerText.includes('spouse visa') || lowerText.includes('partner visa')) {
      return 'family_visa';
  }
  // Add more keyword rules for other visa types...

  // 2. Page Range Matching (adjust page numbers and IDs)
  // Example: if pages 10-20 are about Family Visas
  // if (pageNumber >= 10 && pageNumber <= 20) {
  //   return 'family_visa';
  // }
  // Example: if pages 21-30 are about Student Visas
  // if (pageNumber >= 21 && pageNumber <= 30) {
  //   return 'student_visa';
  // }

  // 3. Section Header Matching (if PDF structure allows easy identification)
  // This would likely require more advanced PDF parsing to detect headers.
  // if (lowerText.startsWith("chapter 3: skilled worker requirements")) {
  //    return 'skilled_worker';
  // }

  // --- End of Example Logic ---

  // If no specific type is identified, return null or a default ID like 'general_info'
  return null;
}


// --- Vector Store Building ---

/**
 * Builds the vector store from the PDF, adding visaTypeId metadata.
 * Parses the PDF, chunks text, determines visa type for each chunk,
 * gets embeddings from OpenAI, and saves to a JSON file.
 * Run this function manually once after setting up `determineVisaTypeForChunk`.
 * @async
 */
async function buildVectorStore() {
  console.log("Starting vector store build process...");

  // Check prerequisites
  if (!process.env.OPENAI_API_KEY) {
    console.error("Error: OPENAI_API_KEY environment variable not set.");
    return;
  }
  if (!fs.existsSync(PDF_PATH)) {
      console.error(`Error: PDF file not found at ${PDF_PATH}`);
      return;
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const pdfParse = require('pdf-parse'); // Moved inside function

  try {
    console.log(`Reading PDF: ${PDF_PATH}`);
    const dataBuffer = fs.readFileSync(PDF_PATH);
    const pdfData = await pdfParse(dataBuffer);
    console.log(`PDF parsed successfully. Pages: ${pdfData.numpages}, Text length: ${pdfData.text.length}`);

    // Split by page marker (\f) or use pdfData.numpages if available
    // pdf-parse might handle pages differently; splitting by '\f' is common
    const pages = pdfData.text.split(/\f+/); // Split by one or more form feed characters
    let allChunks = [];

    console.log(`Processing ${pages.length} potential page sections...`);
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
      const pageText = pages[pageIndex].trim().replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ''); // Clean control characters except newline/tab
      if (!pageText) continue;

      const pageNumber = pageIndex + 1; // Assuming 1-based indexing for pages

      // Chunk the text from the current page
      const chunks = chunkText(pageText, 1000); // Use the improved chunkText

      for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
        const chunkTextContent = chunks[chunkIndex];
        // ---> Determine visa type for this specific chunk <---
        const associatedVisaTypeId = determineVisaTypeForChunk(chunkTextContent, pageNumber, ukVisaTypes);

        allChunks.push({
          pageNumber: pageNumber,
          chunkIndex: chunkIndex, // Index within the page's chunks
          text: chunkTextContent,
          visaTypeId: associatedVisaTypeId // Store the determined ID
        });
      }
    }
    console.log(`Total chunks created: ${allChunks.length}`);
    if (allChunks.length === 0) {
        console.error("Error: No text chunks were generated. Check PDF content and parsing.");
        return;
    }

    // Embed all chunks in batches
    console.log("Generating embeddings for chunks (this may take time)...");
    const chunkTexts = allChunks.map(c => c.text);
    const embeddings = [];
    const batchSize = 50; // Adjust batch size based on OpenAI limits and performance

    for (let i = 0; i < chunkTexts.length; i += batchSize) {
      const batch = chunkTexts.slice(i, Math.min(i + batchSize, chunkTexts.length));
      try {
        process.stdout.write(`  Embedding batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunkTexts.length / batchSize)}... `);
        const response = await openai.embeddings.create({
          model: 'text-embedding-ada-002', // Ensure this model is available/correct
          input: batch
        });
        for (const emb of response.data) {
          embeddings.push(emb.embedding);
        }
        process.stdout.write("Done.\n");
      } catch (error) {
          console.error(`\nError embedding batch starting at index ${i}:`, error.message || error);
          console.error("Aborting build process due to embedding error.");
          // Consider adding retry logic here if needed
          return; // Stop the build on embedding error
      }
    }

    if (embeddings.length !== allChunks.length) {
        console.error(`Error: Mismatch between chunks (${allChunks.length}) and embeddings (${embeddings.length}). Aborting save.`);
        return;
    }
    console.log("Embeddings generated successfully.");

    // Combine chunks with their embeddings
    const vectorStore = allChunks.map((chunk, i) => ({
      ...chunk, // Includes pageNumber, chunkIndex, text, visaTypeId
      embedding: embeddings[i]
    }));

    // Save the vector store
    console.log(`Saving vector store to: ${VECTOR_STORE_PATH}`);
    fs.writeFileSync(VECTOR_STORE_PATH, JSON.stringify(vectorStore, null, 2), 'utf-8');
    console.log(`✅ Vector store created successfully at ${VECTOR_STORE_PATH} with ${vectorStore.length} chunks.`);

  } catch (error) {
    console.error("Error during vector store build:", error);
  }
}


// --- Vector Retrieval ---

/**
 * Retrieve the top N relevant chunks for a query, optionally filtered by visa type.
 * Loads the vector store, filters by visaTypeId (if provided), embeds the query,
 * calculates cosine similarity, sorts, and returns the top matching chunks.
 * @async
 * @param {string} query - The user query.
 * @param {string} [index="local"] - (Ignored placeholder for API compatibility).
 * @param {number} [topN=5] - Number of chunks to return.
 * @param {string | null | undefined} [visaTypeId=null] - The ID of the visa type to filter by. If null/undefined, searches all chunks.
 * @returns {Promise<Array<{pageNumber: number, chunkIndex: number, text: string, visaTypeId: string | null, score: number}>>} - Array of relevant chunks with metadata and score.
 */
async function retrieveRelevantChunks(query, index = "local", topN = 5, visaTypeId = null) {
  console.log(`[RAG] Retrieving chunks for query: "${query.substring(0, 50)}...", Filter ID: ${visaTypeId || 'None'}, TopN: ${topN}`);

  // Check for vector store
  if (!fs.existsSync(VECTOR_STORE_PATH)) {
    const errorMsg = `Vector store not found at: ${VECTOR_STORE_PATH}. Please run buildVectorStore() first.`;
    console.error(`[RAG] Error: ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // Check API Key
  if (!process.env.OPENAI_API_KEY) {
      console.error("[RAG] Error: OPENAI_API_KEY environment variable not set.");
      throw new Error("OpenAI API key not configured.");
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Load the entire vector store (for in-memory search)
  let vectorStore;
  try {
      vectorStore = JSON.parse(fs.readFileSync(VECTOR_STORE_PATH, 'utf-8'));
      if (!Array.isArray(vectorStore) || vectorStore.length === 0) {
          throw new Error("Vector store file is empty or not a valid array.");
      }
      // Verify structure of first item (optional but good practice)
      if (!vectorStore[0].embedding || !vectorStore[0].text) {
           throw new Error("Vector store items seem to lack required 'embedding' or 'text' fields.");
      }
  } catch (error) {
       console.error("[RAG] Error loading or parsing vector store:", error);
       throw new Error(`Failed to load vector store: ${error.message}`);
  }


  // ---> 1. Filter chunks by visaTypeId BEFORE embedding calculation <---
  let relevantStoreSubset = vectorStore;
  if (visaTypeId) {
    console.log(`[RAG] Applying filter: visaTypeId === "${visaTypeId}"`);
    relevantStoreSubset = vectorStore.filter(chunk => chunk.visaTypeId === visaTypeId);
    console.log(`[RAG] Found ${relevantStoreSubset.length} chunks matching filter out of ${vectorStore.length} total.`);

    // Handle case where filter yields no results
    if (relevantStoreSubset.length === 0) {
      console.warn(`[RAG] No chunks found for visaTypeId "${visaTypeId}". Returning empty results.`);
      return []; // Return empty array - no relevant context found for this visa type
      // Alternative: Fallback to searching all if desired (remove 'return []' and uncomment below)
      // console.warn(`[RAG] Falling back to searching all ${vectorStore.length} chunks.`);
      // relevantStoreSubset = vectorStore;
    }
  } else {
    console.log("[RAG] No visaTypeId filter applied. Searching all chunks.");
    // No filtering needed, relevantStoreSubset is already the full vectorStore
  }

  // Proceed only if there are chunks to search after filtering
  if (relevantStoreSubset.length === 0) {
      return []; // Should be covered above, but safe check
  }

  // ---> 2. Embed the user query <---
  let queryEmbedding;
  try {
    const embResponse = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: [query]
    });
    queryEmbedding = embResponse.data[0]?.embedding;
    if (!queryEmbedding) {
        throw new Error("OpenAI embedding response did not contain embedding data.");
    }
  } catch (error) {
    console.error("[RAG] Error embedding query:", error.message || error);
    throw new Error("Failed to get embedding for the query.");
  }

  // ---> 3. Compute similarity for the relevant subset <---
  console.log(`[RAG] Calculating similarity against ${relevantStoreSubset.length} chunks...`);
  const scored = relevantStoreSubset.map(chunk => ({
    ...chunk, // Keep all original chunk data (pageNumber, chunkIndex, text, visaTypeId)
    score: cosineSimilarity(queryEmbedding, chunk.embedding) // Calculate score
  }));

  // ---> 4. Sort by score and take top N <---
  scored.sort((a, b) => b.score - a.score); // Sort descending by score
  const topChunks = scored.slice(0, topN);

  console.log(`[RAG] Found ${topChunks.length} relevant chunks. Top score: ${topChunks[0]?.score ?? 'N/A'}`);

  // Return only the necessary fields + score + visaTypeId for context/citations
  return topChunks.map(({ pageNumber, chunkIndex, text, visaTypeId, score }) => ({
    pageNumber,
    chunkIndex,
    text,
    visaTypeId, // Include this in the result
    score       // Include score for potential thresholding or logging
  }));
}

// --- Exports ---

// Export the functions needed by the API route and for manual building.
module.exports = {
  retrieveRelevantChunks,
  buildVectorStore // Keep exportable for running the build process manually
};

// --- Usage Instructions ---
/*
=======================================================================
                            INSTRUCTIONS
=======================================================================

1.  Dependencies:
    Make sure you have run: npm install openai pdf-parse

2.  Environment Variable:
    Set your OpenAI API key in your environment:
    export OPENAI_API_KEY='your_api_key_here'
    (or use a .env file with `dotenv` package if preferred)

3.  Configuration:
    - Update `PDF_PATH` to the correct location of your PDF file.
    - Update `VECTOR_STORE_PATH` if you want to save the vectors elsewhere.
    - Update `ukVisaTypes` array with your actual visa type IDs and names.

4.  *** Implement `determineVisaTypeForChunk` ***:
    This is CRUCIAL. You MUST provide logic inside this function to correctly
    assign a `visaTypeId` (from your `ukVisaTypes` array) to each text chunk
    based on the content of your PDF (keywords, page numbers, etc.). The
    current implementation has placeholder examples - tailor it to your document!

5.  Build the Vector Store (Run ONCE manually):
    After implementing `determineVisaTypeForChunk`, run this command in your terminal
    from the project root directory:
    node -e "require('./src/lib/api/visaRag.js').buildVectorStore()"
    This will create the `visa_ragchat_vectors.json` file. Check the console output
    for success or errors. Verify the JSON file contains `visaTypeId` fields.

6.  Use in API Route:
    Your Next.js API route (e.g., `/api/knowledgebase/chat/route.ts`) can now
    `require` and use the `retrieveRelevantChunks` function, passing the
    `visaTypeId` obtained from the frontend request.

    Example API Route Usage:
    --------------------------
    const { retrieveRelevantChunks } = require('@/lib/api/visaRag'); // Adjust path
    // ... inside POST handler ...
    const { message, visaType: visaTypeId } = await req.json();
    const chunks = await retrieveRelevantChunks(message, "local", 5, visaTypeId);
    // ... use chunks to build context for LLM ...
    --------------------------

=======================================================================
*/