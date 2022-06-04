import { exec } from "child_process"
import { readFileSync, writeFileSync } from "fs"
import { join } from "path"
import { cyan, green, magenta, red } from "./colors.js"
import { getVersions } from "../src/utils.js"
import semver from "semver"

export default async function handler ( path = ".", { semver: opSem, update, install }) {
	const dir = join(process.cwd(), path)
	const pkgPath = join(dir, "package.json")
	const pkg = JSON.parse(readFileSync(pkgPath))

	console.log(`checking ${process.platform == "win32" ? pkgPath.replace(/\\/g, "/") : pkgPath}`)

	const { dependencies, devDependencies } = pkg
	const deps = { dependencies, devDependencies }

	const len = Object.values(deps).filter(( dep ) => dep).map(( dep ) => Object.keys(dep)).flat().length
	const bar = progress(len)

	const updated = (await Promise.all(
		Object.entries(deps).map(([ type, deps ]) => {
			if (!deps || typeof deps != "object") return []

			return Promise.all(
				Object.entries(deps).map(async ([ name, range ]) => {
					if (!semver.validRange(range)) {
						bar.inc()
						return null
					}

					const versions = await getVersions(name, range.replace(/^([\^~=]|(><)=?)/, ""))
					bar.inc()

					if (!versions) return null

					const [ start = "" ] = /^([\^~=]|[><]=?)/.exec(range) || []
					return {
						name,
						from: type,
						old: range,
						new: !opSem ? `${start}${versions[0]}` : `${start}${semver.maxSatisfying(versions, range) || versions[0]}`
					}
				})
			)
		})
	)).flat().filter(( dep ) => dep && dep.old != dep.new)

	bar.end()

	if (updated.length) {
		const max = updated.reduce(( acc, curr ) => ({
			name: acc.name < curr.name.length ? curr.name.length : acc.name,
			old: acc.old < curr.old.length ? curr.old.length : acc.old,
			new: acc.new < curr.new.length ? curr.new.length : acc.new
		}), { name: 0, old: 0, new: 0 })

		updated.forEach(({ name, old, new: n }) => console.log(`  ${name.padEnd(max.name)}  ${old.padStart(max.old)}  →  ${colorVersion(old, n, max.new)}`))
		console.log()

		if (update) {
			updated.forEach(({ from, name, new: n }) => pkg[from][name] = n)

			writeFileSync(pkgPath, JSON.stringify(pkg, null, "\t") + "\n")

			if (install) {
				console.log(`${magenta("installing")} dependencies`)
				new Promise(( resolve, reject ) => (
					exec("npm install", { cwd: dir }, ( _stdout, _stderr, err ) => err ? reject(err) : resolve())
				))
				.then(() => console.log(`${magenta("installed")} dependencies`))
				.catch(( err ) => console.log(`${`${(err && err.message) || err || "something went wrong"}`.replace(/[\s\n\r]+/g, " ")}`))
			} else {
				console.log(`run ${cyan("npm install")} to install the updated packages`)
			}
		} else {
			console.log(`run ${cyan("ncu -u")} to update your package.json`)
		}
	} else {
		console.log("all dependencies are up to date!")
	}
}

function progress ( num ) {
	const { stdout } = process

	const max = parseInt(`${num}`)
	const len = 30
	let amount = 0
	let write = 0

	stdout.write("\x1b[?25l")
	stdout.write("\n")
	stdout.moveCursor(0, -1)

	stdout.write(`[${"-".repeat(len)}] 0/${max}`)
	stdout.cursorTo(0)

	process.on("SIGINT", () => {
		stdout.write("\x1b[?25h\n")
		process.exit()
	})

	process.on("beforeExit", () => {
		stdout.write("\x1b[?25h\n")
	})

	return {
		inc ( a = 1 ) {
			if (amount == max) return

			amount += a
			write = Math.round(amount / max * len)

			stdout.write(`[${"#".repeat(write)}${"-".repeat(len - write)}] ${amount}/${max} ${(amount / max * 100).toFixed(0)}%`)
			stdout.cursorTo(0)
		},
		end () {
			stdout.moveCursor(0, 1)
			stdout.write("\x1b[?25h\n")
		}
	}
}

function colorVersion ( old, n, max ) {
	const pad = " ".repeat(max.length)

	const [, sym = "", one, two, three ] = /^([\^~])?(.+)\.(.+)?\.(.+)?$/.exec(n)
	const spl = (/^(?:[\^~])?(.+)\.(.+)?\.(.+)?$/.exec(old)).slice(1, 4)

	if (one == spl[0]) {
		if (two == spl[1]) {
			return `${pad}${sym}${one}.${two}.${green(three)}`
		} else {
			return `${pad}${sym}${one}.${cyan(`${two}.${three}`)}`
		}
	} else {
		return `${pad}${sym}${red(`${one}.${two}.${three}`)}`
	}
}
