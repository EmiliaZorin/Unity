const { expect } = require('@playwright/test');
import { profileSelectors } from '../pageSelectors/ProfileSelectors';
import { constValues } from '../support/constValues';
import { timeouts } from '../support/timeouts';
import { getUrl } from '../support/loginInfo';
import { endpoints } from '../support/endpoints';

exports.ProfilePage = class ProfilePage {
  constructor(page) {
    this.page = page;
    this.mainSection = page.locator(profileSelectors.mainSection);
    this.createButton = page.locator(profileSelectors.createButton);
    this.profileTable = page.locator(profileSelectors.profileTable);
    this.profileBody = page.locator(profileSelectors.profileBody);
    this.profileId = page.locator(profileSelectors.profileId);
    this.profileBio = page.locator(profileSelectors.profileBio);
    this.profilePubEmail = page.locator(profileSelectors.profilePubEmail);
    this.saveButton = page.locator(profileSelectors.saveButton);
    this.editProfileName = page.locator(profileSelectors.editProfileName);
    this.bio = page.locator(profileSelectors.bio);
    this.editProfilePublisher = page.locator(profileSelectors.editProfilePublisher);
    this.publisherBox = page.locator(profileSelectors.publisherBox);
    this.filterButton = page.locator(profileSelectors.filterButton);
    this.applyChangesButton = page.locator(profileSelectors.applyChangesButton);
  }

  async profilePageLoaded() {
    console.log('Assert profile page loaded');
    await expect(this.mainSection).toBeVisible();
    await expect(this.createButton).toBeVisible();
    await expect(this.page.locator(profileSelectors.pagePath), { hasText: constValues.postPath }).toBeVisible();
  }

  async createProfile(profileBio, publisherEmail) {
    console.log(`Create profile: ${profileBio}, ${publisherEmail}`);
    await this.createButton.click();
    await this.bio.fill(profileBio);
    await this.page.locator(profileSelectors.publisherBox).click();
    await this.page.locator(profileSelectors.optionsMenu).getByText(publisherEmail).click({ timeout: timeouts.shortTimeout });
    await this.saveButton.click();
  }

  async assertProfileCreated(profileBio, publisherEmail) {
    console.log(`Assert profile: ${profileBio}, ${publisherEmail} created`);
    await expect(this.profileTable).toBeVisible();
    await expect(this.page.locator(profileSelectors.profileBody).locator(profileSelectors.profileBio, { hasText: profileBio })).toBeVisible();
    await expect(this.page.locator(profileSelectors.profileBody).locator(profileSelectors.profilePubEmail, { hasText: publisherEmail })).toBeVisible();
  }

  async getProfileId(pubEmail) {
    console.log(`Get profile: ${pubEmail} id`);
    return await this.profileTable.locator('tbody').locator('tr', { hasText: pubEmail }).locator(profileSelectors.profileId).innerText();
  }

  async deleteProfile(pubEmail) {
    console.log(`Delete profile: ${pubEmail}`);
    await this.profileTable.locator('tbody').locator('tr', { hasText: pubEmail }).locator(profileSelectors.actionButton).hover();
    await expect(this.page.locator(profileSelectors.dropDownMenu)).toBeVisible();
    await this.page.locator(profileSelectors.dropDownMenu).locator(profileSelectors.deleteAction).click();
    await expect(this.page.locator(profileSelectors.popup)).toBeVisible();
    await this.page.locator(profileSelectors.popup).locator(profileSelectors.confirmButton).click();
  }

  async confirmProfileDeletedUsingFilter(pubEmail) {
    console.log(`Conform profile: ${pubEmail} deleted using filter`);
    const id = await this.getProfileId(pubEmail);
    await this.filterButton.click();
    await this.page.locator(profileSelectors.filterIdField).fill(id);
    await this.applyChangesButton.click();
    await expect(this.page.locator(profileSelectors.mainSection, { hasText: constValues.noRecordsLabel })).toBeVisible();
  }

  async createProfileAPI(request, cookies, firstPubId, firstPubBio) {
    const url = await getUrl();
    const createRequest = await request.post(`${url}/${endpoints.createProfile}`, {
      data: {
        bio: firstPubBio,
        publisher: firstPubId,
      },
      headers: {
        Cookie: 'adminjs=' + cookies[0].value,
      },
    });
    try {
      await expect(await createRequest).toBeOK();
      const response = await createRequest.json();
      return await this.getProfileIdAPI(response);
    } catch (e) {
      console.error(`action failed: ${e}`);
    }
  }

  async getProfileIdAPI(response) {
    return await response.record.id;
  }

  async deleteProfileAPI(request, cookies, profileId) {
    const url = await getUrl();
    const deleteRequest = await request.post(`${url}/${endpoints.deleteProfile}${profileId}/delete`, {
      headers: {
        Cookie: 'adminjs=' + cookies[0].value,
      },
    });
    try {
      await expect(await deleteRequest).toBeOK();
      const response = await deleteRequest.json();
      console.log(`profile with id: ${profileId} was: ${response.notice.message}`);
    } catch (e) {
      console.error(`action failed: ${e}`);
    }
  }

  async filterProfileByIdAPI(request, cookies, profileId) {
    const url = await getUrl();
    const filterRequest = await request.post(`${url}/${endpoints.filterProfile}${profileId}&page=1`, {
      headers: {
        Cookie: 'adminjs=' + cookies[0].value,
      },
    });
    try {
      await expect(await filterRequest).toBeOK();
      const response = await filterRequest.json();
      console.log(`total of profiles with id:${profileId} is ${response.meta.total}`);
    } catch (e) {
      console.error(`action failed: ${e}`);
    }
  }
};
