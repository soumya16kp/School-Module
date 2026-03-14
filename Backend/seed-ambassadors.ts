import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Seeding Ambassadors ---');

  const ambassadors = [
    {
      name: 'Capt. Rajesh Kumar',
      type: 'FIRE_DEPT',
      organization: 'City Fire Services',
      phone: '9876543210',
      email: 'rajesh.kumar@fire.gov',
      active: true,
      notes: 'Expert in fire safety and evacuation drills.'
    },
    {
      name: 'Insp. Meera Singh',
      type: 'POLICE',
      organization: 'District Police Headquarters',
      phone: '9876543211',
      email: 'meera.singh@police.gov',
      active: true,
      notes: 'Specializes in campus safety and self-defense awareness.'
    },
    {
      name: 'Dr. Sameer Ahmed',
      type: 'CPR_TRAINER',
      organization: 'HeartSave Foundation',
      phone: '9876543212',
      email: 'sameer.ahmed@heartsave.org',
      active: true,
      notes: 'Certified CPR and ACLS instructor.'
    },
    {
      name: 'Sarah Williams',
      type: 'FIRST_AID_TRAINER',
      organization: 'Red Cross Society',
      phone: '9876543213',
      email: 'sarah.w@redcross.org',
      active: true,
      notes: 'First aid and emergency response specialist.'
    }
  ];

  for (const amb of ambassadors) {
    const created = await prisma.ambassadorDirectory.create({
      data: amb as any
    });
    console.log(`Created ambassador: ${created.name} (${created.type})`);
  }

  console.log('--- Seeding Complete ---');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
