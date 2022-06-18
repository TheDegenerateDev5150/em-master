import tutorialChoice from '../reducers/tutorialChoice'
import Thunk from '../@types/Thunk'

/** Action-creator for tutorialChoice. */
const tutorialChoiceActionCreator =
  (payload: Parameters<typeof tutorialChoice>[1]): Thunk =>
  dispatch =>
    dispatch({ type: 'tutorialChoice', ...payload })

export default tutorialChoiceActionCreator
