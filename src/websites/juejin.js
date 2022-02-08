export const config = {
  hosts: ['juejin.im', 'juejin.cn']
}

export const apply = (extract) => {
  extract()
}

export default {
  config,
  apply
}
