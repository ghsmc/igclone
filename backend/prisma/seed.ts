import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SAMPLE_USERS = [
  {
    username: 'travel_diaries',
    email: 'travel@demo.com',
    fullName: 'Travel Diaries',
    bio: '🌍 Exploring the world one photo at a time\n✈️ 52 countries and counting\n📸 Professional photographer',
    isVerified: true,
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    username: 'foodie_heaven',
    email: 'foodie@demo.com',
    fullName: 'Foodie Heaven',
    bio: '🍕 Food blogger & Chef\n📍 New York City\n🎥 YouTube: FoodieHeaven',
    isVerified: true,
    avatar: 'https://i.pravatar.cc/150?img=2',
  },
  {
    username: 'fitness_pro',
    email: 'fitness@demo.com',
    fullName: 'Sarah Fitness',
    bio: '💪 Personal Trainer\n🏋️ Fitness Coach\n🥗 Healthy Living',
    isVerified: false,
    avatar: 'https://i.pravatar.cc/150?img=3',
  },
  {
    username: 'artsy_soul',
    email: 'art@demo.com',
    fullName: 'Alex Martinez',
    bio: '🎨 Digital Artist\n🖌️ Illustrator\n💼 Open for commissions',
    isVerified: true,
    avatar: 'https://i.pravatar.cc/150?img=4',
  },
  {
    username: 'tech_guru',
    email: 'tech@demo.com',
    fullName: 'Tech Guru',
    bio: '👨‍💻 Software Engineer\n🚀 Tech Enthusiast\n📱 App Developer',
    isVerified: false,
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
  {
    username: 'nature_lover',
    email: 'nature@demo.com',
    fullName: 'Nature Photography',
    bio: '🌿 Nature Photographer\n🦋 Wildlife Enthusiast\n🌲 Save the Planet',
    isVerified: true,
    avatar: 'https://i.pravatar.cc/150?img=6',
  },
  {
    username: 'fashion_icon',
    email: 'fashion@demo.com',
    fullName: 'Emma Style',
    bio: '👗 Fashion Blogger\n✨ Style Inspiration\n🛍️ Shop my looks',
    isVerified: true,
    avatar: 'https://i.pravatar.cc/150?img=7',
  },
  {
    username: 'music_beats',
    email: 'music@demo.com',
    fullName: 'DJ Marcus',
    bio: '🎵 Music Producer\n🎧 DJ\n🎹 Electronic Music',
    isVerified: false,
    avatar: 'https://i.pravatar.cc/150?img=8',
  },
];

const SAMPLE_POSTS = [
  {
    imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    caption: 'Sunset views from the mountains 🏔️ Nothing beats nature\'s beauty!',
    location: 'Swiss Alps, Switzerland',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800',
    caption: 'Homemade pasta carbonara 🍝 Recipe coming soon!',
    location: 'New York, USA',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
    caption: 'Morning workout complete! 💪 Who else is training today?',
    location: 'LA Fitness Center',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800',
    caption: 'New digital artwork! What do you think? 🎨',
    location: 'Studio, California',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800',
    caption: 'Just finished this project! Tech is amazing 🚀',
    location: 'San Francisco, CA',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    caption: 'Morning in the forest 🌲 The perfect start to the day',
    location: 'Yosemite National Park',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
    caption: 'New collection dropping soon! 👗✨',
    location: 'Paris Fashion Week',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800',
    caption: 'Studio sessions 🎵 New track coming this Friday!',
    location: 'Recording Studio, LA',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800',
    caption: 'Chasing waterfalls today 💦 Nature never disappoints',
    location: 'Iceland',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    caption: 'Pizza night! 🍕 Best pizza in town hands down',
    location: 'Brooklyn, NY',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800',
    caption: 'Beach vibes 🏖️ Perfect weather today',
    location: 'Malibu Beach',
  },
  {
    imageUrl: 'https://images.unsplash.com/photo-1452457807411-4979b707c5be?w=800',
    caption: 'Abstract art in progress 🖌️',
    location: 'Art Studio',
  },
];

const COMMENTS = [
  'This is amazing! 😍',
  'Love this! ❤️',
  'Incredible shot! 📸',
  'So beautiful! ✨',
  'This is fire! 🔥',
  'Goals! 💯',
  'Stunning! 🌟',
  'Need this in my life! 💕',
  'Wow! Just wow! 😱',
  'Perfection! 👌',
  'Can\'t wait! 🎉',
  'Amazing work! 👏',
  'Absolutely gorgeous! 💖',
  'This made my day! 😊',
  'Living for this! 💫',
];

async function main() {
  console.log('🌱 Starting database seed...');

  // Delete existing data
  console.log('🗑️  Cleaning existing data...');
  await prisma.savedPost.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log('👥 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = [];
  for (const userData of SAMPLE_USERS) {
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
    });
    users.push(user);
    console.log(`  ✓ Created user: ${user.username}`);
  }

  // Create posts
  console.log('📸 Creating posts...');
  const posts = [];
  for (let i = 0; i < SAMPLE_POSTS.length; i++) {
    const postData = SAMPLE_POSTS[i];
    const user = users[i % users.length];

    const post = await prisma.post.create({
      data: {
        ...postData,
        userId: user.id,
      },
    });
    posts.push(post);
    console.log(`  ✓ Created post by ${user.username}`);
  }

  // Create follows (make it feel like a real network)
  console.log('🤝 Creating follows...');
  let followCount = 0;
  for (let i = 0; i < users.length; i++) {
    for (let j = 0; j < users.length; j++) {
      if (i !== j && Math.random() > 0.5) {
        await prisma.follow.create({
          data: {
            followerId: users[i].id,
            followingId: users[j].id,
          },
        });
        followCount++;
      }
    }
  }
  console.log(`  ✓ Created ${followCount} follows`);

  // Create likes
  console.log('❤️  Creating likes...');
  let likeCount = 0;
  for (const post of posts) {
    const numLikes = Math.floor(Math.random() * 5) + 2;
    for (let i = 0; i < numLikes && i < users.length; i++) {
      try {
        await prisma.like.create({
          data: {
            postId: post.id,
            userId: users[i].id,
          },
        });
        likeCount++;
      } catch (e) {
        // Skip if already exists
      }
    }
  }
  console.log(`  ✓ Created ${likeCount} likes`);

  // Create comments
  console.log('💬 Creating comments...');
  let commentCount = 0;
  for (const post of posts) {
    const numComments = Math.floor(Math.random() * 4) + 1;
    for (let i = 0; i < numComments; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomComment = COMMENTS[Math.floor(Math.random() * COMMENTS.length)];

      await prisma.comment.create({
        data: {
          text: randomComment,
          postId: post.id,
          userId: randomUser.id,
        },
      });
      commentCount++;
    }
  }
  console.log(`  ✓ Created ${commentCount} comments`);

  console.log('\n✅ Database seeded successfully!');
  console.log('\n📊 Summary:');
  console.log(`   Users: ${users.length}`);
  console.log(`   Posts: ${posts.length}`);
  console.log(`   Follows: ${followCount}`);
  console.log(`   Likes: ${likeCount}`);
  console.log(`   Comments: ${commentCount}`);
  console.log('\n🔑 Login credentials:');
  console.log('   Email: any user email from above (e.g., travel@demo.com)');
  console.log('   Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
