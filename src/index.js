const md5 = require('md5');
const html2markdown = require('html-to-md');
const getExt = (fileName) => {
  return fileName.split('.').pop()
}

const query = (selector, context = document) => {
  return context.querySelector(selector)
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

window.juejin = () => {
  const markdownBody = query('.markdown-body').cloneNode(true)
  queryAll('.copy-code-btn', markdownBody).map(item => item.parentElement.removeChild(item))
  queryAll('style', markdownBody).map(item => item.parentElement.removeChild(item))
  queryAll('a', markdownBody).map(item => item.href = item.title)
  queryAll('[data-id]', markdownBody).map(item => item.removeAttribute('data-id'))
  queryAll('code', markdownBody).map(item => {
      const br = /copyable/.test(item.className) ? '\n' : ''
      const lang = item.getAttribute('lang') || ''
      const text = '```' + (lang ? ' ' + lang : '') + br + item.innerText + br + '```' + br
      item.parentElement.replaceChild(document.createTextNode(text), item)
  })
  const files = queryAll('img', markdownBody).map(item => {
    const url = item.src
    const ext = getExt(url)
    const name = md5(url) + (ext ? '.' + ext : '')
    item.src = './' + name
    return {
      name,
      downloadUrl: url
    }
  })
  const getMarkdown = () => {
    return markdownBody.innerHTML
    .replace(/<(\/|)(pre|p|figcaption|figure)>/g, '')
    // .replace(/(&lt;|&gt;)/g, (s, s1) => ({
    //   '&lt;': '<', '&gt;': '>'
    //   }[s1] || s))
  }
  const markdwonDoc = html2markdown(getMarkdown(), {})
  const fileName = ((query('.article-title') || {}).innerText || document.title)
  files.push({
    name: fileName + '.md',
    content:  markdwonDoc + '\n\n' + '> 当前文档由 [markdown文档下载插件](https://github.com/kscript/markdown-download) 下载, 原文链接: [' + fileName + '](' + location.href + ')  '
  })
  copyText(markdwonDoc)
  sendMessage({
    type: 'download',
    fileName,
    files
  })
}