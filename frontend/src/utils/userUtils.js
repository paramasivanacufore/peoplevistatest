/**
 * Get the current logged-in user ID
 * Gets user_id from localStorage
 * @returns {number|null} - Current user's user_id or null if not logged in
 */
export const getCurrentUserId = () => {
  // Get user_id from localStorage (only field stored)
  const storedUserId = localStorage.getItem('user_id');
  
  if (storedUserId) {
    const userId = parseInt(storedUserId, 10);
    if (!isNaN(userId)) {
      return userId;
    }
  }
  
  // Return null if no user found
  return null;
};

