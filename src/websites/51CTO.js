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
        userLink: '.avatar-img',
        invalid: '',
        unpack: '',
        tag: '.mess-tag .shence_tag',
        categories: '.mess-tag .shence_cate'
    }
}

export const hook = {}

export const config = {
    hosts,
    options,
    hook
}

export default config
