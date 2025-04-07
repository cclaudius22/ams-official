// src/components/ui/CardDescription.tsx
import React from 'react';

interface CardDescriptionProps {
  date: string;
}

export function CardDescription({ date }: CardDescriptionProps) {
  const formattedDate = new Date(date).toLocaleString('en-GB', {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return <div className="text-muted">{formattedDate}</div>;
}
