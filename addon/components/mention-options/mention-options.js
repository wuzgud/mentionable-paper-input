import Component from '@glimmer/component';
import { action } from '@ember/object';

class MentionOptionsComponent extends Component {
  @action
  setMentionsDropdownTopPosition(mentionsDropdownEl) {
    const height = this.getTextAreaHeight();
    const newTop = height.substring(0, height.length - 2); // - 2 to remove 'px'
    mentionsDropdownEl.style.top = (+newTop + 2) + 'px'; // + 2 because the dropdown looks a little better when it's off the textarea slightly
  }

  getTextAreaHeight() {
    return this.args.textAreaElement.style.height;
  }
}

export default MentionOptionsComponent;
