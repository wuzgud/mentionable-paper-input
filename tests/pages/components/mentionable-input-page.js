import { clickable, collection, hasClass, text, triggerable, isPresent, attribute } from 'ember-cli-page-object';
import { waitPromise } from "../../helpers/wait";
import textarea from './paper/paper-textarea-page';
import styledInputText from "./styled-input-text-page";

export default function(scope) {
  return {
    scope,
    input: textarea('[data-test-mention-input]'),
    fillWithWait: async function(value) {
      await this.input.textarea(value);
      await waitPromise(150);
    },
    arrowUp: triggerable('keydown', '[data-test-mention-input] textarea',  {
      eventProperties: {
        key: 'ArrowUp'
      }
    }),
    arrowDown: triggerable('keydown', '[data-test-mention-input] textarea',  {
      eventProperties: {
        key: 'ArrowDown'
      }
    }),
    pressEnter: triggerable('keydown', '[data-test-mention-input] textarea',  {
      eventProperties: {
        key: 'Enter'
      }
    }),
    pressEscape: triggerable('keydown', '[data-test-mention-input] textarea',  {
      eventProperties: {
        key: 'Escape'
      }
    }),
    hint: text('[data-test-mention-hint]'),
    hintIsPresent: isPresent('[data-test-mention-hint]'),
    styledInput: styledInputText('[data-test-text-with-mention-styling]'),
    mentionOptionsList: {
      scope: '[data-test-mention-options-list-wrap]',
      helpBar: {
        scope: '[data-test-help-bar]',
        currentMention: text('[data-test-help-bar-text]'),
        closeWrap: {
          scope: '[data-test-help-bar-close]',
          button: clickable('[data-test-close-x]'),
        }
      },
      mentionOptions: collection('[data-test-mention-option]', {
        isFocused: hasClass('focused'),
        ariaCurrent: attribute('aria-current'),
        noResults: text('[data-test-no-mention-options-text]'),
        noResultsMsgExists: isPresent('[data-test-no-mention-options-text]')
      })
    }
  }
}
