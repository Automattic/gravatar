import { useEffect, useMemo } from 'react';

import type { Options, Attach, Detach, CreateHovercard } from './core';
import Hovercards from './core';
import useLatest from './use-latest';

export interface UseHovercardsReturnValues {
	attach: Attach;
	detach: Detach;
	createHovercard: CreateHovercard;
}

export default function useHovercards( {
	placement,
	offset,
	autoFlip,
	delayToShow,
	delayToHide,
	additionalClass,
	myHash,
	i18n,
	onQueryHovercardRef,
	onFetchProfileStart,
	onFetchProfileSuccess,
	onFetchProfileFailure,
	onHovercardShown,
	onHovercardHidden,
}: Options = {} ): UseHovercardsReturnValues {
	// These callbacks / variables won't trigger hooks update and will always be the latest
	const onQueryHovercardRefRef = useLatest( onQueryHovercardRef );
	const onFetchProfileStartRef = useLatest( onFetchProfileStart );
	const onFetchProfileSuccessRef = useLatest( onFetchProfileSuccess );
	const onFetchProfileFailureRef = useLatest( onFetchProfileFailure );
	const onHovercardShownRef = useLatest( onHovercardShown );
	const onHovercardHiddenRef = useLatest( onHovercardHidden );
	const i18nRef = useLatest( i18n );
	// Instantiate the Hovercards class only when the options change
	const { attach, detach } = useMemo(
		() =>
			new Hovercards( {
				placement,
				offset,
				autoFlip,
				delayToShow,
				delayToHide,
				additionalClass,
				myHash,
				i18n: i18nRef.current,
				onQueryHovercardRef: onQueryHovercardRefRef.current,
				onFetchProfileStart: onFetchProfileStartRef.current,
				onFetchProfileSuccess: onFetchProfileSuccessRef.current,
				onFetchProfileFailure: onFetchProfileFailureRef.current,
				onHovercardShown: onHovercardShownRef.current,
				onHovercardHidden: onHovercardHiddenRef.current,
			} ),
		[
			placement,
			offset,
			autoFlip,
			delayToShow,
			delayToHide,
			additionalClass,
			myHash,
			i18nRef,
			onQueryHovercardRefRef,
			onFetchProfileStartRef,
			onFetchProfileSuccessRef,
			onFetchProfileFailureRef,
			onHovercardShownRef,
			onHovercardHiddenRef,
		]
	);

	useEffect( () => {
		return detach;
	}, [ detach ] );

	return { attach, detach, createHovercard: Hovercards.createHovercard };
}
