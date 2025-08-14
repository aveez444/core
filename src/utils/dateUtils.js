/**
 * Date formatting utilities for consistent DD/MM/YYYY format across the app
 */

/**
 * Format a date to DD/MM/YYYY format
 * @param {string|Date} dateInput - Date string, ISO date, or Date object
 * @param {boolean} includeTime - Whether to include time (HH:MM)
 * @returns {string} Formatted date string
 */
export const formatDate = (dateInput, includeTime = false) => {
  if (!dateInput) return 'N/A';
  
  try {
    const date = new Date(dateInput);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
    
    const formattedDate = `${day}/${month}/${year}`;
    
    if (includeTime) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${formattedDate} ${hours}:${minutes}`;
    }
    
    return formattedDate;
  } catch (error) {
    console.warn('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format a date to DD/MM/YYYY HH:MM format
 * @param {string|Date} dateInput - Date string, ISO date, or Date object
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (dateInput) => {
  return formatDate(dateInput, true);
};

/**
 * Format a date for relative display (e.g., "2 days ago", "Today", "Yesterday")
 * @param {string|Date} dateInput - Date string, ISO date, or Date object
 * @returns {string} Relative date string
 */
export const formatRelativeDate = (dateInput) => {
  if (!dateInput) return 'N/A';
  
  try {
    const date = new Date(dateInput);
    const now = new Date();
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Same day - check if it's today
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      return isToday ? 'Today' : formatDate(date);
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      // More than a week ago, show actual date
      return formatDate(date);
    }
  } catch (error) {
    console.warn('Error formatting relative date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format date for input fields (YYYY-MM-DD)
 * @param {string|Date} dateInput - Date string, ISO date, or Date object
 * @returns {string} Date formatted for input field
 */
export const formatDateForInput = (dateInput) => {
  if (!dateInput) return '';
  
  try {
    const date = new Date(dateInput);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.warn('Error formatting date for input:', error);
    return '';
  }
};

/**
 * Format date for datetime-local input fields (YYYY-MM-DDTHH:MM)
 * @param {string|Date} dateInput - Date string, ISO date, or Date object
 * @returns {string} Date formatted for datetime-local input field
 */
export const formatDateTimeForInput = (dateInput) => {
  if (!dateInput) return '';
  
  try {
    const date = new Date(dateInput);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.warn('Error formatting datetime for input:', error);
    return '';
  }
};

/**
 * Get current date in DD/MM/YYYY format
 * @returns {string} Current date formatted as DD/MM/YYYY
 */
export const getCurrentDate = () => {
  return formatDate(new Date());
};

/**
 * Get current date and time in DD/MM/YYYY HH:MM format
 * @returns {string} Current date and time formatted as DD/MM/YYYY HH:MM
 */
export const getCurrentDateTime = () => {
  return formatDateTime(new Date());
};
