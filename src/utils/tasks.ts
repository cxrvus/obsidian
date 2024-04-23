import { DataviewInlineApi } from '../../lib/dv-types/api/inline-api'
import { DataArray } from '../../lib/dv-types/api/data-array';
import { today } from './dates';


export type Task = {
	done?: unknown,
	due?: unknown,
	dur?: unknown,
	props: object,
	link: unknown,
	prio?: string,
	repeat?: unknown,
	time?: string,
}


export const getTasks = (dv: DataviewInlineApi): DataArray<Task> => {
	const cards = dv.pages('"Cards"')
	const tasks = cards
		.map(x => ({
			done: x.done ?? null,
			due: x.due ?? null,
			dur: (x.dur ?? dv.duration('0m')).as('minutes'),
			props: x.props,
			link: x.file.link,
			prio: x.prio ?? 'F',
			repeat: x.repeat ?? null,
			time: x.time ?? '_',
		}))
		.map(x => ({ ...x, due: getActualDue(dv, x) }))
		.sort(x => x.due)
	;
	return tasks
}


export const getDueTasks = (dv: DataviewInlineApi) => getTasks(dv).filter(x => x.due != null)


export const getOverdueAmount = (dv: DataviewInlineApi, task: Task) => {
	// @ts-expect-error cannot safely type due, will deprecate luxon or fix this later
	const overdue = task.due.diff(today(dv), 'days').days
	return overdue < 0 ? overdue : ''
}


const getActualDue = (dv: DataviewInlineApi, task: Task) => {
	const { done, due, repeat } = task
	if (done && !repeat) return null
	else if(due) return due
	else if (!done && repeat) return task
	else if (done && repeat) return dv.date(done).plus(dv.duration(repeat))
	else return null
}
