import path from 'path-browserify'

export const isBrowser = typeof window !== 'undefined' && window instanceof Object
export const isExtension = isBrowser && window.chrome instanceof Object && window.chrome.runtime
export const formatName = (name) => {
  return (typeof name === 'string' ? name : '').replace(/\s/g, '%20').split('?').shift()
}
export const getExt = (fileName) => {
  return formatName(path.parse(fileName).ext.slice(1))
}
export const query = (selector, context = document) => {
  if (selector instanceof NodeList || selector instanceof Node) {
    return selector
  }
  return context.querySelector(selector)
}
export const getText = (selector, context = document) => {
  const el = query(selector, context) || {}
  return el.innerText || ''
}
export const getAttribute = (val, selector, context = document) => {
  const el = query(selector, context)
  return el ? el.getAttribute(val) || '' : ''
}
export const queryAll = (selector, context = document) => {
  return [].slice.apply(context.querySelectorAll(selector))
}
export const noop = (func, defaultFunc) => {
  return typeof func === 'function' ? func : typeof defaultFunc === 'function' ? defaultFunc : () => {}
}
export const encodeUrlData = (data) => {
  let body = ''
  for (let key in data) {
    body += key + '=' + encodeURIComponent(data[key]) + '&'
  }
  return body.slice(0, -1)
}
export const encodeOptionsData = (options) => {
  if (options.stringify !== false && typeof options.data === 'object') {
    options.data = encodeUrlData(options.data)
  }
  return options
}
export const sendMessage = (options, onsuccess, onerror, retry) => {
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
export const formatDate = (str, t) => {
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
export const insertAfter = (newElement, targetElement) => {
  const parent = targetElement.parentNode
  if(parent.lastChild === targetElement){
    parent.appendChild(newElement)
  }else{
    parent.insertBefore(newElement, targetElement.nextSibling)
  }
}
export const getUrl = (prefix, link) => {
  if (!link) return ''
  if (/^(http|https)/.test(link)) {
    return link
  }
  if (/^\/\//.test(link)) {
    return prefix.split('//')[0] + link
  }
  return prefix + link
}
export const exec = async (...rest) => {
    if (!rest.length) return exec.returnValue
    exec.returnValue = false
    try {
        exec.returnValue = typeof rest[0] === 'function' && await rest[0](...rest.slice(1))
    } catch (err) {
        console.warn(err)
    }
    return exec.returnValue
}
export const getLocal = (key) => {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (data) => {
      resolve(data[key])
    })
  })
}
export const setWebsite = async (website, options) => {
  const localWebsites = await getLocal('websites')
  const websites = Object.assign(
    {},
    localWebsites instanceof Object ? localWebsites : {}
  )
  const valid = website
    &&
    options instanceof Object
    &&
    Array.isArray(options.hosts)
    &&
    options.hosts.length
    &&
    (options.selectors || {}).body
  if (valid) {
    options.origin = website
    Object.assign(
      websites,
      {
        [website]: options
      }
    )
    chrome.storage.local.set({
      websites
    })
  } else if (options === null) {
    delete websites[website]
    chrome.storage.local.set({
      websites
    })
  }
  return websites
}
export default {
  isBrowser,
  isExtension,
  formatName,
  getExt,
  query,
  getText,
  getAttribute,
  queryAll,
  noop,
  encodeUrlData,
  encodeOptionsData,
  sendMessage,
  formatDate,
  insertAfter,
  getUrl,
  exec,
  getLocal,
  setWebsite
}