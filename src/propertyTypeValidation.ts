import { error } from 'console';
import * as yup from 'yup';

const types = {
	"aliases": 				yup.array().of(yup.string()),
	"annotation-target": 	yup.object(),
	"date": 				yup.object(),
	"deadline": 			yup.object(),
	"done": 				yup.object(),
	"due": 					yup.object(),
	"flows": 				yup.object(),
	"height": 				yup.object(),
	"margin": 				yup.object(),
	"prio": 				yup.object(),
	"ref": 					yup.object(),
	"repeat": 				yup.object(),
	"template": 			yup.object(),
	"theme": 				yup.object(),
	"transition": 			yup.object(),
	"width": 				yup.object(),
	"year": 				yup.object(),
}


export const validateFrontmatter = (frontmatter: {[key: string]: unknown}) => {
	Object.entries(frontmatter)
		.map(entry => validateEntry(entry))
		.map(([_, error]) => error)
		.join("\n")
	;
}


const validateEntry = (entry: [string, unknown]): [string, string] => {
	const [key, value] = entry;
	const schema = types[key];
	if (!schema) {
		return [key, `unknown property key: ${key}`];
	}
	try {
		schema.validateSync(value);
		return [key, ""];
	} catch (error) {
		return [key, error.message];
	}
}
