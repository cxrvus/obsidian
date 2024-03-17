import * as fs from 'fs'


type Dir = ReturnType<typeof loadDir>
type File = ReturnType<typeof loadFile>


export const loadDir = (dirName: string) => {
	return fs.readdirSync(dirName)
		.map((fileName) => loadFile(dirName, fileName))
		.filter((file) => file !== null)
	;
}


export const saveDir = (dir: Dir) => {
	dir.forEach((file) => { saveFile(file) })
}


export const loadFile = (dirName: string, fileName: string) => {
	if(!fileName?.endsWith('.md')) return null

	const path = `${dirName}/${fileName}`
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

	return { attr, attrEntries, content, dir: dirName, name: fileName, path, rawContent, stats };
}


export const saveFile = (file: File) => {
	const { attr, content, dir, name } = file
	const path = `${dir}/${name}`
	const attrStr = JSON.stringify(attr, Object.keys(attr).sort(), '\t');
	const newContent = `---\n${attrStr}\n---\n${content}`
	fs.writeFileSync(path, newContent);
}
