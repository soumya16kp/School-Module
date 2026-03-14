import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('staff123', 10)
  
  // Ensure we have a school
  const school = await (prisma as any).school.findFirst()
  if (!school) {
    console.log('No school found to link staff to. Please register a school first.')
    return
  }

  const staffData = [
    {
      name: 'Sarah Johnson',
      email: 'sarah.teacher@school.com',
      phone: '9876543210',
      password,
      role: 'CLASS_TEACHER',
      assignedClass: 5,
      assignedSection: 'A',
      schoolId: school.id
    },
    {
      name: 'Michael Chen',
      email: 'michael.teacher@school.com',
      phone: '9876543211',
      password,
      role: 'CLASS_TEACHER',
      assignedClass: 10,
      assignedSection: 'B',
      schoolId: school.id
    },
    {
      name: 'Anita Desai',
      email: 'anita.staff@school.com',
      phone: '9876543212',
      password,
      role: 'STAFF',
      schoolId: school.id
    },
    {
      name: 'Robert Wilson',
      email: 'robert.teacher@school.com',
      phone: '9876543213',
      password,
      role: 'CLASS_TEACHER',
      assignedClass: 8,
      assignedSection: 'C',
      schoolId: school.id
    },
    {
      name: 'Priya Sharma',
      email: 'priya.teacher@school.com',
      phone: '9876543214',
      password,
      role: 'CLASS_TEACHER',
      assignedClass: 3,
      assignedSection: 'A',
      schoolId: school.id
    },
    {
      name: 'David Miller',
      email: 'david.staff@school.com',
      phone: '9876543215',
      password,
      role: 'STAFF',
      schoolId: school.id
    },
    {
      name: 'Global Partner',
      email: 'partner@example.com',
      phone: '9999999999',
      password,
      role: 'PARTNER',
      schoolId: null // Partners might not be tied to a specific school or we can link them later
    },
    {
      name: 'Vikram Singh',
      email: 'vikram.teacher@school.com',
      phone: '9876543216',
      password,
      role: 'CLASS_TEACHER',
      assignedClass: 10,
      assignedSection: 'A',
      schoolId: school.id
    }
  ]

  console.log('Seeding staff and partner members...')
  
  for (const staff of staffData) {
    await (prisma as any).user.upsert({
      where: { email: staff.email },
      update: {},
      create: staff
    })
  }

  console.log('Seed completed successfully!')
  console.log('--- LOGIN DETAILS ---')
  console.log('1. Sarah Johnson: sarah.teacher@school.com / staff123 (Class 5-A)')
  console.log('2. Michael Chen: michael.teacher@school.com / staff123 (Class 10-B)')
  console.log('3. Anita Desai: anita.staff@school.com / staff123 (General Staff)')
  console.log('4. Robert Wilson: robert.teacher@school.com / staff123 (Class 8-C)')
  console.log('5. Priya Sharma: priya.teacher@school.com / staff123 (Class 3-A)')
  console.log('6. David Miller: david.staff@school.com / staff123 (General Staff)')
  console.log('7. Global Partner: partner@example.com / staff123 (Partner)')
  console.log('8. Vikram Singh: vikram.teacher@school.com / staff123 (Class 10-A)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
