// Seed catalogue. Prices are in INR.
// `emoji` + `gradient` are used by the UI as image placeholders; swap in real image URLs later.

export const categories = [
  {
    id: 'clothes',
    name: 'Clothes',
    emoji: '👕',
    tagline: 'Everyday fits, built for comfort',
    gradient: ['#ff9a8b', '#ff6a88'],
  },
  {
    id: 'watches',
    name: 'Watches',
    emoji: '⌚',
    tagline: 'Timeless pieces for every wrist',
    gradient: ['#667eea', '#764ba2'],
  },
  {
    id: 'shoes',
    name: 'Shoes',
    emoji: '👟',
    tagline: 'Step out in style and support',
    gradient: ['#43cea2', '#185a9d'],
  },
];

const p = (id, category, name, brand, price, mrp, rating, stock, emoji, gradient, description) => ({
  id,
  category,
  name,
  brand,
  price,
  mrp,
  rating,
  stock,
  emoji,
  gradient,
  description,
});

export const products = [
  // ---------- Clothes ----------
  p(1, 'clothes', 'Classic Cotton Crew Tee', 'UrbanThread', 599, 999, 4.4, 60, '👕', ['#ff9a8b', '#ff6a88'], 'Soft 100% combed cotton t-shirt with a relaxed fit. Pre-shrunk and built to last wash after wash.'),
  p(2, 'clothes', 'Slim Fit Denim Jacket', 'IndigoCo', 2499, 3999, 4.6, 25, '🧥', ['#74ebd5', '#9face6'], 'Mid-weight stretch denim jacket with a clean slim silhouette and metal button closure.'),
  p(3, 'clothes', 'Oxford Button-Down Shirt', 'Northline', 1299, 1999, 4.3, 40, '👔', ['#fbc2eb', '#a6c1ee'], 'Breathable cotton Oxford shirt that works for the office and the weekend alike.'),
  p(4, 'clothes', 'Everyday Jogger Pants', 'FlexFit', 1199, 1799, 4.2, 55, '👖', ['#a1c4fd', '#c2e9fb'], 'Tapered joggers in a four-way stretch blend with zip pockets and a drawcord waist.'),
  p(5, 'clothes', 'Cozy Fleece Hoodie', 'UrbanThread', 1799, 2599, 4.7, 35, '🧶', ['#f6d365', '#fda085'], 'Brushed fleece interior, kangaroo pocket and a roomy hood for cold evenings.'),
  p(6, 'clothes', 'Floral Summer Dress', 'Bloom', 1599, 2499, 4.5, 30, '👗', ['#ffecd2', '#fcb69f'], 'Lightweight flowy dress with a flattering wrap neckline and breathable lining.'),

  // ---------- Watches ----------
  p(7, 'watches', 'Chrono Steel Analog Watch', 'Meridian', 4999, 7999, 4.6, 20, '⌚', ['#667eea', '#764ba2'], 'Stainless steel chronograph with sapphire-coated glass and 50m water resistance.'),
  p(8, 'watches', 'Minimalist Leather Watch', 'Aurelle', 3499, 5499, 4.5, 28, '🕰️', ['#cfd9df', '#e2ebf0'], 'Slim 40mm dial on a genuine leather strap. Quartz movement, quietly elegant.'),
  p(9, 'watches', 'Smart Fit Band 5', 'PulseTech', 2999, 4499, 4.3, 50, '⌚', ['#84fab0', '#8fd3f4'], 'AMOLED display, heart-rate and SpO2 tracking, 14-day battery and 100+ workout modes.'),
  p(10, 'watches', 'Rugged Sports Digital Watch', 'TerraX', 1999, 2999, 4.4, 45, '⏱️', ['#232526', '#414345'], 'Shock-resistant digital watch with backlight, stopwatch, alarms and 100m water resistance.'),
  p(11, 'watches', 'Rose Gold Ladies Watch', 'Aurelle', 3999, 6499, 4.7, 18, '💎', ['#f093fb', '#f5576c'], 'Rose-gold plated case with a mesh strap and crystal-studded dial.'),
  p(12, 'watches', 'Automatic Skeleton Watch', 'Meridian', 8999, 13999, 4.8, 10, '⚙️', ['#434343', '#000000'], 'Self-winding automatic movement visible through an exhibition caseback.'),

  // ---------- Shoes ----------
  p(13, 'shoes', 'AirRun Performance Sneakers', 'StrideX', 3299, 4999, 4.6, 40, '👟', ['#43cea2', '#185a9d'], 'Responsive cushioning and a breathable knit upper for daily runs and long walks.'),
  p(14, 'shoes', 'Classic White Court Shoes', 'Northline', 2199, 3299, 4.4, 50, '👟', ['#e0eafc', '#cfdef3'], 'Clean low-top leather-look sneakers that pair with everything in your wardrobe.'),
  p(15, 'shoes', 'Leather Formal Oxfords', 'Heritage', 3999, 5999, 4.5, 22, '👞', ['#8e5b3a', '#4b2e1e'], 'Hand-finished leather Oxfords with a cushioned insole for all-day comfort.'),
  p(16, 'shoes', 'Trail Blazer Hiking Boots', 'TerraX', 4599, 6999, 4.7, 15, '🥾', ['#56ab2f', '#a8e063'], 'Waterproof grippy-sole boots with ankle support for rough trails.'),
  p(17, 'shoes', 'Comfort Slide Sandals', 'FlexFit', 799, 1299, 4.1, 80, '🩴', ['#fddb92', '#d1fdff'], 'Ultra-light EVA slides with contoured footbed. Great after workouts.'),
  p(18, 'shoes', 'Retro High-Top Sneakers', 'StrideX', 2799, 4199, 4.5, 33, '👟', ['#ee0979', '#ff6a00'], 'Throwback high-top silhouette with padded collar and vulcanised sole.'),
];
