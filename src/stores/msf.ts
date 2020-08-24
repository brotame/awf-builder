import { writable } from 'svelte/store';
import type { MSFParams, msfBlocks } from '../types';

// Variables
const required: msfBlocks[] = [
  { key: 'webflowSetup', title: 'Webflow setup' },
  { key: 'elements', title: 'Elements' },
];

const optional: msfBlocks[] = [
  { key: 'alertSelector', title: 'Alert Element', selected: false },
  { key: 'alertText', title: 'Alert Text', selected: false },
  { key: 'backText', title: 'Back Button Text', selected: false },
  { key: 'backSelector', title: 'Back Button', selected: false },
  {
    key: 'completedPercentageSelector',
    title: 'Display Completed %',
    selected: false,
  },
  {
    key: 'currentStepSelector',
    title: 'Display Current Step',
    selected: false,
  },
  { key: 'customNav', title: 'Custom Nav Links', selected: false },
  { key: 'displayValues', title: 'Display Filled Values', selected: false },
  { key: 'hiddenForm', title: 'Extra Hidden Form', selected: false },
  { key: 'msfGlobal', title: 'Global Options', selected: false },
  { key: 'nextText', title: 'Next Button Text', selected: false },
  { key: 'warningClass', title: 'Warning Class', selected: false },
];

const params: MSFParams = {
  hiddeButtonsOnSubmit: true,
  scrollTopOnStepChange: false,
};

const msfStore = writable(params);
export default msfStore;

export const msfActivated = writable(false);

export const msfRequired = writable(required);

const optionalStore = writable(optional);
export const msfOptional = {
  subscribe: optionalStore.subscribe,
  modify: (key: string, selected: boolean) => {
    optionalStore.update((items) =>
      items.map((item) => {
        if (item.key === key) item.selected = selected;
        return item;
      })
    );
  },
  checkSelected: (key: string) => {
    let selected = false;
    const unsubscribe = optionalStore.subscribe((items) => {
      selected = items.find((item) => item.key === key).selected;
    });
    unsubscribe();
    return selected;
  },
};

// Checks if the starter form has been copied
export const msfCopy = writable(false);
