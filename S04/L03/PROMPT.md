# S04L03: prompty AI

## AI Prompty

### Prompt 1: podsumowanie builda do Pull Requesta

Kiedy użyć: po zakończonym buildzie, zanim recenzent otworzy dashboard. Chodzi o to, żeby
zaczynał od różnic podejrzanych, a nie od pierwszej z brzegu.

```
You are reviewing a Visual Regression Tracker build before it is merged.

INPUT (JSON from GET /builds and GET /test-runs, Bearer token from POST /users/login):
[paste JSON]

CONTEXT:
- Project main branch: <mainBranchName>
- This build ran on branch: <branchName>
- A test run carries: status, diffPercent, pixelMisMatchCount, baselineBranchName, comment

CLASSIFY every test run that is not `ok` into exactly one bucket:
- expected: the diff is explained by an intentional change described in the PR
- suspicious: the diff touches a screen the PR does not claim to change
- stale-baseline: baselineBranchName differs from branchName and the diff looks like
  a change already merged into the main branch
- broken: status is `failed`, so the comparison itself did not run

RULES:
- Do NOT recommend approving anything. Reviewing is a human decision.
- If the evidence is insufficient, put the run in `suspicious` and say what is missing.
- Quote diffPercent for every run you list.

OUTPUT: a markdown comment for the pull request, buckets as headings,
one line per test run, and a final line with counts per bucket.
```

**Dlaczego akurat tak:** zakaz rekomendowania approve jest w prompcie celowo. Model chętnie
kończy wnioskiem „wygląda dobrze, zatwierdź”, a to jest dokładnie ta decyzja, której nie
oddajemy narzędziu. Kubełek `stale-baseline` istnieje, bo różnica wynikająca ze świeższego
baseline'u gałęzi bazowej wygląda jak regres, a nim nie jest.

### Prompt 2: polityka zatwierdzania baseline'ów do `AGENTS.md`

Kiedy użyć: raz na projekt, przy wdrażaniu trackera w zespole. Wynik dopisujesz do pamięci
agenta z lekcji o `AGENTS.md`, żeby nie trzeba było tego tłumaczyć w każdej rozmowie.

```
Write the "Baseline approval" section of our AGENTS.md for a team using
Visual Regression Tracker alongside Playwright.

FACTS ABOUT THE TOOL (do not contradict these):
- A baseline belongs to a branch; the variation key includes branchName
- Approving on a feature branch creates a branch-local baseline
- The main-branch baseline changes only when approving with the merge flag
- Status `autoApproved` means a heuristic accepted the diff, not a person

RULES THE SECTION MUST STATE:
- Who may approve a diff, and who may approve with merge
- That the agent proposes a classification but never approves on the user's behalf
- That an intentional design change means a stale baseline, not a product bug
- That ignore areas drawn in the dashboard are reviewed like code, not silently added

CONSTRAINTS:
- Max 25 lines, imperative mood, no rationale paragraphs
- This is agent memory, not documentation

OUTPUT: the markdown section, ready to paste.
```

**Dlaczego akurat tak:** blok z faktami o narzędziu jest po to, żeby model nie dopisał reguł
z Percy albo z `toHaveScreenshot`, bo tam baseline działa inaczej. Limit linii pilnuje zasady
z lekcji o pamięci agenta: pamięć ma być krótka, długie uzasadnienia idą do dokumentu
referencyjnego.
