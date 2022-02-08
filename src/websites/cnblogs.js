export const config = {
  hosts: ['www.cnblogs.com', 'cnblogs.com']
}

export const apply = (extract) => {
  extract({
    origin: 'cnblogs',
    link: false,
    br: true,
    code: false,
    selectors: {
      title: '#cb_post_title_url',
      body: '#cnblogs_post_body',
      copyBtn: '.cnblogs_code_toolbar',
      userName: '#author_profile_detail a:nth-child(1)',
      userLink: '#author_profile_detail a:nth-child(1)',
      invalid: '',
      unpack: ''
    }
  })
}

export default {
  config,
  apply
}
