// src/utils/formatters.ts

/**
 * Formats a date string into a readable format (e.g., "11 April 2025").
 * Handles null/undefined input and invalid date strings.
 * @param dateString - The date string or Date object to format.
 * @param options - Optional Intl.DateTimeFormat options.
 * @returns Formatted date string, 'N/A', 'Invalid Date', or 'Error Date'.
 */
export const formatDate = (
    dateString: string | Date | undefined | null,
    options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long', // Use 'short' or '2-digit' for abbreviated months
        day: 'numeric'
    }
): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    // Check if the date is valid after parsing
    if (isNaN(date.getTime())) {
      console.warn("Invalid date string received in formatDate:", dateString);
      return 'Invalid Date';
    }
    // Use 'en-GB' for day/month/year format, adjust locale as needed
    return new Intl.DateTimeFormat('en-GB', options).format(date);
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return 'Error Date';
  }
};

/**
 * Formats a number as currency according to locale and currency code.
 * Handles null/undefined input. Provides a fallback format.
 * @param value - Object containing amount and currency code.
 * @param locale - Locale string (e.g., 'en-GB', 'en-US'). Defaults to 'en-GB'.
 * @param options - Optional Intl.NumberFormat options.
 * @returns Formatted currency string (e.g., "£30,000"), 'N/A', or fallback string.
 */
export const formatCurrency = (
    value: { amount?: number | null; currency?: string | null } | null | undefined,
    locale: string = 'en-GB', // Default to British English formatting
    options: Intl.NumberFormatOptions = {
        style: 'currency',
        currencyDisplay: 'symbol', // 'code', 'symbol', 'narrowSymbol', 'name'
        minimumFractionDigits: 0, // Adjust as needed (e.g., 2 for cents/pence)
        maximumFractionDigits: 0
    }
): string => {
  if (value?.amount == null || !value?.currency) {
      // Handle null, undefined, or zero amount if desired (e.g., return "£0" or "N/A")
      if (value?.amount === 0 && value?.currency) {
         // Format zero explicitly if needed
         try {
             return new Intl.NumberFormat(locale, { ...options, currency: value.currency }).format(0);
         } catch { /* Fallthrough to N/A */ }
      }
      return 'N/A';
  }

  try {
    return new Intl.NumberFormat(locale, {
        ...options, // Spread default or passed options
        currency: value.currency // The currency code is essential
    }).format(value.amount);
  } catch (e) {
    // Catch errors like invalid currency codes
    console.error("Error formatting currency:", value, e);
    // Fallback to simple number + currency code
    return `${value.amount.toLocaleString(locale)} ${value.currency}`;
  }
};

// Example of combining formatters if needed:
// export const formatSalaryFrequency = (salary: { amount?: number; currency?: string, frequency?: string } | null | undefined): string => {
//   if (!salary?.amount || !salary?.currency || !salary.frequency) return 'N/A';
//   const formattedAmount = formatCurrency(salary);
//   if (formattedAmount === 'N/A') return 'N/A'; // Handle currency formatting failure
//   return `${formattedAmount} (${salary.frequency})`;
// }