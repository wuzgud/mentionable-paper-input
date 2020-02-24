import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { create } from "ember-cli-page-object";
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

import mentionableInputPage from "../../pages/components/mentionable-input-page";

const page = create(mentionableInputPage('[data-test-mentionable-input]'));

module('Integration | Component | mentionable-input', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('newValue', '');
});

  test('able to select a mention from the mention options dropdown which emits onInputChange action passing the new input value', async function(assert) {
    assert.expect(10);
    let expectedValueEmitted;
    this.set('inputChanged', (val) => {
      assert.equal(val, expectedValueEmitted);
      this.set('newValue', val);
    });

    let expectedMentionStartedVal;
    this.set('setUserMentions', (val) => {
      assert.equal(val, expectedMentionStartedVal);
      this.set('mentionOptions', testUsers.map((testUser) => {
        return new User({ name: testUser.name, username: testUser.username });
      }));
    });

    await render(hbs`
      <MentionableInput
        @value={{this.newValue}}
        @onInputChange={{fn this.inputChanged}}
        @onMentionStarted={{fn this.setUserMentions}} as |mentionInput|>
          <mentionInput.mentionOptions @options={{this.mentionOptions}} as |options|>
            <options.option
                    @mentionKey={{"username"}}
                    @displayKey={{"name"}} />
          </mentionInput.mentionOptions>
        </MentionableInput>
    `);

    expectedValueEmitted = '@an';
    expectedMentionStartedVal = expectedValueEmitted;
    await page.fillWithWait('@an');

    assert.equal(page.input.value, '@an');
    assert.equal(page.mentionOptions.length, 2);

    expectedMentionStartedVal = '@ajball';
    expectedValueEmitted = `${expectedMentionStartedVal} `;
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
