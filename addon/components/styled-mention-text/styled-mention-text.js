import Component from '@glimmer/component';

import { htmlSafe } from '@ember/string';
import { action } from '@ember/object';

import {
  addEventListener,
  debounceTask,
  runDisposables
} from "ember-lifeline";

class StyledMentionTextComponent extends Component {
  /**
   * Raw, un-stylized text string value
   * @return { String }
   */
  get value() {
    return this.args.value;
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

  /**
   * Render standalone mention text in readonly mode
   * @return { boolean }
   */
  get readonly() {
    return this.args.readonly;
  }

  /**
   * Reference to the textarea DOM element. Not relevant in readonly mode
   * @return { Element }
   */
  get textAreaElement() {
    return this.args.textAreaElement;
  }

  /**
   * Optional "on mention click" href override
   * @return { String }
   */
  get hrefOverride() {
    return this.args.hrefOverride;
  }

  constructor() {
    super(...arguments);
    if (!this.readonly) {
      addEventListener(this, window, 'resize',
        () => debounceTask(this, 'setReplacementTextWidth', 200)
      );
    }
  }

  willDestroy() {
    if (!this.readonly) {
      runDisposables();
    }
  }

  get textSegments() {
    const value = this.value;
    if (!value) {
      return [];
    }
    const mentionRegex = this.mentionPattern;
    const mentions = value.match(mentionRegex) || [];
    const plainTextSegments = value.split(mentionRegex);
    return plainTextSegments.flatMap((plainText, i) => {
      const segments = [plainText];
      if (mentions[i]) {
        const mention = mentions[i];
        const cssClass = this.isIncompleteMention(mention) ? 'mi-incomplete' : '';
        const mentionHtml = this.generateMentionSafeHtml(mention, cssClass);
        segments.push(mentionHtml.toString());
      }
      return segments;
    });
  }

  // don't want to highlight mentions that aren't actually mentions
  isIncompleteMention(mention) {
    const existingMentions = this.existingMentions;
    return !!existingMentions && !existingMentions.includes(mention);
  }

  // TODO: Allow consumer more flexibility in how they handle on mention click behavior (e.g. access to actual click event, ability to make href a noop, etc)
  generateMentionSafeHtml(mention, className) {
    const href = this.hrefOverride || `/u/${mention.substring(1)}`;
    return htmlSafe(`<a class="mi-mention ${className}"
                        href="${href}"
                        data-test-mention>
                        ${mention}
                    </a>`);
  }

  // ===================== DOM helper functions =====================

  replacementTextEl; // reference modifier to replacement text element

  @action
  setStyledMentionTextReference(element) {
    this.replacementTextEl = element;
  }

  setReplacementTextWidth() {
    if (this.textAreaElement && this.replacementTextEl) {
      const widthFloat = parseFloat(this.textAreaWidth);
      this.replacementTextEl.style.width = `${widthFloat - 4}px`; // -4 to account for textarea horizontal padding
    }
  }

  get textAreaWidth() {
    return window.getComputedStyle(this.textAreaElement).width;
  }
}

export default StyledMentionTextComponent;
