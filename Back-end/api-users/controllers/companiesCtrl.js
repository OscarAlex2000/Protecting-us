const { response, request } = require("express");

const CompanyConfig = require('../models/companyConfig')
// const { dbConnection } = require("../database/config");

const UpdateSettings = async (company_id, settings) => {
    try {
        if (company_id) {
            const [multiSessionRow] = settings.filter(s => s.id === global.auth.multiple_sessions_setting_id);
            if (multiSessionRow) {
                // const conn = await dbConnection();
                // const CompanyConfig = conn.model("CompanyConfig");
                const company = await CompanyConfig.findOne({company_id: company_id});
                if (company) {
                    // Actualizar configuración de la empresa
                    await CompanyConfig.findOneAndUpdate(
                        {company_id: company_id},
                        { multiple_sessions: !multiSessionRow.disabled }
                    );
                } else {
                    // Agregar configuración de la empresa
                    const company = new CompanyConfig({
                        company_id: company_id,
                        multiple_sessions: !multiSessionRow.disabled
                    });

                    await company.save();
                }

                // conn.close();
            }
        }
    } catch(err) {
        console.log(err);
    }
}

const UpdateCompanySettings = async (msg) => {
    console.log(msg);
    const data = JSON.parse(msg[1][1]);
    console.log(data);
    await UpdateSettings(data.company_id, data.settings);
}

module.exports = {
    UpdateCompanySettings,
    UpdateSettings
}