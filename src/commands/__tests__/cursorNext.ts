import { cursorNextActionCreator as cursorNext } from '../../actions/cursorNext'
import { importTextActionCreator as importText } from '../../actions/importText'
import { toggleAttributeActionCreator as toggleAttribute } from '../../actions/toggleAttribute'
import { toggleContextViewActionCreator as toggleContextView } from '../../actions/toggleContextView'
import globals from '../../globals'
import contextToPath from '../../selectors/contextToPath'
import store from '../../stores/app'
import expectPathToEqual from '../../test-helpers/expectPathToEqual'
import initStore from '../../test-helpers/initStore'
import { setCursorFirstMatchActionCreator as setCursor } from '../../test-helpers/setCursorFirstMatch'

beforeEach(initStore)

describe('normal view', () => {
  it('move cursor to next sibling', () => {
    store.dispatch([
      importText({
        text: `
          - a
            - a1
          - b`,
      }),
      setCursor(['a']),
      cursorNext(),
    ])

    const stateNew = store.getState()
    expectPathToEqual(stateNew, stateNew.cursor, ['b'])
  })

  it('move to first root child when there is no cursor', () => {
    store.dispatch([
      importText({
        text: `
          - a
          - b`,
      }),
      setCursor(null),
      cursorNext(),
    ])

    const stateNew = store.getState()
    expectPathToEqual(stateNew, stateNew.cursor, ['a'])
  })

  it('do nothing when the cursor on the last thought', () => {
    store.dispatch([
      importText({
        text: `
          - a
          - b`,
      }),
      setCursor(['b']),
      cursorNext(),
    ])

    const stateNew = store.getState()
    expectPathToEqual(stateNew, stateNew.cursor, ['b'])
  })

  it('do nothing when the cursor on the last sibling', () => {
    store.dispatch([
      importText({
        text: `
          - a
            - b
          - c
            - d`,
      }),
      setCursor(['a', 'b']),
      cursorNext(),
    ])

    const stateNew = store.getState()
    expectPathToEqual(stateNew, stateNew.cursor, ['a', 'b'])
  })

  it('do nothing when there are no thoughts', () => {
    store.dispatch(cursorNext())

    expect(store.getState().cursor).toBe(null)
  })

  it('move to first sibling of next row in table view col1', () => {
    store.dispatch([
      importText({
        text: `
          - a
            - =view
              - Table
            - b
              - b1
            - c
              - c1`,
      }),
      setCursor(['a', 'b']),
      cursorNext(),
    ])

    const stateNew = store.getState()
    expectPathToEqual(stateNew, stateNew.cursor, ['a', 'c'])
  })

  it('move to first sibling of next row in table view col2', () => {
    store.dispatch([
      importText({
        text: `
          - a
            - =view
              - Table
            - b
              - b1
            - c
              - c1`,
      }),
      setCursor(['a', 'b', 'b1']),
      cursorNext(),
    ])

    const stateNew = store.getState()
    expectPathToEqual(stateNew, stateNew.cursor, ['a', 'c', 'c1'])
  })

  it('sorted thoughts', () => {
    store.dispatch([
      importText({
        text: `
          - SORT
            - a
              - a1
            - c
            - b`,
      }),
      (dispatch, getState) =>
        dispatch(
          toggleAttribute({
            path: contextToPath(getState(), ['SORT']),
            values: ['=sort', 'Alphabetical'],
          }),
        ),
      setCursor(['SORT', 'a']),
      cursorNext(),
    ])

    const stateNew = store.getState()
    expectPathToEqual(stateNew, stateNew.cursor, ['SORT', 'b'])
  })

  it('skip descendants', () => {
    store.dispatch([
      importText({
        text: `
          - a
            - a1
          - b`,
      }),
      setCursor(['a']),
      cursorNext(),
    ])

    const stateNew = store.getState()
    expectPathToEqual(stateNew, stateNew.cursor, ['b'])
  })
})

describe('context view', () => {
  it('move cursor to next context', () => {
    store.dispatch([
      importText({
        text: `
          - a
            - m
              - x
          - b
            - m
              - y`,
      }),
      setCursor(['a', 'm']),
      toggleContextView(),
      setCursor(['a', 'm', 'a']),
      cursorNext(),
    ])

    const stateNew = store.getState()
    expectPathToEqual(stateNew, stateNew.cursor, ['a', 'm', 'b'])
  })

  it('noop if on last context', () => {
    store.dispatch([
      importText({
        text: `
          - a
            - m
              - x
          - b
            - m
              - y`,
      }),
      setCursor(['a', 'm']),
      toggleContextView(),
      setCursor(['a', 'm', 'b']),
      cursorNext(),
    ])

    const stateNew = store.getState()
    expectPathToEqual(stateNew, stateNew.cursor, ['a', 'm', 'b'])
  })
})

describe('global suppress expansion', () => {
  beforeEach(() => {
    globals.suppressExpansion = false
  })

  it('suppress expansion path on cursorNext', async () => {
    const text = `
    - a
      - d
        - k
      - c
        - e
        - f`

    store.dispatch([
      importText({
        text,
      }),
      setCursor(['a', 'd']),
      cursorNext(),
    ])

    expect(globals.suppressExpansion).toBe(true)
  })

  it('do not activate suppress expansion on cursorNext if new cursor is pinned', async () => {
    const text = `
    - a
      - d
        - k
      - c
        - =pin
          - true
        - e
        - f`

    store.dispatch([
      importText({
        text,
      }),
      setCursor(['a', 'd']),
      cursorNext(),
    ])

    expect(globals.suppressExpansion).toBe(false)
  })

  it('do not activate suppress expansion on cursorNext if new cursor parent has pinned children', async () => {
    const text = `
    - a
      - =children
        - =pin
          - true
      - d
        - k
      - c
        - e
        - f`

    store.dispatch([
      importText({
        text,
      }),
      setCursor(['a', 'd']),
      cursorNext(),
    ])

    expect(globals.suppressExpansion).toBe(false)
  })
})
