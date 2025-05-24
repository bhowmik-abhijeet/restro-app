import convict from 'convict';
import path from 'path';
import dotenv from 'dotenv';

if (process.env.NODE_ENV == 'development') {
    console.warn("Loading environment variables from .env file")
    // Load environment variables from .env file
    dotenv.config({ path: path.resolve(__dirname, './dev.env') });
}


export const config = convict({
    redis: {
        username: {
            doc: 'Redis username',
            format: String,
            default: 'default',
            env: 'REDIS_USERNAME',
        },
        password: {
            doc: 'Redis password',
            format: String,
            default: 'password',
            env: 'REDIS_PASSWORD',
        },
        host: {
            doc: 'Redis host',
            format: String,
            default: 'default',
            env: 'REDIS_HOST',
        },
        port: {
            doc: 'Redis port',
            format: String,
            default: 'default',
            env: 'REDIS_PORT',
        }
    },
    amqp: {
        username: {
            doc: 'username',
            format: String,
            default: 'default',
            env: 'AMQP_USERNAME',
        },
        password: {
            doc: 'password',
            format: String,
            default: 'password',
            env: 'AMQP_PASSWORD',
        },
        host: {
            doc: 'host',
            format: String,
            default: 'default',
            env: 'AMQP_HOST',
        },
        port: {
            doc: 'port',
            format: String,
            default: 'default',
            env: 'AMQP_PORT',
        }
    }
})


config.validate({ allowed: 'strict' });