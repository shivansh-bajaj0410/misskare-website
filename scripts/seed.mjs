import crypto from 'crypto';
import { db } from '../src/lib/db.js';

const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

// On-brand placeholder photography, generated locally and served from /public
// (swap for real Cloudinary/product shots in production — see README).
const img = (seed) => `/products/${seed}.jpg`;
const catImg = (slug) => `/categories/${slug}.jpg`;

const CATEGORIES = [
  { slug: 'bras', name: 'Bras', description: 'Everyday luxury, engineered for support and softness.', heroImage: catImg('bras') },
  { slug: 'sets', name: 'Sets', description: 'Matching lace and satin sets for every mood.', heroImage: catImg('sets') },
  { slug: 'sleepwear', name: 'Sleepwear', description: 'Candlelit-soft silks and satins for evenings in.', heroImage: catImg('sleepwear') },
  { slug: 'shapewear', name: 'Shapewear', description: 'Second-skin shaping with boutique-grade finishing.', heroImage: catImg('shapewear') },
];

const COLORS = ['Camel', 'Black', 'Blush', 'Cream'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

const PRODUCTS = [
  { slug: 'amber-lace-balconette', name: 'Amber Lace Balconette', category: 'bras', price: 5800, compareAt: null, material: 'French lace, silk-lined cups', isNew: true, featured: true },
  { slug: 'candlelit-plunge-bra', name: 'Candlelit Plunge Bra', category: 'bras', price: 6200, compareAt: 7400, material: 'Satin-bound mesh', isNew: false, featured: false },
  { slug: 'boutique-soft-triangle', name: 'Boutique Soft Triangle', category: 'bras', price: 4600, compareAt: null, material: 'Modal-silk blend', isNew: true, featured: false },
  { slug: 'camel-longline-bralette', name: 'Camel Longline Bralette', category: 'bras', price: 5400, compareAt: null, material: 'Stretch lace', isNew: false, featured: false },
  { slug: 'noir-satin-lace-set', name: 'Noir Satin & Lace Set', category: 'sets', price: 9800, compareAt: 11800, material: 'Silk-satin, French lace trim', isNew: true, featured: true },
  { slug: 'gilded-blush-set', name: 'Gilded Blush Set', category: 'sets', price: 8900, compareAt: null, material: 'Embroidered mesh', isNew: false, featured: true },
  { slug: 'amber-glow-bralette-set', name: 'Amber Glow Bralette Set', category: 'sets', price: 8200, compareAt: null, material: 'Recycled lace', isNew: true, featured: false },
  { slug: 'cream-chantilly-set', name: 'Cream Chantilly Set', category: 'sets', price: 10200, compareAt: null, material: 'Chantilly lace, satin bows', isNew: false, featured: false },
  { slug: 'silk-camisole-robe-duo', name: 'Silk Camisole & Robe Duo', category: 'sleepwear', price: 14500, compareAt: 16800, material: '100% mulberry silk', isNew: true, featured: true },
  { slug: 'boutique-satin-slip', name: 'Boutique Satin Slip', category: 'sleepwear', price: 8800, compareAt: null, material: 'Bias-cut satin', isNew: false, featured: false },
  { slug: 'amber-nightfall-robe', name: 'Amber Nightfall Robe', category: 'sleepwear', price: 12800, compareAt: null, material: 'Washed satin', isNew: true, featured: false },
  { slug: 'second-skin-bodysuit', name: 'Second-Skin Bodysuit', category: 'shapewear', price: 7600, compareAt: null, material: 'Micro-compression knit', isNew: false, featured: true },
  { slug: 'sculpt-high-waist-brief', name: 'Sculpt High-Waist Brief', category: 'shapewear', price: 4200, compareAt: 5200, material: 'Seamless power mesh', isNew: false, featured: false },
  { slug: 'contour-slip-dress', name: 'Contour Slip Dress', category: 'shapewear', price: 8600, compareAt: null, material: 'Sculpting satin knit', isNew: true, featured: false },
];

function run() {
  console.log('Seeding MissKare data...');

  const insertCategory = db.prepare(
    'INSERT OR IGNORE INTO categories (id, slug, name, description, heroImage) VALUES (?, ?, ?, ?, ?)'
  );
  const categoryIdBySlug = {};
  for (const c of CATEGORIES) {
    let row = db.prepare('SELECT id FROM categories WHERE slug = ?').get(c.slug);
    if (!row) {
      const id = uid();
      insertCategory.run(id, c.slug, c.name, c.description, c.heroImage);
      row = { id };
    }
    categoryIdBySlug[c.slug] = row.id;
  }

  const insertProduct = db.prepare(`
    INSERT OR IGNORE INTO products
      (id, slug, name, description, price, compareAt, categoryId, colors, sizes, images, material, featured, isNew, rating, reviewCount, createdAt)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `);

  for (const p of PRODUCTS) {
    const existing = db.prepare('SELECT id FROM products WHERE slug = ?').get(p.slug);
    if (existing) continue;
    const images = [1, 2, 3, 4].map((n) => img(`${p.slug}-${n}`));
    insertProduct.run(
      uid(),
      p.slug,
      p.name,
      `The ${p.name} is crafted from ${p.material.toLowerCase()}, finished with hand-sewn details true to MissKare's boutique heritage. Designed to feel like a second skin, worn like a secret.`,
      p.price,
      p.compareAt,
      categoryIdBySlug[p.category],
      JSON.stringify(COLORS),
      JSON.stringify(SIZES),
      JSON.stringify(images),
      p.material,
      p.featured ? 1 : 0,
      p.isNew ? 1 : 0,
      Number((4.5 + Math.random() * 0.5).toFixed(2)),
      Math.floor(20 + Math.random() * 180),
      now()
    );
  }

  const insertPromo = db.prepare(
    'INSERT OR IGNORE INTO promo_codes (id, code, percentOff, active) VALUES (?, ?, ?, 1)'
  );
  insertPromo.run(uid(), 'WELCOME10', 10);
  insertPromo.run(uid(), 'CANDLELIGHT20', 20);

  console.log(`Seeded ${CATEGORIES.length} categories and ${PRODUCTS.length} products.`);
}

run();
