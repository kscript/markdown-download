import merge from"webpack-merge";import md5 from"md5";import html2markdown from"html-to-md";import"mathjax/es5/tex-svg";import{query,getExt,getText,getUrl,queryAll,insertAfter,getAttribute,formatDate,exec}from"./utils";const setInfo=e=>(e=Object.assign({date:formatDate("yyyy-MM-dd HH:mm:ss"),coypright:!1,url:location.href,description:"转载"},e instanceof Object?e:{}),"---\n    title: {{title}}\n    date: {{date}}\n    copyright: {{coypright}}\n    author: {{author}}\n    home: {{home}}\n    origin: {{origin}}\n    url: {{url}}\n    tag: {{tag}}\n    categories: {{categories}}\n    description: {{description}}\n    ---\n    ".replace(/\n\s+/g,"\n").replace(/\{\{(.*?)\}\}/g,((t,n)=>void 0===e[n]?"":e[n]))),formatCopyRight=e=>`> 当前文档由 [markdown文档下载插件](https://github.com/kscript/markdown-download) 下载, 原文链接: [${e}](${location.href})  `,getMarkdown=e=>e.innerHTML;export const tex2svg=e=>e.replace(/<ztext>(.*?)<\/ztext>/g,((e,t)=>{const n=decodeURIComponent(t),r=MathJax.tex2svg(n);return r.setAttribute("data-tex",n),r.style.display="inline",r.outerHTML}));const formatParams=(e,t,n)=>(t=t instanceof Object?t:{},{options:e=merge({},{origin:"juejin",link:!0,br:!1,code:!1,lazyKey:"data-src",selectors:{title:".article-title",body:".markdown-body",copyBtn:".copy-code-btn",userName:".username .name",userLink:".username",invalid:"style",unpack:""}},e instanceof Object?e:{},t),customOptions:t,hook:n=n instanceof Object?n:{}}),getContainer=e=>{if(e){if("string"==typeof e){const t=document.createElement("div");return t.innerHTML=e,t}return e instanceof Node?e:document}return document};export const formatMarkdownBody=(e,t,n,r)=>{const o=query(t.body,e).cloneNode(!0);return queryAll(t.copyBtn,o).map((e=>e.parentElement.removeChild(e))),queryAll("[data-id]",o).map((e=>e.removeAttribute("data-id"))),t.invalid&&queryAll(t.invalid,o).map((e=>e.parentElement.removeChild(e))),t.unpack&&queryAll(t.unpack,o).map((e=>{const t=document.createElement("span");t.innerHTML=e.innerHTML,insertAfter(document.createElement("br"),e),e.parentElement.replaceChild(t,e)})),n.link&&queryAll("a",o).map((e=>e.href=e.title)),n.code&&queryAll("code",o).map((e=>{const t=n.br||/copyable/.test(e.className)?"\n":"",r=e.getAttribute("lang")||(e.className.split("-")||{})[1]||"",o="```"+(r?" "+r:"")+t+e.innerText+t+"```"+t;e.parentElement.replaceChild(document.createTextNode(o),e)})),o};const extract=async(e,t,n,r)=>{const{origin:o}=n,a=getText(t.title)||document.title,i=a.replace(/[\\\/\?<>:'\*\|]/g,"_"),c=queryAll("img",e).map((e=>{const t=e.getAttribute("downloadName"),r=e.getAttribute("downloadUrl");if(t&&r)return e.src="./"+t,{name:t,downloadUrl:r};const o=(e.getAttribute(n.lazyKey)||e.src).replace(/\?$/,""),a=getExt(o),c=i+"/"+md5(o)+(a?"."+a:"");return e.src="./"+c,{name:c,downloadUrl:o}})),l=(s={title:a,origin:o,author:getText(t.userName),home:getUrl(location.origin,getAttribute("href",t.userLink)),description:e.innerText.replace(/^([\n\s]+)/g,"").replace(/\n/g," ").slice(0,50)+"..."},s=Object.assign({date:formatDate("yyyy-MM-dd HH:mm:ss"),coypright:!1,url:location.href,description:"转载"},s instanceof Object?s:{}),"---\n    title: {{title}}\n    date: {{date}}\n    copyright: {{coypright}}\n    author: {{author}}\n    home: {{home}}\n    origin: {{origin}}\n    url: {{url}}\n    tag: {{tag}}\n    categories: {{categories}}\n    description: {{description}}\n    ---\n    ".replace(/\n\s+/g,"\n").replace(/\{\{(.*?)\}\}/g,((e,t)=>void 0===s[t]?"":s[t])));var s;const d=html2markdown(l+getMarkdown(e),{}),m=formatCopyRight(a),p=await r("formatContent",{markdownBody:e,markdwonDoc:d});return c.push({name:i+".md",content:(p&&"string"==typeof p?p:d)+"\n\n"+m}),{fileName:a,files:c}};export const downloadMarkdown=async(...e)=>{const t={},{options:n,hook:r}=formatParams(...e),{selectors:o,el:a=document}=n,i=getContainer(a),c={container:i,options:n},l=async(e,n)=>await exec(r[e],t,Object.assign(c,n instanceof Object?n:{}))instanceof Object;if(await l("beforeExtract"))return exec();const s=formatMarkdownBody(i,o,n);if(await l("extract",{markdownBody:s}))return exec();const{fileName:d,files:m}=await extract(s,o,n,exec);return await l("afterExtract",{fileName:d,files:m})?exec():{type:"download",fileName:d,files:m}};export default downloadMarkdown;