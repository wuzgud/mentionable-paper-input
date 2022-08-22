import { isPresent, text, triggerable } from 'ember-cli-page-object';
import { waitPromise } from '../../helpers/wait';
import mentionOptionsPage from './mention-options-page'
import textarea from './paper/paper-textarea-page';
import styledMentionText from './styled-mention-text-page';

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
    styledInput: styledMentionText('[data-test-text-with-mention-styling]'),
    mentionOptionsList: mentionOptionsPage('[data-test-mention-options-list-wrap]')
  }
}
