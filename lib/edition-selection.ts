import type {Edition} from './news-types';
export function selectEdition(stored:Edition|null,bundled:Edition|undefined):Edition|null{
 if(!stored)return bundled??null;
 if(!bundled||stored.date>bundled.date||(stored.date===bundled.date&&Date.parse(stored.updatedAt)>=Date.parse(bundled.updatedAt)))return stored;
 return bundled;
}
