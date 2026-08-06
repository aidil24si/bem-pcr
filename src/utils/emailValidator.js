/**
 * Validates an email address using a strict regular expression.
 * 
 * @param {string} email - The email string to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@mahasiswa\.pcr\.ac\.id$/i;
  return regex.test(email);
};
