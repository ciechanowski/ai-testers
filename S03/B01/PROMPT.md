# S03B01: prompty AI

## AI Prompty

### Prompt 1 – Threshold per component
```
I have 5 components in a React app:
1. Hero banner (gradient + text)
2. Navbar (static UI)
3. Login form (inputs + button)
4. Data table (mock data, 10 rows)
5. Footer (links + copyright with year)

For each, propose:
- threshold (0–1)
- maxDiffPixels or maxDiffPixelRatio (prefer maxDiffPixels when possible)
- mask (if needed)

Justify each choice (gradient → higher threshold, static → lower / maxDiffPixels).
```

### Prompt 2 – False positive analysis
```
These 3 tests are often red (>30% of runs):
1. gallery-grid.png – diff 0.15% pixels
2. hero-section.png – diff 0.08% pixels
3. footer.png – diff 0.21% pixels

For each, decide:
- Is it an app bug?
- Is the threshold too low?
- Is a mask missing on some element?
Recommend: raise threshold / add mask / fix application.
```
