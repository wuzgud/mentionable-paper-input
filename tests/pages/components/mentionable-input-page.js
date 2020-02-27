import { collection, clickable, text, triggerable,hasClass } from 'ember-cli-page-object';
import { waitPromise } from "../../helpers/wait";
import textarea from './paper/paper-textarea-page';
import styledInputText from "./styled-input-text-page";

export default function(scope){
    return {
        scope,
        input: textarea('[data-test-mention-input]'),
        arrowUp: triggerable('keydown', '[data-test-mention-input] textarea',  { eventProperties: { key: 'ArrowUp' } }),
        arrowDown: triggerable('keydown', '[data-test-mention-input] textarea',  { eventProperties: { key: 'ArrowDown' } }),
        enter: triggerable('keydown', '[data-test-mention-input] textarea',  { eventProperties: { key: 'Enter' } }),
        fillWithWait: async function(value) {
            await this.input.textarea(value);
            await waitPromise(150);
        },
        hint: text('[data-test-mention-hint]'),
        inputWithMentions: styledInputText('[data-test-text-with-mention-styling]'),
        helpBar: {
          scope: '[data-test-help-bar]',
          text: text('[data-test-help-bar-text]'),
          closeWrap: {
            scope: '[data-test-help-bar-close]',
            button: clickable('[data-test-close-x]')
          }
        },
        mentionOptions: collection('[data-test-mention-option]', {
            primary: text('[data-test-primary]'),
            subtext: text('[data-test-subtext]'),
            isFocused: hasClass('focused')
        }),
        noResults: text('[data-test-no-mention-options-text]')
    }
}
