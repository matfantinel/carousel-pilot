/**
 * @param {HTMLElement} host
 * @param {string} selector
 * @param {string} fallback
 * @returns {HTMLElement | null}
 */
export function queryElement(host, selector, fallback) {
	const s = selector || fallback;
	return host?.querySelector(s) ?? null;
}

/**
 * @param {HTMLElement} host
 * @param {string} selector
 * @param {string} fallback
 * @returns {HTMLElement[]}
 */
export function queryElements(host, selector, fallback) {
	const s = selector || fallback;
	return host ? Array.from(host.querySelectorAll(s)) : [];
}
