import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import session from "express-session";
import { createServer as createViteServer } from "vite";
import passport, { generateToken, verifyGoogleIdToken, AppUser } from "./src/lib/passport.ts";
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
  app.use(cookieParser());
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "ledger-secret-session-key-randomized-3891724",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      authFramework: "passport",
    });
  });

  // ================= PASSPORT GOOGLE AUTH ROUTES =================
  
  // 1. Passport standard Google OAuth Redirect
  app.get(
    "/api/auth/google",
    (req, res, next) => {
      if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        return res.status(400).json({ 
          error: "Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) not configured in server environment." 
        });
      }
      passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
    }
  );

  // 2. Passport Google OAuth Callback
  app.get(
    "/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/?auth_error=true" }),
    async (req, res) => {
      const user = req.user as AppUser;
      if (user) {
        await getOrCreateUser(user.uid, user.email, user.displayName, user.photoURL);
        const token = generateToken(user);
        res.redirect(`/?auth_token=${token}`);
      } else {
        res.redirect("/?auth_error=true");
      }
    }
  );

  // 3. Client-Side Google Token Verification (Google Identity Services / One Tap / Popup)
  app.post("/api/auth/google/verify-token", async (req, res) => {
    try {
      const { credential, idToken } = req.body;
      const rawToken = credential || idToken;

      if (!rawToken) {
        return res.status(400).json({ error: "Missing Google credential token" });
      }

      const verifiedUser = await verifyGoogleIdToken(rawToken);
      if (!verifiedUser) {
        return res.status(401).json({ error: "Invalid Google credential" });
      }

      // Persist to Postgres database
      const dbUser = await getOrCreateUser(
        verifiedUser.uid,
        verifiedUser.email,
        verifiedUser.displayName,
        verifiedUser.photoURL
      );

      const token = generateToken(verifiedUser);

      // Log in session via Passport
      req.login(verifiedUser, (err) => {
        if (err) console.warn("Passport login session warning:", err);
      });

      res.json({
        success: true,
        token,
        user: {
          uid: verifiedUser.uid,
          email: verifiedUser.email,
          displayName: verifiedUser.displayName,
          photoURL: verifiedUser.photoURL,
          currency: (dbUser as any)?.currency || "$",
        },
      });
    } catch (error: any) {
      console.error("Google token verification failed:", error);
      res.status(500).json({ error: error.message || "Failed to authenticate with Google" });
    }
  });

  // 4. Quick Demo / Test User Sign-In (frictionless testing)
  app.post("/api/auth/demo-login", async (req, res) => {
    try {
      const { email = "demo.user@gmail.com", displayName = "Demo User" } = req.body;
      const demoUser: AppUser = {
        uid: `demo-${email.replace(/[^a-zA-Z0-9]/g, "_")}`,
        email,
        displayName,
        photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80",
      };

      await getOrCreateUser(demoUser.uid, demoUser.email, demoUser.displayName, demoUser.photoURL);
      const token = generateToken(demoUser);

      req.login(demoUser, (err) => {
        if (err) console.warn("Passport demo login warning:", err);
      });

      res.json({
        success: true,
        token,
        user: demoUser,
      });
    } catch (error: any) {
      console.error("Demo login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  // 5. Current Session User
  app.get("/api/auth/me", requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const user = await getOrCreateUser(
        uid,
        req.user!.email,
        req.user!.displayName,
        req.user!.photoURL
      );
      res.json({ user });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // 6. Logout
  app.post("/api/auth/logout", (req, res) => {
    req.logout?.((err) => {
      if (err) console.warn("Logout warning:", err);
    });
    res.json({ success: true });
  });

  // 7. User Sync & Profile
  app.post("/api/auth/sync", requireAuth, async (req: AuthRequest, res) => {
    try {
      const { email, name, picture } = req.body;
      const uid = req.user!.uid;
      const user = await getOrCreateUser(
        uid,
        email || req.user!.email || "",
        name || req.user!.displayName || null,
        picture || req.user!.photoURL || null
      );
      res.json({ success: true, user });
    } catch (error: any) {
      console.error("User sync error:", error);
      res.status(500).json({ error: error.message || "Failed to sync user" });
    }
  });

  // ================= DATA APIs (PostgreSQL / Supabase) =================

  // Transactions
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

  // Budgets
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

  // Subscriptions
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

  // User Currency
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
