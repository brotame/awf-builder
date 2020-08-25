// Svelte
import { writable, derived } from 'svelte/store';

// Types
import type { Logic } from '../types';

// Helpers
import { cloneDeep } from 'lodash-es';

const defaults: Logic[] = [];

const logicStore = writable(defaults);

const customLogicStore = {
  subscribe: logicStore.subscribe,
  add: (newLogic: Logic) => {
    logicStore.update((items) => [...items, newLogic]);
  },
  modify: (data: Logic) => {
    logicStore.update((items) =>
      items.map((item) => (item.id === data.id ? { ...item, ...data } : item))
    );
  },
  remove: (id: string) => {
    logicStore.update((items) => items.filter((item) => item.id !== id));
  },
};

export default customLogicStore;

export const logicParams = writable({
  submitHiddenInputs: false,
  checkConditionsOnLoad: true,
});

export const logicExport = derived(
  [logicStore, logicParams],
  ([$logicStore, $logicParams]) => {
    const newStore = cloneDeep($logicStore);
    const { submitHiddenInputs, checkConditionsOnLoad } = $logicParams;

    newStore.forEach((logic) => {
      delete logic.id;

      logic.conditions.forEach((condition) => {
        if (condition.type === 'radios') {
          condition.selector = `input[name="${condition.selector}"]`;
        } else {
          if (!condition.selector.startsWith('#'))
            condition.selector = `#${condition.selector}`;
        }

        if (condition.operator === 'checked') {
          condition.value = 'true';
          condition.operator = 'equal';
        }

        if (condition.operator === 'not-checked') {
          condition.value = 'false';
          condition.operator = 'equal';
        }

        delete condition.type;
      });

      logic.actions.forEach((action) => {
        action.selector = `#${action.selector}`;
      });
    });

    return {
      logicList: newStore,
      submitHiddenInputs,
      checkConditionsOnLoad,
    };
  }
);
