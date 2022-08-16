import Controller from '@ember/controller';
import { action } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default class DocsUsage extends Controller {
  placeholderText = 'Type @ to start mentioning';
  selectedTab = 0;
  templateType = 'angle';
  // BEGIN-SNIPPET mentionable-input-usage-controller.js
  @service userService;

  @action
  valueChanged(newText) {
    this.set('textareaVal', newText);
  }

  @action
  extractUsername(user) {
    return user ? user.username : null;
  }

  @task(function * (mention) {
    yield timeout(150); // throttle the search users call
    this.set('userMentions', (yield this.userService.findAll(mention)));
  }).restartable() searchUsersToMention;
  // END-SNIPPET

  @action
  setTemplateType(type) {
    this.set('templateType', type);
  }
}
