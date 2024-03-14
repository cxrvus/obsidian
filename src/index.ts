import * as fs from 'fs'

export const loadDir = (dir: string) => {
	return fs.readdirSync(dir)
		// .filter((name) => !name.endsWith('.md'))
		.map((name) => ({ 
			file: getFileObj(name, `${dir}/${name}`)
		}))
	;
}


const getFileObj = (name: string, path: string) => {
	return {
		name,
		path,
		stats: fs.statSync(path),
		rawContent: fs.readFileSync(path, 'utf-8'),
	}
}
