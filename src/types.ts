export enum Pages {
  HOME,
  MSF,
  LOGIC,
  CODE,
}

export type ConditionOperator =
  | ''
  | 'equal'
  | 'not-equal'
  | 'contain'
  | 'not-contain'
  | 'greater'
  | 'greater-equal'
  | 'less'
  | 'less-equal'
  | 'empty'
  | 'filled'
  | 'checked'
  | 'not-checked';

export interface Condition {
  selector: string;
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'phone'
    | 'number'
    | 'select'
    | 'radios'
    | 'checkbox';
  operator: ConditionOperator;
  value?: string | number;
}

export type Operator = 'and' | 'or';

export interface Action {
  selector: string; // Selector of the target element
  action:
    | 'show'
    | 'hide'
    | 'enable'
    | 'disable'
    | 'require'
    | 'unrequire'
    | 'custom';
  clear?: boolean; // Determines if the input value has to be cleared when the action is triggered
}

export interface Logic {
  id: string;
  conditions: Condition[]; // List of conditions that have to be met
  operator: Operator; // Operator for the conditions | and: all conditions have to be met | or: only one condition has to be met
  actions: Action[]; // List of actions to trigger
}

export interface Slide {
  title: string;
  content: string;
  image: string;
}

export interface SelectOption {
  name: string;
  value: string;
  [x: string]: any;
}

export interface ButtonText {
  id?: string;
  step?: number;
  text?: string;
}

export interface MSFParams {
  alertInteraction?: string;
  alertSelector?: string;
  alertText?: string;
  backButtonText?: ButtonText[];
  backSelector?: string;
  completedPercentageSelector?: string;
  currentStepSelector?: string;
  formSelector?: string;
  hiddeButtonsOnSubmit?: boolean;
  hiddenFormStep?: number;
  nextButtonText?: ButtonText[];
  nextSelector?: string;
  scrollTopOnStepChange?: boolean;
  sendHiddenForm?: boolean;
  submitButtonText?: string;
  warningClass?: string;
}

export interface msfBlocks {
  key: string;
  title: string;
  selected?: boolean;
}
