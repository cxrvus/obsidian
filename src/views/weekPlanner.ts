import { DataviewInlineApi } from '../../lib/dv-types/api/inline-api'
import { inOneWeek, today } from '../utils/dates'
import { getDueTasks } from '../utils/tasks'
import { durationSum } from '../utils/durations'

export default (dv: DataviewInlineApi) => {
	const upcomingTasks = getDueTasks(dv).filter(x => x.due > today(dv) && x.due <= inOneWeek(dv))

	// @ts-expect-error cannot safely type due, will deprecate luxon or fix this later
	const groupedTasks = upcomingTasks.groupBy(x => x.due.toISODate())
	const summedUpTasks = groupedTasks.map(({key, rows}) => [key, rows.length, durationSum(dv, rows)])
	const totalDuration = durationSum(dv, upcomingTasks)

	dv.header(2, 'Durations')
	dv.paragraph(`Total duration: ${totalDuration}`)
	dv.table(['Date', 'Tasks', 'Duration'], summedUpTasks)
}
