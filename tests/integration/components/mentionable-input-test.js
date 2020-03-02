import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { create } from "ember-cli-page-object";
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { waitPromise } from '../../helpers/wait';
import getTestUsers from '../../helpers/get-test-users';

import mentionableInputPage from "../../pages/components/mentionable-input-page";

const page = create(mentionableInputPage('[data-test-mentionable-input]'));

module('Integration | Component | mentionable-input', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.set('newValue', '');
  });

  test('able to select a mention from the mention options dropdown which emits onInputChange action passing the new input value',
    async function(assert) {
    assert.expect(14);
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
      this.set('mentionOptions', val ? getTestUsers() : []);
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
            <span>{{user.name}} </span>
            <span>{{user.username}}</span>
          </OptionResult>
        </MentionableInput>
    `);

    expectedValueEmitted = '@an';
    expectedMentionStartedVal = 'an';
    await page.fillWithWait('@an');

    assert.equal(page.input.value, '@an');
    assert.equal(page.mentionOptionsList.mentionOptions.length, 2);
    assert.ok(page.mentionOptionsList.isPresent);

    expectedMentionStartedVal = null;
    expectedValueEmitted = `@ajball `; // extra space at the end is deliberate. reflects actual behavior of component
    await page.mentionOptionsList.mentionOptions[0].click();

    assert.equal(page.input.value, '@ajball ', 'space added to end of mention after adding');
    assert.equal(page.inputWithMentions.text, '@ajball');
    assert.equal(page.inputWithMentions.mentions.length, 1);
    assert.equal(page.inputWithMentions.mentions[0].href, '/u/ajball');
    assert.equal(
      this.element.querySelector(page.input.scope + ' textarea'),
      document.activeElement,
      'textarea is still focused after selecting mention'
    );
    assert.notOk(page.mentionOptionsList.isPresent,
      'Mention options list and help-bar are closed after selecting mention');
  });

  test('it renders mention options correctly if they exist', async function(assert) {
    this.set('inputChanged', (val) => {
      this.set('newValue', val);
    });

    this.set('setUserMentions', (val) => {
      this.set('mentionOptions', val ? getTestUsers() : []);
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
            <span>{{user.name}} </span>
            <span>{{user.username}}</span>
          </OptionResult>
        </MentionableInput>
    `);

    await page.fillWithWait('@an');

    assert.equal(page.mentionOptionsList.mentionOptions.length, 2);
    assert.equal(page.mentionOptionsList.mentionOptions[0].text, 'Andrew Ball ajball');
    assert.equal(page.mentionOptionsList.mentionOptions[1].text, 'Janine Henry janine');
    assert.notOk(page.mentionOptionsList.mentionOptions[0].noResultsMsgExists);
    assert.notOk(page.mentionOptionsList.mentionOptions[1].noResultsMsgExists);
  });

  test('removing character(s) from an added mention starts a new mention and displays the mention as incomplete',
    async function(assert) {
    assert.expect(19);

    let expectedValueEmitted;
    this.set('inputChanged', (val) => {
      assert.equal(val, expectedValueEmitted);
      this.set('newValue', val);
    });

    let expectedMentionStartedVal;
    this.set('setUserMentions', (val) => {
      assert.equal(val, expectedMentionStartedVal);
      this.set('mentionOptions', val ? getTestUsers() : []);
    });

    let expectedExtractedMention;
    this.set('extractor', (user) => {
      assert.equal(user.username, expectedExtractedMention);
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
            <span>{{user.name}} </span>
            <span>{{user.username}}</span>
          </OptionResult>
        </MentionableInput>
    `);

    expectedValueEmitted = '@an';
    expectedMentionStartedVal = 'an';
    await page.fillWithWait('@an');

    expectedValueEmitted = '@ajball ';
    expectedExtractedMention = 'ajball';
    expectedMentionStartedVal = null;
    await page.mentionOptionsList.mentionOptions[0].click();

    assert.equal(page.inputWithMentions.mentions.length, 1);
    assert.notOk(page.inputWithMentions.mentions[0].isIncomplete);
    assert.equal(page.inputWithMentions.text, '@ajball');

    expectedValueEmitted = '@ajbal';
    expectedMentionStartedVal = 'ajbal';
    await page.fillWithWait(page.input.value.slice(0, -2)); //remove last char

    assert.equal(page.inputWithMentions.mentions.length, 1);
    assert.ok(page.inputWithMentions.mentions[0].isIncomplete);
    assert.equal(page.inputWithMentions.text, '@ajbal');

    expectedValueEmitted = '@janine ';
    expectedExtractedMention = 'janine';
    expectedMentionStartedVal = null;
    await page.mentionOptionsList.mentionOptions[1].click();

    assert.equal(page.inputWithMentions.mentions.length, 1);
    assert.notOk(page.inputWithMentions.mentions[0].isIncomplete);
    assert.equal(page.inputWithMentions.text, '@janine');
  });

  test('backspacing to the end of mention triggers onMentionStarted', async function(assert) {
    this.set('inputChanged', (val) => {
      this.set('newValue', val);
    });

    this.set('setUserMentions', (val) => {
      this.set('mentionOptions', val ? getTestUsers() : []);
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
            <span>{{user.name}} </span>
            <span>{{user.username}}</span>
          </OptionResult>
        </MentionableInput>
    `);

    await page.fillWithWait('@an');
    assert.equal(page.mentionOptionsList.mentionOptions.length, 2);
    await page.mentionOptionsList.mentionOptions[0].click();
    assert.equal(page.mentionOptionsList.mentionOptions.length, 0);

    await page.fillWithWait(page.input.value.slice(0, -1)); //remove space to get cursor at end of mention
    assert.equal(page.mentionOptionsList.mentionOptions.length, 2);
  });

  test('can set the mention special character prefix via @specialCharacter', async function(assert) {
    this.set('inputChanged', (val) => {
      this.set('newValue', val);
    });

    this.set('setUserMentions', () => {
      this.set('mentionOptions', getTestUsers());
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
            <span>{{user.name}}</span>
            <span>{{user.username}}</span>
          </OptionResult>
        </MentionableInput>
    `);

    await page.fillWithWait('@an');

    assert.equal(page.input.value, '@an');
    assert.equal(page.mentionOptionsList.mentionOptions.length, 0);

    await page.fillWithWait('#an');

    assert.equal(page.input.value, '#an');
    assert.equal(page.mentionOptionsList.mentionOptions.length, 2);

    await page.mentionOptionsList.mentionOptions[0].click();

    assert.equal(page.input.value, '#ajball ', 'space added to end of mention after adding');
    assert.equal(page.inputWithMentions.text, '#ajball');
    assert.equal(page.inputWithMentions.mentions.length, 1);
    assert.equal(page.inputWithMentions.mentions[0].href, '/u/ajball');
    assert.equal(
      this.element.querySelector(page.input.scope + ' textarea'),
      document.activeElement,
      'textarea is still focused after selecting mention'
    );
    assert.notOk(page.mentionOptionsList.isPresent,
      'Mention options list and help-bar are closed after selecting mention');
  });

  test('able to use arrow keys and enter to navigate to a mention option and select', async function(assert) {
    this.set('inputChanged', (val) => {
      this.set('newValue', val);
    });

    this.set('setUserMentions', async () => {
      await waitPromise(1000); // Just to make sure it doesn't break if there's a delay setting the options
      this.set('mentionOptions', getTestUsers());
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
            <span>{{user.name}}</span>
            <span>{{user.username}}</span>
          </OptionResult>
        </MentionableInput>
    `);

    await page.fillWithWait('@an');

    assert.equal(page.input.value, '@an');
    assert.equal(page.mentionOptionsList.mentionOptions.length, 2);
    page.mentionOptionsList.mentionOptions.forEach((it) => {
      assert.notOk(it.isFocused);
    });

    await page.arrowDown();
    assert.ok(page.mentionOptionsList.mentionOptions[0].isFocused);
    assert.notOk(page.mentionOptionsList.mentionOptions[1].isFocused);

    await page.arrowDown();
    assert.notOk(page.mentionOptionsList.mentionOptions[0].isFocused);
    assert.ok(page.mentionOptionsList.mentionOptions[1].isFocused);

    await page.arrowDown();
    page.mentionOptionsList.mentionOptions.forEach((it) => {
      assert.notOk(it.isFocused);
    });

    await page.arrowUp();
    assert.notOk(page.mentionOptionsList.mentionOptions[0].isFocused);
    assert.ok(page.mentionOptionsList.mentionOptions[1].isFocused);

    await page.arrowUp();
    assert.ok(page.mentionOptionsList.mentionOptions[0].isFocused);
    assert.notOk(page.mentionOptionsList.mentionOptions[1].isFocused);

    await page.pressEnter();

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

  test('it does not start a mention if normal/plain text (i.e. no @, #, ${specialCharacter}) is entered',
    async function(assert) {
    this.set('inputChanged', (val) => {
      this.set('newValue', val);
    });
    this.set('setUserMentions', () => {
      assert.notOk(true, 'onMentionStarted should not be called');
    });
    this.set('extractor', () => {
      assert.notOk(true, 'extractMention should not be called');
    });

    await render(hbs`
      <MentionableInput
        @value={{this.newValue}}
        @onInputChange={{fn this.inputChanged}}
        @extractMention={{fn this.extractor}}
        @options={{this.mentionOptions}}
        @onMentionStarted={{fn this.setUserMentions}} as |OptionResult|>
          <OptionResult as |user|>
            <span>{{user.name}}</span>
            <span>{{user.username}}</span>
          </OptionResult>
        </MentionableInput>
    `);

    await page.fillWithWait('no mention');
    assert.equal(page.input.value, 'no mention');
    assert.notOk(page.mentionOptionsList.mentionOptions.isPresent);
  });

  test('it does not allow more than one space between words', async function(assert) {
    this.set('inputChanged', (val) => {
      this.set('newValue', val);
    });
    this.set('setUserMentions', () => {
      assert.notOk(true, 'onMentionStarted should not be called');
    });
    this.set('extractor', () => {
      assert.notOk(true, 'extractMention should not be called');
    });

    await render(hbs`
      <MentionableInput
        @value={{this.newValue}}
        @onInputChange={{fn this.inputChanged}}
        @extractMention={{fn this.extractor}}
        @options={{this.mentionOptions}}
        @onMentionStarted={{fn this.setUserMentions}} as |OptionResult|>
          <OptionResult as |user|>
            <span>{{user.name}}</span>
            <span>{{user.username}}</span>
          </OptionResult>
        </MentionableInput>
    `);

    await page.fillWithWait('no text with single spaces');
    assert.equal(page.input.value, 'no text with single spaces');

    await page.fillWithWait('no text  with more than   one space    ');
    assert.equal(page.input.value, 'no text with more than one space ');

    await page.fillWithWait(' ');
    assert.equal(page.input.value, '', 'user should not be allowed to start text with a space');
  });

  test('when the options list is empty, it displays a message informing the user that there are no option results',
    async function(assert) {
    assert.expect(4);
    this.set('inputChanged', (val) => {
      this.set('newValue', val);
    });
    this.set('setUserMentions', (val) => {
      assert.equal(val, 'an');
      this.set('mentionOptions', []);
    });
    this.set('extractor', () => {
      assert.notOk(true, 'extractMention should not be called');
    });

    await render(hbs`
      <MentionableInput
        @value={{this.newValue}}
        @onInputChange={{fn this.inputChanged}}
        @extractMention={{fn this.extractor}}
        @options={{this.mentionOptions}}
        @onMentionStarted={{fn this.setUserMentions}} as |OptionResult|>
          <OptionResult as |user|>
            <span>{{user.name}}</span>
            <span>{{user.username}}</span>
          </OptionResult>
        </MentionableInput>
    `);

    await page.fillWithWait('@an');
    assert.equal(page.input.value, '@an');
    assert.equal(page.mentionOptionsList.mentionOptions.length, 1,
      'technically equal to 1 because the no results list item is a mention-option in the DOM');
    assert.equal(page.mentionOptionsList.mentionOptions[0].noResults, 'No results found matching @an');
  });

  test('mentions are structurally distinct from plain input text (i.e. mention text are contained in their own dom element)',
    async function(assert) {
    this.set('inputChanged', (val) => {
      this.set('newValue', val);
    });
    this.set('setUserMentions', (val) => {
      this.set('mentionOptions', val ? getTestUsers() : []);
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
            <span>{{user.name}} </span>
            <span>{{user.username}}</span>
          </OptionResult>
        </MentionableInput>
    `);

    await page.fillWithWait('@an');
    await page.mentionOptionsList.mentionOptions[0].click();
    assert.equal(page.inputWithMentions.mentions.length, 1);
    assert.notOk(page.mentionOptionsList.mentionOptions.isPresent);
    assert.equal(page.inputWithMentions.text, '@ajball');

    await page.fillWithWait(page.input.value + '@jan');
    assert.notOk(page.inputWithMentions.mentions[0].isIncomplete);
    assert.ok(page.inputWithMentions.mentions[1].isIncomplete);
    await page.mentionOptionsList.mentionOptions[1].click();
    assert.equal(page.inputWithMentions.mentions.length, 2);
    assert.notOk(page.inputWithMentions.mentions[0].isIncomplete && page.inputWithMentions.mentions[1].isIncomplete,
      'able to add duplicate mentions');
    assert.equal(page.inputWithMentions.text, '@ajball @janine');

    await page.fillWithWait(page.input.value + ' no mention text');
    assert.notOk(page.mentionOptionsList.mentionOptions.isPresent);
    assert.equal(page.inputWithMentions.text, '@ajball @janine no mention text');
    assert.equal(page.inputWithMentions.mentions.length, 2, 'still have only two completed mentions');
  });

  test('it is able to show a hint', async function(assert) {
    this.set('inputChanged', (val) => {
      this.set('newValue', val);
    });
    this.set('setUserMentions', () => {
      this.set('mentionOptions', []);
    });
    this.set('extractor', () => {
      assert.notOk(true, 'extractMention should not be called');
    });
    this.set('showHint', true);
    this.set('specialChar', '#');

    await render(hbs`
      <MentionableInput
        @showHint={{this.showHint}}
        @specialCharacter={{this.specialChar}}
        @value={{this.newValue}}
        @onInputChange={{fn this.inputChanged}}
        @extractMention={{fn this.extractor}}
        @options={{this.mentionOptions}}
        @onMentionStarted={{fn this.setUserMentions}} as |OptionResult|>
          <OptionResult as |user|>
            <span>{{user.name}}</span>
            <span>{{user.username}}</span>
          </OptionResult>
        </MentionableInput>
    `);

    assert.equal(page.hint, 'Type "#" to mention');
    this.set('specialChar', null);
    assert.equal(page.hint, 'Type "@" to mention');
    this.set('showHint', false);
    assert.notOk(page.hintIsPresent, 'Hint is not present');
  });

  test(`textarea element's font is not visible`, async function(assert) {
    this.set('inputChanged', (val) => {
      this.set('newValue', val);
    });
    this.set('setUserMentions', (val) => {
      this.set('mentionOptions', val ? getTestUsers() : []);
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
            <span>{{user.name}}</span>
            <span>{{user.username}}</span>
          </OptionResult>
        </MentionableInput>
    `);

    const assertionMsg = (cssProp, val) => `font color appears transparent when ${cssProp} value is ${val}`;
    const expectedTextShadowColor = 'rgba(0, 0, 0, 0) 0px 0px 0px';
    const expectedTextFillColor = 'rgba(0, 0, 0, 0)';
    const expectedTextShadow = { 'text-shadow': expectedTextShadowColor };
    const expectedTextFill = { '-webkit-text-fill-color': expectedTextFillColor };

    assert.dom(page.input.getTextareaEl())
      .hasStyle(expectedTextShadow, assertionMsg('text-shadow', expectedTextShadowColor));
    assert.dom(page.input.getTextareaEl())
      .hasStyle(expectedTextFill, assertionMsg('-webkit-text-fill-color', expectedTextFillColor));
  });
});
