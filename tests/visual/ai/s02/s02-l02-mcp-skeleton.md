Open /about on http://localhost:5173, take an
accessibility snapshot of the main landmark,
then write a Playwright VRT test that screenshots
getByRole('main').
Use role-based locators from the snapshot, not CSS.
