import Component from '@glimmer/component';
import { tagName } from '@ember-decorators/component';

@tagName('')
class MentionOptionComponent extends Component {
  get focused(){
    return this.args.focusedIndex === this.args.index;
  }
}

export default MentionOptionComponent;
