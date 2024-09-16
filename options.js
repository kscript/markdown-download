const defaultOptions={partLimit:1e3,requestLimit:5,retry:3};export const options=Object.assign({},defaultOptions);export const getLocalOptions=()=>new Promise((t=>{chrome.storage.local.get("localOptions",(({localOptions:o})=>{t(o instanceof Object?o:{})}))}));export const mergeOptions=t=>Object.assign(options,defaultOptions,t instanceof Object?t:{});export const mergeLocalOptions=async()=>Object.assign(mergeOptions(await getLocalOptions()));export default{options,getLocalOptions,mergeOptions,mergeLocalOptions};