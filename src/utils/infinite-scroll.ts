type InfiniteScrollObserverOptions = {
	target: Element;
	hasMore: boolean;
	onIntersect: () => void;
	rootMargin?: string;
};

export const createInfiniteScrollObserver = ({
	target,
	hasMore,
	onIntersect,
	rootMargin = "200px 0px",
}: InfiniteScrollObserverOptions): IntersectionObserver | null => {
	if (!hasMore) {
		return null;
	}

	const observer = new IntersectionObserver(
		(entries) => {
			const isVisible = entries.some((entry) => entry.isIntersecting);
			if (isVisible) {
				onIntersect();
			}
		},
		{ rootMargin },
	);

	observer.observe(target);
	return observer;
};
