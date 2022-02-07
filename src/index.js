const md5 = require('md5');
const html2markdown = require('html-to-md');
const getExt = (fileName) => {
  return fileName.split('.').pop()
}

const query = (selector, context = document) => {
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

const copyText = (text) => {
  const copyText = document.createElement('textarea')
  copyText.style.position = 'absolute'
  copyText.style.left = '-9999px'
  copyText.style.width = '1px'
  copyText.style.height = '1px'
  copyText.value = text
  document.body.appendChild(copyText)
  copyText.select()
  document.execCommand('copy')
  document.body.removeChild(copyText)
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
  .replace(/<(\/|)(pre|p|figcaption|figure)>/g, '')
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

const extract = (options) => {
  const defaultOptions = {
    origin: 'juejin',
    // 处理链接
    link: true,
    // 处理段落
    paragraph: false,
    // 处理换行
    br: false,
    // 处理代码块
    code: false,
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
  options = Object.assign({}, defaultOptions, options instanceof Object ? options : {})
  const origin = options.origin || 'juejin'
  const selectors = Object.assign({}, defaultOptions.selectors, options.selectors instanceof Object ? options.selectors : {})

  const markdownBody = query(selectors.body).cloneNode(true)
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

  const fileName = (getText(selectors.title) || document.title)
  const realName = fileName.replace(/[\\\/\?<>:'\*\|]/g, '_')
  const info = setInfo({
    title: fileName,
    origin: origin,
    author: getText(selectors.userName),
    home: location.origin + getAttribute('href', selectors.userLink),
    description: markdownBody.innerText.slice(0, 50) + '...',
  })
  const markdwonDoc = html2markdown(info + getMarkdown(markdownBody), {})
  const files = queryAll('img', markdownBody).map(item => {
    const url = item.src
    const ext = getExt(url)
    const name = realName + '/' + md5(url) + (ext ? '.' + ext : '')
    item.src = './' + name
    return {
      name,
      downloadUrl: url
    }
  })
  files.push({
    name: realName + '.md',
    content:  markdwonDoc + '\n\n' + '> 当前文档由 [markdown文档下载插件](https://github.com/kscript/markdown-download) 下载, 原文链接: [' + fileName + '](' + location.href + ')  '
  })
  copyText(markdwonDoc)
  sendMessage({
    type: 'download',
    fileName,
    files
  })
}

const zhihu = () => {
  extract({
    origin: 'zhihu',
    link: false,
    paragraph: true,
    br: true,
    code: false,
    selectors: {
      title: '.Post-Title',
      body: '.Post-RichText',
      copyBtn: '.copy-code-btn',
      userName: '.AuthorInfo-name .Popover .UserLink-link',
      userLink: '.AuthorInfo-name .Popover .UserLink-link',
      invalid: 'noscript,.ZVideoLinkCard-author',
      unpack: 'p,figure'
    }
  })
}

const juejin = () => {
  extract()
}

const websites = {
  juejin,
  zhihu
}

window.websites = websites

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(message)
  if (message instanceof Object) {
    if (message.type === 'download') {
      if (typeof websites[message.website] === 'function') {
        websites[message.website]()
      }
    }
  }
  sendResponse('')
})