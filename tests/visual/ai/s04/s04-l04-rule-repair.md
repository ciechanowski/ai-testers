## Task — Repair the rule that lost (S04 L04, homework)

A rule in agent memory lost to a direct user request. The agent did what the user asked and broke
the convention. Rewrite the rule so the same request cannot win again.

```
RULE AS WRITTEN:
[paste it]

USER REQUEST THAT BEAT IT:
[paste the prompt, verbatim]

WHAT THE AGENT PRODUCED:
[paste the generated line of code or command]
```

### The rewrite must

- stay within **two lines**, because this file loads on every request
- open with an imperative, never with „prefer", „we usually" or „try to"
- carry the forbidden form as literal code, not as a description of it
- **answer the request instead of ignoring it.** The rule lost because the user asked for something
  real. Say what the agent does when a user explicitly asks for the forbidden form: the substitute,
  and the one sentence it says back.

Then state, in one line, why the original lost: missing counter-form, hedged verb, or a rule that
never anticipated a user asking for the opposite.

Return only the rewritten rule and that one line.

> **Boundary:** the model will happily write a longer, firmer rule. Length is not what wins. The
> request beat the rule because the rule had nothing to say about that request, and a rule that has
> no answer for „hide it" will lose to „hide it" no matter how many capital letters it carries.
