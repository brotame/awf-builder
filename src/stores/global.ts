import { writable } from 'svelte/store';
import { Pages } from '../types';

export const currentPage = writable(Pages.HOME);
