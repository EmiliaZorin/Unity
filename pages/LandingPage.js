const { expect } = require('@playwright/test');
import { landingSelectors } from '../pageSelectors/LandingSelectors';
import { constValues } from '../support/constValues';
import { getUserEmail } from '../support/loginInfo';
import { timeouts } from '../support/timeouts';

exports.LandingPage = class LandingPage {
  constructor(page) {
    this.page = page;
    this.topbar = page.locator(landingSelectors.topbar);
    this.langArea = page.locator(landingSelectors.langArea);
    this.userInfoArea = page.locator(landingSelectors.userInfoArea);
    this.userEmailAddress = page.locator(landingSelectors.userEmailAddress);
    this.userName = page.locator(landingSelectors.userName);
    this.mainAreaTitle = page.locator(landingSelectors.mainAreaTitle, { hasText: constValues.primaryTitle });
    this.mainAreaDescription = page.locator(landingSelectors.mainAreaDescription, { hasText: constValues.primaryDescription });
    this.logo = page.locator(landingSelectors.logo);
    this.folderMenu = page.locator(landingSelectors.menu, { hasText: constValues.happyFolderLabel });
    this.pagesLabel = page.locator(landingSelectors.pagesLabel, { hasText: constValues.pagesTitleLabel });
    this.sideMenuButton = page.locator(landingSelectors.sideMenuButton);
    this.publishTable = page.locator(landingSelectors.publishersTable);
  }

  async assertPageLoaded() {
    await this.assertTopBarLoaded();
    await this.assertMainAreaLoaded();
    await this.assertSideMenuLoaded();
  }

  async assertTopBarLoaded() {
    await expect(this.topbar).toBeVisible({ timeout: timeouts.longTimeout });
    await expect(this.langArea, { hasText: constValues.langEnglish }).toBeVisible({ timeout: timeouts.longTimeout });
    const userEmail = await getUserEmail();
    await expect(this.page.locator(landingSelectors.userEmailAddress, { hasText: userEmail })).toBeVisible({ timeout: timeouts.longTimeout });
    await expect(this.page.locator(landingSelectors.userName, { hasText: constValues.userName })).toBeVisible({ timeout: timeouts.longTimeout });
  }

  async assertMainAreaLoaded() {
    if (await this.mainAreaTitle.isVisible()) {
      await expect(this.mainAreaDescription).toBeVisible({ timeout: timeouts.longTimeout });
    } else {
      await expect(this.publishTable).toBeVisible({ timeout: timeouts.longTimeout });
    }
  }

  async assertSideMenuLoaded() {
    await this.page.waitForTimeout(timeouts.shortTimeout);
    if (await this.sideMenuButton.isVisible()) {
      await this.sideMenuButton.click();
    }
    await expect(this.logo).toBeVisible({ timeout: timeouts.longTimeout });
    const src = await this.logo.locator('img').evaluate((e) => {
      return e.getAttribute('src');
    });
    await expect(src).toEqual(constValues.logoSrc);
    await expect(this.folderMenu, { has: 'ul' }).toBeVisible();
    await this.assertFolderMenuVisible();
    await this.assertPagesMenuVisible();
  }

  async assertFolderMenuVisible() {
    if (await this.folderMenu.locator(landingSelectors.closedCaret).isVisible()) {
      await this.folderMenu.locator(landingSelectors.closedCaret).click();
    }
    await expect(this.page.locator(landingSelectors.menuItem, { hasText: constValues.publisherLabel })).toBeVisible({ timeout: timeouts.longTimeout });
    await expect(this.page.locator(landingSelectors.menuItem, { hasText: constValues.profileLabel })).toBeVisible({ timeout: timeouts.longTimeout });
    await expect(this.page.locator(landingSelectors.menuItem, { hasText: constValues.postLabel })).toBeVisible({ timeout: timeouts.longTimeout });
  }

  async assertPagesMenuVisible() {
    await expect(this.pagesLabel).toBeVisible();
    await expect(this.page.locator(landingSelectors.menuItem, { hasText: constValues.dashboardLabel })).toBeVisible({ timeout: timeouts.longTimeout });
    await expect(this.page.locator(landingSelectors.menuItem, { hasText: constValues.desighSystemsLabels })).toBeVisible({ timeout: timeouts.longTimeout });
  }
};
