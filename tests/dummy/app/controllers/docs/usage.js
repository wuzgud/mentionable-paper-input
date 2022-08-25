import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from "@glimmer/tracking";

export default class Usage extends Controller {
  @tracked
  selectedTab = 0;
  // BEGIN-SNIPPET mentionable-input-usage-controller.js
  @service
  userService;

  @tracked
  value;

  @tracked
  userMentionOptions = []; // A user in this case looks like `{ username: "ajball", name: "Andrew Ball" }`

  @action
  getMentionDisplayText(user) {
    return user ? user.username : null;
  }

  @action
  async searchUsersToMention(mention) {
    this.userMentionOptions = await this.userService.findAll(mention);
  }
  // END-SNIPPET
  @action
  onTabChange(newTabIndex) {
    this.selectedTab = newTabIndex;
    this.value = '';
  }

  @action
  focusTextarea(element) {
    element.querySelector('textarea').focus();
  }
}
