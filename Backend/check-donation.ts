import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Checking Donations for Amount: 6500 ---');
  
  const donations = await prisma.donation.findMany({
    where: {
      amount: 6500
    },
    include: {
      school: {
        select: {
          id: true,
          schoolName: true
        }
      },
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  });

  if (donations.length === 0) {
    console.log('No donations found with the exact amount of ₹6,500.');
  } else {
    console.log(`Found ${donations.length} donation(s):`);
    donations.forEach((d, i) => {
      console.log(`\nDonation #${i + 1}:`);
      console.log(`- Partner: ${d.user.name} (${d.user.email})`);
      console.log(`- School: ${d.school.schoolName} (ID: ${d.schoolId})`);
      console.log(`- Amount: ₹${d.amount}`);
      console.log(`- Status: ${d.status}`);
      console.log(`- Date: ${d.date}`);
    });
  }

  console.log('\n--- Checking All Recent Donations (Last 5) ---');
  const allRecent = await prisma.donation.findMany({
    take: 5,
    orderBy: { date: 'desc' },
    include: {
      school: { select: { schoolName: true } },
      user: { select: { name: true } }
    }
  });
  
  allRecent.forEach(d => {
    console.log(`- ₹${d.amount} for ${d.school.schoolName} by ${d.user.name} (${d.status})`);
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
