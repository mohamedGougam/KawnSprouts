export type HouseItemCategory = 'furniture' | 'decor' | 'textile' | 'toy' | 'art';

export interface HouseShopItem {
  id: string;
  name: string;
  icon: string;
  category: HouseItemCategory;
  priceDiamonds: number;
  priceGold: number;
  description: string;
}

export const HOUSE_SHOP_ITEMS: HouseShopItem[] = [
  { id: 'extra-chair', name: 'Cozy Chair', icon: '🪑', category: 'furniture', priceDiamonds: 4, priceGold: 2, description: 'A second chair for tea time.' },
  { id: 'wooden-toy', name: 'Wooden Toy', icon: '🧸', category: 'toy', priceDiamonds: 5, priceGold: 3, description: 'A hand-carved duck for the shelf.' },
  { id: 'sun-painting', name: 'Sun Painting', icon: '🖼️', category: 'art', priceDiamonds: 6, priceGold: 4, description: 'Warm yellow art for the wall.' },
  { id: 'woven-rug', name: 'Woven Rug', icon: '🟫', category: 'decor', priceDiamonds: 7, priceGold: 5, description: 'Soft rug by the bed.' },
  { id: 'table-cloth', name: 'Table Cloth', icon: '🍽️', category: 'textile', priceDiamonds: 6, priceGold: 3, description: 'Checkered cloth for the dining table.' },
  { id: 'bed-sheets', name: 'Cloud Sheets', icon: '🛏️', category: 'textile', priceDiamonds: 8, priceGold: 5, description: 'Fluffy new sheets for sweet dreams.' },
  { id: 'lace-curtains', name: 'Lace Curtains', icon: '🪟', category: 'textile', priceDiamonds: 9, priceGold: 6, description: 'Gentle curtains that glow at sunset.' },
  { id: 'flower-vase', name: 'Flower Vase', icon: '🏺', category: 'decor', priceDiamonds: 5, priceGold: 3, description: 'Fresh meadow flowers in a tiny vase.' },
  { id: 'star-lantern', name: 'Star Lantern', icon: '✨', category: 'decor', priceDiamonds: 7, priceGold: 4, description: 'A soft night-light for the cottage.' },
  { id: 'bookshelf', name: 'Tiny Bookshelf', icon: '📚', category: 'furniture', priceDiamonds: 10, priceGold: 8, description: 'Storybooks and seed catalogues.' },
  { id: 'wind-chime', name: 'Wind Chime', icon: '🎐', category: 'decor', priceDiamonds: 6, priceGold: 4, description: 'Tinkles when the breeze visits.' },
  { id: 'plush-cloud', name: 'Plush Cloud', icon: '☁️', category: 'toy', priceDiamonds: 5, priceGold: 2, description: 'Squishy friend for the bed.' },
];
