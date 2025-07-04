import DragThoughtItem from './DragThoughtItem'

/** Represents the currently dragged thoughts or files. Returned by monitor.getItem() in the drop handler, or set to { files } when dragging a native file. */
type DragThoughtOrFiles = DragThoughtItem[] | { files: File[] }

export default DragThoughtOrFiles
