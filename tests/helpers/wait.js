import { run } from '@ember/runloop';
import { Promise } from 'rsvp';

function wait(assert, timeout= 200) {
    const done = assert.async();

    run.later(this, function() {
        done();
    }, timeout);
}

function waitPromise(timeout= 200) {
    return new Promise(function(resolve){
        run.later(this, function() {
            resolve(true);
        }, timeout);
    });
}

export {
    wait,
    waitPromise
};
