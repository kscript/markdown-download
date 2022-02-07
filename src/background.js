const md5 = require('md5');
const JSZip = require("jszip");
const FileSaver = require("jszip/vendor/FileSaver.js");

const noop = (func, defaultFunc) => {
  return typeof func === 'function' ? func : typeof defaultFunc === 'function' ? defaultFunc : () => {}
}

const ajax = (options) => {
  var xhr = new XMLHttpRequest()
  options.method = options.method || 'get'
  xhr.responseType = options.dataType || 'json';
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4) {
      try {
        noop(options.success)(xhr.response, xhr)
      } catch (err) {
        noop(options.error)(err, xhr)
      }
    }
  }
  xhr.error = (err) => {
    console.log(err)
    noop(options.error)(err, xhr)
  }
  if (/post/i.test(options.method)) {
    xhr.open(options.method, options.url, options.async !== false)
    xhr.setRequestHeader('Content-type', /json/i.test(options.dataType) ? 'application/json' : 'application/x-www-form-urlencoded')
    xhr.send(options.data)
  } else {
    xhr.open(options.method, options.url, options.async !== false)
    xhr.send()
  }
}

const downloadZip = (files, fileName) => {
  fileName = fileName || md5(files.map(item => item.downloadUrl).join('|'))
  const zip = new JSZip()
  const fetchFile = (file) =>{
    return new Promise((resolve, reject) => {
      if (file.content) {
        const blob = new Blob([file.content], {type : file.type || 'text/plain'})
        zip.file(file.name, blob)
        resolve(blob)
      } else {
        ajax({
          url: file.downloadUrl,
          type: 'get',
          data: '',
          dataType: 'blob',
          success: (blob) => {
            zip.file(file.name, blob);
            resolve(blob)
          },
          error: reject
        })
      }
    })
  }
  return Promise.all(
    files.map(file => fetchFile(file))
  ).then((datas) => {
    zip.generateAsync({
      type: "blob"
    }).then(function(content) {
      FileSaver(content, fileName + '.zip');
    })
  })
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const getHeaders = (xhr) => {
    const headers = {}
    if (Array.isArray(message.responseHeaders)) {
      message.responseHeaders.map(item => {
        headers[item] = xhr.getResponseHeader(item)
      })
    }
    return headers
  }
  const sendSuccess = (message, xhr) => {
    sendResponse([null, message, getHeaders(xhr), xhr])
  }
  const sendError = (error, xhr) => {
    sendResponse([error, null, getHeaders(xhr), xhr])
  }
  if (/(get|post)/i.test(message.type)) {
    ajax({
      url: message.url,
      method: message.type,
      data: message.data,
      dataType: message.dataType,
      success (data, xhr) {
        if (/text|blob/i.test(message.dataType)) {
          sendSuccess(data, xhr)
        } else {
          const obj = message.dataType === 'text' ? data : JSON.parse(data)
          const result = /^json$/i.test(message.dataType) ? {
            callback: message.callback,
            data: obj
          } : data
          if (typeof message.callback === 'string' && message.callback.length) {
            sendSuccess(result, xhr)
          } else {
            sendSuccess(obj, xhr)
          }
        }
      },
      error (error, xhr) {
        sendError(error, xhr)
      }
    })
  } else if (message.type === 'download') {
    downloadZip(message.files, message.fileName)
  }
  return true
})

const sendMessage = (message, onsuccess) => {
  chrome.tabs.query({
    active: true,
    currentWindow: true
  }, (tabs) => {
    console.log(tabs)
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, message, onsuccess)
    }
  })
}
chrome.browserAction.onClicked.addListener(function (tab) {
  const host = new URL(tab.url).host
  if ([
    'juejin.im',
    'juejin.cn',
  ].includes(host)) {
    sendMessage({
      type: 'download',
      website: 'juejin'
    })
  } else
  if ([
    'zhuanlan.zhihu.com'
  ].includes(host)) {
    sendMessage({
      type: 'download',
      website: 'zhihu'
    })
  }
});