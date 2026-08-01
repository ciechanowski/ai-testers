# S04L01: prompty AI

## AI Prompty

### Prompt 1: Trend Analyzer for VRT Tracker
```
VRT builds + test runs from the last 30 days
(JSON from GET /builds and GET /test-runs):
[paste JSON]

Analyze:
- which tests have a trending-up failure rate (tool regression, not app regression)?
- which tests are chronically flaky (>10% failure regardless of PR)?
- any correlations (mobile failing more than desktop, dark mode more than light)?

Return JSON:
{
  trending_up: [{ test, baseline_rate, current_rate, likely_cause }],
  chronically_flaky: [{ test, rate, suggested_action: 'add_mask'|'tune_threshold'|'remove' }],
  patterns: [string],
  health_score: 0-100
}
```
