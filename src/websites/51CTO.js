export const hosts = ['blog.51cto.com']

export const options = {
    origin: '51cto',
    link: false,
    br: true,
    code: false,
    selectors: {
        title: '.title',
        body: '.editor-preview-side',
        copyBtn: '.copy-btn',
        userName: '.username .blog-user',
        userLink: '.username',
        invalid: '',
        unpack: '',
        tag: '.mess-tag .shence_tag'
    }
}

export const hook = {}

export const config = {
    hosts,
    options,
    hook
}

export default config
