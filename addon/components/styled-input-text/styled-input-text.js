import Component from '@glimmer/component';

import { htmlSafe } from '@ember/string';
import { action } from '@ember/object';

import { addEventListener, debounceTask, runDisposables } from "ember-lifeline";
import { tagName } from '@ember-decorators/component';

@tagName('')
class StyledInputTextComponent extends Component {
  /**
   * Raw, un-stylized text string value
   * @return { String }
   */
  get rawValue() {
    return this.args.rawValue;
  }
  /**
   * List of mentions that have already been added.
   * If the user doesn't pass, any text matching the provided mention pattern will be styled as a mention
   * @return { String[] }
   */
  get existingMentions() {
    return this.args.existingMentions;
  }
  /**
   * Regular expression pattern used to match text for mentions
   * @return { RegExp }
   */
  get mentionPattern() {
    return this.args.mentionPattern;
  }

  constructor() {
    super(...arguments);
    if (!this.args.isStatic) {
      addEventListener(this, window, 'resize',
        () => debounceTask(this, 'setReplacementTextWidth', 200)
      );
    }
  }
  willDestroy() {
    if (!this.args.isStatic) {
      runDisposables(this);
    }
  }

  get textSegments() {
    const rawValue = this.rawValue;
    if (!rawValue) {
      return [];
    }
    const mentionRegex = this.mentionPattern;
    const mentions = rawValue.match(mentionRegex) || [];
    const plainTextSegments = rawValue.split(mentionRegex);
    return plainTextSegments.flatMap( (plainText, i) => {
      const segments = [ plainText ];
      if (mentions[i]) {
        const mention = mentions[i];
        const cssClass = this.isIncompleteMention(mention) ? 'mi-incomplete' : '';
        const mentionHtml = this.generateMentionSafeHtml(mention, cssClass);
        segments.push(mentionHtml);
      }
      return segments;
    });
  }
  // don't want to highlight mentions that aren't actually mentions
  isIncompleteMention(mention) {
    const existingMentions = this.existingMentions;
    return !!existingMentions && !existingMentions.includes(mention);
  }
  generateMentionSafeHtml(mention, className) {
    return htmlSafe(`<a class="mi-mention ${className}"
                        href="/u/${mention.substring(1)}"
                        data-test-mention>
                        ${mention}
                    </a>`);
  }

  // ===================== DOM helper functions =====================

  replacementTextEl; // reference modifier to replacement text element

  @action
  setStyledInputTextReference(element) {
    this.replacementTextEl = element;
  }
  setReplacementTextWidth() {
    if (this.args.textAreaElement && this.replacementTextEl) {
      const widthFloat = parseFloat(this.textAreaWidth);
      this.replacementTextEl.style.width = `${widthFloat - 4}px`; // -4 to account for textarea horizontal padding
    }
  }
  get textAreaWidth() {
    return window.getComputedStyle(this.args.textAreaElement).width;
  }
}

export default StyledInputTextComponent;
