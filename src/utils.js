import semver from "semver"
import https from "https"

export async function getAllVersions ( pkgs ) {
	return Object.fromEntries(
		await Promise.all(
			pkgs.map(async ( pkg ) => ([
				pkg, await getVersions(pkg)
			]))
		)
	)
}

export async function getVersions ( pkg, v ) {
	const { error, "dist-tags": { latest } = {}, versions } = await download(pkg)
	if (error) return null

	if (v && semver.valid(v) && semver.gt(v, latest)) {
		return Object.keys(versions).sort(semver.rcompare)
	} else {
		return Object.keys(versions).filter(( version ) => semver.gte(latest, version)).sort(semver.rcompare)
	}
}

function download ( pkg ) {
	return new Promise(( resolve ) => {
		https.get(`https://registry.npmjs.org/${pkg}`, ( res ) => {
			let data = []

			res.on("data", ( d ) => data.push(d))
			res.on("end", () => (
				resolve(
					JSON.parse(Buffer.concat(data))
				)
			))
		})
	})
}
