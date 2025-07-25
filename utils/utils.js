// check email
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// book match regex
export const matchBook = (book, targetBook) => {
  if (!book || typeof book !== "string" || !targetBook || typeof targetBook !== "string") return false;
  const normalize = (str) => str.trim().toLowerCase();
  return normalize(book) === normalize(targetBook);
};