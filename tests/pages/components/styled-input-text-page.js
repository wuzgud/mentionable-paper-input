import { attribute, collection, hasClass } from 'ember-cli-page-object';

export default function(scope){
    return {
        scope,
        mentions: collection('[data-test-mention]', {
            incomplete: hasClass('incomplete'),
            href: attribute('href')
        })
    }
}
