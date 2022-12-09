const checkUserPermissions = async (permissions = []) => {
    let msg = '';
    let msg_es = '';

    permissions.forEach(element => {
        keys = Object.keys(element);
        if (!keys.includes('name') || !keys.includes('alias')) {
            msg = 'Incorrect user permission format';
            msg_es = 'Formato de permiso de usuario incorrecto';
            throw ({ msg, msg_es, value: element });
        }
    });
}

const checkUserProfiles = async (profiles = []) => {
    let msg = '';
    let msg_es = '';

    profiles.forEach(element => {
        keys = Object.keys(element);
        if (!keys.includes('_id') || !keys.includes('name') || !keys.includes('permissions')) {
            msg = 'Incorrect profile format';
            msg_es = 'Formato de perfil incorrecto';
            throw ({ msg, msg_es, value: element });
        }
        element.permissions.forEach(element2 => {
            keys2 = Object.keys(element2);
            if (!keys2.includes('name') || !keys2.includes('alias')) {
                msg = 'Incorrect profile permission format';
                msg_es = 'Formato de permiso de perfil incorrecto';
                throw ({ msg, msg_es, value: element });
            }
        });
    });
}

module.exports = {
    checkUserPermissions,
    checkUserProfiles
}

