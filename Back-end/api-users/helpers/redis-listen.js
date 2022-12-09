const Redis = require("ioredis");
const { UpdateCompanySettings } = require("../controllers/companiesCtrl");
let redis;
let streams = [];
let latest_id = [];
let functions_ = [];
const { PermissionUpdate, PermissionDelete, ProfileUpdate, ProfileDelete } = require('../controllers/usuariosCtrl');

const redisListen = async () => {
    if (!global.redis.enabled || global.redis.events_to_listen.length === 0) {
        return;
    }
    redis = new Redis({
        port: global.redis.port,
        host: global.redis.host,
        username: global.redis.user,
        password: global.redis.pass
    });

    for (let i = 0; i < global.redis.events_to_listen.length; i++) {
        streams.push(global.redis.events_to_listen[i].stream);
        functions_.push(global.redis.events_to_listen[i].function);
        let id = await redis.get(`${global.redis.events_to_listen[i].last_id_key}`);
        if (!id) {
            latest_id.push("0");
        } else {
            latest_id.push(id);
        }
    }

    // Cerrar conexion de redis
    redis.disconnect();

    listenForMessage();
}

const processMessage = (message, key) => {
    try {

        streams.forEach((stream, index) => {
            if (stream == key) {
                switch (functions_[index]) {
                    case "permission/updated":
                        PermissionUpdate(message);
                        break;
                    case "permission/deleted":
                        PermissionDelete(message);
                        break;
                    case "profile/updated":
                        ProfileUpdate(message);
                        break;
                    case "profile/deleted":
                        ProfileDelete(message);
                        break;
                    case "companySettings/updated":
                        UpdateCompanySettings(message);
                        break;
                    default:
                        break;
                }
            }
        });
    } catch (error) {
        console.log(error);
    }
};

const listenForMessage = async () => {
    redis = new Redis({
        port: global.redis.port,
        host: global.redis.host,
        username: global.redis.user,
        password: global.redis.pass
    });

    const results = await redis.xread("block", 0, "STREAMS", streams, latest_id);

    results.forEach((element) => {
        // Desestructurar el elemento para obtener el stream y los mensajes
        const [stream, messages] = element;
        // Recorrer cada mensaje para procesarlo
        messages.forEach((message) => { processMessage(message, stream) });
        // Obtener el id_key del stream para poderlo almacenar
        evt = global.redis.events_to_listen.filter(e => {return e.stream === stream})[0];
        // Guardar el ultimo id del stream que se proceso
        redis.set(`${evt.last_id_key}`, messages[messages.length - 1][0]);

        streams.forEach((element, index) => {
            if (element == stream) {
                latest_id[index] = messages[messages.length - 1][0];
            }
        });
    });

    // Cerrar conexion de redis
    redis.disconnect();

    await listenForMessage();
};

module.exports = {
    redisListen
}