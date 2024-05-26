// main.js

const WebSocket = require('ws');
const { v3: uuidv3 } = require('uuid');
const { createLogger, transports, format } = require('winston');
const { SocksProxyAgent } = require('socks-proxy-agent');

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
    ),
    transports: [new transports.Console()],
});

// Function to send ping messages at regular intervals
async function sendPing(websocket) {
    while (true) {
        const sendMessage = JSON.stringify({
            id: uuidv3(Date.now().toString(), uuidv3.DNS),
            version: '1.0.0',
            action: 'PING',
            data: {},
        });
        logger.debug(sendMessage);
        websocket.send(sendMessage);
        await new Promise((resolve) => setTimeout(resolve, 20000)); // Wait for 20 seconds
    }
}

async function connectToWss(socks5Proxy, userId) {
    const customHeaders = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    };

    const sslOptions = {
        rejectUnauthorized: false,
    };

    const uri = 'wss://proxy.wynd.network:4650/';
    const proxyAgent = new SocksProxyAgent(socks5Proxy);

    const wsOptions = {
        headers: customHeaders,
        agent: proxyAgent,
        ...sslOptions,
    };

    try {
        const websocket = new WebSocket(uri, wsOptions);

        websocket.on('open', () => {
            // Connection established
            logger.info('WebSocket connection established.');

            // Functionality to be executed after connection is established
            sendPing(websocket);
        });

        websocket.on('message', (data) => {
            // Handle incoming messages from the WebSocket server
            const message = JSON.parse(data);
            logger.info(message);

            // Your message handling logic goes here
        });

        websocket.on('error', (error) => {
            // Handle WebSocket connection errors
            logger.error(error);
            logger.error(socks5Proxy);
        });

        websocket.on('close', () => {
            // Handle WebSocket connection close events
            logger.info('WebSocket connection closed. Reconnecting...');
        });

    } catch (error) {
        // Handle other errors that might occur during WebSocket connection setup
        logger.error(error);
        logger.error(socks5Proxy);
    }
}

async function main() {
    const userId = '05c77a38-bfcb-4e04-9ecb-c5882f389988';

    // TODO: Modify proxy list
    const socks5ProxyList = [
        "socks5://c6e386e13b658232:RNW78Fm5@res.proxy-seller.com:10000",
        "socks5://c6e386e13b658232:RNW78Fm5@res.proxy-seller.com:10001",
        "socks5://c6e386e13b658232:RNW78Fm5@res.proxy-seller.com:10002",
        "socks5://c6e386e13b658232:RNW78Fm5@res.proxy-seller.com:10003",
        "socks5://c6e386e13b658232:RNW78Fm5@res.proxy-seller.com:10004",
        "socks5://c6e386e13b658232:RNW78Fm5@res.proxy-seller.com:10005",
        "socks5://c6e386e13b658232:RNW78Fm5@res.proxy-seller.com:10006",
        "socks5://c6e386e13b658232:RNW78Fm5@res.proxy-seller.com:10007",
        "socks5://c6e386e13b658232:RNW78Fm5@res.proxy-seller.com:10008",
        "socks5://c6e386e13b658232:RNW78Fm5@res.proxy-seller.com:10009",
    ];

    // Connect to WebSocket server using each SOCKS5 proxy
    for (const proxy of socks5ProxyList) {
        await connectToWss(proxy, userId);
    }
}

main().catch((error) => {
    // Handle errors that might occur in the main function
    logger.error('Main function error:', error);
});
