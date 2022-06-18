import React, { FC } from 'react'
import { connect } from 'react-redux'
import theme from '../../selectors/theme'
import Index from '../../@types/IndexType'
import State from '../../@types/State'

interface ChatIconProps {
  dark?: boolean
  fill?: string
  size: number
  style?: Index<string>
}

// eslint-disable-next-line jsdoc/require-jsdoc
const mapStateToProps = (state: State) => ({
  dark: theme(state) !== 'Light',
})

// eslint-disable-next-line jsdoc/require-jsdoc
const FeedbackIcon: FC<ChatIconProps> = ({ dark, fill, size = 20, style }) => (
  <svg
    className='icon'
    x='0px'
    y='0px'
    viewBox='0 0 46 50'
    width={size}
    height={size}
    fill={fill || (dark ? 'white' : 'black')}
    style={style}
  >
    <path d='M42.24,6.433l-0.83-0.832c-0.902-0.9-2.367-0.9-3.268,0L23.73,20.013c-0.094,0.094-0.164,0.211-0.201,0.339l-1.246,4.215  c-0.084,0.281-0.006,0.585,0.201,0.792s0.51,0.284,0.791,0.201l4.215-1.246c0.129-0.038,0.244-0.107,0.338-0.202L42.24,9.699  C43.143,8.799,43.143,7.333,42.24,6.433z M40.279,6.731l0.832,0.831c0.277,0.278,0.277,0.729,0,1.007l-0.943,0.942L38.33,7.673  l0.943-0.941C39.551,6.454,40.002,6.454,40.279,6.731z M25.109,23.351c-0.152-0.254-0.363-0.466-0.617-0.618L25.004,21l1.838,1.838  L25.109,23.351z' />
    <rect x='8.5' y='27.63' width='21.25' height='2' />
    <path d='M24.09,16.824H8.5v2h13.617c0.063-0.079,0.129-0.155,0.201-0.228L24.09,16.824z' />
    <path d='M20.889,22.228H8.5v2h11.814c0.016-0.077,0.027-0.153,0.051-0.229L20.889,22.228z' />
    <path d='M33.166,32.628c0,0.884-0.719,1.604-1.604,1.604H13.592c-0.248,0-0.486,0.092-0.672,0.259l-3.67,3.327v-2.586  c0-0.553-0.447-1-1-1H6.686c-0.883,0-1.604-0.72-1.604-1.604V13.826c0-0.884,0.721-1.604,1.604-1.604h22.006l2-2H6.686  c-1.986,0-3.604,1.616-3.604,3.604v18.802c0,1.986,1.617,3.604,3.604,3.604H7.25v3.843c0,0.396,0.232,0.754,0.594,0.914  c0.131,0.058,0.27,0.086,0.406,0.086c0.242,0,0.484-0.089,0.672-0.259l5.057-4.584h17.584c1.986,0,3.604-1.617,3.604-3.604V19.603  l-2,2V32.628z' />
  </svg>
)

export default connect(mapStateToProps)(FeedbackIcon)
