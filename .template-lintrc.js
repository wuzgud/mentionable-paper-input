'use strict';

module.exports = {
  extends: 'recommended',
  rules: {
    'no-implicit-this': {
      allow: ['noop']
    },
    'no-curly-component-invocation': { allow: ['mentionable-paper-input', 'option-result', 'mention-option'] },
    'no-html-comments': false
  },
};
