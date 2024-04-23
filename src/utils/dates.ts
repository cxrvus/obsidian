import { DataviewInlineApi } from '../../lib/dv-types/api/inline-api'


export const today = (dv: DataviewInlineApi) => dv.date('today')
export const oneMonthAgo = (dv: DataviewInlineApi) => today(dv).minus(dv.duration('1 mo'))
export const future = (dv: DataviewInlineApi) => today(dv).plus(dv.duration('3 mo'))
