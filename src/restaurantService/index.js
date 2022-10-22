const { RpcServer } = require('../lib/rpc');


process.nextTick(async () => {


    let server = new RpcServer('restro', {
        processOrder,
    });

    server.listen().then(() => console.log('RPC server listening...')).catch(err => console.log('RPC server failed', err));

    server.registerMethod('getHistory', getHistory);


    // channel = await getChannel((Object.values(Q)));
    // channel.consume(Q.RESTRO, async (msg) => {
    //     if (msg !== null) {
    //         let order = JSON.parse(msg.content.toString());
    //         console.log('Recieved Order:', order);
    //         await processOrder(order);
    //         channel.ack(msg);
    //     } else {
    //         console.log('Consumer cancelled by server');
    //     }
    // });
});


async function processOrder(order) {
    return new Promise((resolve, reject) => {
        console.log('Received Order processing request: ', order);
        setTimeout(() => {
            console.log("Processed Order: ", order);
            order.status = 'served';
            if (Date.now() % 2 === 0) return reject(new Error('Failed to process order'))
            return resolve(order);
        }, 5 * 1000);
    });
}

async function getHistory() {
     // ...
}


// async function processOrder(order) {
//     return new Promise((resolve) => {
//         let timer = 30;
//         let interval = setInterval(() => {
//             timer -= 5;
//             publishToQueue(channel, Q.ORDER_STATUS, {
//                 id: order.id,
//                 eta: timer
//             });
//         }, 6*1000);
//         setTimeout(() => {
//             console.log("Completed Order: ", order);
//             clearInterval(interval)
//             order.eta = 0;
//             order.status = 'served';
//             publishToQueue(channel, Q.ORDER, order);
//             resolve();
//         }, 30 * 1000);
//     });
// }



