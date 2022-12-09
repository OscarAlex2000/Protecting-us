const validarUserName = async (userName = '') => {
    if (global.auth.login_data === 'password') {
        return;
    }

    if (userName === '' || userName === null || userName === undefined) {
        throw ({ msg: `Username is required`, msg_es: `El nombre de usuario es obligatorio` });
    }
}

module.exports = {
    validarUserName
}