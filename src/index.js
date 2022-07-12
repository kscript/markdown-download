import md5 from 'md5'
import path from 'path-browserify'
import html2markdown from 'html-to-md'
import { websites, hooks } from './websites'
import merge from 'webpack-merge'

const isBroswer = typeof window !== 'undefined' && window instanceof Object
const isExtension = isBroswer && window.chrome instanceof Object && window.chrome.runtime

const getExt = (fileName) => {
  return path.parse(fileName).ext.slice(1)
}

const query = (selector, context = document) => {
  if (selector instanceof NodeList || selector instanceof Node) {
    return selector
  }
  return context.querySelector(selector)
}

const getText = (selector, context = document) => {
  const el = query(selector, context) || {}
  return el.innerText || ''
}

const getAttribute = (val, selector, context = document) => {
  const el = query(selector, context)
  return el ? el.getAttribute(val) || '' : ''
}

const queryAll = (selector, context = document) => {
  return [].slice.apply(context.querySelectorAll(selector))
}

const noop = (func, defaultFunc) => {
  return typeof func === 'function' ? func : typeof defaultFunc === 'function' ? defaultFunc : () => {}
}

const encodeUrlData = (data) => {
  let body = ''
  for (let key in data) {
    body += key + '=' + encodeURIComponent(data[key]) + '&'
  }
  return body.slice(0, -1)
}

const encodeOptionsData = (options) => {
  if (options.stringify !== false && typeof options.data === 'object') {
    options.data = encodeUrlData(options.data)
  }
  return options
}

const sendMessage = (options, onsuccess, onerror, retry) => {
  if (isExtension) {
    retry = isNaN(retry) ? 3 : +retry
    encodeOptionsData(options)
    chrome.runtime.sendMessage(options, ([error, response, headers, xhr]) => {
      if (!error) {
        try {
          const result = noop(onsuccess)(response, headers, xhr)
          if (result === void 0) {
            return response
          }
          // onsuccess返回值不为undefined, 视为调用失败
          error = result
        } catch (err) {
          // 执行onsuccess代码出错
          error = err
        }
      }
      if (retry-- > 0) {
        sendMessage(options, onsuccess, onerror, retry)
      } else {
        noop(onerror)(error, headers, xhr)
      }
    })
  }
}

const formatDate = (str, t) => {
  t = typeof t === 'string' || !isNaN(t) ? new Date(t) : t
  if (t instanceof Date === false) {
    t = new Date()
  }
  const obj = {
    yyyyyyyy: t.getFullYear(),
    yy: t.getFullYear(),
    MM: t.getMonth()+1,
    dd: t.getDate(),
    HH: t.getHours(),
    hh: t.getHours() % 12,
    mm: t.getMinutes(),
    ss: t.getSeconds(),
    ww: '日一二三四五六'.split('')[t.getDay()]
  };
  return str.replace(/([a-z]+)/ig, function ($1){
    return (obj[$1+$1] === 0 ? '0' : obj[$1+$1]) || ('0' + obj[$1]).slice(-2);
  });
}

const setInfo = (data) => {
  data = Object.assign({
    date: formatDate('yyyy-MM-dd HH:mm:ss'),
    coypright: false,
    url: location.href,
    description: '转载',
  }, data instanceof Object ? data : {})
  return `---
  title: {{title}}
  date: {{date}}
  copyright: {{coypright}}
  author: {{author}}
  home: {{home}}
  origin: {{origin}}
  url: {{url}}
  tag: {{tag}}
  categories: {{categories}}
  description: {{description}}
  ---
  `.replace(/\n\s+/g, '\n').replace(/\{\{(.*?)\}\}/g, (s, s1) => data[s1] === void 0 ? '' : data[s1])
}

const getMarkdown = (markdownBody) => {
  return markdownBody.innerHTML
  // .replace(/<(\/|)(pre|p|figcaption|figure)>/g, '')
  // .replace(/(&lt;|&gt;)/g, (s, s1) => ({
  //   '&lt;': '<', '&gt;': '>'
  //   }[s1] || s))
}

const insertAfter = (newElement, targetElement) => {
  const parent = targetElement.parentNode
  if(parent.lastChild === targetElement){
    parent.appendChild(newElement)
  }else{
    parent.insertBefore(newElement, targetElement.nextSibling)
  }
}

const getUrl = (prefix, link) => {
  if (!link) return ''
  if (/^(http|https)/.test(link)) {
    return link
  }
  if (/^\/\//.test(link)) {
    return prefix.split('//')[0] + link
  }
  return prefix + link
}

const convert = (options, customOptions) => {
  const context = {}
  const defaultOptions = {
    origin: 'juejin',
    // 处理链接
    link: true,
    // 处理换行
    br: false,
    // 处理代码块
    code: false,
    lazyKey: 'data-src',
    selectors: {
      title: '.article-title',
      body: '.markdown-body',
      copyBtn: '.copy-code-btn',
      userName: '.username .name',
      userLink: '.username',
      invalid: 'style',
      unpack: ''
    }
  }
  options = options instanceof Object ? options : {}
  customOptions = customOptions instanceof Object ? customOptions : {}
  options = merge({}, defaultOptions, options, customOptions)
  if (options.context) {
    if (typeof options.context === 'string') {
      const el = document.createElement('div')
      el.innerHTML = options.context
      options.context = el
    } else {
      options.context = options.context instanceof Node ? options.context : void 0
    }
  }
  const {origin, selectors} = options
  const markdownBody = query(selectors.body, options.context).cloneNode(true)
  const hook = hooks[origin] || {}

  noop(hook.beforeExtract)(Object.assign(context, {
    options,
    markdownBody
  }))
  queryAll(selectors.copyBtn, markdownBody).map(item => item.parentElement.removeChild(item))
  queryAll('[data-id]', markdownBody).map(item => item.removeAttribute('data-id'))
  if (selectors.invalid) {
    queryAll(selectors.invalid, markdownBody).map(item => item.parentElement.removeChild(item))
  }
  if (selectors.unpack) {
    queryAll(selectors.unpack, markdownBody).map(item => {
      const span = document.createElement('span')
      span.innerHTML = item.innerHTML
      insertAfter(document.createElement('br'), item)
      item.parentElement.replaceChild(span, item)
    })
  }
  if (options.link) {
    queryAll('a', markdownBody).map(item => item.href = item.title)
  }
  if (options.code) {
    queryAll('code', markdownBody).map(item => {
      const br = options.br || /copyable/.test(item.className) ? '\n' : ''
      const lang = item.getAttribute('lang') || (item.className.split('-') || {})[1] || ''
      const text = '```' + (lang ? ' ' + lang : '') + br + item.innerText + br + '```' + br
      item.parentElement.replaceChild(document.createTextNode(text), item)
    })
  }
  const urls = []
  const fileName = (getText(selectors.title) || document.title)
  const realName = fileName.replace(/[\\\/\?<>:'\*\|]/g, '_')
  const files = queryAll('img', markdownBody).map(item => {
    const src = item.getAttribute(options.lazyKey) || item.src
    const url = src.replace(/\?$/, '')
    const ext = getExt(url)
    const name = realName + '/' + md5(url) + (ext ? '.' + ext : '')
    item.src = './' + name
    options.urls !== false && urls.push(url)
    return {
      name,
      downloadUrl: url
    }
  })
  const info = setInfo({
    title: fileName,
    origin: origin,
    author: getText(selectors.userName),
    home: getUrl(location.origin, getAttribute('href', selectors.userLink)),
    description: markdownBody.innerText.replace(/^([\n\s]+)/g, '').replace(/\n/g, ' ').slice(0, 50) + '...',
  })
  noop(hook.extract)(context)
  const markdwonDoc = html2markdown(info + getMarkdown(markdownBody), {})
  files.push({
    name: realName + '.md',
    content:  markdwonDoc + '\n\n' + '> 当前文档由 [markdown文档下载插件](https://github.com/kscript/markdown-download) 下载, 原文链接: [' + fileName + '](' + location.href + ')  '
  })
  files.push({
    name: realName + '/urls',
    content: urls.join('\n')
  })
  noop(hook.extractAfter)(Object.assign(context, { files }))
  return {
    type: 'download',
    fileName,
    files
  }
}

const extract = (options, customOptions) => {
  const datas = convert(options, customOptions)
  sendMessage(datas)
  return datas
}

if (isBroswer) {
  if (isExtension) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message instanceof Object) {
        if (message.type === 'download') {
          if (typeof websites[message.website] === 'function') {
            websites[message.website](extract)
          }
        }
      }
      sendResponse('')
    })
  }
}

export default convert