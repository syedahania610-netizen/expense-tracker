import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { getOrCreateUser } from "./src/db/users.ts";
import {
  getUserTransactions,
  upsertUserTransaction,
  deleteUserTransaction,
  bulkDeleteUserTransactions,
  bulkInsertTransactions,
  getUserBudgets,
  upsertUserBudget,
  getUserSubscriptions,
  upsertUserSubscription,
  deleteUserSubscription,
  updateUserCurrency,
} from "./src/db/queries.ts";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // 1. User Sync & Profile
  app.post("/api/auth/sync", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { email, name, picture } = req.body;
      const uid = req.user!.uid;
      const user = await getOrCreateUser(
        uid,
        email || req.user!.email || "",
        name || (req.user as any).name || null,
        picture || (req.user as any).picture || null
      );
      res.json({ success: true, user });
    } catch (error: any) {
      console.error("User sync error:", error);
      res.status(500).json({ error: error.message || "Failed to sync user" });
    }
  });

  // 2. Transactions APIs
  app.get("/api/transactions", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const txs = await getUserTransactions(uid);
      res.json({ transactions: txs });
    } catch (error: any) {
      console.error("Get transactions error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const transaction = req.body;
      await upsertUserTransaction(uid, transaction);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Upsert transaction error:", error);
      res.status(500).json({ error: error.message || "Failed to save transaction" });
    }
  });

  app.delete("/api/transactions/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const { id } = req.params;
      await deleteUserTransaction(uid, id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete transaction error:", error);
      res.status(500).json({ error: error.message || "Failed to delete transaction" });
    }
  });

  app.post("/api/transactions/bulk-delete", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const { ids } = req.body;
      if (Array.isArray(ids)) {
        await bulkDeleteUserTransactions(uid, ids);
      }
      res.json({ success: true });
    } catch (error: any) {
      console.error("Bulk delete error:", error);
      res.status(500).json({ error: error.message || "Failed to bulk delete transactions" });
    }
  });

  app.post("/api/transactions/bulk-import", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const { transactions: imported } = req.body;
      if (Array.isArray(imported)) {
        await bulkInsertTransactions(uid, imported);
      }
      res.json({ success: true });
    } catch (error: any) {
      console.error("Bulk import error:", error);
      res.status(500).json({ error: error.message || "Failed to import transactions" });
    }
  });

  // 3. Budgets APIs
  app.get("/api/budgets", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const bList = await getUserBudgets(uid);
      res.json({ budgets: bList });
    } catch (error: any) {
      console.error("Get budgets error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch budgets" });
    }
  });

  app.post("/api/budgets", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const budget = req.body;
      await upsertUserBudget(uid, budget);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Upsert budget error:", error);
      res.status(500).json({ error: error.message || "Failed to save budget" });
    }
  });

  // 4. Subscriptions APIs
  app.get("/api/subscriptions", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const subs = await getUserSubscriptions(uid);
      res.json({ subscriptions: subs });
    } catch (error: any) {
      console.error("Get subscriptions error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch subscriptions" });
    }
  });

  app.post("/api/subscriptions", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const sub = req.body;
      await upsertUserSubscription(uid, sub);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Upsert subscription error:", error);
      res.status(500).json({ error: error.message || "Failed to save subscription" });
    }
  });

  app.delete("/api/subscriptions/:id", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const { id } = req.params;
      await deleteUserSubscription(uid, id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete subscription error:", error);
      res.status(500).json({ error: error.message || "Failed to delete subscription" });
    }
  });

  // 5. User Preferences
  app.post("/api/user/currency", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const { currency } = req.body;
      if (currency) {
        await updateUserCurrency(uid, currency);
      }
      res.json({ success: true });
    } catch (error: any) {
      console.error("Update currency error:", error);
      res.status(500).json({ error: error.message || "Failed to update currency" });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
