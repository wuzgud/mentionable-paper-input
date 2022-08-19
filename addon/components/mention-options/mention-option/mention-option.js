import Component from '@glimmer/component';

class MentionOptionComponent extends Component {
  get extractedMention() {
    return this.args.onMention(this.args.option);
  }
  get focused() {
    return this.args.focusedIndex === this.args.index;
  }
}

export default MentionOptionComponent;
