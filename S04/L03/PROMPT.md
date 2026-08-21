# S04L03: prompty AI

## AI Prompty

Ciała promptów są po angielsku (konwencja kursu od Dnia 2), otoczka i omówienie po polsku.
Trzy prompty układają się w kolejność, w której używa ich praca domowa: pierwszy porządkuje
build, drugi pisze politykę, trzeci sprawdza, czy któryś z nich nie zaczął zatwierdzać za Ciebie.

### 1. Podsumowanie builda do Pull Requesta

Ten prompt zszedł z prezentacji, ale został w repozytorium i wraca w pracy domowej.
Zamienia skończony build w komentarz, który recenzent czyta przed otwarciem panelu, dzięki czemu
zaczyna od różnic podejrzanych, a nie od tej, która akurat jest pierwsza na liście. Cztery kubełki
są tu istotą rzeczy, a `stale-baseline` najbardziej: różnica z powodu świeższego baseline'u
na gałęzi głównej wygląda jak regres i regresem nie jest.

```
Task: Build Summary for a Pull Request (S04 L03)
Turn a finished Visual Regression Tracker build into a comment a reviewer reads before opening
the dashboard, so they start with the suspicious diffs instead of whichever one happens to be first
in the list.

Paste the JSON from GET /builds and GET /test-runs (Bearer token from POST /users/login), plus
the project's mainBranchName, the branch this build ran on, and what the pull request claims to
change. Every test run carries status, diffPercent, pixelMisMatchCount, baselineBranchName
and comment.

Classify every test run that is not ok into exactly one bucket:

| Bucket | Meaning |
|---|---|
| expected | the diff is explained by an intentional change described in the pull request |
| suspicious | the diff touches a screen the pull request does not claim to change |
| stale-baseline | baselineBranchName differs from branchName and the diff looks like a change already merged into the main branch |
| broken | status is failed, so the comparison itself never ran |

Non-negotiable rules
- Never recommend approving anything. Not "this looks fine", not "safe to approve". Deciding that
  a new image becomes the baseline is the reviewer's job, and it is the whole point of the lesson.
- Insufficient evidence means suspicious, plus a line saying what is missing. Never expected.
- Quote diffPercent for every run you list. A bucket without numbers is an opinion.
- stale-baseline is not a regression. A diff caused by a fresher baseline on the main branch
  looks exactly like a regression and is not one, which is why it gets its own bucket.

Return a markdown comment for the pull request: buckets as headings, one line per test run, and a
final line with the count per bucket.
```

### 2. Polityka zatwierdzania baseline'ów do `AGENTS.md`

Uruchamiasz raz na projekt, przy wdrażaniu trackera w zespole. Wynik dopisujesz do pamięci agenta
zbudowanej w lekcji drugiej, żeby nie tłumaczyć tych zasad w każdej kolejnej rozmowie.

```
Task: Baseline Approval Policy (S04 L03)
Write the "Baseline approval" section of your team's AGENTS.md: who may approve a visual diff,
when, and what nobody is allowed to do. Once a team shares one tracker, "is this image correct?" gets
several answers at once depending on who is asking and from which branch, and this section is what
settles that.

Paste your team's current review process if you have one.

Facts about the tool. Do not contradict these:
- A baseline belongs to a branch. The variation key is name, browser, device, OS, viewport,
  custom tags and branchName, so the same assertion can hold a different baseline on every branch.
- Approving on a feature branch does not overwrite what the rest of the team sees. It creates a
  variation for that branch. The base branch changes only on approval with the merge flag.
- Precedence: your branch's baseline holds until the base branch's baseline is newer, at which point
  the base one wins. Without that rule an open branch would freeze its own version of the truth.
- autoApproved is the tool deciding, approved is a person deciding. They are different statuses
  and the section must treat them differently.

Non-negotiable rules
- Name the moment that needs care. Approving on a branch is cheap and reversible; approving with
  merge moves the reference point for everyone. The policy must say who does the second one.
- No rule the tracker cannot enforce or a reviewer cannot check. "Approve carefully" is not a
  policy.
- Say what happens on disagreement. A policy with no escalation path is a suggestion.
- Around 25 lines. This lands in agent memory, which is loaded on every request.

Return the section as a single Markdown code block, ready to paste under a ## Baseline approval
heading.
```

**Dlaczego akurat tak:** blok z faktami o narzędziu jest po to, żeby model nie dopisał reguł zapożyczonych z Percy albo z `toHaveScreenshot`, bo tam baseline działa inaczej i model chętnie miesza te światy. Limit dwudziestu pięciu linii pilnuje zasady z lekcji drugiej: pamięć agenta ma być krótka, a długie uzasadnienia idą do dokumentu referencyjnego.

### 3. Review dyscypliny zatwierdzania

Puszczasz na tym, co wyprodukowały dwa poprzednie prompty. Model proszony o streszczenie różnicy
dryfuje w stronę wniosku, a wniosek, po który sięga najchętniej, brzmi „wygląda dobrze, można
zatwierdzić". To jedyna decyzja, której zespół nie deleguje, a przychodzi ubrana w uprzejmość.
Dlatego każdy wpis w `approval_recommended` psuje werdykt niezależnie od tego, jak dobrze
udokumentowana jest reszta.

```
Task: Approval Discipline Review (S04 L03)
You are auditing something written about baseline approval: either a build summary headed for a
pull request, or a policy section headed for AGENTS.md. Paste it, together with the tracker JSON or
the process it describes.

One failure mode matters more than the rest. A model asked to summarise a visual diff drifts toward
a conclusion, and the conclusion it reaches for is "this looks fine, approve it". That is precisely
the decision a team does not delegate, and it arrives dressed as helpfulness rather than as a claim.

Check four things.

Approval creep. Any sentence nudging toward approving: "looks safe", "no visual impact", "can be
merged", "nothing to worry about". Quote each one. A summary may describe and classify; it may not
conclude.

Evidence. Every listed test run needs its diffPercent. Anything classed expected needs a
matching claim in the pull request description. Missing evidence should have produced suspicious.

Branch semantics. Approving on a branch and approving with merge are different acts with
different blast radius. Flag any text that blurs them, and any that treats autoApproved as if a
person had looked at it.

Stale baselines. A diff caused by a fresher baseline on the base branch is not a regression.
Flag it if it was filed as one, or if the bucket is missing entirely.

Return only this JSON:

{
  "approval_recommended": [
    { "quote": "<the sentence that recommends approving>", "rewrite": "<neutral description instead>" }
  ],
  "missing_evidence": [
    { "test": "<name>", "missing": "diffPercent" }
  ],
  "branch_semantics_errors": ["<quote conflating branch approval with merge approval>"],
  "stale_baseline_misfiled": ["<test filed as a regression that the precedence rule explains>"],
  "verdict": "usable"
}

- verdict is usable, usable_with_edits or rejected.
- Any entry in approval_recommended forces at least usable_with_edits, no matter how well
  evidenced the rest is.
```

### 3. Review dyscypliny zatwierdzania

Puszczasz na tym, co wyprodukowały dwa poprzednie prompty. Model proszony o streszczenie różnicy
dryfuje w stronę wniosku, a wniosek, po który sięga najchętniej, brzmi „wygląda dobrze, można
zatwierdzić". To jedyna decyzja, której zespół nie deleguje, a przychodzi ubrana w uprzejmość.
Dlatego każdy wpis w `approval_recommended` psuje werdykt niezależnie od tego, jak dobrze
udokumentowana jest reszta.

```
Task: Approval Discipline Review (S04 L03)
You are auditing something written about baseline approval: either a build summary headed for a
pull request, or a policy section headed for AGENTS.md. Paste it, together with the tracker JSON or
the process it describes.

One failure mode matters more than the rest. A model asked to summarise a visual diff drifts toward
a conclusion, and the conclusion it reaches for is "this looks fine, approve it". That is precisely
the decision a team does not delegate, and it arrives dressed as helpfulness rather than as a claim.

Check four things.

Approval creep. Any sentence nudging toward approving: "looks safe", "no visual impact", "can be
merged", "nothing to worry about". Quote each one. A summary may describe and classify; it may not
conclude.

Evidence. Every listed test run needs its diffPercent. Anything classed expected needs a
matching claim in the pull request description. Missing evidence should have produced suspicious.

Branch semantics. Approving on a branch and approving with merge are different acts with
different blast radius. Flag any text that blurs them, and any that treats autoApproved as if a
person had looked at it.

Stale baselines. A diff caused by a fresher baseline on the base branch is not a regression.
Flag it if it was filed as one, or if the bucket is missing entirely.

Return only this JSON:

{
  "approval_recommended": [
    { "quote": "<the sentence that recommends approving>", "rewrite": "<neutral description instead>" }
  ],
  "missing_evidence": [
    { "test": "<name>", "missing": "diffPercent" }
  ],
  "branch_semantics_errors": ["<quote conflating branch approval with merge approval>"],
  "stale_baseline_misfiled": ["<test filed as a regression that the precedence rule explains>"],
  "verdict": "usable"
}

- verdict is usable, usable_with_edits or rejected.
- Any entry in approval_recommended forces at least usable_with_edits, no matter how well
  evidenced the rest is.
```

### 3. Review dyscypliny zatwierdzania

Puszczasz na tym, co wyprodukowały dwa poprzednie prompty. Model proszony o streszczenie różnicy
dryfuje w stronę wniosku, a wniosek, po który sięga najchętniej, brzmi „wygląda dobrze, można
zatwierdzić". To jedyna decyzja, której zespół nie deleguje, a przychodzi ubrana w uprzejmość.
Dlatego każdy wpis w `approval_recommended` psuje werdykt niezależnie od tego, jak dobrze
udokumentowana jest reszta.

```
Task: Approval Discipline Review (S04 L03)
You are auditing something written about baseline approval: either a build summary headed for a
pull request, or a policy section headed for AGENTS.md. Paste it, together with the tracker JSON or
the process it describes.

One failure mode matters more than the rest. A model asked to summarise a visual diff drifts toward
a conclusion, and the conclusion it reaches for is "this looks fine, approve it". That is precisely
the decision a team does not delegate, and it arrives dressed as helpfulness rather than as a claim.

Check four things.

Approval creep. Any sentence nudging toward approving: "looks safe", "no visual impact", "can be
merged", "nothing to worry about". Quote each one. A summary may describe and classify; it may not
conclude.

Evidence. Every listed test run needs its diffPercent. Anything classed expected needs a
matching claim in the pull request description. Missing evidence should have produced suspicious.

Branch semantics. Approving on a branch and approving with merge are different acts with
different blast radius. Flag any text that blurs them, and any that treats autoApproved as if a
person had looked at it.

Stale baselines. A diff caused by a fresher baseline on the base branch is not a regression.
Flag it if it was filed as one, or if the bucket is missing entirely.

Return only this JSON:

{
  "approval_recommended": [
    { "quote": "<the sentence that recommends approving>", "rewrite": "<neutral description instead>" }
  ],
  "missing_evidence": [
    { "test": "<name>", "missing": "diffPercent" }
  ],
  "branch_semantics_errors": ["<quote conflating branch approval with merge approval>"],
  "stale_baseline_misfiled": ["<test filed as a regression that the precedence rule explains>"],
  "verdict": "usable"
}

- verdict is usable, usable_with_edits or rejected.
- Any entry in approval_recommended forces at least usable_with_edits, no matter how well
  evidenced the rest is.
```

### 3. Review dyscypliny zatwierdzania

Puszczasz na tym, co wyprodukowały dwa poprzednie prompty. Model proszony o streszczenie różnicy
dryfuje w stronę wniosku, a wniosek, po który sięga najchętniej, brzmi „wygląda dobrze, można
zatwierdzić". To jedyna decyzja, której zespół nie deleguje, a przychodzi ubrana w uprzejmość.
Dlatego każdy wpis w `approval_recommended` psuje werdykt niezależnie od tego, jak dobrze
udokumentowana jest reszta.

```
Task: Approval Discipline Review (S04 L03)
You are auditing something written about baseline approval: either a build summary headed for a
pull request, or a policy section headed for AGENTS.md. Paste it, together with the tracker JSON or
the process it describes.

One failure mode matters more than the rest. A model asked to summarise a visual diff drifts toward
a conclusion, and the conclusion it reaches for is "this looks fine, approve it". That is precisely
the decision a team does not delegate, and it arrives dressed as helpfulness rather than as a claim.

Check four things.

Approval creep. Any sentence nudging toward approving: "looks safe", "no visual impact", "can be
merged", "nothing to worry about". Quote each one. A summary may describe and classify; it may not
conclude.

Evidence. Every listed test run needs its diffPercent. Anything classed expected needs a
matching claim in the pull request description. Missing evidence should have produced suspicious.

Branch semantics. Approving on a branch and approving with merge are different acts with
different blast radius. Flag any text that blurs them, and any that treats autoApproved as if a
person had looked at it.

Stale baselines. A diff caused by a fresher baseline on the base branch is not a regression.
Flag it if it was filed as one, or if the bucket is missing entirely.

Return only this JSON:

{
  "approval_recommended": [
    { "quote": "<the sentence that recommends approving>", "rewrite": "<neutral description instead>" }
  ],
  "missing_evidence": [
    { "test": "<name>", "missing": "diffPercent" }
  ],
  "branch_semantics_errors": ["<quote conflating branch approval with merge approval>"],
  "stale_baseline_misfiled": ["<test filed as a regression that the precedence rule explains>"],
  "verdict": "usable"
}

- verdict is usable, usable_with_edits or rejected.
- Any entry in approval_recommended forces at least usable_with_edits, no matter how well
  evidenced the rest is.
```

**Granica:** oba prompty operują na metadanych test runów, a nie na pikselach, więc nie rozstrzygają, czy konkretna różnica jest błędem produktu. Od oceny pojedynczej różnicy jest przegląd w panelu, gdzie widać baseline, nowy zrzut i mapę różnic obok siebie. Traktuj wyjście jako uporządkowaną kolejkę do przejrzenia, nie jako werdykt. Do promptu wrzucaj sam zrzut metadanych, bez danych wrażliwych z aplikacji.
