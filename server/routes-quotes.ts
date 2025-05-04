import { sql } from "drizzle-orm";
import express from "express";
import { db } from "./db";
import { storage } from "./storage";
import { InsertQuote, InsertQuoteProduct, quotes } from "@shared/schema";

export function setupQuotesRoutes(app: express.Express) {
  // Récupérer tous les devis d'un fournisseur
  app.get("/api/supplier/quotes", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'supplier') {
        return res.status(401).json({ message: "Non autorisé" });
      }

      const supplier = await storage.getSupplierByUserId(req.user.id);
      if (!supplier) {
        return res.status(404).json({ message: "Profil fournisseur non trouvé" });
      }

      const quotes = await storage.getQuotesBySupplierId(supplier.id);

      // Enrichir les devis avec des informations client
      const enrichedQuotes = await Promise.all(quotes.map(async (quote) => {
        const client = await storage.getClient(quote.clientId);
        const quoteProducts = await storage.getQuoteProductsByQuoteId(quote.id);
        
        return {
          ...quote,
          clientName: client?.company || "Client inconnu",
          items: quoteProducts || []
        };
      }));

      res.json(enrichedQuotes);
    } catch (error) {
      console.error("Erreur lors de la récupération des devis:", error);
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  });

  // Créer un nouveau devis
  app.post("/api/supplier/quotes", async (req, res) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'supplier') {
        return res.status(401).json({ message: "Non autorisé" });
      }

      const supplier = await storage.getSupplierByUserId(req.user.id);
      if (!supplier) {
        return res.status(404).json({ message: "Profil fournisseur non trouvé" });
      }

      const { clientId, validUntil, items } = req.body;

      if (!clientId || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Données de devis invalides" });
      }

      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const quoteData: InsertQuote = {
        clientId,
        supplierId: supplier.id,
        status: "pending",
        total,
        createdAt: new Date(),
        validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 jours par défaut
      };

      const quote = await storage.createQuote(quoteData, items.map(item => ({
        quoteId: 0, // Sera remplacé par createQuote
        productId: item.productId,
        quantity: item.quantity,
        priceAtQuote: item.price
      })));

      res.status(201).json(quote);
    } catch (error) {
      console.error("Erreur lors de la création du devis:", error);
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  });

  // Mettre à jour le statut d'un devis
  app.patch("/api/supplier/quotes/:id/status", async (req, res) => {
    try {
      const quoteId = parseInt(req.params.id);
      if (isNaN(quoteId)) {
        return res.status(400).json({ message: "ID de devis invalide" });
      }

      const { status } = req.body;
      if (!status || !["pending", "accepted", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Statut invalide" });
      }

      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Non autorisé" });
      }

      const quote = await storage.getQuote(quoteId);
      if (!quote) {
        return res.status(404).json({ message: "Devis non trouvé" });
      }

      // Vérifier si l'utilisateur est le fournisseur ou le client concerné
      if (req.user.role === 'supplier') {
        const supplier = await storage.getSupplierByUserId(req.user.id);
        if (!supplier || supplier.id !== quote.supplierId) {
          return res.status(403).json({ message: "Accès refusé" });
        }
      } else if (req.user.role === 'client') {
        const client = await storage.getClientByUserId(req.user.id);
        if (!client || client.id !== quote.clientId) {
          return res.status(403).json({ message: "Accès refusé" });
        }
      } else {
        return res.status(403).json({ message: "Accès refusé" });
      }

      const updatedQuote = await storage.updateQuoteStatus(quoteId, status);
      res.json(updatedQuote);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut du devis:", error);
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  });
}