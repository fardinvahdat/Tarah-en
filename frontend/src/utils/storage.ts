/**
* window.localStorage browser permanent cache
*/
export const localStorage = {
// Set permanent cache
set(key: string, val: any) {
window.localStorage.setItem(key, JSON.stringify(val));
},
// Get permanent cache
get(key: string) {
const json: any = window.localStorage.getItem(key);
return JSON.parse(json);
},
// Remove permanent cache
remove(key: string) {
window.localStorage.removeItem(key);
},
// Remove all permanent caches
clear() {
window.localStorage.clear();
},
};
/**
* window.sessionStorage browser temporary cache
*/
export const sessionStorage = {
// Set temporary cache
set(key: string, val: any) {
window.sessionStorage.setItem(key, JSON.stringify(val));
},
// Get temporary cache
get(key: string) {
const json: any = window.sessionStorage.getItem(key);
return JSON.parse(json);
},
// Remove temporary cache
remove(key: string) {
window.sessionStorage.removeItem(key);
},
// Remove all temporary caches
clear() {
window.sessionStorage.clear();
},
};