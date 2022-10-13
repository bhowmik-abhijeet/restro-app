const express = require("express");
const router = express.Router();
const { RpcClient } = require("../rpc");

const OrdersDB = {};
let orderId = 1;
let restroRpcClient;



process.nextTick(async () => {

    restroRpcClient = new RpcClient('restro', ['processOrder']);
    restroRpcClient.init().then(() => console.log('restroRpcClient initialized...')).catch(err => console.log('restroRpcClient init failed', err));

    // channel = await getChannel((Object.values(Q)));
    // channel.consume(Q.ORDER, async (msg) => {
    //     if (msg !== null) {
    //         let order = JSON.parse(msg.content.toString());
    //         console.log('Order Processed:', order);
    //         OrdersDB[order.id] = order;
    //         channel.ack(msg);
    //     } else {
    //         console.log('Consumer cancelled by server');
    //     }
    // });

    // channel.consume(Q.ORDER_STATUS, async (msg) => {
    //     if (msg !== null) {
    //         let order = JSON.parse(msg.content.toString());
    //         console.log('Order Update:', order);
    //         OrdersDB[order.id].eta = order.eta
    //         channel.ack(msg);
    //     } else {
    //         console.log('Consumer cancelled by server');
    //     }
    // });
});


router.get('/', (req, res) => {
    res.send(Object.values(OrdersDB))
  });

router.post('/', (req, res) => {
    let order = req.body;
    order.id = orderId;
    order.status = 'preparing';
    OrdersDB[orderId++] = order;

    restroRpcClient['processOrder'](order).then((response) => {
        res.send(response);
    }).catch((err) => {
        res.status(500).send(err);
    });
    
    // publishToQueue(channel, Q.RESTRO, order);
    
    
});

module.exports = router;

