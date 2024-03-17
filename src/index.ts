import * as fs from 'fs'
import path = require('path');


export const loadDir = (dir: string) => {
	return fs.readdirSync(dir)
		.filter((name) => name.endsWith('.md'))
		.map((name) => getFileObj(dir, name))
		.filter((fileObj) => fileObj !== null)
	;
}


export const saveDir = (data: ReturnType<typeof loadDir>) => {
	data.forEach((fileObj) => {
		const { path } = fileObj;
		const fullContent = stringFromFileObj(fileObj);
		fs.writeFileSync(path, fullContent);
	});
}


const getFileObj = (dir: string, name: string) => {
	const path = `${dir}/${name}`
	const rawContent = fs.readFileSync(path, 'utf-8')

	const lines = rawContent.split('\n')
	const [first, second] = lines
	const hasValidFrontMatter = first === '---' && second === '{'
	const frontMatterEnd = lines.indexOf('---', 2)
	const frontMatter = hasValidFrontMatter ? lines.slice(1, frontMatterEnd).join('\n') : '{}'
	const content = hasValidFrontMatter ? lines.slice(frontMatterEnd + 1).join('\n') : rawContent

	let attr: Object

	try {
		attr = JSON.parse(frontMatter)
	}
	catch (e) {
		console.log('Error parsing front matter in file: ', path)
		return null
	}

	const attrEntries = Object.entries(attr)

	const { birthtime, mtime, size } = fs.statSync(path)
	const stats = { birthtime, mtime, size }

	return { attr, attrEntries, content, name, path, rawContent, stats };
}


const stringFromFileObj = (fileObj: ReturnType<typeof getFileObj>) => {
	const { attr, content } = fileObj
	const attrStr = JSON.stringify(attr, Object.keys(attr).sort(), '\t');
	return `---\n${attrStr}\n---\n${content}`
}
