import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = process.env.DATABASE_URL?.replace('file:', '') || path.join(process.cwd(), 'dev.db');

const globalForDb = globalThis;

export const db = globalForDb.__misskare_db || new Database(DB_PATH);
if (process.env.NODE_ENV !== 'production') {
  globalForDb.__misskare_db = db;
}

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS addresses (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fullName TEXT NOT NULL,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal TEXT NOT NULL,
  country TEXT NOT NULL,
  phone TEXT,
  isDefault INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  heroImage TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  compareAt INTEGER,
  categoryId TEXT NOT NULL REFERENCES categories(id),
  colors TEXT NOT NULL,
  sizes TEXT NOT NULL,
  images TEXT NOT NULL,
  material TEXT,
  featured INTEGER NOT NULL DEFAULT 0,
  isNew INTEGER NOT NULL DEFAULT 0,
  rating REAL NOT NULL DEFAULT 4.8,
  reviewCount INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS wishlist_items (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  productId TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  createdAt TEXT NOT NULL,
  UNIQUE(userId, productId)
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  userId TEXT REFERENCES users(id),
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'paid',
  subtotal INTEGER NOT NULL,
  discount INTEGER NOT NULL DEFAULT 0,
  shippingCost INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL,
  promoCode TEXT,
  shippingName TEXT NOT NULL,
  shippingLine1 TEXT NOT NULL,
  shippingLine2 TEXT,
  shippingCity TEXT NOT NULL,
  shippingState TEXT NOT NULL,
  shippingPostal TEXT NOT NULL,
  shippingCountry TEXT NOT NULL,
  stripeSessionId TEXT UNIQUE,
  createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  orderId TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  productId TEXT NOT NULL REFERENCES products(id),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  size TEXT NOT NULL,
  price INTEGER NOT NULL,
  quantity INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS promo_codes (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  percentOff INTEGER NOT NULL,
  active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  createdAt TEXT NOT NULL
);
`);

// ---------------------------------------------------------------------------
// Lightweight Prisma-compatible query layer, purpose-built for the exact
// query shapes this app uses. Swap this whole file for `@prisma/client` +
// Postgres in production (see docs/postgres-schema.prisma for the schema).
// ---------------------------------------------------------------------------
import crypto from 'crypto';

const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const toBool = (v) => (v ? 1 : 0);

function attachCategory(row) {
  if (!row) return row;
  const category = db.prepare('SELECT * FROM categories WHERE id = ?').get(row.categoryId);
  return { ...row, category };
}

function normalizeProduct(row) {
  if (!row) return row;
  return { ...row, featured: !!row.featured, isNew: !!row.isNew };
}

const ProductModel = {
  findMany(opts = {}) {
    const { where = {}, orderBy, take, include } = opts;
    let sql = 'SELECT p.* FROM products p';
    const clauses = [];
    const params = [];

    if (where.category?.slug) {
      sql += ' JOIN categories c ON c.id = p.categoryId';
      clauses.push('c.slug = ?');
      params.push(where.category.slug);
    }
    if (where.categoryId) {
      clauses.push('p.categoryId = ?');
      params.push(where.categoryId);
    }
    if (where.id?.in) {
      clauses.push(`p.id IN (${where.id.in.map(() => '?').join(',')})`);
      params.push(...where.id.in);
    }
    if (where.NOT?.id) {
      clauses.push('p.id != ?');
      params.push(where.NOT.id);
    }
    if (where.isNew !== undefined) {
      clauses.push('p.isNew = ?');
      params.push(toBool(where.isNew));
    }
    if (where.featured !== undefined) {
      clauses.push('p.featured = ?');
      params.push(toBool(where.featured));
    }
    if (where.OR?.length) {
      const orClauses = [];
      for (const cond of where.OR) {
        if (cond.name?.contains) {
          orClauses.push('p.name LIKE ?');
          params.push(`%${cond.name.contains}%`);
        }
        if (cond.description?.contains) {
          orClauses.push('p.description LIKE ?');
          params.push(`%${cond.description.contains}%`);
        }
      }
      if (orClauses.length) clauses.push(`(${orClauses.join(' OR ')})`);
    }
    if (where.price?.gte !== undefined) {
      clauses.push('p.price >= ?');
      params.push(where.price.gte);
    }
    if (where.price?.lte !== undefined) {
      clauses.push('p.price <= ?');
      params.push(where.price.lte);
    }

    if (clauses.length) sql += ' WHERE ' + clauses.join(' AND ');

    if (orderBy?.price) sql += ` ORDER BY p.price ${orderBy.price === 'asc' ? 'ASC' : 'DESC'}`;
    else if (orderBy?.rating) sql += ' ORDER BY p.rating DESC';
    else sql += ' ORDER BY p.createdAt DESC';

    if (take) sql += ` LIMIT ${parseInt(take, 10)}`;

    const rows = db.prepare(sql).all(...params).map(normalizeProduct);
    return include?.category ? rows.map(attachCategory) : rows;
  },

  findFirst(opts = {}) {
    const results = ProductModel.findMany({ ...opts, take: 1 });
    return results[0] || null;
  },

  findUnique(opts = {}) {
    const row = db.prepare('SELECT * FROM products WHERE slug = ? OR id = ?').get(
      opts.where.slug || '__none__',
      opts.where.id || '__none__'
    );
    const product = normalizeProduct(row);
    if (!product) return null;
    return opts.include?.category ? attachCategory(product) : product;
  },
};

const CategoryModel = {
  findMany() {
    return db.prepare('SELECT * FROM categories').all();
  },
  findUnique({ where }) {
    return db.prepare('SELECT * FROM categories WHERE slug = ? OR id = ?').get(
      where.slug || '__none__',
      where.id || '__none__'
    ) || null;
  },
};

const UserModel = {
  findUnique({ where }) {
    return db.prepare('SELECT * FROM users WHERE email = ? OR id = ?').get(
      where.email || '__none__',
      where.id || '__none__'
    ) || null;
  },
  create({ data }) {
    const id = uid();
    db.prepare(
      'INSERT INTO users (id, email, password, name, createdAt) VALUES (?, ?, ?, ?, ?)'
    ).run(id, data.email, data.password, data.name, now());
    return UserModel.findUnique({ where: { id } });
  },
};

const AddressModel = {
  findMany({ where }) {
    return db
      .prepare('SELECT * FROM addresses WHERE userId = ? ORDER BY isDefault DESC, createdAt DESC')
      .all(where.userId)
      .map((a) => ({ ...a, isDefault: !!a.isDefault }));
  },
  create({ data }) {
    const id = uid();
    db.prepare(
      `INSERT INTO addresses (id, userId, fullName, line1, line2, city, state, postal, country, phone, isDefault, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      data.userId,
      data.fullName,
      data.line1,
      data.line2 || null,
      data.city,
      data.state,
      data.postal,
      data.country || 'US',
      data.phone || null,
      toBool(data.isDefault),
      now()
    );
    return db.prepare('SELECT * FROM addresses WHERE id = ?').get(id);
  },
  updateMany({ where, data }) {
    if (data.isDefault !== undefined) {
      db.prepare('UPDATE addresses SET isDefault = ? WHERE userId = ?').run(toBool(data.isDefault), where.userId);
    }
  },
  deleteMany({ where }) {
    db.prepare('DELETE FROM addresses WHERE id = ? AND userId = ?').run(where.id, where.userId);
  },
};

const OrderModel = {
  findMany({ where, include }) {
    const rows = db
      .prepare('SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC')
      .all(where.userId);
    return include?.items ? rows.map(attachItems) : rows;
  },
  findUnique({ where, include }) {
    const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(where.id);
    if (!row) return null;
    return include?.items ? attachItems(row) : row;
  },
  create({ data }) {
    const id = uid();
    db.prepare(
      `INSERT INTO orders (id, userId, email, status, subtotal, discount, shippingCost, total, promoCode,
        shippingName, shippingLine1, shippingLine2, shippingCity, shippingState, shippingPostal, shippingCountry,
        stripeSessionId, createdAt)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).run(
      id,
      data.userId || null,
      data.email,
      data.status || 'pending',
      data.subtotal,
      data.discount || 0,
      data.shippingCost || 0,
      data.total,
      data.promoCode || null,
      data.shippingName,
      data.shippingLine1,
      data.shippingLine2 || null,
      data.shippingCity,
      data.shippingState,
      data.shippingPostal,
      data.shippingCountry || 'US',
      null,
      now()
    );

    const items = data.items?.create || [];
    const insertItem = db.prepare(
      `INSERT INTO order_items (id, orderId, productId, name, color, size, price, quantity)
       VALUES (?,?,?,?,?,?,?,?)`
    );
    for (const item of items) {
      insertItem.run(uid(), id, item.productId, item.name, item.color, item.size, item.price, item.quantity);
    }

    return OrderModel.findUnique({ where: { id }, include: { items: true } });
  },
  update({ where, data }) {
    const fields = [];
    const params = [];
    for (const [key, value] of Object.entries(data)) {
      fields.push(`${key} = ?`);
      params.push(value);
    }
    params.push(where.id);
    db.prepare(`UPDATE orders SET ${fields.join(', ')} WHERE id = ?`).run(...params);
    return OrderModel.findUnique({ where: { id: where.id } });
  },
};

function attachItems(order) {
  const items = db.prepare('SELECT * FROM order_items WHERE orderId = ?').all(order.id);
  return { ...order, items };
}

const WishlistItemModel = {
  findMany({ where, include }) {
    const rows = db.prepare('SELECT * FROM wishlist_items WHERE userId = ?').all(where.userId);
    if (include?.product) {
      return rows.map((r) => ({
        ...r,
        product: normalizeProduct(db.prepare('SELECT * FROM products WHERE id = ?').get(r.productId)),
      }));
    }
    return rows;
  },
  findUnique({ where }) {
    if (where.userId_productId) {
      const { userId, productId } = where.userId_productId;
      return (
        db.prepare('SELECT * FROM wishlist_items WHERE userId = ? AND productId = ?').get(userId, productId) || null
      );
    }
    return db.prepare('SELECT * FROM wishlist_items WHERE id = ?').get(where.id) || null;
  },
  create({ data }) {
    const id = uid();
    db.prepare('INSERT INTO wishlist_items (id, userId, productId, createdAt) VALUES (?, ?, ?, ?)').run(
      id,
      data.userId,
      data.productId,
      now()
    );
    return { id, ...data };
  },
  delete({ where }) {
    db.prepare('DELETE FROM wishlist_items WHERE id = ?').run(where.id);
  },
};

const PromoCodeModel = {
  findUnique({ where }) {
    return db.prepare('SELECT * FROM promo_codes WHERE code = ?').get(where.code) || null;
  },
  upsert({ where, create }) {
    const existing = PromoCodeModel.findUnique({ where });
    if (existing) return existing;
    const id = uid();
    db.prepare('INSERT INTO promo_codes (id, code, percentOff, active) VALUES (?, ?, ?, 1)').run(
      id,
      create.code,
      create.percentOff
    );
    return { id, ...create, active: 1 };
  },
};

const NewsletterSubscriberModel = {
  upsert({ where, create }) {
    const existing = db.prepare('SELECT * FROM newsletter_subscribers WHERE email = ?').get(where.email);
    if (existing) return existing;
    const id = uid();
    db.prepare('INSERT INTO newsletter_subscribers (id, email, createdAt) VALUES (?, ?, ?)').run(
      id,
      create.email,
      now()
    );
    return { id, email: create.email };
  },
};

export const prisma = {
  product: ProductModel,
  category: CategoryModel,
  user: UserModel,
  address: AddressModel,
  order: OrderModel,
  wishlistItem: WishlistItemModel,
  promoCode: PromoCodeModel,
  newsletterSubscriber: NewsletterSubscriberModel,
};
