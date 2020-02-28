import { Promise } from 'rsvp';
import { run } from '@ember/runloop';

function wait(assert, timeout= 200) {
    const done = assert.async();
    run.later(this, () => {
        done();
    }, timeout);
}

function waitPromise(timeout= 200) {
    return new Promise((resolve) => {
        run.later(this, () => {
            resolve(true);
        }, timeout);
    });
}

export {
    wait,
    waitPromise
};
