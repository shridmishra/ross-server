class AuthPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.getByRole("textbox", { name: /email/i }).or(page.locator('input[type="email"]')).first();
    this.passwordInput = page.locator('input[type="password"]').first();
    this.signInButton = page.getByRole("button", { name: /sign in/i });
  }

  async login(email, password) {
    await this.page.goto("/auth?isLogin=true");
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
    await this.page.waitForURL("**/dashboard");
  }
}

module.exports = { AuthPage };
