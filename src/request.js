import qs from 'qs'
import { mergeLocalOptions } from './options'
const noop = (func, defaultFunc) => {
  return typeof func === 'function' ? func : typeof defaultFunc === 'function' ? defaultFunc : () => {}
}
export const blob2array = (blob)  => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(Array.from(new Uint8Array(reader.result)))
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(blob)
  })
}
export const array2blob = (array, mimeType = '') => {
  return new Blob([new Uint8Array(array)], { type: mimeType });
}

export const fetchBlobFile = (file) => {
  return new Promise((resolve) => {
    if (file.content) {
      resolve(new Blob([file.content], {type : file.type || 'text/plain'}))
    } else {
      chrome.runtime.sendMessage({ type: 'get', url: file.downloadUrl, dataType: 'blob' }, ([error, message]) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
          return;
        }
        if (error) {
          resolve(new Blob([file.downloadUrl], {type : 'text/plain'}))
        } else {
          resolve(array2blob(message.data, message.mimeType || 'text/plain'))
        }
      })
    }
  })
}

export const ajax = async (options) => {
  const config = await mergeLocalOptions()
  const core = (retry = 3) => {
    const errorCB = (err) => {
      if (retry-- > 0) {
        setTimeout(() => {
          core(retry - 1)
        }, 3e3)
      } else {
        noop(options.error)(err)
      }
    }
    const { method = 'get', data, dataType, headers, success } = options
    const fetchOptions = {
      method,
      headers: headers instanceof Object ? headers : {}
    }
    if (/get/i.test(method)) {
      options.url += (/\?/.test(options.url) ? '&' : '?') + qs.stringify(data)
    } else {
      fetchOptions.body = JSON.stringify(data)
    }
    fetch(options.url, Object.assign(fetchOptions)).then(res => {
      return res[dataType] ? res[dataType]() : res.text()
    }).then(success).catch(errorCB)
  }
  core(config.retry)
}

export default {
  ajax,
  fetchBlobFile
}