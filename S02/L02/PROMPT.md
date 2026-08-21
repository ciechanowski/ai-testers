# S02L02: prompty AI

## AI Prompty

Ciała promptów są po angielsku (konwencja kursu od Dnia 2), otoczka i omówienie po polsku.
Lekcja idzie dwoma promptami pod rząd: pierwszy daje szkielet, drugi dokłada determinizm.

### Krok 1: szkielet testu z żywego drzewa dostępności

Z podłączonym serwerem `@playwright/mcp` prosisz agenta, żeby znawigował na stronę,
zrobił accessibility snapshot i napisał test VRT oparty na rolach z drzewa, nie na CSS:

```
Open /about on http://localhost:5173, take an
accessibility snapshot of the main landmark,
then write a Playwright VRT test that screenshots
getByRole('main').
Use role-based locators from the snapshot, not CSS.
```

### Krok 2: dostrojenie szkieletu do determinizmu

Szkielet z kroku pierwszego jest zielony, ale niestabilny: liczniki i zegar rozjadą baseline
przy drugim przebiegu. Zamiast poprawiać kod ręcznie, dokładasz do tej samej rozmowy
drugi prompt, wprost wymieniając trzy techniki z lekcji.

```
Open /about on http://localhost:5173, take an
accessibility snapshot of the main landmark,
then write a Playwright VRT test that screenshots
getByRole('main'). Use role-based locators, not CSS.

// nowe: wymuś determinizm
- page.clock.setFixedTime(...) BEFORE goto
- mask the animated "Statistics" counter (+ maskColor)
- set a sensible threshold
```

Rewizję i tak robisz sam: sprawdzasz, czy `page.clock` stoi przed `goto`, czy maska ma
`maskColor`, i czy `threshold` pasuje do komponentu. MCP daje szkielet, odpowiedzialność
za determinizm zostaje po Twojej stronie.
