import todayEdition from '@/data/editions/2026-10-15.json';
import previousEdition from '@/data/editions/2026-10-14.json';
import {initialEdition} from './initial-edition';
import type {Edition} from './news-types';
export const bundledEditions:Edition[]=[todayEdition as Edition,previousEdition as Edition,initialEdition];
