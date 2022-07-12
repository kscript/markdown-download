import convert from './'
import download from './download'
import { configs as websiteConfigs } from './websites'

export { convert, download, websiteConfigs }

export const markdownDownload = (options, customOptions) => {
	const {fileName, files} = convert(options, customOptions)
	download(fileName, files)
}

if (typeof window !== 'undefined') {
	markdownDownload.websiteConfigs = websiteConfigs
	markdownDownload.convert = convert
	markdownDownload.download = download
	window.markdownDownload = markdownDownload
}

export default markdownDownload