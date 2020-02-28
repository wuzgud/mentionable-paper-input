import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { create } from "ember-cli-page-object";
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { waitPromise } from '../../helpers/wait';

import mentionableInputPage from "../../pages/components/mentionable-input-page";

const page = create(mentionableInputPage('[data-test-mentionable-input]'));

module('Integration | Component | mentionable-input', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('newValue', '');
  });

  test('able to select a mention from the mention options dropdown which emits onInputChange action passing the new input value', async function(assert) {
    assert.expect(12);
    let expectedValueEmitted;
    this.set('inputChanged', (val) => {
      assert.equal(val, expectedValueEmitted);
      this.set('newValue', val);
    });

    let expectedMentionStartedVal;
    this.set('setUserMentions', (val) => {
      const assertionMsg = val === null
        ? `onMentionStarted action: null because mention is completed and we are no longer "mentioning" after a mention is clicked`
        : `onMentionStarted action: we have a value of ${val} because mention was just started and is incomplete`;
      assert.equal(val, expectedMentionStartedVal, assertionMsg);
      this.set('mentionOptions', val ? testUsers.map((testUser) => {
        return new User({ name: testUser.name, username: testUser.username });
      }) : []);
    });

    this.set('extractor', (user) => {
      assert.equal(user.username, 'ajball');
      return user.username;
    });

    await render(hbs`
      <MentionableInput
        @value={{this.newValue}}
        @onInputChange={{fn this.inputChanged}}
        @extractMention={{fn this.extractor}}
        @options={{this.mentionOptions}}
        @onMentionStarted={{fn this.setUserMentions}} as |OptionResult|>
          <OptionResult as |user|>
            <span data-test-option-text-primary>{{user.name}}</span>
            <span data-test-option-text-secondary>{{user.username}}</span>
          </OptionResult>
        </MentionableInput>
    `);

    expectedValueEmitted = '@an';
    expectedMentionStartedVal = expectedValueEmitted;
    await page.fillWithWait('@an');

    assert.equal(page.input.value, '@an');
    assert.equal(page.mentionOptions.length, 2);

    expectedMentionStartedVal = null;
    expectedValueEmitted = `@ajball `;
    await page.mentionOptions[0].click();

    assert.equal(page.input.value, '@ajball ', 'space added to end of mention after adding');
    assert.equal(page.inputWithMentions.text, '@ajball');
    assert.equal(page.inputWithMentions.mentions.length, 1);
    assert.equal(page.inputWithMentions.mentions[0].href, '/u/ajball');
    assert.equal(
      this.element.querySelector(page.input.scope + ' textarea'),
      document.activeElement,
      'textarea is still focused after selecting mention'
    );
  });

  test('can set the mention special character prefix via @specialCharacter', async function(assert) {
    this.set('inputChanged', (val) => {
      this.set('newValue', val);
    });

    this.set('setUserMentions', () => {
      this.set('mentionOptions', testUsers.map((testUser) => {
        return new User({ name: testUser.name, username: testUser.username });
      }));
    });

    this.set('extractor', (user) => {
      return user.username;
    });

    await render(hbs`
      <MentionableInput
        @specialCharacter='#'
        @value={{this.newValue}}
        @onInputChange={{fn this.inputChanged}}
        @extractMention={{fn this.extractor}}
        @options={{this.mentionOptions}}
        @onMentionStarted={{fn this.setUserMentions}} as |OptionResult|>
          <OptionResult as |user|>
            <span data-test-option-text-primary>{{user.name}}</span>
            <span data-test-option-text-secondary>{{user.username}}</span>
          </OptionResult>
        </MentionableInput>
    `);

    await page.fillWithWait('@an');

    assert.equal(page.input.value, '@an');
    assert.equal(page.mentionOptions.length, 0);

    await page.fillWithWait('#an');

    assert.equal(page.input.value, '#an');
    assert.equal(page.mentionOptions.length, 2);

    await page.mentionOptions[0].click();

    assert.equal(page.input.value, '#ajball ', 'space added to end of mention after adding');
    assert.equal(page.inputWithMentions.text, '#ajball');
    assert.equal(page.inputWithMentions.mentions.length, 1);
    assert.equal(page.inputWithMentions.mentions[0].href, '/u/ajball');
    assert.equal(
      this.element.querySelector(page.input.scope + ' textarea'),
      document.activeElement,
      'textarea is still focused after selecting mention'
    );
  });

  test('able to use arrow keys and enter to navigate to a mention option and select', async function(assert) {
    this.set('inputChanged', (val) => {
      this.set('newValue', val);
    });

    this.set('setUserMentions', async () => {
      await waitPromise(1000); // Just to make sure it doesn't break if there's a delay setting the options
      this.set('mentionOptions', testUsers.map((testUser) => {
        return new User({ name: testUser.name, username: testUser.username });
      }));
    });

    this.set('extractor', (user) => {
      return user.username;
    });

    await render(hbs`
      <MentionableInput
        @value={{this.newValue}}
        @onInputChange={{fn this.inputChanged}}
        @extractMention={{fn this.extractor}}
        @options={{this.mentionOptions}}
        @onMentionStarted={{fn this.setUserMentions}} as |OptionResult|>
          <OptionResult as |user|>
            <span data-test-option-text-primary>{{user.name}}</span>
            <span data-test-option-text-secondary>{{user.username}}</span>
          </OptionResult>
        </MentionableInput>
    `);

    await page.fillWithWait('@an');

    assert.equal(page.input.value, '@an');
    assert.equal(page.mentionOptions.length, 2);
    page.mentionOptions.forEach((it) => {
      assert.notOk(it.isFocused);
    });

    await page.arrowDown();
    assert.ok(page.mentionOptions[0].isFocused);
    assert.notOk(page.mentionOptions[1].isFocused);

    await page.arrowDown();
    assert.notOk(page.mentionOptions[0].isFocused);
    assert.ok(page.mentionOptions[1].isFocused);

    await page.arrowDown();
    page.mentionOptions.forEach((it) => {
      assert.notOk(it.isFocused);
    });

    await page.arrowUp();
    assert.notOk(page.mentionOptions[0].isFocused);
    assert.ok(page.mentionOptions[1].isFocused);

    await page.arrowUp();
    assert.ok(page.mentionOptions[0].isFocused);
    assert.notOk(page.mentionOptions[1].isFocused);

    await page.enter();

    assert.equal(page.input.value, '@ajball ', 'space added to end of mention after adding');
    assert.equal(page.inputWithMentions.text, '@ajball');
    assert.equal(page.inputWithMentions.mentions.length, 1);
    assert.equal(page.inputWithMentions.mentions[0].href, '/u/ajball');
    assert.equal(
      this.element.querySelector(page.input.scope + ' textarea'),
      document.activeElement,
      'textarea is still focused after selecting mention'
    );
  });
});

const testUsers = [
  {
    "username":"ajball",
    "name":"Andrew Ball",
    "avatarThumbnail":{
      "href":"/images/3592",
      "id":3592
    }
  },
  {
    "username": "janine",
    "name": "Janine Schafer",
    "avatarThumbnail": {
      "href": "/images/3299",
      "id": 3299
    }
  }
];

class User {
  name = null;
  username = null;

  constructor({ name, username }) {
    this.name = name;
    this.username = username;
  }
}
