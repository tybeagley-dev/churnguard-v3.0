var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/churnguard-data-service.ts
var churnguard_data_service_exports = {};
__export(churnguard_data_service_exports, {
  ChurnGuardDataService: () => ChurnGuardDataService,
  churnGuardDataService: () => churnGuardDataService
});
import { BigQuery } from "@google-cloud/bigquery";
var ChurnGuardCacheManager, ChurnGuardDataService, churnGuardDataService;
var init_churnguard_data_service = __esm({
  "server/churnguard-data-service.ts"() {
    "use strict";
    ChurnGuardCacheManager = class {
      client;
      constructor(client) {
        this.client = client;
      }
      async ensureFreshCache() {
        const lastUpdate = await this.getLastCacheUpdate();
        const hoursOld = (Date.now() - lastUpdate) / (1e3 * 60 * 60);
        if (hoursOld > 18 || isNaN(hoursOld)) {
          console.log("\u{1F504} Cache refresh triggered - rebuilding weekly and monthly caches");
          await Promise.all([
            this.refreshWeeklyCache(),
            this.refreshMonthlyCache()
          ]);
          console.log("\u2705 Cache refresh complete");
        } else {
          console.log(`\u{1F4CA} Cache fresh (${Math.round(hoursOld)} hours old)`);
        }
      }
      async refreshWeeklyCache() {
        const query = `
      CREATE OR REPLACE TABLE \`accounts.weekly_metrics_cache\` AS
      SELECT 
        a.id as account_id,
        a.name as account_name,
        COALESCE(o.owner_name, 'Unassigned') as csm_owner,
        a.launched_at,
        100 as total_spend,
        50 as total_texts_delivered,
        10 as coupons_redeemed,
        200 as active_subs_cnt,
        80 as previous_week_spend,
        8 as previous_week_redemptions,
        CURRENT_TIMESTAMP() as cache_updated_at
      FROM \`accounts.accounts\` a
      LEFT JOIN \`dbt_models.owners\` o ON o.account_id = a.id
      WHERE a.launched_at IS NOT NULL
      ORDER BY a.name
      LIMIT 10
    `;
        await this.executeQuery(query);
      }
      async refreshMonthlyCache() {
        const query = `
      CREATE OR REPLACE TABLE \`accounts.monthly_metrics_cache\` AS
      SELECT 
        a.id as account_id,
        a.name as account_name,
        COALESCE(o.owner_name, 'Unassigned') as csm_owner,
        a.launched_at,
        500 as total_spend,
        250 as total_texts_delivered,
        50 as coupons_redeemed,
        800 as active_subs_cnt,
        400 as previous_month_spend,
        40 as previous_month_redemptions,
        CURRENT_TIMESTAMP() as cache_updated_at
      FROM \`accounts.accounts\` a
      LEFT JOIN \`dbt_models.owners\` o ON o.account_id = a.id
      WHERE a.launched_at IS NOT NULL
      ORDER BY a.name
      LIMIT 10
    `;
        await this.executeQuery(query);
      }
      async getLastCacheUpdate() {
        try {
          const query = `SELECT MAX(cache_updated_at) as last_update FROM \`accounts.weekly_metrics_cache\` LIMIT 1`;
          const [rows] = await this.client.query(query);
          return rows[0]?.last_update ? new Date(rows[0].last_update).getTime() : 0;
        } catch {
          return 0;
        }
      }
      async executeQuery(query) {
        const [job] = await this.client.createQueryJob({ query, location: "US" });
        const [rows] = await job.getQueryResults();
        return rows;
      }
    };
    ChurnGuardDataService = class {
      client;
      cacheManager;
      constructor() {
        let credentials = void 0;
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
          try {
            credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
          } catch (error) {
            console.error("Failed to parse BigQuery credentials:", error);
            throw new Error("Invalid BigQuery credentials format");
          }
        }
        this.client = new BigQuery({
          projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
          credentials
        });
        this.cacheManager = new ChurnGuardCacheManager(this.client);
      }
      async getAccounts(period, _timeframe) {
        await this.cacheManager.ensureFreshCache();
        const cacheTable = period === "weekly" ? "accounts.weekly_metrics_cache" : "accounts.monthly_metrics_cache";
        const previousSpendField = period === "weekly" ? "previous_week_spend" : "previous_month_spend";
        const previousRedemptionsField = period === "weekly" ? "previous_week_redemptions" : "previous_month_redemptions";
        const query = `
      SELECT 
        account_id,
        account_name,
        csm_owner,
        launched_at,
        total_spend,
        total_texts_delivered,
        coupons_redeemed,
        active_subs_cnt,
        ${previousSpendField},
        ${previousRedemptionsField},
        cache_updated_at
      FROM \`${cacheTable}\`
      ORDER BY account_name
      LIMIT 50
    `;
        const rows = await this.executeQuery(query);
        return rows.map((row) => this.transformAccountData(row, period));
      }
      async getAccountHistory(accountId) {
        const query = `
      SELECT 
        'Week 1' as week_start,
        100 as total_spend,
        50 as total_texts_delivered,
        5 as coupons_redeemed,
        25 as active_subs_cnt
      WHERE '${accountId}' IS NOT NULL
      LIMIT 12
    `;
        return await this.executeQuery(query);
      }
      async getRiskSummary() {
        const accounts = await this.getAccounts("monthly", "current");
        const totalAccounts = accounts.length;
        const highRiskCount = accounts.filter((a) => a.risk_level === "high").length;
        const mediumRiskCount = accounts.filter((a) => a.risk_level === "medium").length;
        const lowRiskCount = accounts.filter((a) => a.risk_level === "low").length;
        const totalRevenue = accounts.reduce((sum, a) => sum + a.total_spend, 0);
        const revenueAtRisk = accounts.filter((a) => a.risk_level === "high").reduce((sum, a) => sum + a.total_spend, 0);
        return {
          totalAccounts,
          highRiskCount,
          mediumRiskCount,
          lowRiskCount,
          totalRevenue,
          revenueAtRisk
        };
      }
      async executeQuery(query, params = {}) {
        try {
          const [job] = await this.client.createQueryJob({
            query,
            location: "US",
            params
          });
          const [rows] = await job.getQueryResults();
          return rows;
        } catch (error) {
          console.error("BigQuery error:", error);
          throw new Error(`BigQuery execution failed: ${error.message}`);
        }
      }
      transformAccountData(row, period) {
        const previousSpend = period === "weekly" ? row.previous_week_spend : row.previous_month_spend;
        const previousRedemptions = period === "weekly" ? row.previous_week_redemptions : row.previous_month_redemptions;
        const spend_delta = row.total_spend - (previousSpend || 0);
        const coupons_delta = row.coupons_redeemed - (previousRedemptions || 0);
        const riskScore = this.calculateRiskScore(row, spend_delta, coupons_delta);
        const riskLevel = this.getRiskLevel(riskScore);
        return {
          account_id: row.account_id,
          account_name: row.account_name,
          csm_owner: row.csm_owner,
          total_spend: row.total_spend,
          total_texts_delivered: row.total_texts_delivered,
          coupons_redeemed: row.coupons_redeemed,
          active_subs_cnt: row.active_subs_cnt,
          spend_delta,
          texts_delta: 0,
          coupons_delta,
          subs_delta: 0,
          risk_level: riskLevel,
          risk_score: riskScore,
          launched_at: row.launched_at
        };
      }
      calculateRiskScore(account, spend_delta, coupons_delta) {
        let score = 0;
        if (account.coupons_redeemed <= 3) score++;
        if (account.active_subs_cnt < 300 && account.coupons_redeemed < 35) score++;
        if (spend_delta < -100) score++;
        if (coupons_delta < -5) score++;
        return score;
      }
      getRiskLevel(score) {
        if (score >= 3) return "high";
        if (score >= 1) return "medium";
        return "low";
      }
    };
    churnGuardDataService = new ChurnGuardDataService();
  }
});

// server/index.ts
import express from "express";

// server/api-routes.ts
init_churnguard_data_service();
import { Router } from "express";
var apiRouter = Router();
apiRouter.get("/accounts", async (req, res) => {
  try {
    const period = req.query.period || "weekly";
    const timeframe = req.query.timeframe || "current";
    const accounts = await churnGuardDataService.getAccounts(period, timeframe);
    res.json(accounts);
  } catch (error) {
    console.error("Error fetching accounts:", error);
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});
apiRouter.get("/accounts/:id/history", async (req, res) => {
  try {
    const { id } = req.params;
    const history = await churnGuardDataService.getAccountHistory(id);
    res.json(history);
  } catch (error) {
    console.error("Error fetching account history:", error);
    res.status(500).json({ error: "Failed to fetch account history" });
  }
});
apiRouter.get("/ri", async (_req, res) => {
  try {
    const summary = await churnGuardDataService.getRiskSummary();
    res.json(summary);
  } catch (error) {
    console.error("Error fetching risk summary:", error);
    res.status(500).json({ error: "Failed to fetch risk summary" });
  }
});
apiRouter.get("/debug/cache-tables", async (_req, res) => {
  try {
    const { churnGuardDataService: churnGuardDataService2 } = await Promise.resolve().then(() => (init_churnguard_data_service(), churnguard_data_service_exports));
    const query = `
      SELECT table_catalog, table_schema, table_name 
      FROM \`data-warehouse-432614.INFORMATION_SCHEMA.TABLES\`
      WHERE table_name LIKE '%cache%'
    `;
    const [job] = await churnGuardDataService2["client"].createQueryJob({
      query,
      location: "US"
    });
    const [rows] = await job.getQueryResults();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// server/index.ts
import { fileURLToPath } from "url";
import { dirname, join } from "path";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var app = express();
var PORT = 5001;
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
app.use("/api", apiRouter);
app.use(express.static(join(__dirname, "../client/dist")));
app.get("/health", (_req, res) => {
  console.log("Health check called");
  res.json({ status: "ok", service: "ChurnGuard 3.0" });
});
app.get("*", (_req, res) => {
  res.sendFile(join(__dirname, "../client/dist/index.html"));
});
app.listen(PORT, () => {
  console.log(`\u{1F680} ChurnGuard 3.0 server running on port ${PORT}`);
  console.log(`\u{1F4CA} Clean architecture with single data service`);
});
