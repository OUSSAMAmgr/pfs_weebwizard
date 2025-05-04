import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { loginSchema, registerClientSchema, registerSupplierSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Utiliser un secret fixe en développement pour éviter des problèmes de session
  // Pour éviter l'erreur Type 'string | undefined' is not assignable to type 'string | string[]'
  const SESSION_SECRET: string = process.env.NODE_ENV === "production" 
    ? process.env.SESSION_SECRET || "materiaux-pro-production-session-secret"
    : "materiaux-pro-development-session-secret";
    
  if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) {
    console.warn("WARNING: No SESSION_SECRET defined for production environment!");
  }
    
  const sessionSettings: session.SessionOptions = {
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: "Email ou mot de passe invalide" });
          } else {
            return done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      }
    ),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/register/client", async (req, res, next) => {
    try {
      const validatedData = registerClientSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(validatedData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await hashPassword(validatedData.password);
      
      const userData = {
        username: validatedData.username,
        password: hashedPassword,
        email: validatedData.email,
        role: validatedData.role,
      };

      const clientData = {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        address: validatedData.address,
        phone: validatedData.phone,
      };

      const user = await storage.createClientWithUser(userData, clientData);

      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(201).json(user);
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  app.post("/api/register/supplier", async (req, res, next) => {
    try {
      const validatedData = registerSupplierSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(validatedData.username);
      
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await hashPassword(validatedData.password);
      
      const userData = {
        username: validatedData.username,
        password: hashedPassword,
        email: validatedData.email,
        role: validatedData.role,
      };

      const supplierData = {
        companyName: validatedData.companyName,
        contactName: validatedData.contactName,
        address: validatedData.address,
        phone: validatedData.phone,
        description: validatedData.description,
      };

      const user = await storage.createSupplierWithUser(userData, supplierData);

      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(201).json(user);
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    try {
      loginSchema.parse(req.body);
      
      passport.authenticate("local", (err: Error, user: Express.User, info: { message: string }) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).json({ message: info.message || "Invalid credentials" });
        }
        
        req.login(user, (err) => {
          if (err) {
            return next(err);
          }
          return res.status(200).json(user);
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    console.log("GET /api/user - Is Authenticated:", req.isAuthenticated());
    console.log("GET /api/user - Session ID:", req.sessionID);
    
    if (!req.isAuthenticated()) {
      console.log("GET /api/user - Not authenticated, sending 401");
      return res.sendStatus(401);
    }
    
    console.log("GET /api/user - User data:", req.user);
    res.json(req.user);
  });

  // Middleware to check if user is authenticated
  app.use("/api/client", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (req.user.role !== "client" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  });

  app.use("/api/supplier", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (req.user.role !== "supplier" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  });

  app.use("/api/admin", (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  });
}
