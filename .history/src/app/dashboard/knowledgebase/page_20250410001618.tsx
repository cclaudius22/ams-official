import React from 'react';
import { RAGChat } from './RAGChat'; // Ensure named import is used

// Define the page component
const KnowledgebasePage = (): JSX.Element => {
  // Render the imported RAGChat component
  return <RAGChat />;
};

// Export the page component as the default export
export default KnowledgebasePage;
