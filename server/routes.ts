import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertProductSchema, insertCategorySchema, insertDeliverySchema,
  insertFavoriteSchema, insertOrderSchema, insertOrderProductSchema, 
  insertQuoteSchema, insertQuoteProductSchema, products
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { hashPassword } from './utils'; // Assuming this function exists for password hashing


function validateSchema(schema: any, data: any) {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      throw new Error(validationError.message);
    }
    throw error;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Product routes
  app.get("/api/products", async (req, res, next) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const products = await storage.getProducts(page, limit);
      res.json(products);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/products/search", async (req, res, next) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      const products = await storage.searchProducts(query);
      res.json(products);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/products/filter", async (req, res, next) => {
    try {
      const categoryIds = req.query.categoryIds ? (req.query.categoryIds as string).split(',').map(Number) : undefined;
      const supplierIds = req.query.supplierIds ? (req.query.supplierIds as string).split(',').map(Number) : undefined;
      const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined;
      const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined;
      const inStock = req.query.inStock === 'true';

      const products = await storage.filterProducts({
        categoryIds,
        supplierIds,
        minPrice,
        maxPrice,
        inStock
      });
      res.json(products);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/products/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/supplier/products", async (req, res, next) => {
    try {
      console.log("=== CREATE PRODUCT START ===");
      console.log("Session ID:", req.sessionID);
      console.log("Is Authenticated:", req.isAuthenticated());
      console.log("User trying to create product:", req.user);

      if (!req.isAuthenticated()) {
        console.log("User is not authenticated!");
        return res.status(401).json({ message: "You must be logged in to create a product" });
      }

      const supplier = await storage.getSupplierByUserId(req.user?.id);
      console.log("Supplier found for product creation:", supplier);

      if (!supplier) {
        console.log("No supplier profile found for user:", req.user?.id);
        return res.status(404).json({ message: "Supplier profile not found" });
      }

      // Assurez-vous que le supplierId est celui du fournisseur connecté
      const productData = {
        ...req.body,
        supplierId: supplier.id
      };

      console.log("Creating product with data:", productData);

      const validatedData = validateSchema(insertProductSchema, productData);
      console.log("Validated data:", validatedData);

      const product = await storage.createProduct(validatedData);
      console.log("Product created successfully:", product);

      res.status(201).json(product);
      console.log("=== CREATE PRODUCT END ===");
    } catch (error) {
      console.error("=== CREATE PRODUCT ERROR ===");
      console.error("Error creating product:", error);
      console.error("Request body:", req.body);
      console.error("User:", req.user);
      console.error("Session:", req.sessionID);
      const errorMessage = error instanceof Error ? error.message : "Internal server error";
      res.status(500).json({ message: errorMessage });
    }
  });

  app.put("/api/supplier/products/:id", async (req, res, next) => {
    try {
      console.log("User trying to update product:", req.user);

      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);

      console.log("Product to update:", product);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Check if supplier is the owner of the product
      const supplier = await storage.getSupplierByUserId(req.user?.id);
      console.log("Supplier found for update:", supplier);

      if (!supplier || product.supplierId !== supplier.id) {
        return res.status(403).json({ message: "You don't have permission to update this product" });
      }

      // Assurez-vous que le supplierId ne peut pas être modifié
      const productData = {
        ...req.body,
        supplierId: supplier.id
      };

      console.log("Updating product with data:", productData);

      const validatedData = validateSchema(insertProductSchema.partial(), productData);
      const updatedProduct = await storage.updateProduct(id, validatedData);

      console.log("Product updated:", updatedProduct);

      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: error.message || "Internal server error" });
    }
  });

  app.delete("/api/supplier/products/:id", async (req, res, next) => {
    try {
      console.log("User trying to delete product:", req.user);

      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);

      console.log("Product to delete:", product);

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Check if supplier is the owner of the product
      const supplier = await storage.getSupplierByUserId(req.user?.id);
      console.log("Supplier found for delete:", supplier);

      if (!supplier || product.supplierId !== supplier.id) {
        return res.status(403).json({ message: "You don't have permission to delete this product" });
      }

      console.log(`Deleting product with ID ${id}`);

      await storage.deleteProduct(id);

      console.log("Product deleted successfully");

      res.sendStatus(204);
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res, next) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/categories/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getCategory(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/categories/:id/products", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const products = await storage.getProductsByCategory(id);
      res.json(products);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/categories", async (req, res, next) => {
    try {
      const validatedData = validateSchema(insertCategorySchema, req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/admin/categories/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = validateSchema(insertCategorySchema.partial(), req.body);
      const category = await storage.updateCategory(id, validatedData);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/admin/categories/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCategory(id);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

  // Order routes
  app.get("/api/client/orders", async (req, res, next) => {
    try {
      const client = await storage.getClientByUserId(req.user.id);
      if (!client) {
        return res.status(404).json({ message: "Client profile not found" });
      }

      const orders = await storage.getOrdersByClient(client.id);
      res.json(orders);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/supplier/orders", async (req, res, next) => {
    try {
      const supplier = await storage.getSupplierByUserId(req.user.id);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier profile not found" });
      }

      const orders = await storage.getOrdersBySupplier(supplier.id);
      res.json(orders);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/client/orders/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Check if client is the owner of the order
      if (req.user.role === 'client') {
        const client = await storage.getClientByUserId(req.user.id);
        if (!client || order.clientId !== client.id) {
          return res.status(403).json({ message: "You don't have permission to view this order" });
        }
      }

      res.json(order);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/client/orders", async (req, res, next) => {
    try {
      const client = await storage.getClientByUserId(req.user.id);
      if (!client) {
        return res.status(404).json({ message: "Client profile not found" });
      }

      const { order, orderProducts } = req.body;

      const validatedOrder = validateSchema(insertOrderSchema, {
        ...order,
        clientId: client.id
      });

      const validatedOrderProducts = orderProducts.map((item: any) => 
        validateSchema(insertOrderProductSchema, item)
      );

      const createdOrder = await storage.createOrder(validatedOrder, validatedOrderProducts);
      res.status(201).json(createdOrder);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/admin/orders/:id/status", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      if (!status || !['pending', 'shipped', 'delivered', 'cancelled'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updatedOrder = await storage.updateOrderStatus(id, status);
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(updatedOrder);
    } catch (error) {
      next(error);
    }
  });

  // Quote routes
  app.get("/api/client/quotes", async (req, res, next) => {
    try {
      const client = await storage.getClientByUserId(req.user.id);
      if (!client) {
        return res.status(404).json({ message: "Client profile not found" });
      }

      const quotes = await storage.getQuotesByClient(client.id);
      res.json(quotes);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/client/quotes", async (req, res, next) => {
    try {
      const client = await storage.getClientByUserId(req.user.id);
      if (!client) {
        return res.status(404).json({ message: "Client profile not found" });
      }

      const { quote, quoteProducts } = req.body;

      const validatedQuote = validateSchema(insertQuoteSchema, {
        ...quote,
        clientId: client.id
      });

      const validatedQuoteProducts = quoteProducts.map((item: any) => 
        validateSchema(insertQuoteProductSchema, item)
      );

      const createdQuote = await storage.createQuote(validatedQuote, validatedQuoteProducts);
      res.status(201).json(createdQuote);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/admin/quotes/:id/status", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updatedQuote = await storage.updateQuoteStatus(id, status);
      if (!updatedQuote) {
        return res.status(404).json({ message: "Quote not found" });
      }

      res.json(updatedQuote);
    } catch (error) {
      next(error);
    }
  });

  // Delivery routes
  app.get("/api/client/orders/:id/delivery", async (req, res, next) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Check if client is the owner of the order
      if (req.user.role === 'client') {
        const client = await storage.getClientByUserId(req.user.id);
        if (!client || order.clientId !== client.id) {
          return res.status(403).json({ message: "You don't have permission to view this delivery" });
        }
      }

      const delivery = await storage.getDeliveryByOrder(orderId);
      if (!delivery) {
        return res.status(404).json({ message: "Delivery not found" });
      }

      res.json(delivery);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/deliveries", async (req, res, next) => {
    try {
      const validatedData = validateSchema(insertDeliverySchema, req.body);
      const delivery = await storage.createDelivery(validatedData);
      res.status(201).json(delivery);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/admin/deliveries/:id", async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = validateSchema(insertDeliverySchema.partial(), req.body);
      const delivery = await storage.updateDelivery(id, validatedData);
      if (!delivery) {
        return res.status(404).json({ message: "Delivery not found" });
      }
      res.json(delivery);
    } catch (error) {
      next(error);
    }
  });

  // Favorite routes
  app.get("/api/client/favorites", async (req, res, next) => {
    try {
      const client = await storage.getClientByUserId(req.user.id);
      if (!client) {
        return res.status(404).json({ message: "Client profile not found" });
      }

      const favorites = await storage.getFavoritesByClient(client.id);
      res.json(favorites);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/client/favorites", async (req, res, next) => {
    try {
      const client = await storage.getClientByUserId(req.user.id);
      if (!client) {
        return res.status(404).json({ message: "Client profile not found" });
      }

      const validatedData = validateSchema(insertFavoriteSchema, {
        ...req.body,
        clientId: client.id
      });

      const favorite = await storage.addFavorite(validatedData);
      res.status(201).json(favorite);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/client/favorites/:productId", async (req, res, next) => {
    try {
      const productId = parseInt(req.params.productId);
      const client = await storage.getClientByUserId(req.user.id);
      if (!client) {
        return res.status(404).json({ message: "Client profile not found" });
      }

      await storage.removeFavorite(client.id, productId);
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

  // Stats routes for suppliers
  // Route pour récupérer le profil du fournisseur
  app.get("/api/supplier/profile", async (req, res, next) => {
    try {
      const supplier = await storage.getSupplierByUserId(req.user?.id);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }

      res.json(supplier);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/supplier/stats", async (req, res, next) => {
    try {
      const supplier = await storage.getSupplierByUserId(req.user?.id);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier profile not found" });
      }

      const stats = {
        totalSales: await storage.getTotalSalesBySupplier(supplier.id),
        totalOrders: await storage.getTotalOrdersBySupplier(supplier.id),
        totalProducts: await storage.getTotalProductsBySupplierId(supplier.id)
      };

      res.json(stats);
    } catch (error) {
      console.error("Error fetching supplier stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Supplier products routes
  app.get("/api/supplier/products", async (req, res, next) => {
    try {
      console.log("User authenticated:", req.user);

      const supplier = await storage.getSupplierByUserId(req.user?.id);
      console.log("Supplier found:", supplier);

      if (!supplier) {
        return res.status(404).json({ message: "Supplier profile not found" });
      }

      const lowStock = req.query.lowStock === 'true';
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      console.log(`Filtering: lowStock=${lowStock}, limit=${limit}`);

      let products = await storage.getProductsBySupplier(supplier.id);
      console.log(`Found ${products.length} products for supplier ${supplier.id}`);

      // Filter low stock products if requested
      if (lowStock) {
        products = products.filter(product => product.stock < 10);
        console.log(`After low stock filter: ${products.length} products`);
      }

      // Apply limit if requested
      if (limit && limit > 0 && products.length > limit) {
        products = products.slice(0, limit);
        console.log(`After limit applied: ${products.length} products`);
      }

      res.json(products);
    } catch (error) {
      console.error("Error fetching supplier products:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Supplier orders route
  app.get("/api/supplier/orders", async (req, res, next) => {
    try {
      console.log("User authenticated for orders:", req.user);

      const supplier = await storage.getSupplierByUserId(req.user?.id);
      console.log("Supplier found for orders:", supplier);

      if (!supplier) {
        return res.status(404).json({ message: "Supplier profile not found" });
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      console.log(`Orders limit=${limit}`);

      let orders = await storage.getOrdersBySupplier(supplier.id);
      console.log(`Found ${orders.length} orders for supplier ${supplier.id}`);

      // Apply limit if requested
      if (limit && limit > 0 && orders.length > limit) {
        orders = orders.slice(0, limit);
        console.log(`After limit applied: ${orders.length} orders`);
      }

      res.json(orders);
    } catch (error) {
      console.error("Error fetching supplier orders:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin stats routes
  app.get("/api/admin/stats", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Données temporaires pour éviter les erreurs
      const stats = {
        totalUsers: 0,
        totalOrders: 0,
        totalSuppliers: 0,
        totalProducts: 0
      };

      try {
        // On peut simplement récupérer tous les produits et compter
        const allProducts = await storage.getProducts();
        stats.totalProducts = allProducts.length;
      } catch (err) {
        console.error("Error counting products:", err);
      }

      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/user/password", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Non authentifié" });
      }

      const { newPassword } = req.body;
      if (!newPassword || newPassword.length < 6) {
        return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
      }

      const hashedPassword = await hashPassword(newPassword);
      await db.update(users).set({ password: hashedPassword }).where(sql`id = ${req.user.id}`);

      res.status(200).json({ message: "Mot de passe modifié avec succès" });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ message: "Erreur lors de la modification du mot de passe" });
    }
  });

  app.get("/api/user", (req, res) => {
    //This endpoint likely needs to be implemented or removed based on your application requirements.  It's unclear from the provided information what this endpoint should do.  For now it remains empty.
    res.send('This endpoint needs implementation')
  });


  const httpServer = createServer(app);
  return httpServer;
}