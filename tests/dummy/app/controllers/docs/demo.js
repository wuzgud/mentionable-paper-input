import Controller from '@ember/controller';
import { action } from '@ember/object';
import { task, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { User } from "../../models/user";

export default class DocsDemo extends Controller {
  mentionPattern = new RegExp(`\\B@[a-z0-9_.]+`, 'gi');
  comments = A([
    {
      "timeSincePosted": "4 hours ago",
      "text": "sounds like my kinda place. similar vibe to Sound Table?",
      "user": new User({
        "username": "will"
      })
    },
    {
      "timeSincePosted": "3 hours ago",
      "text": "@will it's similar but not quite the same. Sound Table is much bigger with more dancing",
      "user": new User({
        "username": "ajball"
      })
    }
  ]);

  placeholderText = 'Type @ to start mentioning';
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

  @action
  addComment(comment) {
    const trimmed = comment ? comment.trim() : '';
    if (trimmed) {
      this.comments.pushObject({
        timeSincePosted: 'Now',
        text: trimmed,
        user: new User({
          username: 'me',
          cssClass: 'mi-blue mint-border'
        })
      });
      this.set('textareaVal', '');
    }
  }
}
