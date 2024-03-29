import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { User } from "../../models/user";

export default class Demo extends Controller {
  mentionPattern = new RegExp(`\\B@[a-z0-9_.]+`, 'gi');

  @tracked
  comments = [
    {
      "timeSincePosted": "4 hours ago",
      "text": "sounds great. I'll see you over there in a couple hours",
      "user": new User({
        "username": "will"
      })
    },
    {
      "timeSincePosted": "3 hours ago",
      "text": "@will be sure to bring the extra set of car keys with you",
      "user": new User({
        "username": "ajball"
      })
    }
  ];

  @service userService;

  @tracked
  value;

  @tracked
  userMentionOptions = [];

  @action
  getMentionDisplayText(user) {
    return user ? user.username : null;
  }

  @action
  async searchUsersToMention(mention) {
    this.userMentionOptions = await this.userService.findAll(mention);
  }

  @action
  addComment(comment) {
    const trimmed = comment ? comment.trim() : '';
    if (trimmed) {
      this.comments = [
        ...this.comments,
        {
          timeSincePosted: 'Now',
          text: trimmed,
          user: new User({
            username: 'me',
            cssClass: 'mi-blue mint-border'
          })
        },
      ];
      this.value = '';
    }
  }
}
