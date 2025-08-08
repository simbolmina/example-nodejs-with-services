import { Request, Response } from 'express';
import analyticsService from '../services/AnalyticsService.js';

export const getSummary = async (_req: Request, res: Response) => {
  try {
    const summary = await analyticsService.getSummary();
    return res.json(summary);
  } catch (error) {
    console.error('❌ Error fetching analytics summary:', error);
    return res.status(500).json({ error: 'Failed to fetch analytics summary' });
  }
};

export const getRecent = async (req: Request, res: Response) => {
  try {
    const limit = Math.min(Number(req.query.limit || 100), 1000);
    const events = await analyticsService.getRecentEvents(limit);
    return res.json({ events, limit });
  } catch (error) {
    console.error('❌ Error fetching recent events:', error);
    return res.status(500).json({ error: 'Failed to fetch recent events' });
  }
};

export const getDashboard = async (_req: Request, res: Response) => {
  try {
    const summary = await analyticsService.getSummary();
    const events = await analyticsService.getRecentEvents(100);
    const html = renderDashboard(summary, events);
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  } catch (error) {
    console.error('❌ Error rendering analytics dashboard:', error);
    return res
      .status(500)
      .send('<h1>Failed to render analytics dashboard</h1>');
  }
};

function renderDashboard(summary: any, events: any[]) {
  const escape = (s: string) =>
    String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const topQueriesRows = summary.topQueries
    .map((q: any) => `<tr><td>${escape(q.query)}</td><td>${q.count}</td></tr>`)
    .join('');

  const productEventsRows = Object.entries(summary.productEventCounts)
    .map(
      ([type, count]: any) =>
        `<tr><td>${escape(type)}</td><td>${count}</td></tr>`
    )
    .join('');

  const productViewsRows = summary.productViewsTop
    .map(
      (p: any) => `<tr><td>${escape(p.productId)}</td><td>${p.views}</td></tr>`
    )
    .join('');

  const systemRows = Object.entries(summary.systemEventCounts)
    .map(
      ([type, count]: any) =>
        `<tr><td>${escape(type)}</td><td>${count}</td></tr>`
    )
    .join('');

  const perfRows = Object.entries(summary.performanceCounts)
    .map(
      ([metric, count]: any) =>
        `<tr><td>${escape(metric)}</td><td>${count}</td></tr>`
    )
    .join('');

  const recentRows = events
    .map(
      (e: any) =>
        `<tr><td>${escape(e.timestamp)}</td><td>${escape(e.topic)}</td><td>${escape(e.type)}</td><td><pre>${escape(
          JSON.stringify(e.data, null, 2)
        )}</pre></td></tr>`
    )
    .join('');

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Analytics Dashboard</title>
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,sans-serif;margin:20px;color:#111}
    h1,h2{margin:0 0 12px}
    .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
    table{width:100%;border-collapse:collapse;font-size:14px}
    th,td{border:1px solid #e5e7eb;padding:6px 8px;vertical-align:top}
    th{background:#f3f4f6;text-align:left}
    pre{white-space:pre-wrap;word-wrap:break-word;margin:0}
    .muted{color:#6b7280}
    .section{margin-bottom:20px}
  </style>
  <script>
    setInterval(()=>{ if (location.hash === '#live') location.reload(); }, 3000);
  </script>
  </head>
<body>
  <h1>Analytics Dashboard <span class="muted">(append #live to auto-refresh)</span></h1>
  <div class="section">
    <strong>Total searches:</strong> ${summary.searchTotal}
  </div>
  <div class="grid">
    <div>
      <h2>Top Queries</h2>
      <table><thead><tr><th>Query</th><th>Count</th></tr></thead><tbody>${topQueriesRows}</tbody></table>
    </div>
    <div>
      <h2>Product Events</h2>
      <table><thead><tr><th>Type</th><th>Count</th></tr></thead><tbody>${productEventsRows}</tbody></table>
    </div>
    <div>
      <h2>Top Product Views</h2>
      <table><thead><tr><th>Product ID</th><th>Views</th></tr></thead><tbody>${productViewsRows}</tbody></table>
    </div>
    <div>
      <h2>System Events</h2>
      <table><thead><tr><th>Type</th><th>Count</th></tr></thead><tbody>${systemRows}</tbody></table>
    </div>
    <div>
      <h2>Performance Metrics</h2>
      <table><thead><tr><th>Metric</th><th>Count</th></tr></thead><tbody>${perfRows}</tbody></table>
    </div>
  </div>
  <div class="section">
    <h2>Recent Events</h2>
    <table><thead><tr><th>Time</th><th>Topic</th><th>Type</th><th>Data</th></tr></thead><tbody>${recentRows}</tbody></table>
  </div>
</body>
</html>`;
}

export default { getSummary, getRecent, getDashboard };
