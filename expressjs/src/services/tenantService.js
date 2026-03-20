import tenantRepository from "../repositories/tenantRepository.js";

async function getTenants() {
    return tenantRepository.getTenants();
}

async function getTenant(id) {
    return tenantRepository.getTenantById(id);
}

async function storeTenant(item) {
    await tenantRepository.insertTenant(item);
}

async function updateTenant(id, item) {
    await tenantRepository.updateTenantById(id, item);
}

async function removeTenant(id) {
    await tenantRepository.deleteTenantById(id);
}

export default {
    getTenants,
    getTenant,
    storeTenant,
    updateTenant,
    removeTenant,
};
