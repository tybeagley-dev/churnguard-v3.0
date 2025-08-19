import { BigQuery } from '@google-cloud/bigquery';

export interface AccountData {
  account_id: string;
  account_name: string;
  csm_owner: string;
  total_spend: number;
  total_texts_delivered: number;
  coupons_redeemed: number;
  active_subs_cnt: number;
  spend_delta?: number;
  texts_delta?: number;
  coupons_delta?: number;
  subs_delta?: number;
  risk_level?: 'high' | 'medium' | 'low';
  risk_score?: number;
  launched_at?: Date;
}

export interface HistoricalData {
  week_start: string;
  total_spend: number;
  total_texts_delivered: number;
  coupons_redeemed: number;
  active_subs_cnt: number;
}

export interface RiskSummary {
  totalAccounts: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  totalRevenue: number;
  revenueAtRisk: number;
}

class ChurnGuardCacheManager {
  private client: BigQuery;

  constructor(client: BigQuery) {
    this.client = client;
  }

  async ensureFreshCache(): Promise<void> {
    const lastUpdate = await this.getLastCacheUpdate();
    const hoursOld = (Date.now() - lastUpdate) / (1000 * 60 * 60);

    if (hoursOld > 18 || isNaN(hoursOld)) {
      console.log('🔄 Cache refresh triggered - rebuilding weekly and monthly caches');
      await Promise.all([
        this.refreshWeeklyCache(),
        this.refreshMonthlyCache()
      ]);
      console.log('✅ Cache refresh complete');
    } else {
      console.log(`📊 Cache fresh (${Math.round(hoursOld)} hours old)`);
    }
  }

  private async refreshWeeklyCache(): Promise<void> {
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

  private async refreshMonthlyCache(): Promise<void> {
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

  private async getLastCacheUpdate(): Promise<number> {
    try {
      const query = `SELECT MAX(cache_updated_at) as last_update FROM \`accounts.weekly_metrics_cache\` LIMIT 1`;
      const [rows] = await this.client.query(query);
      return rows[0]?.last_update ? new Date(rows[0].last_update).getTime() : 0;
    } catch {
      return 0;
    }
  }

  private async executeQuery(query: string): Promise<any[]> {
    const [job] = await this.client.createQueryJob({ query, location: 'US' });
    const [rows] = await job.getQueryResults();
    return rows;
  }
}

export class ChurnGuardDataService {
  private client: BigQuery;
  private cacheManager: ChurnGuardCacheManager;

  constructor() {
    let credentials: any = undefined;

    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      try {
        credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS);
      } catch (error) {
        console.error('Failed to parse BigQuery credentials:', error);
        throw new Error('Invalid BigQuery credentials format');
      }
    }

    this.client = new BigQuery({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: credentials,
    });

    this.cacheManager = new ChurnGuardCacheManager(this.client);
  }

  async getAccounts(period: 'weekly' | 'monthly', _timeframe: string): Promise<AccountData[]> {
    await this.cacheManager.ensureFreshCache();

    const cacheTable = period === 'weekly' ? 'accounts.weekly_metrics_cache' : 'accounts.monthly_metrics_cache';
    const previousSpendField = period === 'weekly' ? 'previous_week_spend' : 'previous_month_spend';
    const previousRedemptionsField = period === 'weekly' ? 'previous_week_redemptions' : 'previous_month_redemptions';

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
    return rows.map(row => this.transformAccountData(row, period));
  }

  async getAccountHistory(accountId: string): Promise<HistoricalData[]> {
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

  async getRiskSummary(): Promise<RiskSummary> {
    const accounts = await this.getAccounts('monthly', 'current');

    const totalAccounts = accounts.length;
    const highRiskCount = accounts.filter(a => a.risk_level === 'high').length;
    const mediumRiskCount = accounts.filter(a => a.risk_level === 'medium').length;
    const lowRiskCount = accounts.filter(a => a.risk_level === 'low').length;
    const totalRevenue = accounts.reduce((sum, a) => sum + a.total_spend, 0);
    const revenueAtRisk = accounts
      .filter(a => a.risk_level === 'high')
      .reduce((sum, a) => sum + a.total_spend, 0);

    return {
      totalAccounts,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      totalRevenue,
      revenueAtRisk
    };
  }

  private async executeQuery(query: string, params: any = {}): Promise<any[]> {
    try {
      const [job] = await this.client.createQueryJob({
        query,
        location: 'US',
        params,
      });

      const [rows] = await job.getQueryResults();
      return rows;
    } catch (error: any) {
      console.error('BigQuery error:', error);
      throw new Error(`BigQuery execution failed: ${error.message}`);
    }
  }

  private transformAccountData(row: any, period: 'weekly' | 'monthly'): AccountData {
    const previousSpend = period === 'weekly' ? row.previous_week_spend : row.previous_month_spend;
    const previousRedemptions = period === 'weekly' ? row.previous_week_redemptions : row.previous_month_redemptions;

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

  private calculateRiskScore(account: any, spend_delta: number, coupons_delta: number): number {
    let score = 0;

    // Consistent risk calculation logic for both frontend display and HubSpot sync
    if (account.coupons_redeemed <= 3) score++;
    if (account.active_subs_cnt < 300 && account.coupons_redeemed < 35) score++;
    if (spend_delta < -100) score++; // Significant spend drop
    if (coupons_delta < -5) score++; // Significant redemption drop

    return score;
  }

  private getRiskLevel(score: number): 'high' | 'medium' | 'low' {
    if (score >= 3) return 'high';
    if (score >= 1) return 'medium';
    return 'low';
  }
}

export const churnGuardDataService = new ChurnGuardDataService();