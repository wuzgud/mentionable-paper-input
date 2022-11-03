import Component from '@glimmer/component';

import { htmlSafe } from '@ember/string';
import { action } from '@ember/object';

import {
  addEventListener,
  debounceTask,
  runDisposables
} from "ember-lifeline";
import { arg } from "ember-arg-types";
import { array, bool, instanceOf, string } from 'prop-types';

class StyledMentionText extends Component {
  /**
   * Raw, un-stylized text string value
   * @argument value
   * @type { string }
   */
  @arg(string.isRequired)
  value = '';

  /**
   * List of mentions that have already been added.
   * If the user doesn't pass, any text matching the provided mention pattern will be styled as a mention.
   * @argument existingMentions
   * @type { string[] }
   */
  @arg(array)
  existingMentions;

  /**
   * Regular expression pattern used to match text for mentions.
   * The default one used by this addon is `new RegExp(`\\B@[a-z0-9_.]+`, 'gi')` where '@' is the special character.
   * @argument mentionPattern
   * @type { RegExp }
   */
  @arg(instanceOf(RegExp).isRequired)
  mentionPattern;

  /**
   * Render standalone mention text in readonly mode. Defaults to `false`.
   * @argument readonly
   * @type { boolean }
   */
  @arg(bool)
  readonly = false;

  /**
   * Reference to the textarea DOM element. Not relevant in readonly mode.
   * @argument textAreaElement
   * @type { HTMLElement }
   */
  @arg(instanceOf(HTMLElement))
  textAreaElement;

  /**
   * Optional "on mention click" href override.
   * @argument hrefOverride
   * @type { string }
   */
  @arg(string)
  hrefOverride;

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
      const segments = [htmlSafe(plainText)];
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

  // TODO: Allow consumer more flexibility in how they handle on mention click behavior (e.g. access to actual click event, ability to make href a noop, etc)
  generateMentionSafeHtml(mention, className) {
    const href = this.hrefOverride || `/u/${mention.substring(1)}`;
    return htmlSafe(`<a class="mi-mention ${className}"
                        href="${href}"
                        data-test-mention>
                        ${mention}
                    </a>`);
  }

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

export default StyledMentionText;
