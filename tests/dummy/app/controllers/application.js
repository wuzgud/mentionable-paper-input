import Controller from '@ember/controller';
import { action } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default class Application extends Controller {
  @service userService;
  constructor() {
    super(...arguments);
  }

  @action
  valueChanged(newText) {
    this.set('textareaVal', newText);
  }

  @action
  extractUsername(user) {
    return user ? user.username : null;
  }

  @task(function * (currentMention) {
    yield timeout(150); // throttle the search users call
    this.set('userMentions', yield this.userService.findAll(currentMention));
  }).restartable() searchUsersToMention;
}
