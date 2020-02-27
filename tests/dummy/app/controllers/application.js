import Controller from '@ember/controller';
import { action } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import RSVP from 'rsvp';
import { User } from '../models/user';

export default class Application extends Controller {
  constructor() {
    super(...arguments);
  }

  @action
  commentChanged(newText) {
    this.set('newCommentText', newText);
  }

  @action
  getUsername(user) {
    return user ? user.username : null;
  }

  @task(function * (currentMention) {
    yield timeout(150);
    this.set('userMentions', currentMention ? yield findAllUsers() : []);
  }).restartable() searchUsersToMention;
}

function findAllUsers() {
  return new RSVP.Promise( (resolve) => {
    resolve([
      new User({ name: 'Andrew Ball', username: 'ajball' }),
      new User({ name: 'Shauna Robertson', username: 'slauna' }),
      new User({ name: 'Will Henry', username: 'will' }),
      new User({ name: 'Janine Henry', username: 'janine' })
    ])
  });
}
