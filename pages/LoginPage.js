const { expect } = require('@playwright/test');
import { loginSelectors } from '../pageSelectors/LoginSelectors';
import { getUserEmail, getUesrPassword, getUrl } from '../support/loginInfo';
import { constValues } from '../support/constValues';

exports.LoginPage = class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailField = page.locator(loginSelectors.emailField);
    this.passwordField = page.locator(loginSelectors.passwordField);
    this.loginButton = page.locator(loginSelectors.loginButton);
    this.logo = page.locator(loginSelectors.logo);
    this.rightSection = page.locator(loginSelectors.rightSection);
    this.rightSectionIcons = page.locator(loginSelectors.rightSectionIcons);
    this.primaryHeader = page.locator(loginSelectors.primaryHeader);
    this.secondaryHeader = page.locator(loginSelectors.secondaryHeader);
  }

  async pageLoaded() {
    await expect(this.rightSection, { has: this.rightSectionIcons }).toBeVisible();
    await expect(this.primaryHeader, { hasText: constValues.welcome }).toBeVisible();
    await expect(this.secondaryHeader, { hasText: constValues.loginPageDescription }).toBeVisible();
  }

  async login() {
    await this.emailField.fill(await getUserEmail());
    await this.passwordField.fill(await getUesrPassword());
    await this.loginButton.click();
  }
};
