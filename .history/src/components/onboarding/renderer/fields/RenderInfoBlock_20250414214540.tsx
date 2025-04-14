// src/components/onboarding/renderer/fields/RenderInfoBlock.tsx
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Optional: Use Card for styling
import { Label } from "@/components/ui/label"; // Use Label for the title/label
import { Info } from 'lucide-react'; // Optional icon
import { FieldConfig } from '@/components/onboarding/configurator/types'; // Adjust path

interface RenderInfoBlockProps {
  fieldConfig: FieldConfig & { config?: { content?: string } };
  // No control or errorMessage needed as it's not an input
}

const RenderInfoBlock = ({ fieldConfig }: RenderInfoBlockProps) => {
  const { label, config, helpText } = fieldConfig;
  const content = config?.content || ''; // Get content from config object

  // Basic sanitization or use a library like DOMPurify if allowing HTML
  // For now, we'll render simple text or use dangerouslySetInnerHTML carefully
  const renderContent = () => {
    // If content looks like simple HTML (e.g., contains <p>, <ul>), render it.
    // WARNING: Only use this if you TRUST the source of the configuration content.
    // Using a proper sanitizer library is recommended for untrusted sources.
    if (/<[a-z][\s\S]*>/i.test(content)) {
       console.warn("Rendering potentially unsafe HTML in InfoBlock. Ensure content source is trusted or sanitized.");
      return <div dangerouslySetInnerHTML={{ __html: content }} className="prose prose-sm max-w-none" />; // Use prose for basic HTML styling
    }
    // Otherwise, render as plain text (preserving whitespace/newlines)
    return <p className="text-sm text-muted-foreground whitespace-pre-wrap">{content}</p>;
  };

  return (
    // Option 1: Simple div with Label
    // <div className="space-y-1">
    //   <Label className="font-medium">{label || 'Information'}</Label>
    //   {renderContent()}
    //   {helpText && <p className="text-xs text-muted-foreground pt-1">{helpText}</p>}
    // </div>

    // Option 2: Using a Card for more visual separation (like info notices in your examples)
    <Card className="bg-secondary/30 border-border/50"> {/* Subtle background */}
       <CardHeader className="pb-2 pt-3 px-4"> {/* Adjust padding */}
          <CardTitle className="text-base font-medium flex items-center"> {/* Adjust size */}
             <Info className="h-4 w-4 mr-2 text-primary/80" /> {/* Optional Icon */}
             {label || 'Information'}
          </CardTitle>
       </CardHeader>
       <CardContent className="px-4 pb-3">
          {renderContent()}
          {helpText && <p className="text-xs text-muted-foreground pt-2">{helpText}</p>}
       </CardContent>
    </Card>
  );
};

export default RenderInfoBlock;