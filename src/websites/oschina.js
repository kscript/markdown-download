export const config = {
	hosts: [/(.*\.|)oschina.net$/]
  }
  
  export const apply = (extract) => {
	extract({
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
		unpack: ''
	  }
	})
  }
  
  export default {
	config,
	apply
  }
  