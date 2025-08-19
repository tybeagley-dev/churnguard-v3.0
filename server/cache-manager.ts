import { BigQuery } from '@google-cloud/bigquery';

export class ChurnGuardCacheManager {
  private client: BigQuery;

  constructor() {
    this.client = new BigQuery({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS
        ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)
        : undefined,
    });
  }

  async ensureFreshCache(): Promise<void> {
    const lastUpdate = await this.getLastCacheUpdate();
    const hoursOld = (Date.now() - lastUpdate) / (1000 * 60 * 60);

    if (hoursOld > 18) { // Refresh if older than 18 hours
      console.log('🔄 Cache refresh triggered - rebuilding weekly and monthly caches');
      await Promise.all([
        this.refreshWeeklyCache(),
        this.refreshMonthlyCache()
      ]);
      await this.updateCacheTimestamp();
      console.log('✅ Cache refresh complete');
    } else {
      console.log(`📊 Cache fresh (${Math.round(hoursOld)} hours old)`);
    }
  }

  private async refreshWeeklyCache(): Promise<void> {
    const query = `
      CREATE OR REPLACE TABLE weekly_metrics_cache AS
      -- Your existing working weekly query from ChurnGuard 2.0
      SELECT 
        a.id as account_id,
        a.name as account_name,
        COALESCE(o.owner_name, 'Unassigned') as csm_owner,
        a.launched_at,
        COALESCE(spend_current.total_spend, 0) as total_spend,
        COALESCE(spend_prev.total_spend, 0) as previous_week_spend,
        COALESCE(text_current.total_texts_delivered, 0) as total_texts_delivered,
        COALESCE(sub_current.active_subs_cnt, 0) as active_subs_cnt,
        COALESCE(coupon_current.coupons_redeemed, 0) as coupons_redeemed,
        COALESCE(coupon_prev.coupons_redeemed, 0) as previous_week_redemptions,
        CURRENT_TIMESTAMP() as cache_updated_at
      FROM accounts.accounts a
      LEFT JOIN dbt_models.owners o ON o.account_id = a.id
      -- Add your working joins here from bigquery-basic.ts
      WHERE a.launched_at IS NOT NULL
      ORDER BY a.name
    `;

    await this.executeQuery(query);
  }

  private async refreshMonthlyCache(): Promise<void> {
    const query = `
      CREATE OR REPLACE TABLE monthly_metrics_cache AS
      -- Your existing working monthly query
      SELECT 
        a.id as account_id,
        a.name as account_name,
        COALESCE(o.owner_name, 'Unassigned') as csm_owner,
        a.launched_at,
        -- Monthly aggregations here
        CURRENT_TIMESTAMP() as cache_updated_at
      FROM accounts.accounts a
      LEFT JOIN dbt_models.owners o ON o.account_id = a.id
      WHERE a.launched_at IS NOT NULL
      ORDER BY a.name
    `;

    await this.executeQuery(query);
  }

  private async getLastCacheUpdate(): Promise<number> {
    try {
      const query = `SELECT MAX(cache_updated_at) as last_update FROM weekly_metrics_cache`;
      const [rows] = await this.client.query(query);
      return rows[0]?.last_update ? new Date(rows[0].last_update).getTime() : 0;
    } catch {
      return 0; // No cache exists yet
    }
  }

  private async updateCacheTimestamp(): Promise<void> {
    // Update both cache tables with fresh timestamp
    await this.executeQuery(`
      UPDATE weekly_metrics_cache 
      SET cache_updated_at = CURRENT_TIMESTAMP() 
      WHERE TRUE
    `);
    await this.executeQuery(`
      UPDATE monthly_metrics_cache 
      SET cache_updated_at = CURRENT_TIMESTAMP() 
      WHERE TRUE
    `);
  }

  private async executeQuery(query: string): Promise<any[]> {
    const [job] = await this.client.createQueryJob({ query, location: 'US' });
    const [rows] = await job.getQueryResults();
    return rows;
  }
}