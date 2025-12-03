import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import {cubicOut} from "svelte/easing";

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

/**
 * Converts a style object to a string representation.
 *
 * @param {Record<string, number | string | undefined>} style - The style object with key-value pairs.
 * @returns {string} The string representation of the style.
 */
export function styleToString(style) {
	return Object.keys(style).reduce((str, key) => {
		if (style[key] === undefined) return str;
		return `${str}${key}:${style[key]};`;
	}, "");
}


/**
 * @typedef {Object} FlyAndScaleParams
 * @property {number} [y] - The vertical translation distance.
 * @property {number} [x] - The horizontal translation distance.
 * @property {number} [start] - The starting scale value.
 * @property {number} [duration] - The duration of the transition in milliseconds.
 */

/**
 * A custom transition function for a "fly and scale" animation effect.
 *
 * @param {Element} node - The DOM element to apply the transition on.
 * @param {FlyAndScaleParams} [params] - The parameters to customize the transition.
 * @returns {import("svelte/transition").TransitionConfig} The transition configuration.
 */
export function flyAndScale(node, params = { y: -8, x: 0, start: 0.95, duration: 150 }) {
	const style = getComputedStyle(node);
	const transform = style.transform === "none" ? "" : style.transform;

	/**
	 * Converts a value in one scale range to another.
	 *
	 * @param {number} valueA - The value to convert.
	 * @param {[number, number]} scaleA - The range of the input value.
	 * @param {[number, number]} scaleB - The range to convert the value to.
	 * @returns {number} The converted value.
	 */
	const scaleConversion = (valueA, scaleA, scaleB) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t,
			});
		},
		easing: cubicOut,
	};
}
