import * as fs from 'fs'
import path = require('path');

export const loadDir = (dir: string) => {
	return fs.readdirSync(dir)
		.filter((name) => name.endsWith('.md'))
		.map((name) => getFileObj(dir, name))
	;
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
	const attr = JSON.parse(frontMatter)
	const attrEntires = Object.entries(attr)

	return {
		attr,
		attrEntires,
		content,
		name,
		path,
		rawContent,
		stats: fs.statSync(path),
	};
}
