import { BACKEND_URL } from '../services/api.js';

/**
 * Utility to convert stored image paths to full reachable URLs
 * @param {string} imagePath - The path stored in the database (e.g., /uploads/image.jpg)
 * @returns {string} - The full URL (e.g., http://localhost:5000/uploads/image.jpg)
 */
export const getImageUrl = (imagePath) => {
    if (!imagePath || typeof imagePath !== 'string') return '';

    // If it's already a full URL (external link), return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
        return imagePath;
    }

    // Ensure the path starts with a slash for consistent concatenation
    const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

    // Combine with backend base URL
    return `${BACKEND_URL}${normalizedPath}`;
};
