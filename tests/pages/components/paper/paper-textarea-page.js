import { find } from '@ember/test-helpers';
import { collection, fillable, text, value } from 'ember-cli-page-object';

export default function(selector) {
  return {
    scope: selector,
    textarea: fillable('textarea'),
    errors: collection('.paper-input-error', {
        message: text()
    }),
    label: text('label'),
    value: value('textarea'),
    getTextareaEl: () => {
      return find(`${selector} textarea`);
    }
  }
}
