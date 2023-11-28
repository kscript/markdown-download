export const hosts = ['segmentfault.com']

export const options = {
  origin: 'segmentfault',
  link: false,
  br: true,
  code: false,
  selectors: {
    title: 'h1 .text-body',
    body: 'article.article-content',
    copyBtn: '.copy-code-btn',
    userName: '.card-body picture+strong',
    userLink: '.card-body h1+div a:nth-child(1)',
    invalid: '',
    unpack: '',
    tag: '.article-wrap .badge-tag'
  }
}

export const hook = {}

export const config = {
  hosts,
  options,
  hook
}

export default config
