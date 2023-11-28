export const hosts = [/(.*\.|)oschina.net$/]

export const options = {
  origin: 'oschina',
  link: false,
  br: true,
  code: false,
  selectors: {
    title: '.article-box h1.article-box__title',
    body: '.article-box .article-box__content .detail-box',
    copyBtn: '.copy-code-btn',
    userName: '.article-box .article-box__meta .item-list .item:nth-child(2) a',
    userLink: '.article-box .article-box__meta .item-list .item:nth-child(2) a',
    invalid: '',
    unpack: '',
    tag: '.article-box__group .group-card__name'
  }
}

export const hook = {}

export const config = {
  hosts,
  options,
  hook
}

export default config
