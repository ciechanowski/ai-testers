## Task — Build Summary for a Pull Request (S04 L03)
Turn a finished **Visual Regression Tracker build** into a comment a reviewer reads before opening
the dashboard, so they start with the suspicious diffs instead of whichever one happens to be first
in the list.
{{context}}

Paste the JSON from `GET /builds` and `GET /test-runs` (Bearer token from `POST /users/login`), plus
the project's `mainBranchName`, the branch this build ran on, and what the pull request claims to
change. Every test run carries `status`, `diffPercent`, `pixelMisMatchCount`, `baselineBranchName`
and `comment`.

Classify every test run that is not `ok` into exactly one bucket:

| Bucket | Meaning |
|---|---|
| `expected` | the diff is explained by an intentional change described in the pull request |
| `suspicious` | the diff touches a screen the pull request does not claim to change |
| `stale-baseline` | `baselineBranchName` differs from `branchName` and the diff looks like a change already merged into the main branch |
| `broken` | status is `failed`, so the comparison itself never ran |

### Non-negotiable rules
- **Never recommend approving anything.** Not "this looks fine", not "safe to approve". Deciding that
  a new image becomes the baseline is the reviewer's job, and it is the whole point of the lesson.
- **Insufficient evidence means `suspicious`**, plus a line saying what is missing. Never `expected`.
- **Quote `diffPercent` for every run you list.** A bucket without numbers is an opinion.
- **`stale-baseline` is not a regression.** A diff caused by a fresher baseline on the main branch
  looks exactly like a regression and is not one, which is why it gets its own bucket.

Return a markdown comment for the pull request: buckets as headings, one line per test run, and a
final line with the count per bucket.

> **Boundary:** the model reads metadata, not images, and it takes the pull request description at
> face value. `expected` therefore means "consistent with what the author wrote", not "correct".
> Nothing here removes the need to open the diff. Run the output through the **Approval Discipline
> Review** ([`s04-l03-approval-review.md`](s04-l03-approval-review.md)) before pasting it.
