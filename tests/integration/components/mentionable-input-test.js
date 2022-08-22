import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { create } from "ember-cli-page-object";
import { setupRenderingTest } from 'ember-qunit';
import { setBreakpoint } from 'ember-responsive/test-support';
import { module, test } from 'qunit';
import { getBigArrayTestUsers, getTestUsers } from '../../helpers/get-test-users';
import { waitPromise } from '../../helpers/wait';

import MentionablePaperInputPage from "../../pages/components/mentionable-input-page";

const page = create(MentionablePaperInputPage('[data-test-mentionable-input]'));

module('Integration | Component | mentionable-paper-input', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('newValue', '');
  });

  test('able to select a mention from the mention options dropdown which emits onChange action passing the new input value',
    async function (assert) {
      assert.expect(14);
      let expectedValueEmitted;
      this.set('inputChanged', (val) => {
        assert.equal(val, expectedValueEmitted);
        this.set('newValue', val);
      });

      let expectedMentionStartedVal;
      this.set('setUserMentions', (val) => {
        const assertionMsg = val === null
          ? `getMentionOptions action: null because mention is completed and we are no longer "mentioning" after a mention is clicked`
          : `getMentionOptions action: we have a value of ${val} because mention was just started and is incomplete`;
        assert.equal(val, expectedMentionStartedVal, assertionMsg);
        this.set('mentionOptions', val ? getTestUsers() : []);
      });

      this.set('extractor', (user) => {
        assert.equal(user.username, 'ajball');
        return user.username;
      });

      await render(hbs`
      <MentionablePaperInput
        @value={{this.newValue}}
        @onChange={{fn this.inputChanged}}
        @onMention={{fn this.extractor}}
        @options={{this.mentionOptions}}
        @getMentionOptions={{fn this.setUserMentions}} as |OptionResult|>
          <OptionResult as |user|>
            <span>{{user.name}} </span>
            <span>{{user.username}}</span>
          </OptionResult>
        </MentionablePaperInput>
    `);

      expectedValueEmitted = '@an';
      expectedMentionStartedVal = 'an';
      await page.fillWithWait('@an');

      assert.equal(page.input.value, '@an');
      assert.equal(page.mentionOptionsList.mentionOptions.length, 2);
      assert.ok(page.mentionOptionsList.isPresent);

      expectedMentionStartedVal = null;
      expectedValueEmitted = '@ajball ';
      await page.mentionOptionsList.mentionOptions[0].click();

      assert.equal(page.input.value, '@ajball ', 'space added to end of mention after mention is added');
      assert.equal(page.styledInput.text, '@ajball');
      assert.equal(page.styledInput.mentions.length, 1);
      assert.equal(page.styledInput.mentions[0].href, '/u/ajball');
      assert.equal(
        this.element.querySelector(page.input.scope + ' textarea'),
        document.activeElement,
        'textarea is still focused after selecting mention'
      );
      assert.notOk(page.mentionOptionsList.isPresent,
        'Mention options list and help-bar are closed after selecting mention');
    });

  test('it renders mention options correctly if they exist', async function (assert) {
    this.set('inputChanged', val => this.set('newValue', val));
    this.set('setUserMentions', val => this.set('mentionOptions', val ? getTestUsers() : []));
    this.set('extractor', user => user.username);

    await render(hbs`
      <MentionablePaperInput
        @value={{this.newValue}}
        @onChange={{fn this.inputChanged}}
        @onMention={{fn this.extractor}}
        @options={{this.mentionOptions}}
        @getMentionOptions={{fn this.setUserMentions}} as |OptionResult|>
          <OptionResult as |user|>
            <span>{{user.name}} </span>
            <span>{{user.username}}</span>
          </OptionResult>
        </MentionablePaperInput>
    `);

    await page.fillWithWait('@an');

    assert.equal(page.mentionOptionsList.mentionOptions.length, 2);
    assert.equal(page.mentionOptionsList.mentionOptions[0].text, 'Andrew Ball ajball');
    assert.equal(page.mentionOptionsList.mentionOptions[1].text, 'Janine Henry janine');
    assert.notOk(page.mentionOptionsList.mentionOptions[0].noResultsMsgExists);
    assert.notOk(page.mentionOptionsList.mentionOptions[1].noResultsMsgExists);
  });

  test('it renders a maximum of 6 mention options', async function (assert) {
    const testUsers = getBigArrayTestUsers();
    this.set('inputChanged', val => this.set('newValue', val));
    this.set('setUserMentions', val => this.set('mentionOptions', val ? testUsers : []));
    this.set('extractor', user => user.username);

    await render(hbs`
      <MentionablePaperInput
        @value={{this.newValue}}
        @onChange={{fn this.inputChanged}}
        @onMention={{fn this.extractor}}
        @options={{this.mentionOptions}}
        @getMentionOptions={{fn this.setUserMentions}} as |OptionResult|>
          <OptionResult as |user|>
            <span>{{user.name}} </span>
            <span>{{user.username}}</span>
          </OptionResult>
        </MentionablePaperInput>
    `);

    await page.fillWithWait('@an');

    assert.ok(testUsers.length > 6);
    assert.equal(page.mentionOptionsList.mentionOptions.length, 6);
  });

  test('removing character(s) from an added mention starts a new mention and displays the mention as incomplete',
    async function (assert) {
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
      <MentionablePaperInput
        @value={{this.newValue}}
        @onChange={{fn this.inputChanged}}
        @onMention={{fn this.extractor}}
        @options={{this.mentionOptions}}
        @getMentionOptions={{fn this.setUserMentions}} as |OptionResult|>
          <OptionResult as |user|>
            <span>{{user.name}} </span>
            <span>{{user.username}}</span>
          </OptionResult>
        </MentionablePaperInput>
    `);

      expectedValueEmitted = '@an';
      expectedMentionStartedVal = 'an';
      await page.fillWithWait('@an');

      expectedValueEmitted = '@ajball ';
      expectedExtractedMention = 'ajball';
      expectedMentionStartedVal = null;
      await page.mentionOptionsList.mentionOptions[0].click();

      assert.equal(page.styledInput.mentions.length, 1);
      assert.notOk(page.styledInput.mentions[0].isIncomplete);
      assert.equal(page.styledInput.text, '@ajball');

      expectedValueEmitted = '@ajbal';
      expectedMentionStartedVal = 'ajbal';
      await page.fillWithWait(page.input.value.slice(0, -2)); // remove last char

      assert.equal(page.styledInput.mentions.length, 1);
      assert.ok(page.styledInput.mentions[0].isIncomplete);
      assert.equal(page.styledInput.text, '@ajbal');

      expectedValueEmitted = '@janine ';
      expectedExtractedMention = 'janine';
      expectedMentionStartedVal = null;
      await page.mentionOptionsList.mentionOptions[1].click();

      assert.equal(page.styledInput.mentions.length, 1);
      assert.notOk(page.styledInput.mentions[0].isIncomplete);
      assert.equal(page.styledInput.text, '@janine');
    });

  test('backspacing to the end of mention triggers getMentionOptions', async function (assert) {
    this.set('inputChanged', val => this.set('newValue', val));
    this.set('setUserMentions', val => this.set('mentionOptions', val ? getTestUsers() : []));
    this.set('extractor', user => user.username);

    await render(hbs`
      <MentionablePaperInput
        @value={{this.newValue}}
        @onChange={{fn this.inputChanged}}
        @onMention={{fn this.extractor}}
        @options={{this.mentionOptions}}
        @getMentionOptions={{fn this.setUserMentions}} as |OptionResult|>
          <OptionResult as |user|>
            <span>{{user.name}} </span>
            <span>{{user.username}}</span>
          </OptionResult>
        </MentionablePaperInput>
    `);

    await page.fillWithWait('@an');
    assert.equal(page.mentionOptionsList.mentionOptions.length, 2);
    await page.mentionOptionsList.mentionOptions[0].click();
    assert.equal(page.mentionOptionsList.mentionOptions.length, 0);

    await page.fillWithWait(page.input.value.slice(0, -1)); // remove space to get cursor at end of mention
    assert.equal(page.mentionOptionsList.mentionOptions.length, 2);
  });

  test('can set the mention special character prefix via @specialCharacter', async function (assert) {
    this.set('inputChanged', val => this.set('newValue', val));
    this.set('setUserMentions', val => this.set('mentionOptions', val ? getTestUsers() : []));
    this.set('extractor', user => user.username);

    await render(hbs`
      <MentionablePaperInput
        @specialCharacter='#'
        @value={{this.newValue}}
        @onChange={{fn this.inputChanged}}
        @onMention={{fn this.extractor}}
        @options={{this.mentionOptions}}
        @getMentionOptions={{fn this.setUserMentions}} as |OptionResult|>
          <OptionResult as |user|>
            <span>{{user.name}}</span>
            <span>{{user.username}}</span>
          </OptionResult>
        </MentionablePaperInput>
    `);

    await page.fillWithWait('@an');

    assert.equal(page.input.value, '@an');
    assert.equal(page.mentionOptionsList.mentionOptions.length, 0);

    await page.fillWithWait('#an');

    assert.equal(page.input.value, '#an');
    assert.equal(page.mentionOptionsList.mentionOptions.length, 2);

    await page.mentionOptionsList.mentionOptions[0].click();

    assert.equal(page.input.value, '#ajball ', 'space added to end of mention after mention is added');
    assert.equal(page.styledInput.text, '#ajball');
    assert.equal(page.styledInput.mentions.length, 1);
    assert.equal(page.styledInput.mentions[0].href, '/u/ajball');
    assert.equal(
      this.element.querySelector(page.input.scope + ' textarea'),
      document.activeElement,
      'textarea is still focused after selecting mention'
    );
    assert.notOk(page.mentionOptionsList.isPresent,
      'Mention options list and help-bar are closed after selecting mention');
  });

  test('able to use arrow keys and enter to navigate to a mention option and select', async function (assert) {
    this.set('inputChanged', val => this.set('newValue', val));
    this.set('setUserMentions', async (val) => {
      await waitPromise(1000); // Just to make sure it doesn't break if there's a delay
      this.set('mentionOptions', val ? getTestUsers() : []);
    });
    this.set('extractor', user => user.username);

    await render(hbs`
      <MentionablePaperInput
        @value={{this.newValue}}
        @onChange={{fn this.inputChanged}}
        @onMention={{fn this.extractor}}
        @options={{this.mentionOptions}}
        @getMentionOptions={{fn this.setUserMentions}} as |OptionResult|>
          <OptionResult as |user|>
            <span>{{user.name}}</span>
            <span>{{user.username}}</span>
          </OptionResult>
        </MentionablePaperInput>
    `);

    await page.fillWithWait('@an');

    assert.equal(page.input.value, '@an');
    assert.equal(page.mentionOptionsList.mentionOptions.length, 2);
    assert.ok(page.mentionOptionsList.mentionOptions[0].isFocused, 'first mention option is auto-focused');
    assert.ok(page.mentionOptionsList.mentionOptions[0].ariaCurrent === 'true');
    assert.notOk(page.mentionOptionsList.mentionOptions[1].isFocused);
    assert.notOk(page.mentionOptionsList.mentionOptions[1].ariaCurrent === 'true');

    await page.arrowDown();
    assert.notOk(page.mentionOptionsList.mentionOptions[0].isFocused);
    assert.notOk(page.mentionOptionsList.mentionOptions[0].ariaCurrent === 'true');
    assert.ok(page.mentionOptionsList.mentionOptions[1].isFocused);
    assert.ok(page.mentionOptionsList.mentionOptions[1].ariaCurrent === 'true');

    await page.arrowDown();
    page.mentionOptionsList.mentionOptions.forEach((it) => {
      assert.notOk(it.isFocused);
      assert.notOk(it.ariaCurrent === 'true');
    });

    await page.arrowUp();
    assert.notOk(page.mentionOptionsList.mentionOptions[0].isFocused);
    assert.notOk(page.mentionOptionsList.mentionOptions[0].ariaCurrent === 'true');
    assert.ok(page.mentionOptionsList.mentionOptions[1].isFocused);
    assert.ok(page.mentionOptionsList.mentionOptions[1].ariaCurrent === 'true');

    await page.arrowUp();
    assert.ok(page.mentionOptionsList.mentionOptions[0].isFocused);
    assert.ok(page.mentionOptionsList.mentionOptions[0].ariaCurrent === 'true');
    assert.notOk(page.mentionOptionsList.mentionOptions[1].isFocused);
    assert.notOk(page.mentionOptionsList.mentionOptions[1].ariaCurrent === 'true');

    await page.pressEnter();

    assert.equal(page.input.value, '@ajball ', 'space added to end of mention after mention is added');
    assert.equal(page.styledInput.text, '@ajball');
    assert.equal(page.styledInput.mentions.length, 1);
    assert.equal(page.styledInput.mentions[0].href, '/u/ajball');
    assert.equal(
      this.element.querySelector(page.input.scope + ' textarea'),
      document.activeElement,
      'textarea is still focused after selecting mention'
    );
    assert.notOk(page.mentionOptionsList.isPresent,
      'Mention options list and help-bar are closed after selecting mention');
  });

  test('it does not start a mention if normal/plain text (i.e. no @, #, ${specialCharacter}) is entered',
    async function (assert) {
      this.set('inputChanged', val => this.set('newValue', val));
      this.set('setUserMentions', () => assert.notOk(true, 'getMentionOptions should not be called'));
      this.set('extractor', () => assert.notOk(true, 'onMention should not be called'));

      await render(hbs`
      <MentionablePaperInput
        @value={{this.newValue}}
        @onChange={{fn this.inputChanged}}
        @onMention={{fn this.extractor}}
        @options={{this.mentionOptions}}
        @getMentionOptions={{fn this.setUserMentions}} as |OptionResult|>
          <OptionResult as |user|>
            <span>{{user.name}}</span>
            <span>{{user.username}}</span>
          </OptionResult>
        </MentionablePaperInput>
    `);

      await page.fillWithWait('no mention');
      assert.equal(page.input.value, 'no mention');
      assert.notOk(page.mentionOptionsList.mentionOptions.isPresent);
    });

  test('it does not allow more than one space between words', async function (assert) {
    this.set('inputChanged', (val) => this.set('newValue', val));
    this.set('setUserMentions', () => assert.notOk(true, 'getMentionOptions should not be called'));
    this.set('extractor', () => assert.notOk(true, 'onMention should not be called'));

    await render(hbs`
      <MentionablePaperInput
        @value={{this.newValue}}
        @onChange={{fn this.inputChanged}}
        @onMention={{fn this.extractor}}
        @options={{this.mentionOptions}}
        @getMentionOptions={{fn this.setUserMentions}} as |OptionResult|>
          <OptionResult as |user|>
            <span>{{user.name}}</span>
            <span>{{user.username}}</span>
          </OptionResult>
        </MentionablePaperInput>
    `);

    await page.fillWithWait('no text with single spaces');
    assert.equal(page.input.value, 'no text with single spaces');

    await page.fillWithWait('no text  with more than   one space    allowed  ');
    assert.equal(page.input.value, 'no text with more than one space allowed ');

    await page.fillWithWait(' ');
    assert.equal(page.input.value, '', 'user should not be allowed to start text with a space');
  });

  test('when the options list is empty, it displays a message informing the user that there are no option results',
    async function (assert) {
      assert.expect(4);
      this.set('inputChanged', val => this.set('newValue', val));
      this.set('setUserMentions', (val) => {
        assert.equal(val, 'an');
        this.set('mentionOptions', []);
      });
      this.set('extractor', () => assert.notOk(true, 'onMention should not be called'));

      await render(hbs`
      <MentionablePaperInput
        @value={{this.newValue}}
        @onChange={{fn this.inputChanged}}
        @onMention={{fn this.extractor}}
        @options={{this.mentionOptions}}
        @getMentionOptions={{fn this.setUserMentions}} as |OptionResult|>
          <OptionResult as |user|>
            <span>{{user.name}}</span>
            <span>{{user.username}}</span>
          </OptionResult>
        </MentionablePaperInput>
    `);

      await page.fillWithWait('@an');
      assert.equal(page.input.value, '@an');
      assert.equal(page.mentionOptionsList.mentionOptions.length, 1,
        'technically equal to 1 because the no results list item is a mention-option in the DOM');
      assert.equal(page.mentionOptionsList.mentionOptions[0].noResults, 'No results found matching @an');
    });

  test('mentions are structurally distinct from plain input text (i.e. mention text are contained in their own dom element)',
    async function (assert) {
      this.set('inputChanged', val => this.set('newValue', val));
      this.set('setUserMentions', val => this.set('mentionOptions', val ? getTestUsers() : []));
      this.set('extractor', user => user.username);

      await render(hbs`
      <MentionablePaperInput
        @value={{this.newValue}}
        @onChange={{fn this.inputChanged}}
        @onMention={{fn this.extractor}}
        @options={{this.mentionOptions}}
        @getMentionOptions={{fn this.setUserMentions}} as |OptionResult|>
          <OptionResult as |user|>
            <span>{{user.name}} </span>
            <span>{{user.username}}</span>
          </OptionResult>
        </MentionablePaperInput>
    `);

      await page.fillWithWait('@an');
      await page.mentionOptionsList.mentionOptions[0].click();
      assert.equal(page.styledInput.mentions.length, 1);
      assert.notOk(page.mentionOptionsList.mentionOptions.isPresent);
      assert.equal(page.styledInput.text, '@ajball');

      await page.fillWithWait(page.input.value + '@jan');
      assert.notOk(page.styledInput.mentions[0].isIncomplete);
      assert.ok(page.styledInput.mentions[1].isIncomplete);
      await page.mentionOptionsList.mentionOptions[1].click();
      assert.equal(page.styledInput.mentions.length, 2);
      assert.notOk(page.styledInput.mentions[0].isIncomplete && page.styledInput.mentions[1].isIncomplete,
        'able to add duplicate mentions');
      assert.equal(page.styledInput.text, '@ajball @janine');

      await page.fillWithWait(page.input.value + ' no mention text');
      assert.notOk(page.mentionOptionsList.mentionOptions.isPresent);
      assert.equal(page.styledInput.text, '@ajball @janine no mention text');
      assert.equal(page.styledInput.mentions.length, 2, 'still have only two completed mentions');
    });

  test('it is able to show a hint', async function (assert) {
    this.set('inputChanged', val => this.set('newValue', val));
    this.set('setUserMentions', () => this.set('mentionOptions', []));
    this.set('extractor', () => assert.notOk(true, 'onMention should not be called'));
    this.set('showHint', true);
    this.set('specialChar', '#');

    await render(hbs`
      <MentionablePaperInput
        @showHint={{this.showHint}}
        @specialCharacter={{this.specialChar}}
        @value={{this.newValue}}
        @onChange={{fn this.inputChanged}}
        @onMention={{fn this.extractor}}
        @options={{this.mentionOptions}}
        @getMentionOptions={{fn this.setUserMentions}} as |OptionResult|>
          <OptionResult as |user|>
            <span>{{user.name}}</span>
            <span>{{user.username}}</span>
          </OptionResult>
        </MentionablePaperInput>
    `);

    assert.equal(page.hint, 'Type "#" to mention');
    this.set('specialChar', null);
    assert.equal(page.hint, 'Type "@" to mention');
    this.set('showHint', false);
    assert.notOk(page.hintIsPresent, 'Hint is not present');
  });

  test(`textarea element's font is not visible`, async function (assert) {
    this.set('inputChanged', val => this.set('newValue', val));
    this.set('setUserMentions', val => this.set('mentionOptions', val ? getTestUsers() : []));
    this.set('extractor', user => user.username);

    await render(hbs`
      <MentionablePaperInput
        @value={{this.newValue}}
        @onChange={{fn this.inputChanged}}
        @onMention={{fn this.extractor}}
        @options={{this.mentionOptions}}
        @getMentionOptions={{fn this.setUserMentions}} as |OptionResult|>
          <OptionResult as |user|>
            <span>{{user.name}}</span>
            <span>{{user.username}}</span>
          </OptionResult>
        </MentionablePaperInput>
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

  test('dropdown list element renders directly beneath textarea element', async function (assert) {
    this.set('inputChanged', val => this.set('newValue', val));
    this.set('setUserMentions', val => this.set('mentionOptions', val ? getTestUsers() : []));
    this.set('extractor', user => user.username);

    await render(hbs`
      <MentionablePaperInput
        @value={{this.newValue}}
        @onChange={{fn this.inputChanged}}
        @onMention={{fn this.extractor}}
        @options={{this.mentionOptions}}
        @getMentionOptions={{fn this.setUserMentions}} as |OptionResult|>
          <OptionResult as |user|>
            <span>{{user.name}}</span>
            <span>{{user.username}}</span>
          </OptionResult>
        </MentionablePaperInput>
    `);

    await page.fillWithWait('@an');

    const textarea = page.input.getTextareaEl();
    const textAreaHeight = textarea.style.height;
    const heightNumber = +textAreaHeight.replace(/px/, '');
    // 2 is a constant used in setMentionsDropdownTopPosition() mention-options.js
    const expectedOptionsListTopValue = (heightNumber + 2) + 'px';

    assert
      .dom(page.mentionOptionsList.scope)
      .hasStyle({ top: expectedOptionsListTopValue });
  });

  test('the help-bar displays the current mention and instructions to close options dropdown at desktop and close button at tablet screen sizes', async function (assert) {
    this.set('inputChanged', val => this.set('newValue', val));
    this.set('setUserMentions', val => this.set('mentionOptions', val ? getTestUsers() : []));
    this.set('extractor', user => user.username);

    await render(hbs`
      <MentionablePaperInput
        @value={{this.newValue}}
        @onChange={{fn this.inputChanged}}
        @onMention={{fn this.extractor}}
        @options={{this.mentionOptions}}
        @getMentionOptions={{fn this.setUserMentions}} as |OptionResult|>
          <OptionResult as |user|>
            <span>{{user.name}}</span>
            <span>{{user.username}}</span>
          </OptionResult>
        </MentionablePaperInput>
    `);

    setBreakpoint('desktop');
    await page.fillWithWait('@an');

    assert.equal(page.mentionOptionsList.helpBar.currentMention, 'Results matching "@an"');
    assert.equal(page.mentionOptionsList.helpBar.closeWrap.text, 'esc to dismiss');

    await page.pressEscape();
    assert.notOk(page.mentionOptionsList.isPresent);

    setBreakpoint('tablet');
    await page.fillWithWait('@an');
    assert.equal(page.mentionOptionsList.helpBar.currentMention, 'Results matching "@an"');
    assert.equal(page.mentionOptionsList.helpBar.closeWrap.text, 'close', 'paper icon val');

    await page.pressEscape();
    assert.notOk(page.mentionOptionsList.isPresent);
  });

  test('the help-bar displays a button to close options dropdown at mobile device screen sizes', async function (assert) {
    this.set('inputChanged', val => this.set('newValue', val));
    this.set('setUserMentions', val => this.set('mentionOptions', val ? getTestUsers() : []));
    this.set('extractor', user => user.username);

    await render(hbs`
      <MentionablePaperInput
        @value={{this.newValue}}
        @onChange={{fn this.inputChanged}}
        @onMention={{fn this.extractor}}
        @options={{this.mentionOptions}}
        @getMentionOptions={{fn this.setUserMentions}} as |OptionResult|>
          <OptionResult as |user|>
            <span>{{user.name}}</span>
            <span>{{user.username}}</span>
          </OptionResult>
        </MentionablePaperInput>
    `);

    setBreakpoint('mobile');
    await page.fillWithWait('@an');

    assert.equal(page.mentionOptionsList.helpBar.currentMention, 'Results matching "@an"');
    assert.equal(page.mentionOptionsList.helpBar.closeWrap.text, 'close', 'paper icon val');

    await page.mentionOptionsList.helpBar.closeWrap.button();
    assert.notOk(page.mentionOptionsList.isPresent);

    setBreakpoint('tablet');
    await page.fillWithWait('@an');

    assert.equal(page.mentionOptionsList.helpBar.currentMention, 'Results matching "@an"');
    assert.equal(page.mentionOptionsList.helpBar.closeWrap.text, 'close', 'paper icon val');

    await page.mentionOptionsList.helpBar.closeWrap.button();
    assert.notOk(page.mentionOptionsList.isPresent);
  });
});
