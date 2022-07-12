import md5 from 'md5'
import JSZip from 'jszip'
import FileSaver from 'jszip/vendor/FileSaver'
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

export const downloadZip = (fileName, files) => {
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

export default downloadZip