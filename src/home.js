// eslint-disable-next-line no-undef
const dvx = dv


// # TIMES

const today = dvx.date('today')
const oneMonthAgo = today.minus(dvx.duration('1mo'))
const future = today.plus(dvx.duration('3mo'))


// # FUNCTIONS

const getActualDue = card => {
	const { done, due, repeat } = card
	if (done && !repeat) return null
	else if(due) return due
	else if (!done && repeat) return today
	else if (done && repeat) return dvx.date(done).plus(dvx.duration(repeat))
	else return null
}

const prioIcon = prio => ({
	A: '📌',
	B: '🔴',
	C: '🟡',
	D: '🔵',
	F: '⚫',
}[prio])

const iconizePrio = task => ({
	...task, prio: prioIcon(task.prio) ?? 'INVALID'
})

const timeIcon = time => ({
	A: '🐔', // 08-12
	B: '🌞', // 12-17
	H: '⛅', // 17-18
	X: '🌙', // 21-00
	Z: '💤', // 00-08
	_: '◾'
}[time])

const iconizeTime = task => ({
	...task, time: timeIcon(task.time) ?? 'INVALID'
})

const getOverdueAmount = task => {
	const overdue = task.due.diff(today, 'days').days
	return overdue < 0 ? overdue : ''
}


// # QUERIES

const dailyNotes = dvx.pages('"Documents/Daily"')
const cards = dvx.pages('"Cards"')

const quickTasks = dailyNotes
	.map(x => ({
		tasks: x.file.tasks,
		cday: dvx.date(`20${x.file.name}`)
	}))
	.filter(x => x.cday > oneMonthAgo)
	.tasks
	.filter(x => !x.completed)
;


const tasks = cards
	.map(x => ({
		cday: x.file.cday,
		done: x.done,
		flows: x.flows,
		link: x.file.link,
		prio: x.prio ?? 'F',
		repeat: x.repeat,
		time: x.time ?? '_',
	}))
	.map(x => ({ ...x, due: getActualDue(x) }))
	.sort(x => x.due)
;

const completed = tasks
	.filter(x => x.done && x.done >= today)
	.sort(x => x.link)
;

const dueTasks = tasks.filter(x => x.due)

const dueToday = dueTasks
	.filter(x => x.due <= today)
	.sort(x => x.prio + x.due.toString() + x.time)
	.map(x => iconizePrio(x))
	.map(x => iconizeTime(x))
	.map(x => ({ ...x, time: `${x.time} ${getOverdueAmount(x)}` }))
;

const dueWhenever = dueTasks
	.filter(x => x.due > today && x.due < future)
	.map(x => iconizePrio(x))
	.sort(x => x.prio + x.due.toString())
;


const pinnedCards = cards
	.filter(card => card.flows
		.map(flow => flow.path)
		.some(path => path?.includes('Pinned'))
	)
	.map(x => x.file.link)
;


// # RENDERING

dvx.header(1, today)

dvx.header(1, pinnedCards.join(' | '))

dvx.header(2, 'Due Today')

dvx.table(['Task', 'Prio', 'Time'],
	dueToday.map(x => [x.link, x.prio, x.time])
)

dvx.header(3, 'Completed Today')

dvx.list(completed.map(x => [x.link]))

dvx.header(3, 'Quick Tasks')

dvx.taskList(quickTasks)

dvx.header(3, 'Scheduled')

dvx.table(['Task', 'Prio', 'Due'],
	dueWhenever.map(x => [x.link, x.prio, x.due])
)
