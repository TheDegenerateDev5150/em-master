import { useLayoutEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { CSSTransitionProps } from 'react-transition-group/CSSTransition'
import { css } from '../../styled-system/css'
import ActionType from '../@types/ActionType'
import TreeThoughtPositioned from '../@types/TreeThoughtPositioned'
import testFlags from '../e2e/testFlags'
import useFauxCaretNodeProvider from '../hooks/useFauxCaretCssVars'
import DropCliff from './DropCliff'
import FadeTransition from './FadeTransition'
import FauxCaret from './FauxCaret'
import VirtualThought, { OnResize } from './VirtualThought'

/** Renders a thought component for mapped treeThoughtsPositioned. */
const TreeNode = ({
  belowCursor,
  cliff,
  depth,
  env,
  height,
  indexChild,
  indexDescendant,
  isCursor,
  isEmpty,
  isTableCol1,
  isTableCol2,
  thoughtKey,
  leaf,
  path,
  prevChild,
  showContexts,
  isLastVisible,
  simplePath,
  singleLineHeightWithCliff,
  style,
  thoughtId,
  width,
  autofocus,
  x,
  y: _y,
  index,
  viewportBottom,
  treeThoughtsPositioned,
  bulletWidth,
  cursorUncleId,
  setSize,
  cliffPaddingStyle,
  dragInProgress,
  autofocusDepth,
  editing,
  ...transitionGroupsProps
}: TreeThoughtPositioned & {
  thoughtKey: string
  index: number
  viewportBottom: number
  treeThoughtsPositioned: TreeThoughtPositioned[]
  bulletWidth: number
  cursorUncleId: string | null
  setSize: OnResize
  cliffPaddingStyle: { paddingBottom: number }
  dragInProgress: boolean
  autofocusDepth: number
  editing: boolean
} & Pick<CSSTransitionProps, 'in'>) => {
  const [y, setY] = useState(_y)
  // Since the thoughts slide up & down, the faux caret needs to be a child of the TreeNode
  // rather than one universal caret in the parent.
  const fadeThoughtRef = useRef<HTMLDivElement>(null)
  const fauxCaretNodeProvider = useFauxCaretNodeProvider({
    editing,
    fadeThoughtElement: fadeThoughtRef.current,
    isCursor,
    isTableCol1,
    path,
  })
  const isLastActionNewThought = useSelector(state => {
    const lastPatches = state.undoPatches[state.undoPatches.length - 1]
    return lastPatches?.some(patch => patch.actions[0] === 'newThought')
  })

  // true if the last action is any of archive/delete/collapse
  const isLastActionDelete = useSelector(state => {
    const deleteActions: ActionType[] = ['archiveThought', 'uncategorize', 'deleteThought', 'deleteThoughtWithCursor']
    const lastPatches = state.undoPatches[state.undoPatches.length - 1]
    return lastPatches?.some(patch => deleteActions.includes(patch.actions[0]))
  })

  useLayoutEffect(() => {
    if (y !== _y) {
      // When y changes React re-renders the component with the new value of y. It will result in a visual change in the DOM.
      // Because this is a state-driven change, React applies the updated value to the DOM, which causes the browser to recognize that
      // a CSS property has changed, thereby triggering the CSS transition.
      // Without this additional render, updates get batched and subsequent CSS transitions may not work properly. For example, when moving a thought down, it would not animate.
      setY(_y)
    }
  }, [y, _y])

  // List Virtualization
  // Do not render thoughts that are below the viewport.
  // Exception: The cursor thought and its previous siblings may temporarily be out of the viewport, such as if when New Subthought is activated on a long context. In this case, the new thought will be created below the viewport and needs to be rendered in order for scrollCursorIntoView to be activated.
  // Render virtualized thoughts with their estimated height so that document height is relatively stable.
  // Perform this check here instead of in virtualThoughtsPositioned since it changes with the scroll position (though currently `sizes` will change as new thoughts are rendered, causing virtualThoughtsPositioned to re-render anyway).
  if (belowCursor && !isCursor && y > viewportBottom + height) return null

  const nextThought = isTableCol1 ? treeThoughtsPositioned[index + 1] : null
  const previousThought = isTableCol1 ? treeThoughtsPositioned[index - 1] : null

  // Adjust col1 width to remove dead zones between col1 and col2, increase the width by the difference between col1 and col2 minus bullet width
  const xCol2 = isTableCol1 ? nextThought?.x || previousThought?.x || 0 : 0
  // Increasing margin-right of thought for filling gaps and moving the thought to the left by adding negative margin from right.
  const marginRight = isTableCol1 ? xCol2 - (width || 0) - x - (bulletWidth || 0) : 0

  // Speed up the tree-node's transition (normally layoutNodeAnimationDuration) by 50% on New (Sub)Thought only.
  const transition = isLastActionNewThought
    ? `left {durations.layoutNodeAnimationFast} ease-out,top {durations.layoutNodeAnimationFast} ease-out`
    : `left {durations.layoutNodeAnimation} ease-out,top {durations.layoutNodeAnimation} ease-out`

  return (
    <FadeTransition
      id={thoughtKey}
      // The FadeTransition is only responsible for fade out on unmount;
      // or for fade in on mounting of a new thought.
      // See autofocusChanged for normal opacity transition.
      // Limit the fade/shrink/blur animation to the archive, delete, and uncategorize actions.
      duration={isEmpty ? 'nodeFadeIn' : isLastActionDelete ? 'nodeDissolve' : 'nodeFadeOut'}
      nodeRef={fadeThoughtRef}
      in={transitionGroupsProps.in}
      unmountOnExit
    >
      <div
        aria-label='tree-node'
        // The key must be unique to the thought, both in normal view and context view, in case they are both on screen.
        // It should not be based on editable values such as Path, value, rank, etc, otherwise moving the thought would make it appear to be a completely new thought to React.
        className={css({
          position: 'absolute',
          transition,
        })}
        style={{
          // Cannot use transform because it creates a new stacking context, which causes later siblings' DropChild to be covered by previous siblings'.
          // Unfortunately left causes layout recalculation, so we may want to hoist DropChild into a parent and manually control the position.
          left: x,
          top: y,
          // Table col1 uses its exact width since cannot extend to the right edge of the screen.
          // All other thoughts extend to the right edge of the screen. We cannot use width auto as it causes the text to wrap continuously during the counter-indentation animation, which is jarring. Instead, use a fixed width of the available space so that it changes in a stepped fashion as depth changes and the word wrap will not be animated. Use x instead of depth in order to accommodate ancestor tables.
          // 1em + 10px is an eyeball measurement at font sizes 14 and 18
          // (Maybe the 10px is from .content padding-left?)
          width: isTableCol1 ? width : `calc(100% - ${x}px + 1em + 10px)`,
          ...style,
          textAlign: isTableCol1 ? 'right' : undefined,
          ...fauxCaretNodeProvider,
        }}
      >
        <div ref={fadeThoughtRef}>
          <VirtualThought
            debugIndex={testFlags.simulateDrop ? indexChild : undefined}
            depth={depth}
            dropUncle={thoughtId === cursorUncleId}
            env={env}
            indexDescendant={indexDescendant}
            // isMultiColumnTable={isMultiColumnTable}
            isMultiColumnTable={false}
            leaf={leaf}
            onResize={setSize}
            path={path}
            prevChildId={prevChild?.id}
            showContexts={showContexts}
            simplePath={simplePath}
            singleLineHeight={singleLineHeightWithCliff}
            // Add a bit of space after a cliff to give nested lists some breathing room.
            // Do this as padding instead of y, otherwise there will be a gap between drop targets.
            // In Table View, we need to set the cliff padding on col1 so it matches col2 padding, otherwise there will be a gap during drag-and-drop.
            style={cliff < 0 || isTableCol1 ? cliffPaddingStyle : undefined}
            crossContextualKey={thoughtKey}
            prevCliff={treeThoughtsPositioned[index - 1]?.cliff}
            isLastVisible={isLastVisible}
            autofocus={autofocus}
            marginRight={isTableCol1 ? marginRight : 0}
          />
        </div>

        {dragInProgress &&
          // do not render hidden cliffs
          // rough autofocus estimate
          autofocusDepth - depth < 2 && (
            <DropCliff
              cliff={cliff}
              depth={depth}
              path={path}
              isTableCol2={isTableCol2}
              isLastVisible={isLastVisible}
              prevWidth={treeThoughtsPositioned[index - 1]?.width}
            />
          )}
        <span className={css({ position: 'absolute', margin: '-0.1875em 0 0 -0.05em', top: 0, left: 0 })}>
          <FauxCaret caretType='positioned' path={path} wrapperElement={fadeThoughtRef.current} />
        </span>
      </div>
    </FadeTransition>
  )
}

export default TreeNode
