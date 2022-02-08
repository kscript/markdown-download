export const config = {
  hosts: ['segmentfault.com']
}

export const apply = (extract) => {
  extract({
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
      unpack: ''
    }
  })
}

export default {
  config,
  apply
}
