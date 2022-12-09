const Redis = require("ioredis");
let redis;

const redisEmit = async (event_key = '', res = {}) => {
    if (!global.redis.enabled) {
        return;
    }

    redis = new Redis({
        port: global.redis.port,
        host: global.redis.host,
        username: global.redis.user,
        password: global.redis.pass
    });

    const { stream, max_len = 100 } = global.redis.events_to_emmit.filter((event) => event.event_key == event_key)[0] || {stream: null, max_len: null};

    if (stream) {
        await redis.xadd(stream, 'MAXLEN', '~', max_len, "*", `data`, JSON.stringify(res));
    }

    // Cerrar conexion de redis
    redis.disconnect();
}

module.exports = { redisEmit }