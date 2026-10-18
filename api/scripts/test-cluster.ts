/**
 * Throwaway PostgreSQL cluster for Al-Mamharah integration tests.
 *
 * The repo's production DATABASE_URL points at a remote database and the
 * Drizzle migration chain requires the `vector` extension, which is not
 * installed locally. This script therefore:
 *
 *   1. initialises a local PostgreSQL cluster in the OS temp directory
 *      (trust auth, dedicated port) using the installed PostgreSQL 18 tools;
 *   2. recreates the test database;
 *   3. applies every migration in `drizzle/*.sql` statement-by-statement,
 *      skipping the `vector` extension and the `books.embedding` column so the
 *      schema is otherwise identical to production;
 *   4. (with `run`) executes the Al-Mamharah test suite against it and stops
 *      the cluster afterwards.
 *
 * Usage:
 *   bun scripts/test-cluster.ts up     # init/start cluster + migrate
 *   bun scripts/test-cluster.ts down   # stop the cluster
 *   bun scripts/test-cluster.ts run    # up + run tests + down
 */
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import postgres from 'postgres'

const PG_BIN =
	process.env.PG_BIN ??
	(process.platform === 'win32'
		? 'C:\\Program Files\\PostgreSQL\\18\\bin'
		: '/usr/lib/postgresql/18/bin')

const BASE_DIR = join(tmpdir(), 'mssn-al-mamharah-pgtest')
const DATA_DIR = join(BASE_DIR, 'data')
const LOG_FILE = join(BASE_DIR, 'postgres.log')
const PORT = Number(process.env.TEST_PG_PORT ?? 55432)
const TEST_DB = 'mssn_al_mamharah_test'
const ADMIN_URL = `postgres://postgres@127.0.0.1:${PORT}/postgres`
const TEST_DB_URL = `postgres://postgres@127.0.0.1:${PORT}/${TEST_DB}`

function run(bin: string, args: string[], options: { allowFailure?: boolean } = {}) {
	const result = spawnSync(bin, args, { encoding: 'utf8' })
	if (result.status !== 0 && !options.allowFailure) {
		console.error(result.stdout)
		console.error(result.stderr)
		throw new Error(`${bin} ${args.join(' ')} failed with status ${result.status}`)
	}
	return result
}

function isClusterRunning(): boolean {
	if (!existsSync(DATA_DIR)) return false
	const result = run(join(PG_BIN, 'pg_ctl'), ['status', '-D', DATA_DIR], { allowFailure: true })
	return result.status === 0
}

function initCluster(): void {
	if (existsSync(join(DATA_DIR, 'PG_VERSION'))) return
	mkdirSync(BASE_DIR, { recursive: true })
	console.log(`[test-db] initdb → ${DATA_DIR}`)
	const result = run(join(PG_BIN, 'initdb'), [
		'-A',
		'trust',
		'-U',
		'postgres',
		'--encoding=UTF8',
		'--locale=C',
		'-D',
		DATA_DIR
	])
	console.log(result.stdout.trim().split('\n').slice(-2).join('\n'))
}

function startCluster(): void {
	if (isClusterRunning()) {
		console.log('[test-db] cluster already running')
		return
	}
	initCluster()
	console.log(`[test-db] starting cluster on port ${PORT}`)
	run(join(PG_BIN, 'pg_ctl'), [
		'start',
		'-D',
		DATA_DIR,
		'-o',
		`-p ${PORT} -c listen_addresses=127.0.0.1 -c fsync=off -c synchronous_commit=off -c full_page_writes=off`,
		'-l',
		LOG_FILE,
		'-w',
		'-t',
		'60'
	])
}

function stopCluster(): void {
	if (!isClusterRunning()) {
		console.log('[test-db] cluster not running')
		return
	}
	console.log('[test-db] stopping cluster')
	run(join(PG_BIN, 'pg_ctl'), ['stop', '-D', DATA_DIR, '-m', 'fast', '-w', '-t', '60'])
}

async function resetDatabase(): Promise<void> {
	const admin = postgres(ADMIN_URL, { max: 1 })
	try {
		await admin.unsafe(`DROP DATABASE IF EXISTS ${TEST_DB} WITH (FORCE)`)
		await admin.unsafe(`CREATE DATABASE ${TEST_DB}`)
		console.log(`[test-db] recreated database ${TEST_DB}`)
	} finally {
		await admin.end()
	}
}

interface JournalEntry {
	idx: number
	tag: string
}

/** Removes lines that depend on the uninstalled `vector` extension. */
function stripVectorLines(statement: string): string {
	return statement
		.split('\n')
		.filter(line => !/"embedding"\s+"?vector/i.test(line))
		.join('\n')
}

async function applyMigrations(): Promise<void> {
	const journal = JSON.parse(
		readFileSync(join(process.cwd(), 'drizzle', 'meta', '_journal.json'), 'utf8')
	) as { entries: JournalEntry[] }

	const sql = postgres(TEST_DB_URL, { max: 1, onnotice: () => {} })
	let applied = 0
	let skipped = 0
	try {
		for (const entry of journal.entries) {
			const file = join(process.cwd(), 'drizzle', `${entry.tag}.sql`)
			const content = readFileSync(file, 'utf8')
			const statements = content
				.split('--> statement-breakpoint')
				.map(stripVectorLines)
				.map(s => s.trim())
				.filter(Boolean)

			for (const statement of statements) {
				if (/create\s+extension/i.test(statement) && /vector/i.test(statement)) {
					skipped++
					continue
				}
				try {
					await sql.unsafe(statement)
					applied++
				} catch (error) {
					const message = error instanceof Error ? error.message : String(error)
					if (/vector|extension|embedding/i.test(message)) {
						console.warn(`[test-db] skipped statement (${message.split('\n')[0]})`)
						skipped++
						continue
					}
					console.error(`[test-db] failed migration ${entry.tag}:\n${statement.slice(0, 400)}`)
					throw error
				}
			}
		}
		console.log(`[test-db] migrations applied (${applied} statements, ${skipped} skipped)`)
	} finally {
		await sql.end()
	}
}

function testEnvironment(): NodeJS.ProcessEnv {
	return {
		...process.env,
		NODE_ENV: 'test',
		DATABASE_URL: TEST_DB_URL,
		PAYSTACK_SECRET_KEY: 'test',
		PAYSTACK_PUBLIC_KEY: 'test',
		SMTP_HOST: '127.0.0.1',
		SMTP_PORT: '2525',
		SMTP_USER: 'test',
		SMTP_PASS: 'test',
		SMTP_FROM: 'al-mamharah@example.com',
		JWT_SECRET: 'test-jwt-secret',
		AL_MAMHARAH_MANAGER_EMAIL: 'primary.manager@example.com',
		AL_MAMHARAH_MANAGER_PASSWORD: 'primary-password-123',
		AL_MAMHARAH_SITE_URL: 'http://localhost:5173'
	}
}

async function up(): Promise<void> {
	startCluster()
	await resetDatabase()
	await applyMigrations()
	console.log(`[test-db] ready → ${TEST_DB_URL}`)
}

function runTests(): number {
	const result = spawnSync(
		'bun',
		['test', 'tests/al-mamharah-units.test.ts', 'tests/al-mamharah.test.ts'],
		{ stdio: 'inherit', cwd: process.cwd(), env: testEnvironment() }
	)
	return result.status ?? 1
}

async function main(): Promise<void> {
	const command = process.argv[2] ?? 'run'

	switch (command) {
		case 'up':
			await up()
			break
		case 'down':
			stopCluster()
			break
		case 'reset': {
			stopCluster()
			rmSync(BASE_DIR, { recursive: true, force: true })
			console.log('[test-db] removed test cluster data directory')
			break
		}
		case 'run': {
			await up()
			let exitCode = 1
			try {
				exitCode = runTests()
			} finally {
				stopCluster()
			}
			process.exit(exitCode)
			break
		}
		default:
			console.error(`Unknown command: ${command}`)
			process.exit(1)
	}
}

main().catch(error => {
	console.error(error)
	process.exit(1)
})
