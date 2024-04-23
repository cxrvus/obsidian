import { DataArray } from '../../lib/dv-types/api/data-array'
import { DataviewInlineApi } from '../../lib/dv-types/api/inline-api'
import { formatDuration } from './formatter'
import { Task } from './tasks'


export const durationSum = (dv: DataviewInlineApi, tasks: DataArray<Task>): string => (
	formatDuration(dv, tasks.dur?.array().reduce((acc, mins) => acc.plus(dv.duration(`${mins}m`)), dv.duration('0m')) ?? dv.duration('0m'))
)
