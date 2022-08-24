
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { replaceAt } from '../utils/replace-at';
import { arg } from 'ember-arg-types';
import { array, bool, func, instanceOf, string } from 'prop-types';

class MentionablePaperInputComponent extends Component {
  /**
   * The textarea element's raw text value
   * @argument value
   * @type string
   */
  @arg(string)
  value = '';

  /**
   * A list of mentionable options
   * @argument options
   * @type array
   */
  @arg(array)
  get options() {
    return this.args.options ? this.args.options.slice(0, 6) : [];
  }

  /**
   * Label for the textarea input element
   * @argument label
   * @type string
   */
  @arg(string)
  label = '';

  /**
   * Character used to trigger a mention
   * @argument specialCharacter
   * @default
   * @type string
   */
  @arg(string)
  specialCharacter = '@';

  /**
   * Regular expression pattern used to match text for mentions
   * Defaults to a pattern that matches a string starting with a space-preceded ${this.specialCharacter} followed by an unbroken, successive string of letters, numbers, underscores, and periods
   * @argument mentionPattern
   * @type RegExp
   */
  @arg(instanceOf(RegExp))
  get mentionPattern() {
    const defaultPattern = new RegExp(`\\B${this.specialCharacter}[a-z0-9_.]+`, 'gi');
    return this.args.mentionPattern || defaultPattern;
  }

  /**
   * Used to control visibility of a hint directly underneath textarea element. The hint can instruct users how to mention.
   * Hidden by default.
   * @argument showHint
   * @default
   * @type boolean
   */
  @arg(bool)
  showHint = false;

  /**
   * Executed when a user edits (i.e. add or remove) the textarea's value
   * The pass-thru _onChange call strips excessive spacing (no more than one space between words is allowed)
   * A necessary (and low-cost) compromise to make the css voodoo in `<StyledMentionText />` work
   * @param  { string } newValue The new text value from textarea element
   * @event getMentionOptions emits current mention to parent context via getMentionOptions action argument
   * @see getMentionOptions
   */
  @arg(func.isRequired)
  onChange;

  /**
   * Executed when a user selects a mention from the dropdown
   * @param  { string, Object } option The mention option selected
   * @returns { string } The consuming app must parse the passed option and return a string/display value for the mention
   */
  @arg(func.isRequired)
  onMention;

  /**
   * Executed when it is determined the user is attempting to mention. Consuming app should pass mention options during this step.
   * @param  { string } currentMention The incomplete (i.e. "in progress") mention
   * @see options
   */
  @arg(func.isRequired)
  getMentionOptions;

  @tracked
  alreadyMentioned = [];
  @tracked
  enableMentions = true;
  @tracked
  focusedOptionIndex = 0;

  constructor() {
    super(...arguments);
    // TODO: Handle passed in text with mentions already there
    // this.alreadyMentioned.pushObjects(this.args.prePopulatedMentions || A([]));
  }

  @action
  _onChange(newValue) {
    this.enableMentions = true;
    if (newValue === ' ') newValue = '';
    if (newValue) {
      newValue = newValue.replace(/\s\s+/g, ' ');
    }
    this.onChange(newValue);
    if (this.isMentioning) {
      this.getMentionOptions(this.currentMention.substring(1)); // substring invoked to remove the special character
    }
  }

  @action
  doMention(mentionValue) {
    const fullMentionText = `${this.specialCharacter}${mentionValue}`;
    if (!this.alreadyMentioned.includes(fullMentionText)) {
      this.alreadyMentioned = [
        ...this.alreadyMentioned,
        fullMentionText,
      ];
    }

    if (this.currentMention) {
      const updatedTextWithMention = this.addMentionToText(this.value, this.currentMention, mentionValue);
      this.onChange(updatedTextWithMention);
    }

    this.closeOptionsDropdown();
    this.textAreaElement.focus();
  }

  addMentionToText(text, incompleteMention, mentionValue) {
    const cursorPosition = this.getCursorPosition();
    const startIndexOfMention = cursorPosition - incompleteMention.length;
    return replaceAt(
      text,
      startIndexOfMention,
      `${this.specialCharacter}${mentionValue} `,
      incompleteMention.length + 1 // plus 1 because of extra space added to end of mention
    );
  }

  @action
  closeOptionsDropdown() {
    this.getMentionOptions(null);
    this.enableMentions = false;
    this.focusedOptionIndex = 0;
  }

  @action
  keyDown(event) {
    if (event.key === 'Escape') {
      this.closeOptionsDropdown();
    }
    if (this.isMentioning) {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.processArrowUp();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.processArrowDown(); // TODO: If element is not visible due to scroll, should we scroll newly focused option into view?
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (this.focusedOptionIndex === -1) {
          this.closeOptionsDropdown();
        } else {
          const option = this.options[this.focusedOptionIndex];
          if (option) {
            const mentionText = this.onMention(option);
            this.doMention(mentionText);
          } else {
            this.closeOptionsDropdown();
          }
        }
      }
    }
  }

  processArrowUp() {
    let options = this.options;
    if (!options) { return; }
    if (this.focusedOptionIndex === -1) {
      this.focusedOptionIndex = options.length - 1;
    } else {
      this.focusedOptionIndex--;
    }
  }

  processArrowDown() {
    let options = this.options;
    if (!options) { return; }
    if (this.focusedOptionIndex === (options.length -1)) {
      this.focusedOptionIndex = -1;
    } else {
      this.focusedOptionIndex++;
    }
  }

  get currentMention() {
    const cursorPosition = this.getCursorPosition();
    const text = this.value;
    return this.getMentions(text).find((mention) => {
      const regex = this.getSpecificMentionRegex(mention.substring(1));

      const indicesOfThisMention = [];
      while (regex.exec(text)) {
        indicesOfThisMention.push(regex.lastIndex);
      }
      return indicesOfThisMention.includes(cursorPosition);
    });
  }

  get isMentioning() {
    return !!this.currentMention;
  }

  getMentions(text = '') {
    return text.match(this.mentionPattern) || [];
  }

  getSpecificMentionRegex(mentionValue) {
    const regex = `${this.specialCharacter}\\b${mentionValue}(?!\\S)`;
    return new RegExp(regex, 'g');
  }

  _textAreaWrapperEl;

  @action
  setTextAreaWrapperElement(element) {
    this._textAreaWrapperEl = element;
  }
  get textAreaElement() {
    return this._textAreaWrapperEl ? this._textAreaWrapperEl.querySelector('textarea') : {};
  }
  getCursorPosition() {
    return this.textAreaElement.selectionStart;
  }
}

export default MentionablePaperInputComponent;
