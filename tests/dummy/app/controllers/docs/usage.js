import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from "@glimmer/tracking";

export default class DocsUsage extends Controller {
  selectedTab = 0;
  // BEGIN-SNIPPET mentionable-input-usage-controller.js
  @service userService;

  @tracked
  value;

  @tracked
  userMentionOptions = [];

  @action
  extractUsername(user) {
    return user ? user.username : null;
  }

  @action
  async searchUsersToMention(mention) {
    this.userMentionOptions = await this.userService.findAll(mention);
  }
  // END-SNIPPET
}
