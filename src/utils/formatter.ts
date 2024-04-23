import { DataviewInlineApi } from '../../lib/dv-types/api/inline-api'
import { Task } from './tasks'


const prioIcon = (prio: string) => ({
	A: '📌',
	B: '🔴',
	C: '🟡',
	D: '🔵',
	F: '⚫',
}[prio] ?? 'INVALID')

export const iconizePrio = (task: Task) => ({
	...task, prio: prioIcon(task.prio)
})

const timeIcon = (time: string) => ({
	A: '🐔', // 08-12
	B: '🌞', // 12-17
	H: '⛅', // 17-18
	X: '🌙', // 21-00
	Z: '💤', // 00-08
	_: '◾'
}[time] ?? 'INVALID')

export const iconizeTime = (task: Task) => ({
	...task, time: timeIcon(task.time)
})


export const formatDuration = (dv: DataviewInlineApi, dur: unknown) => `**${dv.duration(dur).toFormat('h:mm')}h**`
