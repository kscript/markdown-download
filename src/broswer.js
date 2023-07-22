import convert from './'
import download from './download'
import * as downloadMarkdown from './markdown'
import { configs as websiteConfigs } from './websites'

export { convert, download, websiteConfigs }

export const downloader = (options, customOptions) => {
	const {fileName, files} = convert(options, customOptions)
	download(fileName, files)
}

if (typeof window !== 'undefined') {
	downloader.websiteConfigs = websiteConfigs
	downloader.convert = convert
	downloader.download = download
	downloader.downloadMarkdown = downloadMarkdown
	window.downloader = downloader
}

export default downloader