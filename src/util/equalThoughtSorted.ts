import Thought from '../@types/Thought'
import PropertyRequired from '../@types/PropertyRequired'

/** Compares two thought objects using { value } as identity and ignoring other properties. */
const equalThoughtSorted = (a: PropertyRequired<Thought, 'value'>, b: PropertyRequired<Thought, 'value'>): boolean =>
  a === b || (a && b && a.value === b.value)

export default equalThoughtSorted
