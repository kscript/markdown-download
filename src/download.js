import md5 from 'md5'
import JSZip from 'jszip'
import FileSaver from 'jszip/vendor/FileSaver'

const defaultOptions = {
  partLimit: 1e3,
  requestLimit: 5,
  retry: 3
}

const options = Object.assign({}, defaultOptions)

export const mergeOptions = (newOptions) => {
  return Object.assign(options, defaultOptions, newOptions instanceof Object ? newOptions : {})
}


export const noop = (func, defaultFunc) => {
  return typeof func === 'function' ? func : typeof defaultFunc === 'function' ? defaultFunc : () => {}
}

export const ajax = (options) => {
  options = Object.assign({}, defaultOptions, options)
  const core = (retry = 3) => {
    const xhr = new XMLHttpRequest()
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
      if (retry--) {
        console.log(err)
        noop(options.error)(err, xhr)
      } else {
        setTimeout(() => {
          core(retry - 1)
        }, 3e3)
      }
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
  core(options.retry)
}

export const fetchBlobFile = (file) =>{
  return new Promise((resolve, reject) => {
    if (file.content) {
      resolve(new Blob([file.content], {type : file.type || 'text/plain'}))
    } else {
      ajax({
        url: file.downloadUrl,
        type: 'get',
        data: '',
        dataType: 'blob',
        success: (blob) => {
          resolve(blob)
        },
        error: () => {
          resolve(new Blob([file.downloadUrl], {type : 'text/plain'}))
        }
      })
    }
  })
}

export const partTask = (items, handler, limit) => {
  let index = 0
  let list = items.slice(0)
  let queue = Promise.resolve()
  const result = []
  while (list.length) {
    const current = list.splice(0, limit)
    const currentIndex = index++
    queue = queue.then(() => {
      return new Promise((resolve) => {
        Promise.all(handler(current, currentIndex)).then(datas => {
          result.push.apply(result, datas)
        })
        .finally(() => resolve(result))
      })
    })
  }
  return queue
}

export const partRequest = (fileName, files, { requestLimit } = options) => {
  const zip = new JSZip()
  const handler = (files) => files.map(file => fetchBlobFile(file, zip).then(blob => {
    zip.file(file.name, blob)
    return blob
  }))
  return partTask(files, handler, requestLimit).then((datas) => {
    return zip.generateAsync({
      type: "blob"
    }).then((content) => {
      return new Promise((resolve) => {
        FileSaver(content, fileName);
        setTimeout(() => {
          resolve()
        }, 1.5e4)
      })
    })
  })
}

export const partDownload = (fileName, files, { partLimit } = options) => {
  const count = ~~(files.length / partLimit)
  return partTask(files, (files, index) => {
    const partMame = count >= 1 ? '-p' + (index + 1) + '-' + count : ''
    const name = fileName + partMame + '.zip'
    return [partRequest(name, files, options)]
  }, partLimit)
}

export const downloadZip = (fileName, files, options = {}) => {
  fileName = fileName || md5(files.map(item => item.downloadUrl).join('|'))
  return partDownload(fileName, files, mergeOptions(options))
}

export default downloadZip