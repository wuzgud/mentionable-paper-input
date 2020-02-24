import {
    fillable,
    text,
    collection,
    value
} from 'ember-cli-page-object';

export default function(selector){
    return {
        scope: selector,
        textarea: fillable('textarea'),
        errors: collection('.paper-input-error', {
            message: text()
        }),
        label: text('label'),
        value: value('textarea')
    }
}
