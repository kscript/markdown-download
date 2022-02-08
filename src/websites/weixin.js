export const config = {
  hosts: ['mp.weixin.qq.com']
}
export const hook = {
  beforeExtract: (context) => {
    const qrcode = document.getElementById('js_pc_qr_code_img')
    qrcode.setAttribute('href', qrcode.getAttribute('src'))
  }
}
export const apply = (extract) => {
  extract({
    origin: 'weixin',
    link: false,
    br: true,
    code: false,
    selectors: {
      title: '#activity-name',
      body: '#js_content',
      copyBtn: '.copy-code-btn',
      userName: '#js_name',
      userLink: '#js_pc_qr_code_img',
      invalid: '',
      unpack: ''
    }
  })
}

export default {
  config,
  hook,
  apply
}
