import dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Configuration améliorée du serveur
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  const hostsToTry = ['0.0.0.0', '127.0.0.1']; // Essaye d'abord 0.0.0.0, puis 127.0.0.1 si échec

  const startServer = (hostIndex = 0) => {
    const host = hostsToTry[hostIndex];
    
    server.listen(port, host, () => {
      const displayHost = host === '0.0.0.0' ? 'localhost' : host;
      log(`Server running on http://${displayHost}:${port}`);
      log(`API available at http://${displayHost}:${port}/api`);
      if (app.get("env") === "development") {
        log(`Vite dev server proxied through http://${displayHost}:${port}`);
      }
    }).on('error', (err: NodeJS.ErrnoException) => {
      if (hostIndex < hostsToTry.length - 1) {
        log(`Failed to start on ${host} (${err.code}), trying next host...`);
        startServer(hostIndex + 1);
      } else {
        log(`Could not start server on port ${port}: ${err.message}`);
        log('Possible solutions:');
        log('- Try a different port by setting PORT in .env');
        log('- Check if another process is using this port');
        log('- Verify your network/firewall settings');
        process.exit(1);
      }
    });
  };

  startServer();
})();