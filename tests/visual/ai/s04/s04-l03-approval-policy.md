## Task — Baseline Approval Policy (S04 L03)
Write the **"Baseline approval"** section of your team's `AGENTS.md`: who may approve a visual diff,
when, and what nobody is allowed to do. Once a team shares one tracker, "is this image correct?" gets
several answers at once depending on who is asking and from which branch, and this section is what
settles that.

Paste your team's current review process if you have one.

**Facts about the tool. Do not contradict these:**
- A baseline belongs to a **branch**. The variation key is name, browser, device, OS, viewport,
  custom tags and `branchName`, so the same assertion can hold a different baseline on every branch.
- Approving on a feature branch does **not** overwrite what the rest of the team sees. It creates a
  variation for that branch. The base branch changes only on approval with the `merge` flag.
- Precedence: your branch's baseline holds until the base branch's baseline is newer, at which point
  the base one wins. Without that rule an open branch would freeze its own version of the truth.
- `autoApproved` is the tool deciding, `approved` is a person deciding. They are different statuses
  and the section must treat them differently.

### Non-negotiable rules
- **Name the moment that needs care.** Approving on a branch is cheap and reversible; approving with
  `merge` moves the reference point for everyone. The policy must say who does the second one.
- **No rule the tracker cannot enforce or a reviewer cannot check.** "Approve carefully" is not a
  policy.
- **Say what happens on disagreement.** A policy with no escalation path is a suggestion.
- **Around 25 lines.** This lands in agent memory, which is loaded on every request.

Return the section as a single Markdown code block, ready to paste under a `## Baseline approval`
heading.

> **Boundary:** the model knows how the tracker behaves, because that is written above. It does not
> know your team: who reviews design changes, who is on call, whether you even have a base branch
> worth protecting. Treat the output as a draft to argue about in a retro, not a decision. Check it
> with the **Approval Discipline Review** ([`s04-l03-approval-review.md`](s04-l03-approval-review.md)).
