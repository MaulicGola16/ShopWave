// Product reviews module (to be wired into index.js)
export const reviews = [];
export function addReview(productId, rating, comment) {
  const review = { productId, rating, comment, createdAt: new Date().toISOString() };
  reviews.push(review);
  return review;
}
