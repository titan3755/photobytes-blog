import { Prisma, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const userData: Prisma.UserCreateInput[] = [
  {
    name: 'Alice',
    email: 'alice@prisma.io',
    username: 'alice',
    articles: {
      create: [
        {
          title: 'Join the Prisma Discord',
          slug: 'join-prisma-discord',
          content: 'https://pris.ly/discord',
          published: true,
        },
        {
          title: 'Prisma on YouTube',
          slug: 'prisma-on-youtube',
          content: 'https://pris.ly/youtube',
        },
      ],
    },
  },
  {
    name: 'Bob',
    email: 'bob@prisma.io',
    username: 'bob',
    articles: {
      create: [
        {
          title: 'Follow Prisma on Twitter',
          slug: 'follow-prisma-on-twitter',
          content: 'https.www.twitter.com/prisma',
          published: true,
        },
      ],
    },
  },
];

export async function main() {
  console.log('Start seeding...');
  for (const u of userData) {
    const user = await prisma.user.create({ data: u });
    console.log(`Created user with id: ${user.id}`);
  }
  console.log('Seeding finished.');
}

main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });