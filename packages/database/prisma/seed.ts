import { PrismaClient, RoleName } from '../src';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando Seed de Base de Datos para KALIX...');

  // 1. Roles por Defecto
  const rolesData = [
    { name: RoleName.ADMIN, description: 'Administrador general de la comunidad' },
    { name: RoleName.RESIDENT, description: 'Residente que habita una propiedad' },
    { name: RoleName.OWNER, description: 'Propietario de una o más propiedades' },
    { name: RoleName.SECURITY, description: 'Personal de caseta y control de accesos' },
    { name: RoleName.MAINTENANCE, description: 'Personal encargado de atender reportes de mantenimiento' },
  ];

  for (const r of rolesData) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: r,
    });
  }
  console.log('✅ Roles creados/actualizados exitosamente.');

  // 2. Permisos del Sistema
  const permissions = [
    'property.read', 'property.create', 'property.update', 'property.delete',
    'fee.read', 'fee.create', 'fee.update',
    'payment.read', 'payment.create',
    'maintenance.read', 'maintenance.create', 'maintenance.assign', 'maintenance.update',
    'reservation.read', 'reservation.create', 'reservation.cancel',
    'visitor.read', 'visitor.create',
    'access.validate', 'access.read',
    'announcement.read', 'announcement.create',
    'user.read', 'user.create', 'user.update',
    'audit.read',
  ];

  for (const permName of permissions) {
    await prisma.permission.upsert({
      where: { name: permName },
      update: {},
      create: { name: permName, description: `Permiso para ${permName}` },
    });
  }
  console.log('✅ Permisos creados exitosamente.');

  console.log('🚀 Seed completado de forma satisfactoria.');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
