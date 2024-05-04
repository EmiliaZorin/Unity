const { test, expect } = require('@playwright/test');
import { LoginPage } from '../pages/LoginPage';
import { LandingPage } from '../pages/LandingPage';
import { PublisherPage } from '../pages/PublisherPage';
import { PostPage } from '../pages/PostPage';
import { ProfilePage } from '../pages/ProfilePage';
import { getUrl } from '../support/loginInfo';
import { landingSelectors } from '../pageSelectors/LandingSelectors';
import { constValues } from '../support/constValues';
import { timeouts } from '../support/timeouts';

test.describe('Scenarios', () => {
  let loginPage;
  let landindPage;
  let publisherPage;
  let postPage;
  let profilePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    landindPage = new LandingPage(page);
    publisherPage = new PublisherPage(page);
    postPage = new PostPage(page);
    profilePage = new ProfilePage(page);
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
    if (await page.locator(landingSelectors.sideMenuButton).isVisible({ timeout: timeouts.longTimeout * 2 })) {
      await page.locator(landingSelectors.sideMenuButton).click({ timeout: timeouts.longTimeout * 2 });
    }
    await page.locator(landingSelectors.menuItem, { hasText: constValues.profileLabel }).click();
    await profilePage.profilePageLoaded();
    await profilePage.createProfile(constValues.firstBioProfile, constValues.firstPublisherEmail);
    await profilePage.assertProfileCreated(constValues.firstBioProfile, constValues.firstPublisherEmail);
    await profilePage.createProfile(constValues.secondBioProfile, constValues.secondPublisherEmail);
    await profilePage.assertProfileCreated(constValues.secondBioProfile, constValues.secondPublisherEmail);
    await profilePage.deleteProfile(constValues.secondPublisherEmail);
    await profilePage.confirmProfileDeletedUsingFilter(constValues.secondPublisherEmail);
    //clean up
    if (await page.locator(landingSelectors.sideMenuButton).isVisible({ timeout: timeouts.longTimeout * 2 })) {
      await page.locator(landingSelectors.sideMenuButton).click({ timeout: timeouts.longTimeout * 2 });
    }
    await page.locator(landingSelectors.menuItemDiv, { hasText: constValues.profileLabel }).click({ timeout: timeouts.longTimeout });
    await profilePage.deleteProfile(constValues.firstPublisherEmail);
    if (await page.locator(landingSelectors.sideMenuButton).isVisible({ timeout: timeouts.longTimeout * 2 })) {
      await page.locator(landingSelectors.sideMenuButton).click({ timeout: timeouts.longTimeout * 2 });
    }
    await page.locator(landingSelectors.menuItem, { hasText: constValues.publisherLabel }).click();
    await publisherPage.deletePublisher(constValues.firstPublisherName);
    await publisherPage.deletePublisher(constValues.secondPublisherName);
  });

  test('Scenario two', async ({ page }) => {
    await page.locator(landingSelectors.menuItem, { hasText: constValues.publisherLabel }).click();
    await publisherPage.publisherPageLoaded();
    await publisherPage.createPublisher(constValues.thirdPublisherName, constValues.thirdPublisherEmail);
    await publisherPage.assertPublisherCreated(constValues.thirdPublisherName, constValues.thirdPublisherEmail);
    await landindPage.sideMenuButton.click();
    await page.locator(landingSelectors.menuItem, { hasText: constValues.postLabel }).click();
    await postPage.postPageLoaded();
    const jsonData = {
      number: constValues.JsonDataNumber,
      text: constValues.JsonDataText,
    };
    await postPage.createPost(constValues.postTitle, constValues.postContent, constValues.activePostStatus, constValues.thirdPublisherEmail, jsonData);
    await postPage.assertPostCreated(constValues.postTitle, constValues.postContent, constValues.activePostStatus);
    await postPage.editPost(constValues.postTitle);
    await postPage.changePostStatus(constValues.removedPostStatus);
    await postPage.assertPostCreated(constValues.postTitle, constValues.postContent, constValues.removedPostStatus);
    //clean Up
    await postPage.deletePost(constValues.postTitle);
    if (await page.locator(landingSelectors.sideMenuButton).isVisible({ timeout: timeouts.longTimeout * 2 })) {
      await page.locator(landingSelectors.sideMenuButton).click({ timeout: timeouts.longTimeout * 2 });
    }
    await page.locator(landingSelectors.menuItem, { hasText: constValues.publisherLabel }).click({ timeout: timeouts.longTimeout });
    await publisherPage.deletePublisher(constValues.thirdPublisherName);
  });

  test('Scenario three', async ({ page, request }) => {
    const cookies = await page.context().cookies();
    const firstPubId = await publisherPage.createPublisherAPI(request, cookies, constValues.firstPublisherName, constValues.firstPublisherEmail);
    const secondPubId = await publisherPage.createPublisherAPI(request, cookies, constValues.secondPublisherEmail, constValues.secondPublisherEmail);
    const firstProfileId = await profilePage.createProfileAPI(request, cookies, firstPubId, constValues.firstBioProfile);
    const secondProfileId = await profilePage.createProfileAPI(request, cookies, secondPubId, constValues.firstBioProfile);
    await profilePage.deleteProfileAPI(request, cookies, firstProfileId);
    await profilePage.filterProfileByIdAPI(request, cookies, firstProfileId);
    //clean up
    await profilePage.deleteProfileAPI(request, cookies, secondProfileId);
    await publisherPage.deletePublisherAPI(request, cookies, firstPubId);
    await publisherPage.deletePublisherAPI(request, cookies, secondPubId);
  });

  test('Scenario four', async ({ page, request }) => {
    const cookies = await page.context().cookies();
    const firstPubId = await publisherPage.createPublisherAPI(request, cookies, constValues.firstPublisherName, constValues.firstPublisherEmail);
    const data = {
      pTitle: constValues.postTitle,
      pContent: constValues.postContent,
      pStatus: constValues.activePostStatus,
      pIsPublished: true,
      pId: firstPubId,
      jsonData: constValues.jsonData,
    };
    const firstPostId = await postPage.createPostAPI(request, cookies, data);
    const dataToEditPost = {
      pTitle: constValues.postTitle,
      pContent: constValues.postContent,
      pStatus: constValues.removedPostStatus,
      pIsPublished: true,
      pId: firstPubId,
      jsonData: constValues.jsonData,
    };
    await postPage.editPostAPI(request, cookies, dataToEditPost, firstPostId);
    await postPage.filterPostAPI(request, cookies, firstPostId);
    //clean up
    await postPage.deletePostAPI(request, cookies, firstPostId);
    await publisherPage.deletePublisherAPI(request, cookies, firstPubId);
  });
});
