// src/utils/dateUtils.ts (or lib/utils.ts)

export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    // Check if the date is valid after parsing
    if (isNaN(date.getTime())) {
      console.warn("Invalid date string received:", dateString);
      return 'Invalid Date';
    }
    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return 'Error Date'; // Or handle differently
  }
};

// You can add other date/utility functions here later