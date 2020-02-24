import Component from '@glimmer/component';

import { tagName } from '@ember-decorators/component';
import { action } from '@ember/object';

@tagName('')
class MentionOptionsComponent extends Component {
  // defaults generically to "Results". If passed, make sure it's pluralized (e.g. Users, People, Tags, etc)
  get resultTypeDisplay() {
    return this.args.resultTypeDisplay || 'Results';
  }
  constructor() {
    super(...arguments);
  }
  @action
  setMentionsDropdownTopPosition(mentionsDropdownEl) {
    const height = this.getTextAreaHeight();
    const newTop = height.substr(0, height.length - 2); // - 2 to remove 'px'
    mentionsDropdownEl.style.top = (+newTop + 2) + 'px'; // + 2 because the dropdown looks a little better when it's off the textarea slightly
  }
  getTextAreaHeight() {
    return this.args.textAreaElement.style.height;
  }
}

export default MentionOptionsComponent;
