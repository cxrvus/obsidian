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
	.filter(x => dvx.date(`20${x.file.name}`) > oneMonthAgo)
	.sort(x => x.file.name, 'desc')
	.map(x => x.file.tasks.filter(task => !task.completed))
	.filter(x => x.length)
;


const tasks = cards
	.map(x => ({
		cday: x.file.cday,
		done: x.done,
		due: x.due,
		dur: (x.dur ?? dvx.duration('0m')).as('minutes'),
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
	.sort(x => x.time + x.prio + x.due.toString())
;

const dueWhenever = dueTasks
	.filter(x => x.due > today && x.due < future)
	.sort(x => x.prio + x.due.toString())
;


const dueTodayView = dueToday
	.map(x => iconizePrio(x))
	.map(x => iconizeTime(x))
	.map(x => ({ ...x, time: `${x.time} ${getOverdueAmount(x)}` }))
;

const dueWheneverView = dueWhenever
	.map(x => iconizePrio(x))
;

const scheduledTasksView = dueWheneverView.filter(x => x.dur || x.repeat)

const scheduledGoalsView = dueWheneverView.filter(x => !(x.dur || x.repeat))


const minsToDur = mins => dvx.duration(`${mins}m`)

const workDuration = dueToday.dur.array()
	.reduce((acc, mins) => acc.plus(minsToDur(mins)), dvx.duration('0m'))
;


const pinnedCards = cards
	.filter(card => card.flows
		?.map(flow => flow?.path)
		.some(path => path?.includes('Pinned'))
	)
	.map(x => x.file.link)
	.sort()
;


// # RENDERING

dvx.header(1, today)

dvx.header(1, pinnedCards.join(' | '))

dvx.header(2, 'Due Today')

dvx.paragraph(`Work due today: **${dvx.duration(workDuration).toFormat('h:mm')}h**`)

dvx.table(['Task', 'Time', 'Prio', 'Duration'],
	dueTodayView.map(x => [x.link, x.time, x.prio, x.dur])
)

dvx.header(3, 'Completed Today')

dvx.list(completed.map(x => [x.link]))

dvx.header(3, 'Quick Tasks')

quickTasks.forEach(x => {
	dvx.taskList(x)
	dvx.el('br')
})

dvx.header(3, 'Scheduled Tasks')

dvx.table(['Task', 'Prio', 'Due'],
	scheduledTasksView.map(x => [x.link, x.prio, x.due])
)

dvx.header(2, 'Goals')

dvx.table(['Task', 'Prio', 'Due'],
	scheduledGoalsView.map(x => [x.link, x.prio, x.due])
)
