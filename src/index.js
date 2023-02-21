import md5 from 'md5'
import html2markdown from 'html-to-md'
import { websites, hooks } from './websites'
import merge from 'webpack-merge'
import 'mathjax/es5/tex-svg'
import { 
  isExtension,
  getExt,
  query,
  getText,
  getAttribute,
  queryAll,
  noop,
  sendMessage,
  formatDate,
  insertAfter,
  getUrl
} from './utils'


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

const convert = async (options, customOptions) => {
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
  customOptions = customOptions instanceof Object ? customOptions : {}
  options = merge({}, defaultOptions, options instanceof Object ? options : {}, customOptions)
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
  const hook = hooks[origin] || {}
  const result = await noop(hook.beforeExtract)(Object.assign(context, {
    options
  }))
  if (result instanceof Object) {
    return result
  }
  const markdownBody = query(selectors.body, options.context).cloneNode(true)
  const fileName = (getText(selectors.title) || document.title)
  const realName = fileName.replace(/[\\\/\?<>:'\*\|]/g, '_')
  noop(hook.extract)(context, { markdownBody, fileName, realName })
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
  const files = queryAll('img', markdownBody).map(item => {
    const downloadName = item.getAttribute('downloadName')
    const downloadUrl = item.getAttribute('downloadUrl')
    if (downloadName && downloadUrl) {
      item.src = './' + downloadName
      options.urls !== false && urls.push(downloadUrl)
      return {
        name: downloadName,
        downloadUrl
      }
    }
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
  const markdwonDoc = html2markdown(info + getMarkdown(markdownBody), {})
  const copyright = '> 当前文档由 [markdown文档下载插件](https://github.com/kscript/markdown-download) 下载, 原文链接: [' + fileName + '](' + location.href + ')  '
  const content = await noop(hook.formatContent)(context, { markdownBody, markdwonDoc })
  files.push({
    name: realName + '.md',
    content:  (content && typeof content === 'string' ? content: markdwonDoc )+ '\n\n' + copyright
  })
  files.push({
    name: realName + '/urls',
    content: urls.join('\n')
  })
  noop(hook.afterExtract)(Object.assign(context, { files }))
  return {
    type: 'download',
    fileName,
    files
  }
}

const extract = async (options, customOptions) => {
  const datas = await convert(options, customOptions)
  sendMessage(datas)
  return datas
}

if (isExtension) {
  chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    if (message instanceof Object) {
      if (message.type === 'download') {
        if (typeof websites[message.website] === 'function') {
          await websites[message.website](extract)
        }
      }
    }
    sendResponse('')
  })
}

export default convert