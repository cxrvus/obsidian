// ## Times

const today = dv.date('today')
const soon = today.plus(dv.duration('2d'))
const oneMonthAgo = today.minus(dv.duration('1mo'))
const future = today.plus(dv.duration('3mo'))


// ## Funcs

const getDue = file => {
	const { done, due, repeat } = file
	if (done && !repeat) return null
	else if(due) return due
	else if (!done && repeat) return today
	else if (done && repeat) return dv.date(done).plus(dv.duration(repeat))
	else return null
}

const prioIcon = prio => ({
	A: '📌',
	B: '🔴',
	C: '🟡',
	D: '🔵',
	F: '',
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
	_: ''
}[time])

const iconizeTime = task => ({
	...task, time: timeIcon(task.time) ?? 'INVALID'
})


// ## Queries

const dailyNotes = dv.pages('"Documents/Daily"')
const cards = dv.pages('"Cards"')

const quickTasks = dailyNotes
	.map(x => ({
		tasks: x.file.tasks,
		cday: dv.date(`20${x.file.name}`)
	}))
	.filter(x => x.cday > oneMonthAgo)
	.tasks
	.filter(x => !x.completed)
;


const tasks = cards
	.map(x => ({
		cday: x.file.cday,
		due: getDue(x),
		time: x.time ?? '_',
		done: x.done,
		flows: x.flows,
		prio: x.prio ?? 'F',
		link: x.file.link,
	}))
	.sort(x => x.due)
;

const completed = tasks
	.filter(x => x.done && x.done >= today)
	.sort(x => x.link)
;

const dueTasks = tasks
	.filter(x => x.due)
	.sort(x => x.prio + x.due.toString() + x.time)
	.map(x => iconizePrio(x))
	.map(x => iconizeTime(x))
;

const dueSoon = dueTasks
	.filter(x => x.due <= soon)
;

const dueWhenever = dueTasks
	.filter(x => x.due > soon && x.due < future)
;


const pinnedCards = cards
	.filter(card => card.flows
		.map(flow => flow.path)
		.some(path => path?.includes('Pinned'))
	)
	.map(x => x.file.link)
;


// # Render

dv.header(1, today)

dv.header(1, pinnedCards.join(' | '))

dv.header(2, 'To Do')

dv.table(['Task', 'Prio', 'Due', 'Time'],
	dueSoon.map(x => [x.link, x.prio, x.due, x.time])
)

dv.header(3, 'Completed Today')

dv.list(completed.map(x => [x.link]))

dv.header(3, 'Quick Tasks')

dv.taskList(quickTasks)

dv.header(3, 'Scheduled')

dv.table(['Task', 'Prio', 'Due'],
	dueWhenever.map(x => [x.link, x.prio, x.due])
)
