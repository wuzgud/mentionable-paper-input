import {
  attribute,
  clickable,
  collection,
  hasClass,
  isPresent,
  text
} from 'ember-cli-page-object';

export default function(scope) {
  return {
    scope,
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
