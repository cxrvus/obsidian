import { DataviewInlineApi } from '../../lib/dv-types/api/inline-api'


export const today = (dv: DataviewInlineApi) => dv.date('today')
export const inOneWeek = (dv: DataviewInlineApi) => today(dv).plus(dv.duration('1 w'))
export const threeMonthAgo = (dv: DataviewInlineApi) => today(dv).minus(dv.duration('3 mo'))
export const future = (dv: DataviewInlineApi) => today(dv).plus(dv.duration('3 mo'))
