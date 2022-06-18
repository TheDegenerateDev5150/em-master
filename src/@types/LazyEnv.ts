import ThoughtId from './ThoughtId'
import Index from './IndexType'

/** An environment for evaluating expressions defined by lazily loaded thoughts. Indexed by thought value (e.g. =heading1). */
type LazyEnv = Index<ThoughtId>

export default LazyEnv
