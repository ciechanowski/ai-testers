# S05B03: prompty AI

## AI Prompty

### Prompt 1, Flaky Test Analysis
```
Test `Hero pricing page` (file: tests/pricing.spec.ts):
- last 10 runs: 6 pass, 4 fail
- Failure pattern: different diffs each fail (not the same region), 3/4 fail on the second
  test in the batch (after `Footer test`)
- Run time: mean 8s, p95 14s

[paste diff PNG samples]

Is this flaky? Classify:
- noise (anti-aliasing / sub-pixel) -> tune threshold
- intermittent bug -> reproduce + investigate
- order dependency -> isolation issue with Footer test
- timing -> stabilization issue

Return JSON:
{
  flaky_type: 'noise'|'intermittent_bug'|'order_dependency'|'timing',
  evidence,
  recommended_action,
  confidence: 0-1
}
```
