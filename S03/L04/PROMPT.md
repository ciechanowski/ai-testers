# S03L04: prompty AI

## AI Prompty

Dwa prompty. Pierwszy szkicuje skilla z Twojego powtarzanego prompta, drugi go **atakuje**: i to ten drugi jest tu ważniejszy. Treść po angielsku, tak jak w repo.

### 1. Draft skilla komponującego

Dwie rzeczy są tu kluczowe. Model **najpierw czyta** cztery modelowe skille, więc nie zgaduje
kształtu. I dostaje **twardy zakaz przepisywania ich reguł**: bez tego zdania skopiuje
wszystko, co uzna za ważne, i dostaniesz molocha.

```
Read all four SKILL.md files in .claude/skills/ first (vrt-factory,
vrt-pom, vrt-spec, vrt-i18n).

Then create .claude/skills/vrt-page-suite/SKILL.md - a skill whose ONLY
responsibility is orchestration: given a page path and a list of locales,
run those four in the right order to produce a complete VRT suite.

Hard rule: it must NOT restate their rules. No "avoid Math.random",
no locator conventions, no threshold advice - those belong to the four
it delegates to. It owns the ORDER and the wiring, nothing else.
It must also check what already exists in tests/fixtures and tests/pages
and reuse it instead of regenerating.

YAML frontmatter (name, a trigger-focused description with explicit NOT
clauses, allowed-tools including Read), rules, steps, and one concrete
input/output example. Return the full SKILL.md.
```

### 2. Review triggera: adwersarialnie, przeciw sąsiadowi

Zwykłe „czy mój trigger jest dobry?” zawsze dostanie odpowiedź „tak”. Dlatego pytanie stawiamy
inaczej: **podajesz modelowi trudny przypadek i każesz znaleźć prompty, przy których dwa
skille się gryzą.**

```
Here are two skill descriptions: mine (vrt-page-suite) and vrt-i18n's.

The hard case: "build the full VRT suite for /insights in PL and DE"
should fire mine, but "cover /insights in all languages" should fire
vrt-i18n - and they sound almost identical.

Give me 3 prompts that should fire mine and 3 that should fire vrt-i18n.
Then tell me which of the 6 are ambiguous, and rewrite my description
so none of them are. Return the improved description only.
```

### Dlaczego akurat przeciw sąsiadowi

Skill, który nie odpala się nigdy, poznasz od razu. Groźniejszy jest ten, który odpala się
**czasami nie tam**: bo wygląda, jakby działał.

Tu masz najtrudniejszy możliwy przypadek i to nie przypadkiem: `vrt-page-suite` i `vrt-i18n`
dotyczą **tej samej strony i tych samych języków**. Różnica jest w punkcie wyjścia: jeden
buduje suitę od zera, drugi dokłada języki do **istniejącego** specu. Prompty, które to
rozróżniają, dzieli jedno słowo. Bez klauzuli NOT model wybiera właściwie losowo i przy
odrobinie szczęścia trafi dobrze, więc uznasz, że działa.

### Granica

AI destyluje skilla z Twoich promptów, ale `description` zatwierdzasz sam, bo to jedyne pole,
które decyduje, **czy i kiedy** skill w ogóle ruszy. Model nie ma jak sprawdzić, czy trigger
jest dobry: nie widzi Twoich przyszłych promptów. Ty je widzisz.
