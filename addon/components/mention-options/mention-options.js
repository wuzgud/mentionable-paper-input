import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

class MentionOptionsComponent extends Component {
  @service media;

  // @computed('media.{isDesktop,isJumbo}')
  get isDesktop() {
    return true;
    // return this.media.isDesktop || this.media.isJumbo;
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
