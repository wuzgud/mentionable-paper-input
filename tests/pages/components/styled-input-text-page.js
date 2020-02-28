import { attribute, collection, hasClass } from 'ember-cli-page-object';

export default function(scope) {
    return {
        scope,
        mentions: collection('[data-test-mention]', {
            isIncomplete: hasClass('incomplete'),
            href: attribute('href')
        })
    }
}
