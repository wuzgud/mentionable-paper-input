import { tagName } from '@ember-decorators/component';
import Component from '@glimmer/component';

@tagName('')
class MentionOptionComponent extends Component {
  get extractedMention() {
    return this.args.extractMention(this.args.option);
  }
  get focused() {
    return this.args.focusedIndex === this.args.index;
  }
}

export default MentionOptionComponent;
