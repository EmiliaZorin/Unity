const { expect } = require('@playwright/test');
import { postSelectors } from '../pageSelectors/PostSelectors';
import { constValues } from '../support/constValues';
import { timeouts } from '../support/timeouts';

exports.PostPage = class PostPage {
  constructor(page) {
    this.page = page;
    this.postTitle = page.locator(postSelectors.postTitle, { hasText: constValues.createNewTitle });
    this.createButton = page.locator(postSelectors.createButton);
    this.mainSection = page.locator(postSelectors.mainSection);
    this.saveButton = page.locator(postSelectors.saveButton);
    this.editTitleArea = page.locator(postSelectors.editTitleArea);
    this.title = page.locator(postSelectors.title);
    this.editContentArea = page.locator(postSelectors.editContentArea);
    this.content = page.locator(postSelectors.content);
    this.editJson = page.locator(postSelectors.editJson);
    this.addJsonButton = page.locator(postSelectors.addJsonButton);
    this.jsonForm = page.locator(postSelectors.jsonForm);
    this.editStatus = page.locator(postSelectors.editStatus);
    this.statusDropDown = page.locator(postSelectors.statusDropDown);
    this.editPublished = page.locator(postSelectors.editPublished);
    this.editPublisher = page.locator(postSelectors.editPublisher);
    this.jsonNumber = page.locator(postSelectors.jsonNumber);
    this.jsonString = page.locator(postSelectors.jsonString);
    this.jsonDatePicker = page.locator(postSelectors.jsonDatePicker);
    this.datePickerPopup = page.locator(postSelectors.datePickerPopup);

    this.postTable = page.locator(postSelectors.postTable);
  }

  async publisherPageLoaded() {
    await expect(this.mainSection).toBeVisible();
    await expect(this.createButton).toBeVisible();
    await expect(this.page.locator(postSelectors.pagePath), { hasText: constValues.postPath }).toBeVisible();
  }

  async createPost(postTitle, postContent, postStatus, publisherEmail, jsonData) {
    await this.createButton.click();
    await this.title.fill(postTitle);
    await this.content.fill(postContent);
    await this.addJsonButton.click();
    await expect(this.jsonForm).toBeVisible();
    await this.page.locator(postSelectors.adminBox, { hasText: 'Some Json Number' }).locator('input').fill(jsonData.number);
    await this.page.locator(postSelectors.adminBox, { hasText: 'Some Json String' }).locator('input').fill(jsonData.text);
    await this.editStatus.locator(postSelectors.dropDown).click();
    await this.page.locator(postSelectors.option, { hasText: postStatus }).click();
    await this.editPublished.locator(postSelectors.publishedCheckBox).click();
    await this.editPublisher.locator(postSelectors.dropDown).click();
    await this.page.locator(postSelectors.option, { hasText: publisherEmail }).click({ timeout: timeouts.shortTimeout });
    await this.saveButton.click();
  }

  async assertPostCreated(postTitle, postContent, postStatus) {
    await expect(this.postTable).toBeVisible();
    await expect(this.page.locator(postSelectors.postTableBody).locator(postSelectors.tableTitle, { hasText: postTitle })).toBeVisible();
    await expect(this.page.locator(postSelectors.postTableBody).locator(postSelectors.tableContent, { hasText: postContent })).toBeVisible();
    await expect(this.page.locator(postSelectors.postTableBody).locator(postSelectors.tableStatus, { hasText: postStatus })).toBeVisible();
  }

  async editPost(postTitle) {
    await this.postTable.locator('tbody').locator('tr', { hasText: postTitle }).locator(postSelectors.actionButton).hover();
    await expect(this.page.locator(postSelectors.dropDownMenu)).toBeVisible();
    await this.page.locator(postSelectors.dropDownMenu).locator(postSelectors.editOption).click();
  }

  async changePostStatus(postStatus) {
    await this.editStatus.locator(postSelectors.dropDown).click();
    await this.page.locator(postSelectors.optionMenu).getByText(postStatus).click();
    await this.saveButton.click();
  }
};
