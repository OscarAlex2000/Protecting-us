const path = require('path');
const fs = require('fs');
let config = {};
const validRedisEventsEmit = ['userPost', 'userPatch', 'userDelete', 'userLogin'];
const validRedisEventsListen = ['permission/updated', 'permission/deleted', 'profile/updated', 'profile/deleted', 'companySettings/updated'];

const startConfig = async () => {

    let urlConfig = path.join(__dirname, '../config/config.json');
    if (fs.existsSync(urlConfig)) {
        config = await fs.readFileSync(urlConfig);
        config = JSON.parse(config);
    }

    if (!config.redis) {
        redisDefaults();
    } else {


        if (config.redis.enabled && config.redis.use_defaults) {
            redisDefaults();
        }

        if (typeof config.redis.enabled !== "boolean") {
            (config.redis.enabled === "true" || config.redis.enabled === "1")
                ? config.redis.enabled = true
                : ((config.redis.enabled === "false" || config.redis.enabled === "0")
                    ? config.redis.enabled = false
                    : config.redis.enabled = true);
        }
        if (typeof config.redis.use_defaults !== "boolean") {
            (config.redis.use_defaults === "true" || config.redis.use_defaults === "1")
                ? config.redis.use_defaults = true
                : ((config.redis.use_defaults === "false" || config.redis.use_defaults === "0")
                    ? config.redis.use_defaults = false
                    : config.redis.use_defaults = true);
        }
        if (typeof config.redis.host !== "string" || config.redis.host == "") {
            config.redis.host = "localhost";
        }
        if (typeof config.redis.port !== "number") {
            config.redis.port = 6379;
        }
        if (typeof config.redis.user !== "string") {
            config.redis.user = "";
        }
        if (typeof config.redis.pass !== "string") {
            config.redis.pass = "";
        }

        if (!config.redis.events_to_emmit || !Array.isArray(config.redis.events_to_emmit)) {
            config.redis.events_to_emmit = [
                {
                    stream: "users.user.created",
                    event_key: "userPost",
                    max_len: 100
                },
                {
                    stream: "users.user.updated",
                    event_key: "userPatch",
                    max_len: 100
                },
                {
                    stream: "users.user.deleted",
                    event_key: "userDelete",
                    max_len: 100
                },
                {
                    stream: "users.user.login",
                    event_key: "userLogin",
                    max_len: 100
                }
            ];
        }

        if (!config.redis.events_to_listen || !Array.isArray(config.redis.events_to_listen)) {
            config.redis.events_to_listen = [
                {
                    function: "permission/updated",
                    stream: "permissions.permission.updated",
                    last_id_key: "app.users.permission.updated.last_id"
                },
                {
                    function: "permission/deleted",
                    stream: "permissions.permission.deleted",
                    last_id_key: "app.users.permission.deleted.last_id"
                },
                {
                    function: "profile/updated",
                    stream: "profiles.profile.updated",
                    last_id_key: "app.users.profile.updated.last_id"
                },
                {
                    function: "profile/deleted",
                    stream: "profiles.profile.deleted",
                    last_id_key: "app.users.profile.deleted.last_id"
                },
                {
                    function: "companySettings/updated",
                    stream: "companies.settings.updated",
                    last_id_key: "app.users.companies.settings.updated.last_id"
                }
            ];
        }

        config.redis.events_to_emmit = config.redis.events_to_emmit.filter((event) => validRedisEventsEmit.includes(event.event_key));
        config.redis.events_to_listen = config.redis.events_to_listen.filter((event) => validRedisEventsListen.includes(event.function));
        global.redis = config.redis;
    }

    if (!config.auth) {
        authDefaults();
    } else {
        if (typeof config.auth.jwt_secret_key !== "string") {
            config.auth.jwt_secret_key = "vxW4nw3Dl#IhkqCZ3Or87hGvAnP$FWOJmdz";
        }
        if (typeof config.auth.jwt_exipire_time !== "string") {
            config.auth.jwt_exipire_time = "1h";
        }
        if (typeof config.auth.login_data !== "string") {
            config.auth.login_data = "user_name";
        }
        if (typeof config.auth.user_name_type !== "string") {
            config.auth.user_name_type = "code";
        }
        if (typeof config.auth.user_name_min_length !== "number") {
            config.auth.user_name_min_length = 5;
        }
        if (typeof config.auth.password_min_length !== "number") {
            config.auth.password_min_length = 8;
        }
        if (typeof config.auth.multiple_sessions_setting_id !== "number") {
            config.auth.multiple_sessions_setting_id = null;
        }
        if (typeof config.auth.account_validation == 'undefined') {
            config.auth.account_validation = true;
        }
        if (!config.auth.validation_route) {
            config.auth.validation_route = "https://radmintest.selfip.net/api/users/users/validate"
        }
        if (!config.auth.validation_code_type) {
            config.auth.validation_code_type = "long_code"
        }
        if (!config.auth.create_default_user || typeof config.auth.create_default_user !== "boolean") {
            config.auth.create_default_user = false;
        }
        if (!config.auth.default_user || typeof config.auth.default_user !== "object") {
            config.auth.default_user = {
                name: "Admin",
                user_name: "admin",
                password: "admin"
            };
        }
        if (config.auth.default_user && typeof config.auth.default_user == "object") {
            if (!config.auth.default_user.name) {
                config.auth.default_user.name = "Admin";
            }
            if (!config.auth.default_user.user_name) {
                config.auth.default_user.name = "admin";
            }
            if (!config.auth.default_user.password) {
                config.auth.default_user.password = "admin";
            }
        }
        global.auth = config.auth;
    }
    if (!config.captcha) {
        captchaDefaults();
    } else {
        if (typeof config.captcha.enabled !== "boolean") {
            config.captcha.enabled = true;
        }
        if (!config.captcha.minutes_to_expire) {
            config.captcha.minutes_to_expire = 1;
        }
        global.captcha = config.captcha;
    }

    if (!config.mongo) {
        mongoDefaults();
    } else {
        config.mongo.enabled = true;
        if (config.mongo.enabled && config.mongo.use_defaults) {
            mongoDefaults();
        }

        if (typeof config.mongo.srv !== "boolean") {
            (config.mongo.srv === "true" || config.mongo.srv === "1")
                ? config.mongo.srv = true
                : ((config.mongo.srv === "false" || config.mongo.srv === "0")
                    ? config.mongo.srv = false
                    : config.mongo.srv = false);
        }
        if (typeof config.mongo.host !== "string" || config.mongo.host == "") {
            config.mongo.host = "localhost";
        }
        if (typeof config.mongo.port !== "number") {
            config.mongo.port = 27017;
        }
        if (typeof config.mongo.username !== "string" || config.mongo.username == "") {
            config.mongo.username = "";
        }
        if (typeof config.mongo.password !== "string" || config.mongo.password == "") {
            config.mongo.password = "";
        }
        if (typeof config.mongo.db !== "string" || config.mongo.db == "") {
            config.mongo.db = "api_users";
        }
        global.mongo = config.mongo;
    }

    if (!config.api) {
        apiDefault();
    } else {
        if (typeof config.api.name !== "string" || config.api.name == "") {
            config.api.name = "users";
        }
        if (typeof config.api.port !== "number") {
            config.api.port = 8080;
        }
        if (typeof config.api.company_id_required !== "boolean") {
            config.api.company_id_required = false;
        }
        if (typeof config.api.show_user_name !== "boolean") {
            (config.api.show_user_name === "true" || config.api.show_user_name === "1")
                ? config.api.show_user_name = true
                : ((config.api.show_user_name === "false" || config.api.show_user_name === "0")
                    ? config.api.show_user_name = false
                    : config.api.show_user_name = true);
        }
        global.api = config.api;
    }
    // console.log(global.redis.events_to_listen);

    if (!config.mail_info) {
        mail_InfoDefaults();
    } else {
        global.mail_info = config.mail_info;
    }

    return global;
};

const redisDefaults = () => {
    global.redis = {
        enabled: true,
        use_defaults: true,
        host: "localhost",
        port: 6379,
        user: "",
        pass: "",
        events_to_emmit: [
            {
                stream: "users.user.created",
                event_key: "userPost",
                max_len: 100
            },
            {
                stream: "users.user.updated",
                event_key: "userPatch",
                max_len: 100
            },
            {
                stream: "users.user.deleted",
                event_key: "userDelete",
                max_len: 100
            },
            {
                stream: "users.user.login",
                event_key: "userLogin",
                max_len: 100
            }
        ],
        events_to_listen: [
            {
                function: "permission/updated",
                stream: "permissions.permission.updated",
                last_id_key: "app.users.permission.updated.last_id"
            },
            {
                function: "permission/deleted",
                stream: "permissions.permission.deleted",
                last_id_key: "app.users.permission.deleted.last_id"
            },
            {
                function: "profile/updated",
                stream: "profiles.profile.updated",
                last_id_key: "app.users.profile.updated.last_id"
            },
            {
                function: "profile/deleted",
                stream: "profiles.profile.deleted",
                last_id_key: "app.users.profile.deleted.last_id"
            },
            {
                function: "companySettings/updated",
                stream: "companies.settings.updated",
                last_id_key: "app.users.companies.settings.updated.last_id"
            }
        ]
    };
}

const authDefaults = () => {
    global.auth = {
        jwt_secret_key: "vxW4nw3Dl#IhkqCZ3Or87hGvAnP$FWOJmdz",
        jwt_exipire_time: "1h",
        login_data: "user_name",
        user_name_type: "code",
        user_name_min_length: 5,
        password_min_length: 8,
        multiple_sessions_setting_id: null,
        account_validation: true,
        validation_route: "https://radmintest.selfip.net/api/users/users/validate",
        validation_code_type: "long_code",
        create_default_user: false,
        default_user: {
            name: "Admin",
            user_name: "admin",
            password: "admin"
        }
    };
}

const captchaDefaults = () => {
    global.captcha = {
        enabled: true,
        minutes_to_expire: 5

    };
}

const mongoDefaults = () => {
    global.mongo = {
        enabled: true,
        use_defaults: true,
        srv: false,
        host: "localhost",
        port: 27017,
        user: "",
        pass: "",
        db: "api_users"
    };
}

const apiDefault = () => {
    global.api = {
        name: "users",
        port: 8080,
        company_id_required: false,
        show_user_name: true
    };
}

const mail_InfoDefaults = () => {
    global.mail_info ={
        host: "http://notification:3000",
        validation: {
            template: "archivistica_validation"
        },
        password:{
            template: "archivistica_password"
        },
        recobery_password:{
            template: "recobery_password"
        }
    }
}
module.exports = { startConfig };