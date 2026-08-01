import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * LoginPage – strona /login. Locatory + akcje (fill/submit). Zero asercji.
 */
export class LoginPage extends BasePage {
  readonly path = '/login';
  readonly form: Locator;
  readonly email: Locator;
  readonly password: Locator;
  readonly alert: Locator;

  constructor(page: Page) {
    super(page);
    this.form = page.getByRole('form', { name: /sign in|zaloguj|anmeld/i });
    this.email = page.getByLabel(/email/i);
    this.password = page.getByLabel(/password|hasło|passwort/i);
    this.alert = page.getByRole('alert');
  }

  async fill(email: string, password: string): Promise<void> {
    await this.email.fill(email);
    await this.password.fill(password);
  }

  async submit(): Promise<void> {
    await this.form
      .getByRole('button', { name: /sign in|zaloguj|anmeld/i })
      .click();
  }
}
