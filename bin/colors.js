function draw ( s, e, txt ) {
	return `\x1b[${s}m${txt}\x1b[${e}m`
}

export const cyan = draw.bind(null, 36, 39)
export const green = draw.bind(null, 32, 39)
export const magenta = draw.bind(null, 35, 39)
export const red = draw.bind(null, 31, 39)
