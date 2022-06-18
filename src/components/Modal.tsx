import { connect } from 'react-redux'
import ModalComponent, { ModalProps } from './ModalComponent'
import State from '../@types/State'

// eslint-disable-next-line jsdoc/require-jsdoc
const mapStateToProps = ({ isLoading, showModal }: State, props: ModalProps) => ({
  isLoading,
  show: showModal === props.id,
})

/** A generic modal component. */
const Modal = connect(mapStateToProps)(ModalComponent)

export default Modal
