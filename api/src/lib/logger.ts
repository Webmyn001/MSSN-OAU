import pino from 'pino'
import env from './env.js'

// * Determine if we're in development
const isDev = env.NODE_ENV === 'development'

// * Configure Pino logger
export const logger = pino({
	level: isDev ? 'debug' : 'info',
	transport: isDev
		? {
				target: 'pino-pretty',
				options: {
					colorize: true,
					translateTime: 'SYS:standard',
					ignore: 'pid,hostname',
					singleLine: false
				}
			}
		: undefined,
	redact: {
		paths: [
			'password',
			'password_hash',
			'token',
			'authorization',
			'cookie',
			'apiKey',
			'secret',
			'two_fa_secret',
			'access_token',
			'refresh_token'
		],
		censor: '[REDACTED]'
	},
	serializers: {
		error: pino.stdSerializers.err,
		req: pino.stdSerializers.req,
		res: pino.stdSerializers.res
	}
})
