import * as fs from 'fs'
import * as yaml from 'js-yaml'


type Dir = ReturnType<typeof loadDir>
type File = ReturnType<typeof loadFile>
type FrontMatterMode = 'json' | 'yaml'


export const loadDir = (dirName: string) => {
	return fs.readdirSync(dirName)
		.map((fileName) => loadFile(dirName, fileName))
		.filter((file) => file !== null)
	;
}


export const saveDir = (dir: Dir, frontMatterMode: FrontMatterMode = 'yaml') => {
	dir.forEach((file) => { saveFile(file, frontMatterMode) })
}


export const loadFile = (dirName: string, fileName: string) => {
	if(!fileName?.endsWith('.md')) return null

	const path = `${dirName}/${fileName}`
	const rawContent = fs.readFileSync(path, 'utf-8')

	const lines = rawContent.split('\n')
	const frontMatterEnd = lines.indexOf('---', 2)
	const hasFrontMatter = (frontMatterEnd != -1) && lines?.[0] == '---'
	const frontMatter = hasFrontMatter ? lines.slice(1, frontMatterEnd).join('\n') : '{}'
	const content = hasFrontMatter ? lines.slice(frontMatterEnd + 1).join('\n') : rawContent

	const attr = parseFrontMatter(frontMatter, fileName)
	if (attr === null) return null

	const attrEntries = Object.entries(attr)

	const { birthtime, mtime, size } = fs.statSync(path)
	const stats = { birthtime, mtime, size }

	return { attr, attrEntries, content, dir: dirName, name: fileName, path, rawContent, stats };
}


export const saveFile = (file: File, frontMatterMode: FrontMatterMode = 'yaml') => {
	const { attr, content, dir, name } = file
	const path = `${dir}/${name}`
	const frontMatter = stringifyFrontMatter(attr, frontMatterMode, name)
	const newContent = `---\n${frontMatter}\n---\n${content}`
	fs.writeFileSync(path, newContent);
}


const parseFrontMatter = (frontMatter: string, fileName: string) => {
	try {
		if (frontMatter.startsWith('{')) return JSON.parse(frontMatter)
		else return yaml.load(frontMatter)
	}
	catch (e) {
		console.log('Error parsing front matter\n', e.message, fileName)
		return null
	}
}


const stringifyFrontMatter = (frontMatter: object, frontMatterMode: FrontMatterMode, fileName: string) => {
	try {
		if (frontMatterMode === 'yaml') return yaml.dump(frontMatter).trim()
		else if (frontMatterMode === 'json') return JSON.stringify(frontMatter, Object.keys(frontMatter).sort(), '\t')
	}
	catch (e) {
		console.log('Error stringifying front matter\n', e.message, fileName)
		return null
	}
}
