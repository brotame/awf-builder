// Imports
import { derived } from 'svelte/store';
import msfStore from './msf';
import { logicExport } from './logic';
import stringifyObject from 'stringify-object';

const generatedCode = derived(
  [logicExport, msfStore],
  ([$logicExport, $msfStore]) => {
    const script = `<script src="https://cdn.jsdelivr.net/gh/brotame/advanced-webflow-forms@master/conditional-logic/dist/logic.js"><\/script>`;

    const msfString =
      $msfStore.formSelector && $msfStore.nextSelector
        ? `new MSF(${stringifyObject($msfStore, {
            inlineCharacterLimit: 99999,
          })});`
        : '';

    const logicString =
      $logicExport.logicList.length > 0
        ? `new ConditionalLogic(${stringifyObject($logicExport, {
            inlineCharacterLimit: 99999,
          })});`
        : '';

    return `
    <!-- Advanced Forms Code -->
    ${script}

    <!-- Advanced Forms Init -->
    <script>
    var Webflow = Webflow || [];
    Webflow.push(function () {
      ${msfString}
      ${logicString}
    )};
    <\/script>
    `;
  }
);

export default generatedCode;
