import { DataviewInlineApi } from '../../lib/dv-types/api/inline-api'
import * as yup from 'yup';


export default (dv: DataviewInlineApi) => {
	const coreTypes = dv.pages('"Notes/Core Types"')[0]._types
	const custTypes = dv.pages('"Notes/Custom Types"')?.[0]._types ?? {}
	const spec = { ...coreTypes, ...custTypes }
	const notes = dv.pages('"Notes"')
	const validatedNotes = notes.file.map(x => [
		x.link,
		validateFrontmatter(x.frontmatter ?? {}, spec)
	])

	dv.table(['Note', 'Error'], validatedNotes.filter(x => x[1]))
}


const linkRegEx = /^\[\[.*\]\]$/;
const dateRegEx = /^\d{4}-\d{2}-\d{2}$/;
const longDurationRegEx = /^\d+ (d|w|mo)$/;
const shortDurationRegEx = /^\d+ [mh]$/;

const typeCodesToTypes: {[tp: string]: yup.Schema} = {
	STR: yup.string(),
	LSTR: yup.array(yup.string()),
	NUM: yup.number(),
	LNUM: yup.array(yup.number()),
	LNK: yup.string().matches(linkRegEx),
	LLNK: yup.array(yup.string().matches(linkRegEx)),
	DATE: yup.string().matches(dateRegEx),
	DUR: yup.string().matches(shortDurationRegEx),
	XDUR: yup.string().matches(longDurationRegEx),
	BOOL: yup.boolean(),
}


const validateFrontmatter = (frontmatter: {[key: string]: unknown}, propKeysToTypeCodes: {[key: string]: string}) => {
	const propKeysToTypeCodeEntries = Object.entries(propKeysToTypeCodes)

	try { yup.array(yup.array(yup.string().required()).length(2)).validateSync(propKeysToTypeCodeEntries) }
	catch (_) { throw new Error('type specification must be an object with string values') }

	const propKeysToTypeEntries = propKeysToTypeCodeEntries.map(([key, type]) => [key, typeCodesToTypes[type]])
	
	const invalidTypeCode = propKeysToTypeEntries.find(([, type]) => !type)
	if (invalidTypeCode) { throw new Error(`unknown type code: ${invalidTypeCode[1]}`) }

	const propKeysToTypes: {[key: string]: yup.Schema} = Object.fromEntries(propKeysToTypeEntries)
	
	const errorMessage = Object.entries(frontmatter)
		.filter(([key]) => !key.startsWith('_'))
		.map(entry => validateEntry(entry, propKeysToTypes))
		.filter(([, error]) => error)
		.map(([key, error]) => `[${key}]: ${error}`)
		.join(';\n\n')
	;

	return errorMessage
}


const validateEntry = (entry: [string, unknown], fullSchema: {[key: string]: yup.Schema}): [string, string] => {
	const [key, value] = entry;
	const entrySchema = fullSchema[key];

	if (!value && value !== 0) { return [key, `property values must not be empty: ${key}`]; }
	if (!entrySchema) { return [key, `unknown property key: ${key}`]; }

	try {
		entrySchema.validateSync(value);
		return [key, ''];
	} catch (error) {
		return [key, error.message];
	}
}
