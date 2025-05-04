import { pgTable, text, serial, integer, doublePrecision, timestamp, boolean, primaryKey, foreignKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("createdat").defaultNow().notNull(),
  role: text("role", { enum: ["admin", "client", "supplier"] }).notNull()
});

export const usersRelations = relations(users, ({ one, many }) => ({
  client: one(clients, {
    fields: [users.id],
    references: [clients.userId]
  }),
  supplier: one(suppliers, {
    fields: [users.id],
    references: [suppliers.userId]
  }),
  orders: many(orders)
}));

// Client schema
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  userId: integer("userid").notNull().references(() => users.id, { onDelete: "cascade" }),
  firstName: text("firstname").notNull(),
  lastName: text("lastname").notNull(),
  address: text("address"),
  phone: text("phone")
});

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, {
    fields: [clients.userId],
    references: [users.id]
  }),
  orders: many(orders),
  favorites: many(favorites)
}));

// Supplier schema
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  companyName: text("companyname").notNull(),
  contactName: text("contactname").notNull(),
  address: text("address"),
  phone: text("phone"),
  description: text("description")
});

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
  user: one(users, {
    fields: [suppliers.userId],
    references: [users.id]
  }),
  products: many(products)
}));

// Product schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: doublePrecision("price").notNull(),
  stock: integer("stock").notNull().default(0),
  imageUrl: text("imageurl"),
  createdAt: timestamp("createdat").defaultNow().notNull(),
  supplierId: integer("supplierid").references(() => suppliers.id, { onDelete: "cascade" }).notNull(),
  categoryId: integer("categoryid").references(() => categories.id)
});

export const productsRelations = relations(products, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [products.supplierId],
    references: [suppliers.id]
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id]
  }),
  orderProducts: many(orderProducts),
  quoteProducts: many(quoteProducts),
  favorites: many(favorites)
}));

// Category schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description")
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products)
}));

// Order schema
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  clientId: integer("clientid").references(() => clients.id, { onDelete: "cascade" }).notNull(),
  total: doublePrecision("total").notNull(),
  status: text("status", { enum: ["pending", "shipped", "delivered", "cancelled"] }).notNull().default("pending"),
  createdAt: timestamp("createdat").defaultNow().notNull()
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
  client: one(clients, {
    fields: [orders.clientId],
    references: [clients.id]
  }),
  orderProducts: many(orderProducts),
  delivery: one(deliveries, {
    fields: [orders.id],
    references: [deliveries.orderId]
  })
}));

// OrderProduct schema (junction table for order-product many-to-many)
export const orderProducts = pgTable("order_products", {
  id: serial("id").primaryKey(),
  orderId: integer("orderid").references(() => orders.id, { onDelete: "cascade" }).notNull(),
  productId: integer("productid").references(() => products.id, { onDelete: "cascade" }).notNull(),
  quantity: integer("quantity").notNull(),
  priceAtPurchase: doublePrecision("priceatpurchase").notNull()
});

export const orderProductsRelations = relations(orderProducts, ({ one }) => ({
  order: one(orders, {
    fields: [orderProducts.orderId],
    references: [orders.id]
  }),
  product: one(products, {
    fields: [orderProducts.productId],
    references: [products.id]
  })
}));

// Quote schema
export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  clientId: integer("clientid").references(() => clients.id, { onDelete: "cascade" }).notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] }).notNull().default("pending"),
  total: doublePrecision("total").notNull(),
  createdAt: timestamp("createdat").defaultNow().notNull()
});

export const quotesRelations = relations(quotes, ({ one, many }) => ({
  client: one(clients, {
    fields: [quotes.clientId],
    references: [clients.id]
  }),
  quoteProducts: many(quoteProducts)
}));

// QuoteProduct schema (junction table for quote-product many-to-many)
export const quoteProducts = pgTable("quote_products", {
  id: serial("id").primaryKey(),
  quoteId: integer("quoteid").references(() => quotes.id, { onDelete: "cascade" }).notNull(),
  productId: integer("productid").references(() => products.id, { onDelete: "cascade" }).notNull(),
  quantity: integer("quantity").notNull()
});

export const quoteProductsRelations = relations(quoteProducts, ({ one }) => ({
  quote: one(quotes, {
    fields: [quoteProducts.quoteId],
    references: [quotes.id]
  }),
  product: one(products, {
    fields: [quoteProducts.productId],
    references: [products.id]
  })
}));

// Delivery schema
export const deliveries = pgTable("deliveries", {
  id: serial("id").primaryKey(),
  orderId: integer("orderid").references(() => orders.id, { onDelete: "cascade" }).notNull().unique(),
  address: text("address").notNull(),
  deliveryDate: timestamp("deliverydate")
});

export const deliveriesRelations = relations(deliveries, ({ one }) => ({
  order: one(orders, {
    fields: [deliveries.orderId],
    references: [orders.id]
  })
}));

// Favorites schema
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  clientId: integer("clientid").references(() => clients.id, { onDelete: "cascade" }).notNull(),
  productId: integer("productid").references(() => products.id, { onDelete: "cascade" }).notNull()
});

export const favoritesRelations = relations(favorites, ({ one }) => ({
  client: one(clients, {
    fields: [favorites.clientId],
    references: [clients.id]
  }),
  product: one(products, {
    fields: [favorites.productId],
    references: [products.id]
  })
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertClientSchema = createInsertSchema(clients).omit({ id: true });
export const insertSupplierSchema = createInsertSchema(suppliers).omit({ id: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true });
export const insertOrderProductSchema = createInsertSchema(orderProducts).omit({ id: true });
export const insertQuoteSchema = createInsertSchema(quotes).omit({ id: true });
export const insertQuoteProductSchema = createInsertSchema(quoteProducts).omit({ id: true });
export const insertDeliverySchema = createInsertSchema(deliveries).omit({ id: true });
export const insertFavoriteSchema = createInsertSchema(favorites).omit({ id: true });

// Registration schema
export const registerClientSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  role: z.literal("client"),
  firstName: z.string().min(2, { message: "First name is required" }),
  lastName: z.string().min(2, { message: "Last name is required" }),
  address: z.string().optional(),
  phone: z.string().optional()
});

export const registerSupplierSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  role: z.literal("supplier"),
  companyName: z.string().min(2, { message: "Company name is required" }),
  contactName: z.string().min(2, { message: "Contact name is required" }),
  address: z.string().optional(),
  phone: z.string().optional(),
  description: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email({ message: "Email valide requis" }),
  password: z.string().min(1, { message: "Mot de passe requis" })
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Supplier = typeof suppliers.$inferSelect;
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderProduct = typeof orderProducts.$inferSelect;
export type InsertOrderProduct = z.infer<typeof insertOrderProductSchema>;
export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type QuoteProduct = typeof quoteProducts.$inferSelect;
export type InsertQuoteProduct = z.infer<typeof insertQuoteProductSchema>;
export type Delivery = typeof deliveries.$inferSelect;
export type InsertDelivery = z.infer<typeof insertDeliverySchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type RegisterClient = z.infer<typeof registerClientSchema>;
export type RegisterSupplier = z.infer<typeof registerSupplierSchema>;
export type Login = z.infer<typeof loginSchema>;
