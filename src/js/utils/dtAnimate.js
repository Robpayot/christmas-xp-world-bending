import { cssBezier } from "./easing"

export const getProgress = (time, start, duration) => Math.min((time - start) / duration, 1)

export const dtAnimate = (time, { start, duration, from, to, easing, onComplete, cssEasing } = {}) => {

	let progress = getProgress(time, start, duration)

	if (easing) {
		progress = easing(progress)
	}

	if (cssEasing) {
		progress = cssBezier(progress, ...cssEasing)
	}

	// TODO: trigger once
	if (progress === 1) onComplete?.()

	if (!from) from = 0

	return  from + (to - from) * progress
}