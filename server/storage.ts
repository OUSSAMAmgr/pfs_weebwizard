import { 
  users, clients, suppliers, products, categories, orders, orderProducts, 
  quotes, quoteProducts, deliveries, favorites,
  type User, type InsertUser, type Client, type InsertClient, 
  type Supplier, type InsertSupplier, type Product, type InsertProduct, 
  type Category, type InsertCategory, type Order, type InsertOrder, 
  type OrderProduct, type InsertOrderProduct, type Quote, type InsertQuote, 
  type QuoteProduct, type InsertQuoteProduct, type Delivery, type InsertDelivery,
  type Favorite, type InsertFavorite
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, like, or, gte, lte, gt } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

// Extend storage interface with required CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Client operations
  getClient(id: number): Promise<Client | undefined>;
  getClientByUserId(userId: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  createClientWithUser(userData: InsertUser, clientData: Omit<InsertClient, "userId">): Promise<User>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;
  
  // Supplier operations
  getSupplier(id: number): Promise<Supplier | undefined>;
  getSupplierByUserId(userId: number): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  createSupplierWithUser(userData: InsertUser, supplierData: Omit<InsertSupplier, "userId">): Promise<User>;
  updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: number): Promise<boolean>;
  
  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getProducts(page?: number, limit?: number): Promise<Product[]>;
  getProductsBySupplier(supplierId: number): Promise<Product[]>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  filterProducts(options: { categoryIds?: number[], supplierIds?: number[], minPrice?: number, maxPrice?: number, inStock?: boolean }): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Category operations
  getCategory(id: number): Promise<Category | undefined>;
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByClient(clientId: number): Promise<Order[]>;
  getOrdersBySupplier(supplierId: number): Promise<Order[]>;
  createOrder(order: InsertOrder, orderProducts: InsertOrderProduct[]): Promise<Order>;
  updateOrderStatus(id: number, status: Order['status']): Promise<Order | undefined>;
  deleteOrder(id: number): Promise<boolean>;
  
  // Quote operations
  getQuote(id: number): Promise<Quote | undefined>;
  getQuotesByClient(clientId: number): Promise<Quote[]>;
  createQuote(quote: InsertQuote, quoteProducts: InsertQuoteProduct[]): Promise<Quote>;
  updateQuoteStatus(id: number, status: Quote['status']): Promise<Quote | undefined>;
  deleteQuote(id: number): Promise<boolean>;
  
  // Delivery operations
  getDelivery(id: number): Promise<Delivery | undefined>;
  getDeliveryByOrder(orderId: number): Promise<Delivery | undefined>;
  createDelivery(delivery: InsertDelivery): Promise<Delivery>;
  updateDelivery(id: number, delivery: Partial<InsertDelivery>): Promise<Delivery | undefined>;
  
  // Favorite operations
  getFavoritesByClient(clientId: number): Promise<Favorite[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(clientId: number, productId: number): Promise<boolean>;
  
  // Stats operations
  getTotalSalesBySupplier(supplierId: number): Promise<number>;
  getTotalOrdersBySupplier(supplierId: number): Promise<number>;
  getTotalProductsBySupplierId(supplierId: number): Promise<number>;
  
  // Admin stats operations
  getTotalUsers(): Promise<number>;
  getTotalOrders(): Promise<number>;
  getTotalSuppliers(): Promise<number>;
  getTotalProducts(): Promise<number>;
  
  // Session store for authentication
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      tableName: 'user_sessions',
      createTableIfMissing: true,
      // Optimiser la gestion des sessions pour éviter les problèmes de perte de session
      disableTouch: false,
      pruneSessionInterval: 60 * 15 // nettoyer les anciennes sessions toutes les 15 minutes
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [createdUser] = await db.insert(users).values(user).returning();
    return createdUser;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return true;
  }

  // Client operations
  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async getClientByUserId(userId: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.userId, userId));
    return client;
  }

  async createClient(client: InsertClient): Promise<Client> {
    const [createdClient] = await db.insert(clients).values(client).returning();
    return createdClient;
  }

  async createClientWithUser(userData: InsertUser, clientData: Omit<InsertClient, "userId">): Promise<User> {
    // Start a transaction
    return await db.transaction(async (tx) => {
      const [user] = await tx.insert(users).values(userData).returning();
      await tx.insert(clients).values({
        userId: user.id,
        ...clientData
      });
      return user;
    });
  }

  async updateClient(id: number, clientData: Partial<InsertClient>): Promise<Client | undefined> {
    const [updatedClient] = await db
      .update(clients)
      .set(clientData)
      .where(eq(clients.id, id))
      .returning();
    return updatedClient;
  }

  async deleteClient(id: number): Promise<boolean> {
    await db.delete(clients).where(eq(clients.id, id));
    return true;
  }

  // Supplier operations
  async getSupplier(id: number): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier;
  }

  async getSupplierByUserId(userId: number): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.userId, userId));
    return supplier;
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [createdSupplier] = await db.insert(suppliers).values(supplier).returning();
    return createdSupplier;
  }

  async createSupplierWithUser(userData: InsertUser, supplierData: Omit<InsertSupplier, "userId">): Promise<User> {
    // Start a transaction
    return await db.transaction(async (tx) => {
      const [user] = await tx.insert(users).values(userData).returning();
      await tx.insert(suppliers).values({
        userId: user.id,
        ...supplierData
      });
      return user;
    });
  }

  async updateSupplier(id: number, supplierData: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const [updatedSupplier] = await db
      .update(suppliers)
      .set(supplierData)
      .where(eq(suppliers.id, id))
      .returning();
    return updatedSupplier;
  }

  async deleteSupplier(id: number): Promise<boolean> {
    await db.delete(suppliers).where(eq(suppliers.id, id));
    return true;
  }

  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProducts(page = 1, limit = 10): Promise<Product[]> {
    const offset = (page - 1) * limit;
    return await db
      .select()
      .from(products)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(products.createdAt));
  }

  async getProductsBySupplier(supplierId: number): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.supplierId, supplierId))
      .orderBy(desc(products.createdAt));
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(eq(products.categoryId, categoryId))
      .orderBy(desc(products.createdAt));
  }

  async searchProducts(query: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(
        or(
          like(products.name, `%${query}%`),
          like(products.description || '', `%${query}%`)
        )
      )
      .orderBy(desc(products.createdAt));
  }

  async filterProducts(options: { 
    categoryIds?: number[],
    supplierIds?: number[],
    minPrice?: number,
    maxPrice?: number,
    inStock?: boolean
  }): Promise<Product[]> {
    let query = db.select().from(products);
    
    if (options.categoryIds && options.categoryIds.length > 0) {
      query = query.where(sql`${products.categoryId} IN ${options.categoryIds}`);
    }
    
    if (options.supplierIds && options.supplierIds.length > 0) {
      query = query.where(sql`${products.supplierId} IN ${options.supplierIds}`);
    }
    
    if (options.minPrice !== undefined) {
      query = query.where(gte(products.price, options.minPrice));
    }
    
    if (options.maxPrice !== undefined) {
      query = query.where(lte(products.price, options.maxPrice));
    }
    
    if (options.inStock) {
      query = query.where(gt(products.stock, 0));
    }
    
    return await query.orderBy(desc(products.createdAt));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [createdProduct] = await db.insert(products).values(product).returning();
    return createdProduct;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set(productData)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    await db.delete(products).where(eq(products.id, id));
    return true;
  }

  // Category operations
  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [createdCategory] = await db.insert(categories).values(category).returning();
    return createdCategory;
  }

  async updateCategory(id: number, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updatedCategory] = await db
      .update(categories)
      .set(categoryData)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    await db.delete(categories).where(eq(categories.id, id));
    return true;
  }

  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrdersByClient(clientId: number): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.clientId, clientId))
      .orderBy(desc(orders.createdAt));
  }

  async getOrdersBySupplier(supplierId: number): Promise<Order[]> {
    // Get orders that contain products from this supplier
    const orderItems = await db
      .select({
        orderId: orderProducts.orderId
      })
      .from(orderProducts)
      .innerJoin(products, eq(orderProducts.productId, products.id))
      .where(eq(products.supplierId, supplierId))
      .groupBy(orderProducts.orderId);
    
    if (orderItems.length === 0) return [];
    
    const orderIds = orderItems.map(item => item.orderId);
    
    return await db
      .select()
      .from(orders)
      .where(sql`${orders.id} IN ${orderIds}`)
      .orderBy(desc(orders.createdAt));
  }

  async createOrder(orderData: InsertOrder, orderProductsData: InsertOrderProduct[]): Promise<Order> {
    return await db.transaction(async (tx) => {
      const [order] = await tx.insert(orders).values(orderData).returning();
      
      // Insert order products
      for (const item of orderProductsData) {
        await tx.insert(orderProducts).values({
          ...item,
          orderId: order.id
        });
      }
      
      return order;
    });
  }

  async updateOrderStatus(id: number, status: Order['status']): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  async deleteOrder(id: number): Promise<boolean> {
    await db.delete(orders).where(eq(orders.id, id));
    return true;
  }

  // Quote operations
  async getQuote(id: number): Promise<Quote | undefined> {
    const [quote] = await db.select().from(quotes).where(eq(quotes.id, id));
    return quote;
  }

  async getQuotesByClient(clientId: number): Promise<Quote[]> {
    return await db
      .select()
      .from(quotes)
      .where(eq(quotes.clientId, clientId))
      .orderBy(desc(quotes.createdAt));
  }

  async createQuote(quoteData: InsertQuote, quoteProductsData: InsertQuoteProduct[]): Promise<Quote> {
    return await db.transaction(async (tx) => {
      const [quote] = await tx.insert(quotes).values(quoteData).returning();
      
      // Insert quote products
      for (const item of quoteProductsData) {
        await tx.insert(quoteProducts).values({
          ...item,
          quoteId: quote.id
        });
      }
      
      return quote;
    });
  }

  async updateQuoteStatus(id: number, status: Quote['status']): Promise<Quote | undefined> {
    const [updatedQuote] = await db
      .update(quotes)
      .set({ status })
      .where(eq(quotes.id, id))
      .returning();
    return updatedQuote;
  }

  async deleteQuote(id: number): Promise<boolean> {
    await db.delete(quotes).where(eq(quotes.id, id));
    return true;
  }

  // Delivery operations
  async getDelivery(id: number): Promise<Delivery | undefined> {
    const [delivery] = await db.select().from(deliveries).where(eq(deliveries.id, id));
    return delivery;
  }

  async getDeliveryByOrder(orderId: number): Promise<Delivery | undefined> {
    const [delivery] = await db.select().from(deliveries).where(eq(deliveries.orderId, orderId));
    return delivery;
  }

  async createDelivery(delivery: InsertDelivery): Promise<Delivery> {
    const [createdDelivery] = await db.insert(deliveries).values(delivery).returning();
    return createdDelivery;
  }

  async updateDelivery(id: number, deliveryData: Partial<InsertDelivery>): Promise<Delivery | undefined> {
    const [updatedDelivery] = await db
      .update(deliveries)
      .set(deliveryData)
      .where(eq(deliveries.id, id))
      .returning();
    return updatedDelivery;
  }

  // Favorite operations
  async getFavoritesByClient(clientId: number): Promise<Favorite[]> {
    return await db.select().from(favorites).where(eq(favorites.clientId, clientId));
  }

  async addFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [createdFavorite] = await db.insert(favorites).values(favorite).returning();
    return createdFavorite;
  }

  async removeFavorite(clientId: number, productId: number): Promise<boolean> {
    await db
      .delete(favorites)
      .where(
        and(
          eq(favorites.clientId, clientId),
          eq(favorites.productId, productId)
        )
      );
    return true;
  }

  // Stats operations for suppliers
  async getTotalSalesBySupplier(supplierId: number): Promise<number> {
    try {
      const result = await db.execute(sql`
        SELECT SUM(op."priceAtPurchase" * op.quantity) as total
        FROM "order_products" op
        JOIN products p ON op."productId" = p.id
        WHERE p."supplierId" = ${supplierId}
      `);
      
      return Number(result.rows[0]?.total) || 0;
    } catch (error) {
      console.error("Error in getTotalSalesBySupplier:", error);
      return 0;
    }
  }

  async getTotalOrdersBySupplier(supplierId: number): Promise<number> {
    try {
      const result = await db.execute(sql`
        SELECT COUNT(DISTINCT o.id) as count
        FROM orders o
        JOIN "order_products" op ON o.id = op."orderId"
        JOIN products p ON op."productId" = p.id
        WHERE p."supplierId" = ${supplierId}
      `);
      
      return Number(result.rows[0]?.count) || 0;
    } catch (error) {
      console.error("Error in getTotalOrdersBySupplier:", error);
      return 0;
    }
  }

  async getTotalProductsBySupplierId(supplierId: number): Promise<number> {
    try {
      const result = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM products
        WHERE "supplierId" = ${supplierId}
      `);
      
      return Number(result.rows[0]?.count) || 0;
    } catch (error) {
      console.error("Error in getTotalProductsBySupplierId:", error);
      return 0;
    }
  }

  // Admin stats operations
  async getTotalUsers(): Promise<number> {
    try {
      const result = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM users
      `);
      
      return Number(result.rows[0]?.count) || 0;
    } catch (error) {
      console.error("Error in getTotalUsers:", error);
      return 0;
    }
  }

  async getTotalOrders(): Promise<number> {
    try {
      const result = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM orders
      `);
      
      return Number(result.rows[0]?.count) || 0;
    } catch (error) {
      console.error("Error in getTotalOrders:", error);
      return 0;
    }
  }

  async getTotalSuppliers(): Promise<number> {
    try {
      const result = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM suppliers
      `);
      
      return Number(result.rows[0]?.count) || 0;
    } catch (error) {
      console.error("Error in getTotalSuppliers:", error);
      return 0;
    }
  }

  async getTotalProducts(): Promise<number> {
    try {
      const result = await db.execute(sql`
        SELECT COUNT(*) as count
        FROM products
      `);
      
      return Number(result.rows[0]?.count) || 0;
    } catch (error) {
      console.error("Error in getTotalProducts:", error);
      return 0;
    }
  }
}

export const storage = new DatabaseStorage();
