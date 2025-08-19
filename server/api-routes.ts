import { Router } from 'express';
import { bigQueryDataService } from './services/bigquery-data';

export const apiRouter = Router();

// Get account data for dashboard table
apiRouter.get('/accounts', async (req, res) => {
  try {
    console.log('Fetching account data from BigQuery...');
    const accounts = await bigQueryDataService.getAccountData();
    res.json(accounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// Get 12-week account history for modal (matching 2.0 endpoint structure)
apiRouter.get('/bigquery/account-history/:accountId', async (req, res) => {
  try {
    const { accountId } = req.params;
    console.log(`Fetching 12-week history for account: ${accountId}`);
    const history = await bigQueryDataService.getAccountHistory(accountId);
    res.json(history);
  } catch (error) {
    console.error('Error fetching account history:', error);
    res.status(500).json({ error: 'Failed to fetch account history' });
  }
});

// Get historical performance data for dashboard charts
apiRouter.get('/historical-performance', async (_req, res) => {
  try {
    console.log('Fetching historical performance data...');
    const data = await bigQueryDataService.getHistoricalPerformance();
    res.json(data);
  } catch (error) {
    console.error('Error fetching historical performance:', error);
    res.status(500).json({ error: 'Failed to fetch historical performance data' });
  }
});

// Get monthly trends for risk level bar chart
apiRouter.get('/monthly-trends', async (_req, res) => {
  try {
    console.log('Fetching monthly trends data...');
    const data = await bigQueryDataService.getMonthlyTrends();
    res.json(data);
  } catch (error) {
    console.error('Error fetching monthly trends:', error);
    res.status(500).json({ error: 'Failed to fetch monthly trends data' });
  }
});

// Test BigQuery connection
apiRouter.get('/test-connection', async (_req, res) => {
  try {
    console.log('Testing BigQuery connection...');
    const result = await bigQueryDataService.testConnection();
    res.json(result);
  } catch (error) {
    console.error('Error testing connection:', error);
    res.status(500).json({ error: 'Failed to test connection' });
  }
});
