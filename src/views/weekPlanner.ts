import { DataviewInlineApi } from '../../lib/dv-types/api/inline-api'
import { inOneWeek, today } from '../utils/dates'
import { getDueTasks } from '../utils/tasks'
import { durationSum } from '../utils/durations'

export default (dv: DataviewInlineApi) => {
	const upcomingTasks = getDueTasks(dv).filter(x => x.due > today(dv) && x.due <= inOneWeek(dv))

	// @ts-expect-error cannot safely type due, will deprecate luxon or fix this later
	const foo = upcomingTasks.groupBy(x => x.due.toISODate())
	const bar = foo.map(({key, rows}) => [key, rows.length, durationSum(dv, rows)])

	dv.table(['Date', 'Tasks', 'Duration'], bar)
}
