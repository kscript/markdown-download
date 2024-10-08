# markdown-download
markdown文档下载 chrome插件

## 作为插件使用
1. 在命令行中执行拉取/安装/打包
``` cmd
git clone https://github.com/kscript/markdown-download
cd markdown-download
npm install
npm run build
```
> 也可以在clone后使用`gh-pages`分支中的文件
2. 在chrome浏览器扩展程序中`开启开发者模式`
3. 选择`加载已解压的扩展程序`, 选中项目打包后的dist文件夹
4. 访问已支持的网站的文章详情页面, 等待文章内图片全部加载后, 点击插件图标

## 作为模块使用
### 安装
```
npm i markdown-downloader
```
### 使用
> 由于会操作dom元素, 所以运行时需要在浏览器环境下
``` js
// 方式1. 导入模块
import markdownDownload, { convert, download, websiteConfigs } from 'markdown-downloader'
markdownDownload(websiteConfigs.juejin, {
	// 包含所有信息的innerHTML文本
	context: ``
})
```
```html
<!-- 方式2. 直接使用脚本文件 -->
<script src="./markdownDownload.js"></script>
<script>
	// 给window对象添加一个markdownDownload函数, convert, download, websiteConfigs作为其属性
	markdownDownload(markdownDownload.websiteConfigs.juejin, {
		// 包含所有信息的innerHTML文本
		context: ``
	})
</script>
```

## 已支持的网站
[Github Issue](https://github.com/)  
[掘金](https://juejin.cn/)  
[知乎专栏](https://zhuanlan.zhihu.com/)  
[思否专栏](https://segmentfault.com/)  
[简书](https://www.jianshu.com/)  
[博客园](https://www.cnblogs.com/)  
[微信文章](https://mp.weixin.qq.com/)  
[开源中国](https://www.oschina.net/)  
[CSDN](https://blog.csdn.net/)  