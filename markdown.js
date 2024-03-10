import merge from"webpack-merge";import md5 from"md5";import html2markdown from"html-to-md";import"mathjax/es5/tex-svg";import{query,getExt,getText,getUrl,queryAll,insertAfter,getAttribute,formatDate,exec}from"./utils";const replace=(t,e)=>(e="function"==typeof e?e:t=>t,t.replace(/\$\{(.*?)\}/g,((t,n)=>e(n.replace(/(^\s+|\s+$)/g,""))))),setInfo=(t,e)=>(t=Object.assign({now:formatDate("yyyy-MM-dd HH:mm:ss"),copyright:!1,url:location.href,description:"转载",tag:[]},t instanceof Object?t:{}),replace((e="string"==typeof e?e:"---\n        title: ${title}\n        date: ${now}\n        copyright: ${copyright}\n        author: ${author}\n        home: ${home}\n        origin: ${origin}\n        url: ${url}\n        tag: ${tag}\n        categories: ${categories}\n        description: ${description}\n    ---\n    ").replace(/\n\s+/g,"\n"),(e=>void 0===t[e]?"":Array.isArray(t[e])?"\n  - "+t[e].join("\n  - "):t[e]))),formatCopyRight=(t,{retain:e,copyright:n})=>{const r=e?"> 当前文档由 [markdown文档下载插件](https://github.com/kscript/markdown-download) 下载, 原文链接: [${title}](${url})  ":n;return"string"==typeof r?"\n\n"+replace(r,(e=>t[e]||""))+"\n\n":""},getMarkdown=t=>t.innerHTML;export const tex2svg=t=>t.replace(/<ztext>(.*?)<\/ztext>/g,((t,e)=>{const n=decodeURIComponent(e),r=MathJax.tex2svg(n);return r.setAttribute("data-tex",n),r.style.display="inline",r.outerHTML}));const formatParams=(t,e,n)=>(e=e instanceof Object?e:{},{options:t=merge({},{br:!1,code:!1,link:!0,lazyKey:"data-src",origin:"",selectors:{}},t instanceof Object?t:{},e),customOptions:e,hook:n=n instanceof Object?n:{}}),getContainer=t=>{if(t){if("string"==typeof t){const e=document.createElement("div");return e.innerHTML=t,e}return t instanceof Node?t:document}return document};export const formatMarkdownBody=(t,e,n,r)=>{const o=query(e.body,t).cloneNode(!0);if(queryAll(e.copyBtn,o).map((t=>t.parentElement.removeChild(t))),queryAll("[data-id]",o).map((t=>t.removeAttribute("data-id"))),e.invalid&&queryAll(e.invalid,o).map((t=>t.parentElement.removeChild(t))),e.unpack&&queryAll(e.unpack,o).map((t=>{const e=document.createElement("span");e.innerHTML=t.innerHTML,insertAfter(document.createElement("br"),t),t.parentElement.replaceChild(e,t)})),e.tag){const t=[];queryAll(e.tag).map((e=>{t.push(e.innerText.replace(/(^[\n\s]+|[\n\s]+$)/g,""))})),n.context.tag=t}return n.link&&queryAll("a",o).map((t=>t.href=t.title)),n.code&&queryAll("code",o).map((t=>{const e=n.br||/copyable/.test(t.className)?"\n":"",r=t.getAttribute("lang")||(t.className.split("-")||{})[1]||"",o="```"+(r?" "+r:"")+e+t.innerText+e+"```"+e;t.parentElement.replaceChild(document.createTextNode(o),t)})),o};const extract=async(t,e,n,r)=>{const{origin:o,context:a,localOptions:i={}}=n,c=getText(e.title)||document.title,l=c.replace(/[\\\/\?<>:'\*\|]/g,"_"),s=queryAll("img",t).map((t=>{const e=t.getAttribute("downloadName"),r=t.getAttribute("downloadUrl");if(e&&r)return t.src="./"+e,{name:e,downloadUrl:r};const o=(t.getAttribute(n.lazyKey)||t.src).replace(/\?$/,""),a=getExt(o),i=l+"/"+md5(o)+(a?"."+a:"");return t.src="./"+i,{name:i,downloadUrl:o}})),m=(d={title:c,origin:o,author:getText(e.userName),home:getUrl(location.origin,getAttribute("href",e.userLink)),tag:a.tag,description:t.innerText.replace(/^([\n\s]+)/g,"").replace(/\n/g," ").slice(0,50)+"..."},p=i.tpl,d=Object.assign({now:formatDate("yyyy-MM-dd HH:mm:ss"),copyright:!1,url:location.href,description:"转载",tag:[]},d instanceof Object?d:{}),replace((p="string"==typeof p?p:"---\n        title: ${title}\n        date: ${now}\n        copyright: ${copyright}\n        author: ${author}\n        home: ${home}\n        origin: ${origin}\n        url: ${url}\n        tag: ${tag}\n        categories: ${categories}\n        description: ${description}\n    ---\n    ").replace(/\n\s+/g,"\n"),(t=>void 0===d[t]?"":Array.isArray(d[t])?"\n  - "+d[t].join("\n  - "):d[t])));var d,p;const g=html2markdown(m+getMarkdown(t),{}),u=formatCopyRight({title:c,url:location.href},i),y=await r("formatContent",{markdownBody:t,markdownDoc:g});return s.push({name:l+".md",content:`${y&&"string"==typeof y?y:g}${u}`}),{fileName:c,files:s}};export const downloadMarkdown=async(...t)=>{const e={},{options:n,hook:r}=formatParams(...t),{selectors:o,el:a=document}=n,i=getContainer(a),c={container:i,options:n},l=async(t,n)=>await exec(r[t],e,Object.assign(c,n instanceof Object?n:{}))instanceof Object;if(n.context=e,await l("beforeExtract"))return exec();const s=formatMarkdownBody(i,o,n);if(await l("extract",{markdownBody:s}))return exec();const{fileName:m,files:d}=await extract(s,o,n,exec);return await l("afterExtract",{fileName:m,files:d})?exec():{type:"download",fileName:m,files:d}};export default downloadMarkdown;