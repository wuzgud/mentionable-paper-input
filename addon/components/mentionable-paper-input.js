import { assert } from '@ember/debug';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { replaceAt } from '../utils/replace-at';

class MentionablePaperInputComponent extends Component {
  /**
   * Internally tracked state
   */
  @tracked
  alreadyMentioned = [];
  @tracked
  enableMentions = true;
  @tracked
  focusedOptionIndex = 0;

  // ===================== Getters for <MentionablePaperInput>'s args =====================

  /**
   * The textarea element's raw text value
   * @return { String } textarea value
   */
  get value() {
    return this.args.value;
  }
  /**
   * The textarea element's raw text value
   * @return { String } textarea value
   */
  get options() {
    return this.args.options ? this.args.options.slice(0, 6) : [];
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
   * @return { RegExp } the user passed pattern or the default
   */
  get mentionPattern() {
    return this.args.mentionPattern || this.defaultRegex;
  }
  /**
   * Regular expression pattern used to match text for mentions
   * @return { RegExp } Defaults to a pattern that matches a string
   *    starting with a space-preceded ${this.specialCharacter} followed by an unbroken, successive string of letters, numbers, underscores, and periods
   */
  get defaultRegex() {
    //TODO: this.specialCharacter needs to be escaped properly so that special regex characters could be used literally (eg $)
    return new RegExp(`\\B${this.specialCharacter}[a-z0-9_.]+`, 'gi');
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
      '<MentionablePaperInput> requires a bound `onChange` action which accepts the current text value as an argument',
      this.args.onChange && typeof this.args.onChange === 'function'
    );
    assert(
      '<MentionablePaperInput> requires a bound `onMention` action which accepts the current mention as an argument',
      this.args.onMention && typeof this.args.onMention === 'function'
    );
    assert(
      '<MentionablePaperInput> requires a bound `getMentionOptions` action which accepts a mention option as an argument',
      this.args.getMentionOptions && typeof this.args.getMentionOptions === 'function'
    );
    // TODO: Handle passed in text with mentions already there
    // this.alreadyMentioned.pushObjects(this.args.prePopulatedMentions || A([]));
  }

  /**
   * Executed when a user edits (i.e. add or remove) the textarea's value
   * Strips excessive spacing (no more than one space between words is allowed)
   * A necessary (and low-cost) compromise to make the css voodoo in `<StyledInputText />` work
   * @param  { String } newValue The new, raw text value from textarea element
   * @event onChange emits updated textarea value to parent context via onChange action binding

   * @event getMentionOptions emits current mention to parent context via getMentionOptions action
   * @see currentMention
   */
  @action
  onChange(newValue) {
    this.enableMentions = true;
    if (newValue === ' ') newValue = '';
    if (newValue) {
      newValue = newValue.replace(/\s\s+/g, ' ');
    }
    this.args.onChange(newValue);
    if (this.isMentioning) {
      this.args.getMentionOptions(this.currentMention.substring(1)); // substring invoked to remove the special character
    }
  }

  /**
   * Executed when a user selects a mention result in the mention options dropdown
   * Completes the mention by adding it to the textarea text and pushing it to the array tracking added mentions
   * Refocuses textarea element
   * @param  { String } mentionValue Complete mention value (e.g. a user's full username)
   * @event this.args.onChange emits updated textarea text value to parent context
   */
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
      this.args.onChange(updatedTextWithMention);
    }

    this.closeOptionsDropdown();
    this.textAreaElement.focus();
  }
  /**
   * Helper function to add a completed mention to a given text value
   * @param  { String } text Text to add the mention to (in this case, the current value of the textarea element)
   * @param  { String } incompleteMention The current, incomplete mention value (e.g. a user's incomplete username, andrew.b)
   * @param  { String } mentionValue Complete mention value (e.g. a user's full username, andrew.ball)
   * @return { String } text with the new mention added
   */
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
  /**
   * Hides mention options dropdown
   */
  @action
  closeOptionsDropdown() {
    this.args.getMentionOptions(null);
    this.enableMentions = false;
    this.focusedOptionIndex = 0;
  }
  /**
   * Binds to the textarea's key down event and closes the mention options dropdown
   * this action delegates various key down events like close with escape,
   * and navigating to/selecting a mention when the user mentions via enter and arrow keys
   * @param  { KeyboardEvent } event The key down event. Used to check the key property
   */
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
            const mentionText = this.args.onMention(option);
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
  /**
   * Check if we have (or don't have) a mention that is currently being added
   * @return { boolean }
   */
  get isMentioning() {
    return !!this.currentMention;
  }
  /**
   * Getter function to get the mention currently being added
   * @see findCurrentMention
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

  // TODO: This function seems redundant with the currentMention getter above...maybe consolidate?
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
      while (regex.exec(text)) {
        indicesOfThisMention.push(regex.lastIndex);
      }
      return indicesOfThisMention.includes(cursorPosition);
    });
  }
  /**
   * Creates a regular expression that can be used to match text for a specific mention
   * @param  { String } mentionValue The full display value for a mention option (e.g. a user's username)
   * @return { RegExp } regular expression to match a mention option's full display value
   */
  getSpecificMentionRegex(mentionValue) {
    const regex = `${this.specialCharacter}\\b${mentionValue}(?!\\S)`;
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

export default MentionablePaperInputComponent;
