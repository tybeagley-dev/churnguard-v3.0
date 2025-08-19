import { BigQuery } from '@google-cloud/bigquery';

export class BigQueryDataService {
  private client: BigQuery;

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
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'data-warehouse-432614',
      credentials: credentials,
    });
  }

  async executeQuery(query: string): Promise<any[]> {
    try {
      console.log('Executing BigQuery query...');
      const [job] = await this.client.createQueryJob({
        query,
        location: 'US',
        jobTimeoutMs: 30000,
      });
      
      const [rows] = await job.getQueryResults();
      console.log(`Query completed successfully, returned ${rows.length} rows`);
      return rows;
    } catch (error) {
      console.error('BigQuery error:', error);
      throw new Error(`BigQuery execution failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // Get account data for dashboard table
  async getAccountData(): Promise<any[]> {
    const query = `
      WITH account_metrics AS (
        SELECT 
          a.id as account_id,
          a.name as account_name,
          a.status,
          COALESCE(u.name, 'Unassigned') as csm_owner,
          h.id as hubspot_id,
          
          -- Current week metrics
          COALESCE(w.total_spend, 0) as total_spend,
          COALESCE(w.total_texts_delivered, 0) as total_texts_delivered,
          COALESCE(w.coupons_redeemed, 0) as coupons_redeemed,
          COALESCE(w.active_subs_cnt, 0) as active_subs_cnt,
          
          -- Risk indicators
          CASE 
            WHEN w.total_spend < 100 AND w.coupons_redeemed < 5 THEN 'high'
            WHEN w.total_spend < 200 OR w.coupons_redeemed < 10 THEN 'medium'
            ELSE 'low'
          END as risk_level,
          
          -- Mock delta values for now
          ROUND(RAND() * 100 - 50) as spend_delta,
          ROUND(RAND() * 20 - 10) as texts_delta,
          ROUND(RAND() * 10 - 5) as redemptions_delta
          
        FROM accounts.accounts a
        LEFT JOIN accounts.users u ON u.id = a.csm_user_id
        LEFT JOIN dbt_models.hubspot_companies h ON h.company_id = a.id
        LEFT JOIN (
          -- Get current week aggregated data
          SELECT 
            account_id,
            SUM(spend_adj) as total_spend,
            SUM(total_texts_delivered) as total_texts_delivered,
            SUM(coupons_redeemed) as coupons_redeemed,
            MAX(active_subs_cnt) as active_subs_cnt
          FROM dbt_models.account_weekly_rollup 
          WHERE week_start_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
          GROUP BY account_id
        ) w ON w.account_id = a.id
        
        WHERE a.launched_at IS NOT NULL
          AND a.status IN ('LAUNCHED', 'PAUSED')
        ORDER BY a.name
        LIMIT 100
      )
      SELECT * FROM account_metrics
    `;
    
    return this.executeQuery(query);
  }

  // Get 12-week historical data for account modal
  async getAccountHistory(accountId: string): Promise<any[]> {
    const query = `
      SELECT 
        CONCAT(EXTRACT(YEAR FROM week_start_date), 'W', FORMAT('%02d', EXTRACT(WEEK FROM week_start_date))) as week_yr,
        FORMAT_DATE('%Y-%m-%d', week_start_date) as week_label,
        COALESCE(spend_adj, 0) as total_spend,
        COALESCE(total_texts_delivered, 0) as total_texts_delivered,
        COALESCE(coupons_redeemed, 0) as coupons_redeemed,
        COALESCE(active_subs_cnt, 0) as active_subs_cnt
      FROM dbt_models.account_weekly_rollup
      WHERE account_id = @accountId
        AND week_start_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 * 7 DAY)
      ORDER BY week_start_date DESC
      LIMIT 12
    `;
    
    const options = {
      query,
      location: 'US',
      params: { accountId },
    };
    
    const [job] = await this.client.createQueryJob(options);
    const [rows] = await job.getQueryResults();
    return rows;
  }

  // Get historical performance data for dashboard charts
  async getHistoricalPerformance(): Promise<any[]> {
    const query = `
      WITH monthly_data AS (
        SELECT 
          FORMAT_DATE('%Y-%m', DATE_TRUNC(week_start_date, MONTH)) as month,
          FORMAT_DATE('%B %Y', DATE_TRUNC(week_start_date, MONTH)) as monthLabel,
          SUM(spend_adj) as spendAdjusted,
          COUNT(DISTINCT account_id) as totalAccounts,
          SUM(coupons_redeemed) as totalRedemptions,
          SUM(active_subs_cnt) / COUNT(DISTINCT account_id) as totalSubscribers,
          SUM(total_texts_delivered) / 1000000 as totalTextsSent
        FROM dbt_models.account_weekly_rollup
        WHERE week_start_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 * 30 DAY)
        GROUP BY 1, 2
      )
      SELECT 
        month,
        monthLabel,
        ROUND(spendAdjusted / 1000000, 1) as spendAdjusted,
        totalAccounts,
        totalRedemptions,
        ROUND(totalSubscribers / 1000000, 2) as totalSubscribers,
        ROUND(totalTextsSent, 1) as totalTextsSent
      FROM monthly_data
      ORDER BY month
      LIMIT 12
    `;
    
    return this.executeQuery(query);
  }

  // Get monthly trends for risk level bar chart
  async getMonthlyTrends(): Promise<any[]> {
    const query = `
      WITH monthly_risk AS (
        SELECT 
          FORMAT_DATE('%B %Y', DATE_TRUNC(week_start_date, MONTH)) as month,
          account_id,
          AVG(spend_adj) as avg_spend,
          AVG(coupons_redeemed) as avg_redemptions,
          
          CASE 
            WHEN AVG(spend_adj) < 100 AND AVG(coupons_redeemed) < 5 THEN 'highRisk'
            WHEN AVG(spend_adj) < 200 OR AVG(coupons_redeemed) < 10 THEN 'mediumRisk'
            ELSE 'lowRisk'
          END as risk_category
          
        FROM dbt_models.account_weekly_rollup
        WHERE week_start_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 * 30 DAY)
        GROUP BY 1, 2
      )
      SELECT 
        month,
        SUM(CASE WHEN risk_category = 'highRisk' THEN 1 ELSE 0 END) as highRisk,
        SUM(CASE WHEN risk_category = 'mediumRisk' THEN 1 ELSE 0 END) as mediumRisk,
        SUM(CASE WHEN risk_category = 'lowRisk' THEN 1 ELSE 0 END) as lowRisk,
        COUNT(*) as total
      FROM monthly_risk
      GROUP BY month
      ORDER BY month
      LIMIT 6
    `;
    
    return this.executeQuery(query);
  }

  // Test connection
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const testQuery = `SELECT 'connection_test' as status, CURRENT_TIMESTAMP() as timestamp`;
      const result = await this.executeQuery(testQuery);
      return {
        success: true,
        message: `BigQuery connection successful. Test result: ${JSON.stringify(result[0])}`
      };
    } catch (error) {
      return {
        success: false,
        message: `BigQuery connection failed: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}

export const bigQueryDataService = new BigQueryDataService();