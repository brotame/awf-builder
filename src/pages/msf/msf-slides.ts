// Types
import type { SlidesObj } from '../../types';

const msfSlides: SlidesObj = {
  intro: [
    {
      title: 'Multi step Feature',
      content: `<p>Add multi step functionality to your Webflow Forms in a couple of clicks:<br></p>
      <ul role="list">
        <li>Input validation</li>
        <li>Warnings</li>
        <li>Custom Interactions</li>
        <li>And much more!</li>
      </ul>
      <p>Simply select all the features that you want to add and the builder will generate the code for you :)<br></p>
      <p>Some functionalities may require a certain setup in Webflow, always check the info before setting them!<br></p>`,
      video: 'videos/msf/MSF.mp4',
    },
  ],
  webflowSetup: [
    {
      title: 'Webflow setup',
      content: `<p>
      The slides will act as different steps of your form. You can put
      how many slides as you want inside the slider.<br />
    </p>
    <p>
      Each step will check the required inputs inside it before
      jumping to the next one.<br />
    </p>
    <p>
      You can put how many slides (steps) as you want inside the
      slider. Each step will check the
      <strong class="underline">required and visible</strong> inputs
      inside it before jumping to the next one.<br />
    </p>`,
      video: 'videos/msf/Webflow Setup.mp4',
    },
  ],
  elements: [
    {
      title: 'Required elements',
      content: `<p>
      Make sure that you set the ID of the Form,
      <strong>not</strong> the Form Block.<br />
    </p>
    <p>
      The next button doesn&#x27;t need to be placed inside the form,
      it can be located anywhere in the page.<br />
    </p>
    <p>
      Once the last step is reached, the next button&#x27;s text will
      change to the submit button&#x27;s text.<br />
    </p>
    <p class="text-sm pl-4">
      <strong>Note:</strong> remember to place a submit button set to
      <span class="opacity-75">display:none</span> anywhere inside the
      form.
    </p>`,
      video: 'videos/msf/Elements.mp4',
    },
  ],
  alertSelector: [
    {
      title: 'Alert element',
      content: `<p>
      You can show an element as an alert when there are missing
      fields that must be filled.<br />
    </p>
    <p class="text-sm pl-4">
      <strong>Eg:</strong> show a box that alerts the user to fill the
      missing inputs.
    </p>
    <p>This element can be placed anywhere in the page.<br /></p>
    <p>
      By default, it will be set to
      <span class="opacity-75">display:block</span> when shown, and
      <span class="opacity-75">display:none</span> when hidden.<br />
    </p>
    <p>
      If you want to show it using a Webflow Interaction, place a
      hidden <em>Div Block</em> inside it with the custom
      attribute:<br />
    </p>
    <ul role="list" class="list-none">
      <li><strong>Name:</strong> data-msf</li>
      <li><strong>Value:</strong> alert</li>
    </ul>
    <p>
      And bind it to a
      <span class="opacity-75">Mouse click (tap)</span>
      interaction.<br />The script will trigger the
      <span class="opacity-75">1st click</span> to show it and the
      <span class="opacity-75">2nd click</span> to hide it.<br />
    </p>`,
      video: 'videos/msf/Alert Element.mp4',
    },
  ],
  backSelector: [
    {
      title: 'Back button',
      content: `<p>
      Use this button to let the user go back to the previous step.<br />
    </p>
    <p>
      It is recommended that you hide it in the first slide (step) to
      avoid confusing the users.<br />
    </p>
    <p>
      To do so, use a Slider Change interaction to hide it when the
      first slide enters and show it when the first slide leaves.<br />
    </p>
    <p>This element can be placed anywhere in the page.<br /></p>`,
      video: 'videos/msf/Back Button.mp4',
    },
  ],
  alertText: [
    {
      title: 'Alert text',
      content: `<p>
      You can show a global alert when there are missing fields that
      must be filled.<br />
    </p>
    <p>Check how it will look:<br /></p>
    <button
      type="button"
      class="button w-button"
      onclick="alert('It will look like this!')"
    >
      Display alert
    </button>`,
      video: 'videos/msf/Alert Text.mp4',
    },
  ],
  backText: [
    {
      title: 'Back button text',
      content: `<p>
      Additionally, you can set a different text of the back button in
      any step.<br />
    </p>
    <p>
      If you don&#x27;t set the text for a particular step
      <em class="opacity-75"
        >(for example you set the text for the 2nd and 4th step, but
        not the 3rd)</em
      >
      it will fall back to the lower closest one
      <em class="opacity-75">(the 2nd one in this case)</em>.<br />
    </p>`,
      video: 'videos/msf/Back Text.mp4',
    },
  ],
  nextText: [
    {
      title: 'Next button text',
      content: `<p>
      Additionally, you can set a different text of the next button in
      any step.<br />
    </p>
    <p>
      If you don&#x27;t set the text for a particular step
      <em class="opacity-75"
        >(for example you set the text for the 2nd and 4th step, but
        not the 3rd)</em
      >
      it will fall back to the lower closest one
      <em class="opacity-75">(the 2nd one in this case)</em>.<br />
    </p>`,
      video: 'videos/msf/Next Text.mp4',
    },
  ],
  completedPercentageSelector: [
    {
      title: 'Display completed %',
      content: `<p>
      You can set any text element (paragraph, text block, heading,
      list item...) to display the completed % of the steps:<br />
    </p>
    <p>
      It will show the percentage starting from 0% in the first step
      to 100% in the last step.<br />
    </p>
    <p>This element can be placed anywhere in the page.<br /></p>`,
      video: 'videos/msf/Completed Percentage.mp4',
    },
  ],
  currentStepSelector: [
    {
      title: 'Display current step',
      content: `<p>
      You can set any text element (paragraph, text block, heading,
      list item...) to display the number of the current step.<br />
    </p>
    <p>
      If you want to show the number of total steps, you should to it
      manually as it is a fixed value.<br />
    </p>
    <p>This element can be placed anywhere in the page.<br /></p>`,
      video: 'videos/msf/Current Step.mp4',
    },
  ],
  customNav: [
    {
      title: 'Custom nav links',
      content: `<p>
      You can let the user jump to a specific step adding this custom
      nav links.<br />
    </p>
    <p>
      To do so, give this custom attribute to the element that should
      trigger it when clicked:<br />
    </p>
    <ul role="list" class="list-none">
      <li><strong>Name:</strong> data-msf-nav</li>
      <li>
        <strong>Value:</strong> The number of the step (<strong
          >Eg:</strong
        >
        2)
      </li>
    </ul>
    <p>This elements can be placed anywhere in the page.<br /></p>`,
      video: 'videos/msf/Custom Nav.mp4',
    },
  ],
  displayValues: [
    {
      title: 'Display filled values',
      content: `<p>
      You can set the value of an input to be displayed on any text
      element (paragraph, text block, heading, list item...).<br />
    </p>
    <p>
      To do so, give this custom attribute to the text element that
      should show it:<br />
    </p>
    <ul role="list" class="list-none">
      <li><strong>Name:</strong> data-msf-value</li>
      <li>
        <strong>Value:</strong> The ID of the input (<strong
          >Eg:</strong
        >
        email)
      </li>
    </ul>
    <p>This elements can be placed anywhere in the page.<br /></p>`,
      video: 'videos/msf/Display Values.mp4',
    },
  ],
  msfGlobal: [
    {
      title: 'Global options',
      content: `<p>
      The navigation buttons (next, back, and custom navs) are
      disabled once the form is submitted.<br />
    </p>
    <p>
      You can additionally hide the back and next button by checking
      the option. They will be set to
      <span class="opacity-75">display:none</span>.<br />
    </p>`,
      video: 'videos/msf/Global Options.mp4',
    },
  ],
  warningClass: [
    {
      title: 'Warning class',
      content: `<p>
      You can add a CSS class to each missing input when the user
      tries to jump to the next step.<br />
    </p>
    <p>
      This is useful to highlight those inputs that should be filled,
      like adding a colored border.<br />
    </p>
    <p>
      Once the input is filled, that CSS class will be removed.<br />
    </p>
    <p>
      Radio inputs and checkboxes should be set to
      <strong>Custom</strong> in the Webflow Designer in order to
      display it correctly.<br />
    </p>`,
      video: 'videos/msf/Warning Class.mp4',
    },
  ],
  hiddenForm: [
    {
      title: 'Extra hidden form',
      content: `<p>
      You can send an additional hidden form when the user completes a
      specific step.<br />
    </p>
    <p>
      This feature is useful if you want to make sure that some of the
      info is collected even if the user doesn&#x27;t complete the
      whole form.<br />
    </p>
    <p>
      Add this custom attribute to each input that you want to collect
      in the hidden form:<br />
    </p>
    <ul role="list" class="list-none">
      <li><strong>Name:</strong> data-msf</li>
      <li><strong>Value:</strong> hidden</li>
    </ul>
    <p>
      The script will automatically create the hidden form, populate
      and send it when the user completes the desired step.<br />
    </p>`,
      video: 'videos/msf/Hidden Form.mp4',
    },
  ],
};

export default msfSlides;
