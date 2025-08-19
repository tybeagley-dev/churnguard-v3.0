  import { Router } from 'express';
  import { churnGuardDataService } from './churnguard-data-service';

  export const apiRouter = Router();

  // Single endpoint for all account data
  apiRouter.get('/accounts', async (req, res) => {
    try {
      const period = req.query.period as 'weekly' | 'monthly' || 'weekly';
      const timeframe = req.query.timeframe as string || 'current';

      const accounts = await churnGuardDataService.getAccounts(period, timeframe);
      res.json(accounts);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      res.status(500).json({ error: 'Failed to fetch accounts' });
    }
  });

  // Account history endpoint
  apiRouter.get('/accounts/:id/history', async (req, res) => {
    try {
      const { id } = req.params;
      const history = await churnGuardDataService.getAccountHistory(id);
      res.json(history);
    } catch (error) {
      console.error('Error fetching account history:', error);
      res.status(500).json({ error: 'Failed to fetch account history' });
    }
  });

  // Risk summary endpoint
  apiRouter.get('/risk-summary', async (_req, res) => {
    try {
      const summary = await churnGuardDataService.getRiskSummary();
      res.json(summary);
    } catch (error) {
      console.error('Error fetching risk summary:', error);
      res.status(500).json({ error: 'Failed to fetch risk summary' });
    }
  });

  // Analytics endpoint for professional dashboard components
  apiRouter.get('/analytics/dashboard', async (_req, res) => {
    try {
      const riskSummary = await churnGuardDataService.getRiskSummary();

      const analytics = {
        ...riskSummary,
        weeklyTrends: []
      };

      res.json(analytics);
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
    }
  });
