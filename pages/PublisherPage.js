const { expect } = require('@playwright/test');
import { constValues } from '../support/constValues';
import { publisherSelectors } from '../pageSelectors/PublisherSelectors';

exports.PublisherPage = class PublisherPage {
  constructor(page) {
    this.page = page;
    this.title = page.locator(publisherSelectors.title, { hasText: constValues.createNewTitle });
    this.editNameArea = page.locator(publisherSelectors.editNameArea, { hasText: constValues.publisherNameLabel });
    this.editEmailArea = page.locator(publisherSelectors.editEmailArea, { hasText: constValues.publisherEmailLabel });
    this.saveButton = page.locator(publisherSelectors.saveButton, { hasText: constValues.save });
    this.mainSection = page.locator(publisherSelectors.mainSection);
    this.createPublisherButton = page.locator(publisherSelectors.createPublisherButton);
    this.publisherNameField = page.locator(publisherSelectors.name);
    this.publisherEmailField = page.locator(publisherSelectors.email);
    this.publishersTable = page.locator(publisherSelectors.publishersTable);
    this.filterButton = page.locator(publisherSelectors.filterButton);
    this.applyChangesButton = page.locator(publisherSelectors.applyChangesButton);
  }

  async publisherPageLoaded() {
    if (await this.mainSection.isVisible()) {
      await expect(this.mainSection).toBeVisible();
    } else {
      await expect(this.createPublisherButton).toBeVisible();
      await expect(this.page.locator(publisherSelectors.pagePath), { hasText: constValues.publisherPath }).toBeVisible();
    }
  }

  async publisherFormLoaded() {
    await expect(this.title).toBeVisible();
    await expect(this.editNameArea).toBeVisible();
    await expect(this.editEmailArea).toBeVisible();
    await expect(this.saveButton).toBeVisible();
  }

  async createPublisher(name, email) {
    await this.createPublisherButton.click();
    await this.publisherFormLoaded();
    await this.publisherNameField.fill(name);
    await this.publisherEmailField.fill(email);
    await this.saveButton.click();
  }

  async assertPublisherCreated(name, email) {
    await expect(this.publishersTable).toBeVisible();
    await expect(this.page.locator(publisherSelectors.tableName, { hasText: name })).toBeVisible();
    await expect(this.page.locator(publisherSelectors.tableEmail, { hasText: email })).toBeVisible();
  }

  async getPublisherId(name) {
    return await this.publishersTable.locator('tbody').locator('tr', { hasText: name }).locator(publisherSelectors.tableId).innerText();
  }

  async deletePublisher(name) {
    await this.publishersTable.locator('tbody').locator('tr', { hasText: name }).locator(publisherSelectors.actionButton).hover();
    await expect(this.page.locator(publisherSelectors.dropDownMenu)).toBeVisible();
    await this.page.locator(publisherSelectors.dropDownMenu).locator(publisherSelectors.deleteAction).click();
    await expect(this.page.locator(publisherSelectors.popup)).toBeVisible();
    await this.page.locator(publisherSelectors.popup).locator(publisherSelectors.confirmButton).click();
  }

  async confirmPublisherDeletedUsingFilter(name) {
    const id = await this.getPublisherId(name);
    await this.filterButton.click();
    await this.page.locator(publisherSelectors.filterIdField).fill(id);
    await this.applyChangesButton.click();
    await expect(this.page.locator(publisherSelectors.publisherResultTitle, { hasText: constValues.noRecordsLabel })).toBeVisible();
    await expect(this.page.locator(publisherSelectors.publisherResultDescription, { hasText: constValues.noRecordsDescription })).toBeVisible();
  }
};
