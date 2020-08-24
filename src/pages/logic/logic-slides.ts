// Types
import type { SlidesObj } from '../../types';

const logicSlides: SlidesObj = {
  intro: [
    {
      title: 'Intro',
      content: `<p>
      Build your form in the Webflow Designer as you would normally
      do.<br />
    </p>
    <p>
      Then, create your logic in the builder. You can set as many
      conditions and actions to be performed, the code will be
      automatically generated for you!<br />
    </p>
    <p>Check the next steps to see what you can do with it :)<br /></p>`,
      video1:
        'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee9b27330483f41b4be2_Intro-transcode.mp4',
      video2:
        'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee9b27330483f41b4be2_Intro-transcode.webm',
    },
    {
      title: 'Single action target',
      content: `<p>
      You can set the target of an action to be any form element (input,
      select, checkbox, radio...).<br />
    </p>
    <p>To do so, use its ID:<br /></p>
    <p class="text-sm pl-4 mb-6">
      <strong>E.g.</strong> make input which ID is <span class="opacity-75"
        >surname</span
      >
      to be required.<br />
    </p>
    <p>
      You can show, hide, enable, disable, require or unrequire it.<br />
    </p>`,
      video1:
        'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43eea0273304c2341b4be3_Single Action Target-transcode.mp4',
      video2:
        'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43eea0273304c2341b4be3_Single Action Target-transcode.webm',
    },
    {
      title: 'Group action target',
      content: `<p>
      You can also group multiple elements inside a
      <em>Div Block</em>.<br />
    </p>
    <p>
      If you set that <em>Div Block</em> as the target of an action, all
      the inputs inside it will be affected.<br />
    </p>
    <p>To do so, use that block ID:<br /></p>
    <p class="text-sm pl-4">
      <strong>E.g.</strong> disable all inputs that are inside the
      <em>Div Block</em> which ID is
      <span class="opacity-75">contact-info</span>.<br />
    </p>`,
      video1:
        'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee94877e0a3bf5d60731_Group Action Target-transcode.mp4',
      video2:
        'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee94877e0a3bf5d60731_Group Action Target-transcode.webm',
    },
    {
      title: 'Action Interactions',
      content: `<p>
      You can trigger Webflow Interactions when any action is
      performed.<br />
    </p>
    <p>
      To do so, you must first set your target as a Group Action
      Target:<br />
    </p>
    <p class="text-sm pl-4 mb-6">
      <em
        >&quot;Put your target inside a Div Block and use its ID as
        the target.&quot;</em
      >
    </p>
    <p>
      Then add inside the group a hidden <em>Div Block</em> with the
      custom attribute:<br />
    </p>
    <ul role="list" class="list-none">
      <li><strong>Name:</strong> data-logic</li>
      <li>
        <strong>Value:</strong> show, hide, enable, disable, require
        or unrequire.
      </li>
    </ul>
    <p>
      And bind it to a
      <span class="opacity-75">Mouse click (tap)</span>
      interaction.<br />When an action is performed, the script will
      click the correspondent trigger.<br />
    </p>
    <p class="text-sm pl-4">
      <strong>E.g.</strong> when you show the input
      <span class="opacity-75">phone</span>, the script will click the
      <em>Div Block</em> that has the attribute
      <span class="opacity-75">data-logic=show</span>.
    </p>`,
      video1:
        'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee8bf4340039b7f3c9f0_Action Interactions-transcode.mp4',
      video2:
        'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee8bf4340039b7f3c9f0_Action Interactions-transcode.webm',
    },
    {
      title: 'Important!',
      content: `<p>
      When you choose to <em>show </em>or <em>hide </em>a target, by
      default the script will set it to
      <span class="opacity-75">display: block</span> or
      <span class="opacity-75">display: none</span>.<br />
    </p>
    <p>
      If you bind a Webflow Interaction to the <em>hide </em>or
      <em>show </em>actions, you should set that display property.<br />
    </p>
    <p class="text-sm pl-4 mb-8">
      <strong>E.g.</strong> when the target is showed, trigger a Webflow
      Interaction that sets
      <span class="opacity-75">display: flex</span> and
      <span class="opacity-75">opacity: 100%</span>.<br />
    </p>`,
      video1:
        'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee986da478c1e7b0e034_Important-transcode.mp4',
      video2:
        'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee986da478c1e7b0e034_Important-transcode.webm',
    },
    {
      title: 'Custom interactions',
      content: `<p>
      You can also trigger a random interaction that isn&#x27;t binded
      to any specific action.<br />
    </p>
    <p>
      To do so, select <strong>Interaction<em> </em></strong>as the
      trigger.<br />
    </p>
    <p>
      The script will click that trigger when the conditions are
      met.<br />
    </p>
    <p class="text-sm pl-4">
      <strong>E.g.</strong> click the element with the ID
      <span class="opacity-75">show-modal</span> when the conditions
      are met.
    </p>`,
      video1:
        'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee90128e383bb89ab0db_Custom Interactions-transcode.mp4',
      video2:
        'https://assets.website-files.com/5ee9e5f2c67c989ce5331572/5f43ee90128e383bb89ab0db_Custom Interactions-transcode.webm',
    },
  ],
  submitHiddenInputs: [
    {
      title: 'Submit hidden inputs',
      content: `<p>
      You can choose if the inputs that are affected by the action
      <strong>hide</strong> should be submitted or not.<br />
    </p>
    <p class="text-sm pl-4">
      <strong>Warning:</strong> not submitting the hidden inputs can
      affect 3rd party integrations like Zapier, as the form could
      receive different fields depending on user actions.
    </p>`,
      video1: '',
      video2: '',
    },
  ],
  checkConditionsOnLoad: [
    {
      title: 'Check conditions on load',
      content: `<p>
      If you select this option, the script will check if any of the
      conditions is already met when the page loads and triggers the
      correspondent actions.<br />
    </p>
    <p class="text-sm pl-4">
      <strong>Note:</strong> it is recommended to leave this option
      checked, as not doing so could lead to unexpected behaviours.
    </p>`,
      video1: '',
      video2: '',
    },
  ],
};

export default logicSlides;
