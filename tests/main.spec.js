const { test, expect } = require('@playwright/test');
import { LoginPage } from '../pages/LoginPage';
import { LandingPage } from '../pages/LandingPage';
import { PublisherPage } from '../pages/PublisherPage';
import { PostPage } from '../pages/PostPage';
import { getUrl } from '../support/loginInfo';
import { landingSelectors } from '../pageSelectors/LandingSelectors';
import { constValues } from '../support/constValues';
import { timeouts } from '../support/timeouts';

test.describe('Scenarios', () => {
  let loginPage;
  let landindPage;
  let publisherPage;
  let postPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    landindPage = new LandingPage(page);
    publisherPage = new PublisherPage(page);
    postPage = new PostPage(page);
    await page.goto(await getUrl());
    await loginPage.pageLoaded();
    await loginPage.login();
    await landindPage.assertPageLoaded();
  });

  test('Scenario one', async ({ page }) => {
    await page.locator(landingSelectors.menuItem, { hasText: constValues.publisherLabel }).click();
    await publisherPage.publisherPageLoaded();
    await publisherPage.createPublisher(constValues.firstPublisherName, constValues.firstPublisherEmail);
    await publisherPage.assertPublisherCreated(constValues.firstPublisherName, constValues.firstPublisherEmail);
    await publisherPage.createPublisher(constValues.secondPublisherName, constValues.secondPublisherEmail);
    await publisherPage.assertPublisherCreated(constValues.secondPublisherName, constValues.secondPublisherEmail);
    await publisherPage.deletePublisher(constValues.secondPublisherName);
    await publisherPage.confirmPublisherDeletedUsingFilter(constValues.secondPublisherName);
  });

  test.only('Scenario two', async ({ page }) => {
    await page.locator(landingSelectors.menuItem, { hasText: constValues.publisherLabel }).click();
    await publisherPage.publisherPageLoaded();
    await publisherPage.createPublisher(constValues.thirdPublisherName, constValues.thirdPublisherEmail);
    await publisherPage.assertPublisherCreated(constValues.thirdPublisherName, constValues.thirdPublisherEmail);

    if (await page.locator(landingSelectors.noticeMessage).isVisible()) {
      await expect(page.locator(landingSelectors.noticeMessage)).toBeHidden({ timeout: timeouts.longTimeout });
      await landindPage.sideMenuButton.click();
    }
    await page.locator(landingSelectors.menuItem, { hasText: constValues.postLabel }).click();
    await postPage.publisherPageLoaded();
    const jsonData = {
      number: constValues.JsonDataNumber,
      text: constValues.JsonDataText,
    };
    await postPage.createPost(constValues.postTitle, constValues.postContent, constValues.activePostStatus, constValues.thirdPublisherEmail, jsonData);
    await postPage.assertPostCreated(constValues.postTitle, constValues.postContent, constValues.activePostStatus);
    await postPage.editPost(constValues.postTitle);
    await postPage.changePostStatus(constValues.removedPostStatus);
    await postPage.assertPostCreated(constValues.postTitle, constValues.postContent, constValues.removedPostStatus);
  });
});
