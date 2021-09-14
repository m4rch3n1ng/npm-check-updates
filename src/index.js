import semver from "semver"
import { getAllVersions } from "./utils.js"

export default async function ncu ( pkg, { semver: opSem = false } = {}) {
	const { dependencies, devDependencies } = pkg
	const deps = { dependencies, devDependencies }

	let updated = []
	for (const type in deps) {
		if (deps[type]) {
			const versions = await getAllVersions(Object.keys(deps[type]))

			const localUpdated = Object.entries(versions).map(([ name, versions ]) => {
				const range = deps[type][name]

				if (!semver.validRange(range)) return null

				const [ start = "" ] = /^([\^~=]|[><]=?)/.exec(range) || []
				return {
					name,
					from: type,
					old: range,
					new: !opSem ? `${start}${semver.maxSatisfying(versions, "*")}` : `${start}${semver.maxSatisfying(versions, range)}`
				}
			})

			updated.push(...localUpdated.filter(( dep ) => dep && dep.new != dep.old))
		}
	}

	return updated
}
