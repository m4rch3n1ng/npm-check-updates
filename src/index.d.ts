interface anyObject {
	[ key: string ]: any
}

interface pkg extends anyObject {
	dependencies?: anyObject
	devDependencies?: anyObject
}

interface updated {
	name: "string",
	from: "dependencies" | "devDependencies"
	old: string
	new: string
}

export default function ncu ( pkg: pkg, { semver }?: { semver: boolean }): Promise<updated>
