const { getChannel, publishToQueue } = require('../amqp');
class RpcServer {

    constructor(name, methodHandlers) {
        this.queueName = name + '_rpc_queue';
        this.methodHandlers = methodHandlers || {};
    }

    registerMethod(methodName, methodHandler) {
        this.methodHandlers[methodName] = methodHandler;
    }

    async invoke(method, params) {
        if (!this.methodHandlers[method]) {
            return {
                error: {
                    code: -32600,
                    message: 'Invalid method'
                }
            };
        }
        try {
            let result = await this.methodHandlers[method].apply({}, params);
            return {
                result,
            };
        } catch(err) {
            return {
                error: {
                    code: -32603,
                    message: err.message,
                }
            };
        }
    }

    async listen() {
        this.channel = await getChannel([this.queueName], { noAck: true, autoDelete: true, durable: false });
        this.channel.consume(this.queueName, async (msg) => {
            if (!msg) {
                console.log('Stopping Server...');
                process.exit();
            }
            let rpcPayload = JSON.parse(msg.content.toString());
            let method = rpcPayload.method;
            let params = rpcPayload.params;
            let id = rpcPayload.id;
            let res = await this.invoke(method, params);
            res.id = id;
            let props = {
                correlationId: msg.properties.correlationId
            };
            publishToQueue(this.channel, msg.properties.replyTo, res, props);
        });
    }
}



class RpcClient {
    constructor(name, methods) {
        this.queueName = name + '_rpc_queue';
        this.replyTo = name + '_reply_to_' + Date.now();
        this.callbacks = {};
        methods.forEach(method => {
            this[method] = this.getCallHandler(method);
        });
    }

    getCallHandler(method) {
        return function(...params) {
            return new Promise(async (resolve, reject) => {
                if (!this.channel) {
                    return reject(new Error('Client not initialized'));
                }
                let rpcPayload = {
                    method,
                    params,
                    id: Date.now().toString(),
                }
                let props = {
                    replyTo: this.replyTo,
                    correlationId: rpcPayload.id,
                }
                await publishToQueue(this.channel, this.queueName, rpcPayload, props);
                this.callbacks[rpcPayload.id] = (err, res) => {
                    if (err) reject(err);
                    return resolve(res);
                }
            });
        }
    }

    async init() {
        this.channel = await getChannel([this.queueName, this.replyTo], { noAck: true, autoDelete: true, durable: false });
        this.channel.consume(this.replyTo, (res) => {
            if (!res) {
                console.log('Stopping Client...');
                process.exit();
            }
            let callback = this.callbacks[res.properties.correlationId];
            if (callback) {
                let response = JSON.parse(res.content.toString());
                return callback(response.error, response.result);
            }
        });
    }
}

module.exports = {
    RpcClient, RpcServer
}