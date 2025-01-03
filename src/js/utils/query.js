let params = {}

export default function query(value) {
	return params[value]
}

function parse(value) {
	// TODO: call on history/page change?
	const urlParams = new URLSearchParams(value || location.search)
	params = Object.fromEntries(urlParams.entries())
	Object.keys(params).forEach((key) => {
		const val = params[key]
		if (val == '') params[key] = true
	})
}

if (typeof window !== 'undefined') parse()
