# S03L03: prompty AI

## AI Prompty

Ciała promptów są po angielsku (konwencja kursu od Dnia 2), otoczka i omówienie po polsku.
Pierwszy prompt pisze skilla, drugi sprawdza jego trigger, czyli jedyne pole, które decyduje,
kiedy skill w ogóle wejdzie do kontekstu.

### Draft skilla z powtarzanych promptów

Użyj, gdy ten sam prompt VRT wklejasz po raz kolejny i chcesz zamienić go w reużywalny skill w repo.

```
Task: Agent Skill Draft (S03 L03)
Turn the prompts you keep re-pasting (the S03 prompty.md files) plus the repo's factory
conventions into a reusable Claude Code Skill, a SKILL.md that the agent auto-loads when the
task matches, instead of copy-pasting a prompt from chat history.

Build .claude/skills/vrt-factory/SKILL.md:
- YAML frontmatter: name, a trigger-focused description, allowed-tools: Read Write Edit.
  The description is the whole game, progressive disclosure means only name + description
  sit in context until the trigger matches, so write it like a good test name: a concrete verb +
  object ("generate factory / mock data for a visual test") and say what it does not cover.
- Body (Markdown): the non-negotiable rules from L01 (hardcoded IDs, no Math.random() /
  Date.now(), ISO 8601 dates, a sliced fixed array, match tests/fixtures/artwork.factory.ts),
  the steps (read the existing factory first to catch the style → generate data + interface →
  say how to verify determinism), and one concrete input/output example.
- One responsibility only: data. Not assertions, not Page Objects, not thresholds (that is SRP
  from L02 applied to skills, a narrow trigger is why the skill fires in time, not at everything).

Return the full SKILL.md.
```

### Review triggera (`description`)

Użyj, gdy skill już istnieje i chcesz sprawdzić, czy odpala się w porę, czyli tylko przy właściwych zadaniach.
Kontrakt JSON wymusza konkret: model ma wymienić zadania, przy których skill odpaliłby się niepotrzebnie.

```
Task: Skill Trigger Review (S03 L03)
Review the description field of an Agent Skill. Paste the SKILL.md frontmatter into the chat.
Because of progressive disclosure, description is the only thing that decides whether and when the skill loads, a fuzzy trigger fires everywhere or nowhere.

Judge the trigger for vrt-factory (whose one job is generating deterministic factory / mock data):
- Is it specific enough to auto-load only for factory / mock-data / test-fixture requests?
- Would it wrongly fire on unrelated VRT tasks: masking, threshold tuning, Page Objects, ARIA?
- Does it name the concrete trigger phrases and state what the skill does not cover?

Return only this JSON:

{
  "specific_enough": false,
  "would_misfire_on": ["<e.g. masking, thresholds, Page Objects>"],
  "trigger_phrases": ["factory", "mock data", "seed data", "test fixture"],
  "improved_description": "<one precise description: verb + object, trigger phrases, explicit NOT-scope>"
}

- specific_enough: true only when the trigger cannot reasonably fire on masking / thresholds / POM.
```

**Granica:** AI świetnie destyluje skilla z promptów, które i tak już piszesz, ale trigger i finalny kształt zatwierdzasz sam. Najczęstsze błędy modelu to zbyt szeroki `description` (skill odpala się „przy wszystkim”) i skill-moloch łamiący SRP (dane + asercje + Page Object w jednym). Trzymaj zasadę: jeden skill = jedna odpowiedzialność, trigger konkretny jak nazwa testu, sekrety poza skillem.
