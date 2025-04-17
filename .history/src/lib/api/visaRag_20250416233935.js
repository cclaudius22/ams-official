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
// Placeholder visa types - ensure these match your frontend/other definitions
const ukVisaTypes = [
  { id: 'standard_visitor_visa', name: 'Standard Visitor Visa' },
  { id: 'skilled_worker_visa', name: 'Skilled Worker Visa' },
  { id: 'global_talent_visa', name: 'Global Talent Visa' },
  { id: 'student_visa', name: 'Student Visa' },
  { id: 'spouse_partner_visa', name: 'Spouse or Partner Visa' },
  { id: 'ilr', name: 'Indefinite Leave to Remain (ILR)' },
  { id: 'eta', name: 'Electronic Travel Authorisation (ETA)' },
  { id: 'health_care_worker_visa', name: 'Health and Care Worker Visa' },
  { id: 'innovator_founder_visa', name: 'Innovator Founder Visa' },
  { id: 'short_term_study_visa', name: 'Short-term Study Visa' },


  // Add all your relevant visa types with their unique IDs
];

// --- In-Memory Cache ---
let cachedVectorStore = null;
let vectorStoreLoadError = null; // To store persistent loading errors

// --- Helper Functions ---

/**
 * Loads the vector store from file or returns the cached version.
 * Handles errors during loading and caches the result (or error).
 * @returns {Array<object>} The loaded vector store array.
 * @throws {Error} If the vector store cannot be loaded or parsed.
 */
function getVectorStore() {
    // 1. Return immediately if already cached successfully
    if (cachedVectorStore) {
        // console.log("[RAG Cache] Using cached vector store."); // Optional: Reduce logs in production
        return cachedVectorStore;
    }

    // 2. If a previous load attempt failed, throw the stored error immediately
    if (vectorStoreLoadError) {
        console.error("[RAG Cache] Previous load attempt failed. Re-throwing error.");
        throw vectorStoreLoadError;
    }

    // 3. Cache miss and no previous error: Attempt to load
    console.log(`[RAG Cache] Cache miss. Loading vector store from: ${VECTOR_STORE_PATH}`);

    if (!fs.existsSync(VECTOR_STORE_PATH)) {
        // Store the error and throw it
        vectorStoreLoadError = new Error(`Vector store not found at: ${VECTOR_STORE_PATH}. Please run buildVectorStore() first.`);
        console.error(`[RAG Cache] Error: ${vectorStoreLoadError.message}`);
        throw vectorStoreLoadError;
    }

    try {
        const jsonData = fs.readFileSync(VECTOR_STORE_PATH, 'utf-8');
        const loadedStore = JSON.parse(jsonData);

        // Basic validation of the loaded data
        if (!Array.isArray(loadedStore) || loadedStore.length === 0) {
            throw new Error("Vector store file is empty or not a valid array.");
        }
        // Check structure of the first item as a sample
        if (!loadedStore[0]?.embedding || !loadedStore[0]?.text) {
             throw new Error("Vector store items seem to lack required 'embedding' or 'text' fields.");
        }

        console.log(`[RAG Cache] Successfully loaded and cached ${loadedStore.length} vectors.`);
        cachedVectorStore = loadedStore; // Store the loaded data in the cache
        vectorStoreLoadError = null; // Clear any previous error on successful load
        return cachedVectorStore;

    } catch (error) {
        // Store the error and throw it
        vectorStoreLoadError = new Error(`Failed to load or parse vector store: ${error.message}`);
        console.error("[RAG Cache] Error loading vector store:", vectorStoreLoadError);
        cachedVectorStore = null; // Ensure cache is clear on error
        throw vectorStoreLoadError;
    }
}


/**
 * Splits text into chunks (same as before).
 */
function chunkText(text, maxChunkSize = 1000) {
    // ... (implementation remains the same as provided previously) ...
    const sentences = text.match(/[^.!?]+[.!?]*\s*/g) || [];
    const chunks = [];
    let currentChunk = "";
    for (const sentence of sentences) {
        if (currentChunk.length + sentence.length <= maxChunkSize) {
            currentChunk += sentence;
        } else {
            if (currentChunk) chunks.push(currentChunk.trim());
            if (sentence.length > maxChunkSize) {
                let sentencePart = sentence;
                while (sentencePart.length > maxChunkSize) {
                    chunks.push(sentencePart.slice(0, maxChunkSize));
                    sentencePart = sentencePart.slice(maxChunkSize);
                }
                currentChunk = sentencePart;
            } else {
                currentChunk = sentence;
            }
        }
    }
    if (currentChunk) chunks.push(currentChunk.trim());
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
 * Computes cosine similarity (same as before).
 */
function cosineSimilarity(a, b) {
    // ... (implementation remains the same as provided previously) ...
    if (!a || !b || a.length !== b.length || a.length === 0) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    const normProduct = Math.sqrt(normA) * Math.sqrt(normB);
    return normProduct === 0 ? 0 : dot / normProduct;
}


/**
 * *** ACTION REQUIRED: Implement this based on your PDF structure ***
 * Determines the relevant visaTypeId for a given text chunk or page.
 * This function is still crucial if filtering by visaTypeId is ever desired,
 * but the current API route disables the filter.
 */
function determineVisaTypeForChunk(text, pageNumber, allVisaTypes) {
    // ... (Your custom implementation or placeholder logic remains here) ...
    // Example Placeholder:
     const lowerText = text.toLowerCase();
     if (lowerText.includes('skilled worker')) return 'skilled_worker';
     if (lowerText.includes('student visa')) return 'student_visa';
     if (lowerText.includes('global talent')) return 'global_talent_visa';
     // ... etc ...
     return null; // Default if no match
}


// --- Vector Store Building ---

/**
 * Builds the vector store from the PDF (same as before).
 * Run this function manually.
 * @async
 */
async function buildVectorStore() {
    console.log("Starting vector store build process...");
    // ... (Prerequisite checks: API Key, PDF Path) ...
    if (!process.env.OPENAI_API_KEY) { console.error("..."); return; }
    if (!fs.existsSync(PDF_PATH)) { console.error("..."); return; }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const pdfParse = require('pdf-parse');

    try {
        console.log(`Reading PDF: ${PDF_PATH}`);
        const dataBuffer = fs.readFileSync(PDF_PATH);
        const pdfData = await pdfParse(dataBuffer);
        console.log(`PDF parsed. Pages: ${pdfData.numpages}, Text length: ${pdfData.text.length}`);

        const pages = pdfData.text.split(/\f+/);
        let allChunks = [];

        console.log(`Processing ${pages.length} page sections...`);
        for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
            const pageText = pages[pageIndex].trim().replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
            if (!pageText) continue;
            const pageNumber = pageIndex + 1;
            const chunks = chunkText(pageText, 1000);

            for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
                const chunkTextContent = chunks[chunkIndex];
                const associatedVisaTypeId = determineVisaTypeForChunk(chunkTextContent, pageNumber, ukVisaTypes); // Still runs, but result might not be used effectively later
                allChunks.push({
                    pageNumber: pageNumber,
                    chunkIndex: chunkIndex,
                    text: chunkTextContent,
                    visaTypeId: associatedVisaTypeId
                });
            }
        }
        console.log(`Total chunks created: ${allChunks.length}`);
        if (allChunks.length === 0) { console.error("No text chunks generated."); return; }

        // --- Embed all chunks ---
        console.log("Generating embeddings...");
        const chunkTexts = allChunks.map(c => c.text);
        const embeddings = [];
        const batchSize = 50; // Adjust as needed
        // ... (Embedding loop logic remains the same) ...
        for (let i = 0; i < chunkTexts.length; i += batchSize) {
            const batch = chunkTexts.slice(i, Math.min(i + batchSize, chunkTexts.length));
            try {
                process.stdout.write(` Embedding batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunkTexts.length / batchSize)}... `);
                const response = await openai.embeddings.create({
                    model: 'text-embedding-ada-002',
                    input: batch
                });
                embeddings.push(...response.data.map(emb => emb.embedding));
                process.stdout.write("Done.\n");
            } catch (error) {
                 console.error(`\nError embedding batch starting at index ${i}:`, error.message || error);
                 return; // Stop build on error
            }
        }
        if (embeddings.length !== allChunks.length) { console.error("Mismatch between chunks and embeddings."); return; }
        console.log("Embeddings generated.");

        // Combine chunks with embeddings
        const vectorStoreData = allChunks.map((chunk, i) => ({
            ...chunk,
            embedding: embeddings[i]
        }));

        // Save the vector store
        console.log(`Saving vector store to: ${VECTOR_STORE_PATH}`);
        fs.writeFileSync(VECTOR_STORE_PATH, JSON.stringify(vectorStoreData, null, 2), 'utf-8');
        console.log(`✅ Vector store created successfully at ${VECTOR_STORE_PATH} with ${vectorStoreData.length} chunks.`);

        // --- Clear the cache after building a new store ---
        cachedVectorStore = null;
        vectorStoreLoadError = null;
        console.log("[RAG Cache] Cache cleared due to vector store rebuild.");

    } catch (error) {
        console.error("Error during vector store build:", error);
    }
}


// --- Vector Retrieval ---

/**
 * Retrieve the top N relevant chunks using semantic search on the (cached) vector store.
 * @async
 * @param {string} query - The user query.
 * @param {string} [index="local"] - (Ignored placeholder).
 * @param {number} [topN=5] - Number of chunks to return.
 * @param {string | null | undefined} [visaTypeId=null] - (Currently ignored by API route, but kept for potential future use).
 * @returns {Promise<Array<{pageNumber: number, chunkIndex: number, text: string, visaTypeId: string | null, score: number}>>} - Array of relevant chunks.
 */
async function retrieveRelevantChunks(query, index = "local", topN = 5, visaTypeId = null /* Argument kept for consistency */) {
    console.log(`[RAG] Retrieving chunks for query: "${query.substring(0, 50)}...", Filter ID: ${visaTypeId || 'None'}, TopN: ${topN}`); // Log received filter ID

    // Check API Key
    if (!process.env.OPENAI_API_KEY) {
        console.error("[RAG] Error: OPENAI_API_KEY environment variable not set.");
        throw new Error("OpenAI API key not configured.");
    }
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    let vectorStore;
    try {
        // ---> Use the caching function to get the store <---
        vectorStore = getVectorStore();
    } catch (error) {
        // Error is already logged by getVectorStore
        throw error; // Re-throw to be caught by the API route
    }

    // NOTE: The API route currently passes visaTypeId=null, so this filter block
    // will not be actively used unless the API route logic changes back.
    // Kept here for structure, but filter effectiveness depends on `determineVisaTypeForChunk` accuracy.
    let relevantStoreSubset = vectorStore;
    if (visaTypeId) {
      // This filtering logic will only work if determineVisaTypeForChunk correctly tagged chunks during build
      console.warn(`[RAG] Applying filter visaTypeId="${visaTypeId}". Effectiveness depends on JSON metadata.`);
      relevantStoreSubset = vectorStore.filter(chunk => chunk.visaTypeId === visaTypeId);
      console.log(`[RAG] Found ${relevantStoreSubset.length} chunks matching filter out of ${vectorStore.length}.`);
      // Optional: Fallback if filter yields nothing (might be desired if metadata is sparse)
      // if (relevantStoreSubset.length === 0 && vectorStore.length > 0) {
      //    console.warn(`[RAG] Filter yielded no results for "${visaTypeId}". Falling back to searching all ${vectorStore.length} chunks.`);
      //    relevantStoreSubset = vectorStore;
      // }
    } else {
       // Normal path when API sends null: search everything
       // console.log("[RAG] No visaTypeId filter applied. Searching all chunks.");
    }

    // If, after potential filtering, there's nothing to search, return empty
    if (relevantStoreSubset.length === 0) {
        console.log("[RAG] No relevant chunks subset to search. Returning empty results.");
        return [];
    }

    // ---> Embed the user query <---
    let queryEmbedding;
    try {
        const embResponse = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: [query] // Embed the potentially modified query (e.g., including visa name)
        });
        queryEmbedding = embResponse.data[0]?.embedding;
        if (!queryEmbedding) {
            throw new Error("OpenAI embedding response did not contain embedding data.");
        }
    } catch (error) {
        console.error("[RAG] Error embedding query:", error.message || error);
        throw new Error("Failed to get embedding for the query.");
    }

    // ---> Compute similarity against the relevant subset <---
    // console.log(`[RAG] Calculating similarity against ${relevantStoreSubset.length} chunks...`); // Reduce logging
    const scoredChunks = relevantStoreSubset.map(chunk => ({
        ...chunk, // Keep all original chunk data
        score: cosineSimilarity(queryEmbedding, chunk.embedding)
    }));

    // ---> Sort by score and take top N <---
    scoredChunks.sort((a, b) => b.score - a.score); // Sort descending
    const topChunks = scoredChunks.slice(0, topN);

    // console.log(`[RAG] Returning ${topChunks.length} relevant chunks. Top score: ${topChunks[0]?.score ?? 'N/A'}`); // Reduce logging

    // Return necessary fields
    return topChunks.map(({ pageNumber, chunkIndex, text, visaTypeId, score }) => ({
        pageNumber,
        chunkIndex,
        text,
        visaTypeId, // Include for potential debugging/future use
        score
    }));
}

// --- Exports ---
module.exports = {
  retrieveRelevantChunks,
  buildVectorStore,
  // Optionally expose cache clearing if needed for updates without server restart
  // clearRagCache: () => { cachedVectorStore = null; vectorStoreLoadError = null; console.log("[RAG Cache] Cache cleared."); }
};

// --- Usage Instructions (remain the same) ---
/*
=======================================================================
                            INSTRUCTIONS
=======================================================================
... (Instructions about dependencies, API key, implementing determineVisaTypeForChunk,
     running buildVectorStore manually, and using in API route remain the same) ...

NOTE ON CACHING: This file now caches the vector store in memory after the
first load. If you update the visa_ragchat_vectors.json file by running
buildVectorStore() again, you **must restart your Node.js server** for the
changes to be reflected in the cache.
=======================================================================
*/