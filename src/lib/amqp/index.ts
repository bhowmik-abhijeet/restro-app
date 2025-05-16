
import amqp from 'amqplib';
import { config } from "../../config";

var channelModel: amqp.ChannelModel;
var conn: amqp.Connection;

async function getConnection() {
    if (conn) return conn;
    const cfg = config.get('amqp')
    channelModel = (await amqp.connect(`amqp://${cfg.username}:${cfg.password}@${cfg.host}:${cfg.port}`));
    conn = channelModel.connection
    return conn;
}


module.exports.getChannel = async (queues: string[], opt = {}): Promise<amqp.Channel> => {
    let conn = await getConnection();
    let channel = await channelModel.createChannel();
    const queueAssertPromise: Promise<any>[] = [];

    queues.forEach((q) => {
       queueAssertPromise.push(channel.assertQueue(q, opt));
    });

    await Promise.all(queueAssertPromise);
    return channel;
}

module.exports.publishToQueue = async (channel: amqp.Channel, queueName: string, data: any, props = {}) => {
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), props);
}