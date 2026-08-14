const prisma = require('../config/database');

// Singleton resource: the app keeps a single laundry profile row. `getProfile`
// lazily creates it so `GET` never 404s on a fresh database.
async function getProfile() {
  let profile = await prisma.laundryProfile.findFirst();
  if (!profile) {
    profile = await prisma.laundryProfile.create({ data: { operationalDays: [] } });
  }
  return profile;
}

async function updateProfile(data) {
  const profile = await getProfile();
  return prisma.laundryProfile.update({
    where: { id: profile.id },
    data: {
      name: data.name,
      address: data.address,
      info: data.info,
      operationalDays: data.operationalDays ?? [],
      openTime: data.openTime,
      closeTime: data.closeTime,
      whatsapp: data.whatsapp,
      email: data.email,
      links: data.links,
    },
  });
}

module.exports = { getProfile, updateProfile };
