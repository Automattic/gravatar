import { MutableRefObject, useRef } from 'react';

/**
 * A custom React hook to persist a mutable value.
 *
 * @template T The type of the value.
 * @param {T} val The value to persist.
 * @return {MutableRefObject<T>} Mutable reference object initialized to `val`.
 * @internal
 */
export default < T >( val: T ): MutableRefObject< T > => {
	const ref = useRef( val );
	ref.current = val;
	return ref;
};
