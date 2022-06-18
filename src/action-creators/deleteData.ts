import Thunk from '../@types/Thunk'
import hashThought from '../util/hashThought'
import timestamp from '../util/timestamp'
import { deleteLexeme, updateLastUpdated } from '../data-providers/dexie'

/** Low-level action to delete a lexeme directly from State and Dexie. Use deleteThought instead if possible. */
const deleteData =
  (value: string): Thunk =>
  (dispatch, getState) => {
    deleteLexeme(hashThought(value))
    updateLastUpdated(timestamp())
    dispatch({ type: 'deleteData', value })
  }

export default deleteData
