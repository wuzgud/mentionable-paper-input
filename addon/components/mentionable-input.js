import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { A } from '@ember/array';
import { action } from '@ember/object';
import { assert } from '@ember/debug';

class MentionableInputComponent extends Component {
  /**
   * Internally tracked state
   */
  @tracked
  alreadyMentioned = A([]);
  @tracked
  enableMentions = true;

  // ===================== Public getters for this component's input parameters =====================

  /**
   * The textarea element's raw text value
   * @return { String } textarea value
   */
  get value() {
    return this.args.value;
  }
  /**
   * Label for the textarea element
   * @return { String } Textarea label
   */
  get label() {
    return this.args.label || '';
  }
  /**
   * Character used to trigger a mention
   * @return { String } Character used to trigger mention. Defaults to "@" if not overridden by the addon consumer
   */
  get specialCharacter() {
    return this.args.specialCharacter || '@';
  }
  /**
   * Regular expression pattern used to match text for mentions
   * @return { RegExp } Defaults to a pattern that matches a string
   *    starting with a space-preceded "@" followed by a continuous string of letters, numbers, underscores, and periods
   */
  get mentionPattern() {
    return this.args.mentionPattern || /\B@[a-z0-9_.]+/gi;
  }
  /**
   * Used to control visibility of a hint directly underneath textarea element. The hint instructs users how to mention
   * @return { boolean } true shows the hint and false hides it
   */
  get showHint() {
    return !!this.args.showHint;
  }

  /**
   * Check for mandatory input params and initialize array tracking mentions that have already been added
   */
  constructor() {
    super(...arguments);
    assert(
      '<MentionableInput> requires a bound `onInputChange` action which accepts the current text value as an argument',
      this.args.onInputChange && typeof this.args.onInputChange === 'function'
    );
    assert(
      '<MentionableInput> requires a bound `onMentionTriggered` action which accepts the current mention as an argument',
      this.args.onMentionTriggered && typeof this.args.onMentionTriggered === 'function'
    );
    this.alreadyMentioned = A([]).concat(this.args.prePopulatedMentions || []);
  }

  /**
   * Executed when a user adds or removes text in the textarea
   * Strips excessive spacing (no more than one space between words is allowed)
   * A necessary (and low-cost) compromise to make the styling hackery in StyledInputText work
   * @param  { String } newValue Complete mention value (e.g. a user's full username)
   * @return { action<String> } emits updated textarea value to parent context via onInputChange action binding
   * @return { action<String> } emits current mention (see currentMention) to parent context via onMentionTriggered action
   */
  @action
  onInputChange(newValue) {
    this.enableMentions = true;
    if (newValue === ' ') newValue = '';
    if (newValue) {
      newValue = newValue.replace(/\s\s+/g, ' ');
    }
    this.args.onInputChange(newValue);
    if (this.isMentioning) {
      this.args.onMentionTriggered(this.currentMention);
    }
  }

  /**
   * Executed when a user clicks on a mention result in the mention options dropdown
   * Completes the mention by adding it to the textarea text and pushing it to the array tracking added mentions
   * Refocuses textarea element
   * @param  { String } optionDisplayText Complete mention value (e.g. a user's full username)
   * @return { action<String> } emits updated textarea text value to parent context via onInputChange action binding
   */
  @action
  doMention(optionDisplayText) {
    if (!this.alreadyMentioned.includes(`@${optionDisplayText}`)) {
      this.alreadyMentioned.pushObject(`@${optionDisplayText}`);
    }

    const updatedTextWithMention = this.addMentionToText(this.value, this.currentMention, optionDisplayText);
    this.args.onInputChange(updatedTextWithMention);
    // if the current/incomplete mention and optionDisplayText are the same, the overall textarea value won't be affected and the options dropdown won't close
    if (this.currentMention === optionDisplayText) {
      this.closeOptionsDropdown();
    }

    this.textAreaElement.focus();
  }
  /**
   * Helper function to add a completed mention to a given text value
   * @param  { String } text Text to add the mention to (in this case, the current value of the textarea element)
   * @param  { String } incompleteMention The current, incomplete mention value (e.g. a user's incomplete username, andrew.b)
   * @param  { String } optionDisplayText Complete mention value (e.g. a user's full username, andrew.ball)
   * @return { String } text with the new mention added
   */
  addMentionToText(text, incompleteMention, optionDisplayText) {
    const cursorPosition = this.getCursorPosition();
    const startIndexOfMention = cursorPosition - incompleteMention.length;
    return replaceAt(
      text,
      startIndexOfMention,
      `@${optionDisplayText} `,
      incompleteMention.length + 1 // plus 1 because of extra space added to end of mention
    );
  }
  /**
   * Hides mention options dropdown. Executed when a user clicks the close button on the mention options dropdown
   */
  @action
  closeOptionsDropdown() {
    this.args.onMentionTriggered(null);
    this.enableMentions = false;
  }
  /**
   * Binds to the textarea's key down event and closes the mention options dropdown if the "Escape" key is pressed
   * Only available on non-mobile screen sizes
   * @param  { KeyboardEvent } event The key down event. Used to check the key property
   * @todo support up/down arrow and enter to cycle and select mention options
   */
  @action
  keyDown(event) {
    if (event.key === 'Escape') {
      this.closeOptionsDropdown();
    }
  }
  /**
   * Check if we have (or don't have) a mention that is currently being added
   * @return { boolean }
   */
  get isMentioning() {
    return !!this.currentMention;
  }
  /**
   * Getter function to get the mention currently being added (see findCurrentMention)
   */
  get currentMention() {
    return this.findCurrentMention();
  }
  /**
   * Gets all mentions in a given string matching the mentionPattern
   * @return { string[] } all mentions in a given string of text
   */
  getMentions(text) {
    text = text || '';
    return text.match(this.mentionPattern) || [];
  }
  /**
   * Finds the mention the user is currently adding based on the position of the user's cursor inside the textarea
   * @return { String } the current (incomplete) mention
   */
  findCurrentMention() {
    const cursorPosition = this.getCursorPosition();
    const text = this.value;
    return this.getMentions(text).find((mention) => {
      const regex = this.getSpecificMentionRegex(mention.substring(1));

      const indicesOfThisMention = [];
      while (regex.exec(text)){
        indicesOfThisMention.push(regex.lastIndex);
      }
      return indicesOfThisMention.includes(cursorPosition);
    });
  }
  /**
   * Creates a regular expression that can be used to match text for a specific mention
   * @param  { String } optionDisplayText The full display value for a mention option (e.g. a user's username)
   * @return { RegExp } regular expression to match a mention option's full display value
   */
  getSpecificMentionRegex(optionDisplayText) {
    const regex = `@\\b${optionDisplayText}(?!\\S)`;
    return new RegExp(regex, 'g');
  }

  // ===================== DOM helper functions =====================

  // reference modifier to the textarea paper element wrapper
  // Use textarea getter to get a reference to the actual textarea element
  textAreaWrapperEl;
  @action
  setTextAreaWrapperElement(element) {
    this.textAreaWrapperEl = element;
  }
  get textAreaElement() {
    return this.textAreaWrapperEl ? this.textAreaWrapperEl.querySelector('textarea') : {};
  }
  getCursorPosition() {
    return this.textAreaElement.selectionStart;
  }
}

function replaceAt(text, index, replacementText, replacedTextLength){
  return text.substr(0, index) + replacementText + text.substr(index + replacedTextLength);
}

export default MentionableInputComponent;
