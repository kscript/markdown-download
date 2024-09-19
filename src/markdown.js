import merge from 'webpack-merge'
import md5 from 'md5'
import html2markdown from 'html-to-md'
import 'mathjax/es5/tex-svg'
import { query, getExt, getText, getUrl, queryAll, insertAfter, getAttribute, formatDate, exec, formatName } from './utils'
const replace = (str, fn) => {
    fn = typeof fn === 'function' ? fn : (s) => s
    return str.replace(/\$\{(.*?)\}/g, (s, s1) => fn(s1.replace(/(^\s+|\s+$)/g, '')))
}
const setInfo = (data, tpl) => {
    data = Object.assign({
        now: formatDate('yyyy-MM-dd HH:mm:ss'),
        copyright: false,
        url: location.href,
        description: '转载',
        tag: []
    }, data instanceof Object ? data : {})
    tpl = typeof tpl === 'string' ? tpl : `---
        title: \${title}
        date: \${now}
        copyright: \${copyright}
        author: \${author}
        home: \${home}
        origin: \${origin}
        url: \${url}
        tag: \${tag}
        categories: \${categories}
        description: \${description}
    ---
    `
    return replace(tpl.replace(/\n\s+/g, '\n'), (s1) => data[s1] === void 0 ? '' : Array.isArray(data[s1]) ? '\n  - ' + data[s1].join('\n  - ') : data[s1])
}
const formatCopyRight = (data, { retain, copyright }) => {
    const tpl = retain ? '> 当前文档由 [markdown文档下载插件](https://github.com/kscript/markdown-download) 下载, 原文链接: [${title}](${url})  ' : copyright
    return typeof tpl === 'string' ? '\n\n' + replace(tpl, (s1) => data[s1] || '') + '\n\n' : ''
}
const getMarkdown = (markdownBody) => {
    return markdownBody.innerHTML
    // .replace(/<(\/|)(pre|p|figcaption|figure)>/g, '')
    // .replace(/(&lt;|&gt;)/g, (s, s1) => ({
    //   '&lt;': '<', '&gt;': '>'
    //   }[s1] || s))
}

export const tex2svg = (markdownDoc) => {
    return markdownDoc.replace(/<ztext>(.*?)<\/ztext>/g, (s, s1) => {
        const tex = decodeURIComponent(s1)
        const svg = MathJax.tex2svg(tex)
        svg.setAttribute('data-tex', tex)
        svg.style.display = 'inline'
        return svg.outerHTML
    })
}

const formatParams = (options, customOptions, hook) => {
    const defaultOptions = {
        br: false,
        code: false,
        link: true,
        lazyKey: 'data-src',
        origin: '',
        selectors: {}
    }
    customOptions = customOptions instanceof Object ? customOptions : {}
    options = merge({}, defaultOptions, options instanceof Object ? options : {}, customOptions)
    hook = hook instanceof Object ? hook : {}
    return {
        options, customOptions, hook
    }
}
const getContainer = (container) => {
    if (container) {
        if (typeof container === 'string') {
            const el = document.createElement('div')
            el.innerHTML = container
            return el
        } else {
            return container instanceof Node ? container : document
        }
    }
    return document
}

export const formatMarkdownBody = (container, selectors, options, exec) => {
    const markdownBody = query(selectors.body, container).cloneNode(true)
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
    if (selectors.tag) {
        const tag = []
        queryAll(selectors.tag).map(item => {
            tag.push(item.innerText.replace(/(^[\n\s]+|[\n\s]+$)/g, ''))
        })
        options.context.tag = tag
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
    return markdownBody
}

const extract = async ({ markdownBody, selectors, options, exec, hook }) => {
    const { origin, context, localOptions = {} } = options
    const fileName = getText(selectors.title) || document.title
    const realName = fileName.replace(/[\\\/\?<>:'\*\|]/g, '_')
    const files = queryAll('img', markdownBody).map(item => {
        const downloadName = item.getAttribute('downloadName')
        const downloadUrl = item.getAttribute('downloadUrl')
        if (downloadName && downloadUrl) {
            item.src = './' + formatName(downloadName)
            return {
                name: downloadName,
                downloadUrl
            }
        }
        const src = item.getAttribute([].concat(options.lazyKey || []).find(key => item.getAttribute(key)) || 'src')
        const url = src.replace(/\?$/, '')
        const ext = getExt(url)
        const name = realName + '/' + md5(url) + (ext ? '.' + ext : '')
        item.src = './' + formatName(name)
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
        tag: context.tag,
        description: markdownBody.innerText.replace(/^([\n\s]+)/g, '').replace(/\n/g, ' ').slice(0, 50) + '...',
    }, localOptions.tpl)
    const markdownDoc = html2markdown(info + getMarkdown(markdownBody), {})
    const copyright = formatCopyRight({ title: fileName, url: location.href }, localOptions)
    const content = await exec(hook['formatContent'], context, { markdownBody, markdownDoc })
    files.push({
        name: realName + '.md',
        content: `${content && typeof content === 'string' ? content : markdownDoc}${copyright}`
    })
    return {
        fileName,
        files
    }
}

export const downloadMarkdown = async (...rest) => {
    const context = {}
    const { options, hook } = formatParams(...rest)
    const { selectors, el = document } = options
    const container = getContainer(el)
    const state = { container, options }
    const verify = async (hookName, data) => {
        return await exec(hook[hookName], context, Object.assign(state, data instanceof Object ? data : {})) instanceof Object
    }
    options.context = context

    if (await verify('beforeExtract')) return exec()

    const markdownBody = formatMarkdownBody(container, selectors, options, exec)
    if (await verify('extract', { markdownBody })) return exec()

    const { fileName, files } = await extract({ markdownBody, selectors, options, exec, hook })
    if (await verify('afterExtract', { fileName, files })) return exec()

    return {
        type: 'download',
        fileName,
        files
    }
}

export default downloadMarkdown