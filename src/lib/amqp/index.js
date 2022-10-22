const amqp = require('amqplib');
let conn;

async function getConnection() {
    if (conn) return conn;
    conn = await amqp.connect('amqp://guest:guest@localhost');
    return conn;
}


module.exports.getChannel = async (queues, opt = {}) => {
    let conn = await getConnection();
    let channel = await conn.createChannel();
    const queueAssertPromise = [];

    queues.forEach((q) => {
       queueAssertPromise.push(channel.assertQueue(q, opt));
    });

    await Promise.all(queueAssertPromise);
    return channel;
}

module.exports.publishToQueue = async (channel, queueName, data, props = {}) => {
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)), props);
}