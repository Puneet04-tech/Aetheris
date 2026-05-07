import { db } from './index';
import { users, communities, posts, comments, votes, communityMembers, opportunities } from './schema';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data
    await db.delete(votes);
    await db.delete(comments);
    await db.delete(posts);
    await db.delete(communityMembers);
    await db.delete(communities);
    await db.delete(users);
    await db.delete(opportunities);

    console.log('🧹 Cleared existing data');

    // Create users
    const createdUsers = await db.insert(users).values([
      {
        id: 'user_1',
        name: 'Alex Chen',
        email: 'alex@example.com',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
        role: 'professional',
        bio: 'Full-stack developer passionate about React and Node.js',
        location: 'San Francisco, CA',
        website: 'https://alexchen.dev',
        github: 'alexchen',
        linkedin: 'alexchen',
        badges: ['Top Contributor', 'React Expert', 'Open Source']
      },
      {
        id: 'user_2',
        name: 'Sarah Miller',
        email: 'sarah@example.com',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        role: 'professional',
        bio: 'UI/UX Designer focused on creating beautiful and functional interfaces',
        location: 'New York, NY',
        website: 'https://sarahmiller.design',
        github: 'sarahmiller',
        linkedin: 'sarahmiller',
        badges: ['Design Expert', 'Top Contributor']
      },
      {
        id: 'user_3',
        name: 'Dr. Michael Roberts',
        email: 'michael@example.com',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
        role: 'professional',
        bio: 'AI Researcher and Machine Learning Engineer',
        location: 'Boston, MA',
        website: 'https://michaelroberts.ai',
        github: 'michaelroberts',
        linkedin: 'michaelroberts',
        badges: ['AI Expert', 'Research Pioneer', 'Top Contributor']
      },
      {
        id: 'user_4',
        name: 'Emily Johnson',
        email: 'emily@example.com',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
        role: 'professional',
        bio: 'Senior Developer with expertise in cloud architecture',
        location: 'Austin, TX',
        website: 'https://emilyjohnson.dev',
        github: 'emilyjohnson',
        linkedin: 'emilyjohnson',
        badges: ['Cloud Expert', 'Senior Developer']
      },
      {
        id: 'user_5',
        name: 'James Wilson',
        email: 'james@example.com',
        image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
        role: 'professional',
        bio: 'Junior Developer eager to learn and contribute',
        location: 'Seattle, WA',
        website: 'https://jameswilson.dev',
        github: 'jameswilson',
        linkedin: 'jameswilson',
        badges: ['Rising Star']
      }
    ]).returning();

    console.log(`👥 Created ${createdUsers.length} users`);

    // Create communities
    const createdCommunities = await db.insert(communities).values([
      {
        id: 'comm_1',
        name: 'Web Development',
        slug: 'web-dev',
        description: 'Everything web development - React, Vue, Angular, and more!',
        icon: '💻',
        isPrivate: false,
        memberCount: 15420,
        creatorId: 'user_1'
      },
      {
        id: 'comm_2',
        name: 'AI & Machine Learning',
        slug: 'ai-ml',
        description: 'Discuss the latest in AI, ML, deep learning, and data science.',
        icon: '🤖',
        isPrivate: false,
        memberCount: 12850,
        creatorId: 'user_3'
      },
      {
        id: 'comm_3',
        name: 'Design Systems',
        slug: 'design-systems',
        description: 'Building and maintaining scalable design systems.',
        icon: '🎨',
        isPrivate: false,
        memberCount: 8760,
        creatorId: 'user_2'
      },
      {
        id: 'comm_4',
        name: 'Startup Founders',
        slug: 'startup-founders',
        description: 'Private community for startup founders and entrepreneurs.',
        icon: '🚀',
        isPrivate: true,
        memberCount: 3420,
        creatorId: 'user_4'
      },
      {
        id: 'comm_5',
        name: 'DevOps & Cloud',
        slug: 'devops-cloud',
        description: 'Infrastructure, deployment, and cloud architecture discussions.',
        icon: '☁️',
        isPrivate: false,
        memberCount: 9830,
        creatorId: 'user_4'
      },
      {
        id: 'comm_6',
        name: 'Job Board',
        slug: 'jobs',
        description: 'Career opportunities and freelance projects.',
        icon: '💼',
        isPrivate: false,
        memberCount: 23450,
        creatorId: 'user_1'
      }
    ]).returning();

    console.log(`🏘️ Created ${createdCommunities.length} communities`);

    // Add community members
    const memberRelations = [];
    for (const user of createdUsers) {
      for (const community of createdCommunities) {
        if (!community.isPrivate || Math.random() > 0.5) {
          memberRelations.push({
            id: `member_${user.id}_${community.id}`,
            userId: user.id,
            communityId: community.id,
            role: Math.random() > 0.8 ? 'admin' : Math.random() > 0.6 ? 'moderator' : 'member'
          });
        }
      }
    }

    await db.insert(communityMembers).values(memberRelations);
    console.log(`👋 Created ${memberRelations.length} community memberships`);

    // Create posts
    const createdPosts = await db.insert(posts).values([
      {
        id: 'post_1',
        type: 'REPO',
        title: 'Building a Real-time Chat App with Next.js and WebSocket',
        content: 'Just shipped my latest project - a real-time chat application built with Next.js 15, WebSocket, and PostgreSQL. Features include instant messaging, typing indicators, and online status tracking. The code is open source and available on GitHub!',
        codeUrl: 'const socket = new WebSocket("ws://localhost:3001");\nsocket.onmessage = (event) => {\n  const message = JSON.parse(event.data);\n  setMessages(prev => [...prev, message]);\n};',
        codeLanguage: 'JavaScript',
        authorId: 'user_1',
        communityId: 'comm_1',
        upvotes: 234,
        downvotes: 12,
        viewCount: 1542,
        tags: ['Next.js', 'WebSocket', 'PostgreSQL', 'TypeScript'],
        isPinned: true
      },
      {
        id: 'post_2',
        type: 'GALLERY',
        title: 'Redesigned Dashboard UI with Glassmorphism Effects',
        content: 'Completed a complete redesign of our analytics dashboard using modern glassmorphism techniques. The new design features dynamic mesh gradients, improved data visualization, and a much more intuitive user experience.',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop',
        authorId: 'user_2',
        communityId: 'comm_3',
        upvotes: 189,
        downvotes: 8,
        viewCount: 892,
        tags: ['UI Design', 'Glassmorphism', 'Dashboard', 'Figma']
      },
      {
        id: 'post_3',
        type: 'ARTICLE',
        title: 'The Future of AI in Software Development: Opportunities and Challenges',
        content: 'An in-depth analysis of how artificial intelligence is transforming the software development landscape. From code generation to automated testing, AI is reshaping how we build and maintain software. This article explores current tools, future possibilities, and the ethical considerations we need to address.',
        authorId: 'user_3',
        communityId: 'comm_2',
        upvotes: 412,
        downvotes: 23,
        viewCount: 2341,
        tags: ['AI', 'Machine Learning', 'Software Development', 'Ethics']
      },
      {
        id: 'post_4',
        type: 'PULSE',
        title: 'Just got promoted to Senior Developer! 🎉',
        content: 'After 3 years of hard work and continuous learning, I finally got promoted to Senior Developer at my company. Huge thanks to this amazing community for all the support, code reviews, and knowledge sharing. Remember, consistency beats intensity every time!',
        authorId: 'user_4',
        communityId: 'comm_1',
        upvotes: 156,
        downvotes: 3,
        viewCount: 567,
        tags: ['Career', 'Promotion', 'Milestone']
      },
      {
        id: 'post_5',
        type: 'JOB',
        title: 'Hiring: Senior Frontend Developer at TechCorp',
        content: 'We are looking for an experienced Frontend Developer to join our growing team. You will work on cutting-edge web applications using React, TypeScript, and modern CSS frameworks. Remote position with competitive salary and great benefits.',
        linkUrl: 'https://techcorp.com/careers/senior-frontend-developer',
        authorId: 'user_1',
        communityId: 'comm_6',
        upvotes: 78,
        downvotes: 2,
        viewCount: 423,
        tags: ['Hiring', 'Frontend', 'React', 'TypeScript', 'Remote']
      },
      {
        id: 'post_6',
        type: 'QUESTION',
        title: 'Best practices for handling authentication in Next.js 15?',
        content: 'I am building a new application with Next.js 15 and I am confused about the best approach for authentication. Should I use NextAuth.js, Auth0, or build a custom solution? What are the pros and cons of each approach?',
        authorId: 'user_5',
        communityId: 'comm_1',
        upvotes: 45,
        downvotes: 1,
        viewCount: 234,
        tags: ['Authentication', 'Next.js', 'Security', 'Best Practices']
      }
    ]).returning();

    console.log(`📝 Created ${createdPosts.length} posts`);

    // Create comments
    const comments = [];
    for (const post of createdPosts) {
      const commentCount = Math.floor(Math.random() * 10) + 5;
      for (let i = 0; i < commentCount; i++) {
        const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        comments.push({
          id: `comment_${post.id}_${i}`,
          content: [
            'Great post! This really helped me understand the concept better.',
            'Thanks for sharing this. I\'ve been looking for exactly this solution.',
            'Excellent work! The attention to detail is impressive.',
            'This is exactly what I needed for my current project.',
            'Well explained! The examples make it very clear.',
            'Interesting perspective. I hadn\'t thought about it this way.',
            'Thanks for the detailed explanation. This saved me hours of work.',
            'Perfect timing! I was just dealing with this issue.',
            'This is a game-changer. Thank you for sharing your knowledge.',
            'I\'ve implemented this and it works perfectly. Great job!'
          ][Math.floor(Math.random() * 10)],
          postId: post.id,
          authorId: randomUser.id,
          upvotes: Math.floor(Math.random() * 20),
          downvotes: Math.floor(Math.random() * 3)
        });
      }
    }

    await db.insert(comments).values(comments);
    console.log(`💬 Created ${comments.length} comments`);

    // Create opportunities
    await db.insert(opportunities).values([
      {
        id: 'opp_1',
        title: 'Senior Frontend Developer',
        description: 'We are looking for an experienced Frontend Developer to join our growing team. You will work on cutting-edge web applications using React, TypeScript, and modern CSS frameworks.',
        company: 'TechCorp',
        location: 'San Francisco, CA / Remote',
        type: 'full-time',
        salaryMin: 120000,
        salaryMax: 180000,
        equity: '0.1-0.5%',
        remote: true,
        tags: ['React', 'TypeScript', 'Next.js', 'Tailwind'],
        authorId: 'user_1',
        isActive: true
      },
      {
        id: 'opp_2',
        title: 'Full Stack Engineer',
        description: 'Join our engineering team to build scalable web applications. You will work on both frontend and backend components.',
        company: 'StartupXYZ',
        location: 'New York, NY',
        type: 'full-time',
        salaryMin: 100000,
        salaryMax: 150000,
        equity: '0.5-1.5%',
        remote: false,
        tags: ['Node.js', 'React', 'PostgreSQL', 'AWS'],
        authorId: 'user_2',
        isActive: true
      },
      {
        id: 'opp_3',
        title: 'UI/UX Designer',
        description: 'Looking for a talented designer to create beautiful and intuitive user interfaces.',
        company: 'DesignHub',
        location: 'Remote',
        type: 'contract',
        salaryMin: 80,
        salaryMax: 120,
        equity: null,
        remote: true,
        tags: ['Figma', 'Adobe XD', 'Prototyping', 'Design Systems'],
        authorId: 'user_2',
        isActive: true
      },
      {
        id: 'opp_4',
        title: 'DevOps Engineer',
        description: 'Help us build and maintain our cloud infrastructure. Experience with Kubernetes and Docker required.',
        company: 'CloudScale',
        location: 'London, UK / Remote',
        type: 'full-time',
        salaryMin: 110000,
        salaryMax: 160000,
        equity: '0.2-0.8%',
        remote: true,
        tags: ['Kubernetes', 'Docker', 'AWS', 'CI/CD'],
        authorId: 'user_4',
        isActive: true
      },
      {
        id: 'opp_5',
        title: 'Machine Learning Engineer',
        description: 'Join our AI research team to build cutting-edge machine learning models.',
        company: 'AILabs',
        location: 'Boston, MA',
        type: 'full-time',
        salaryMin: 140000,
        salaryMax: 200000,
        equity: '0.3-1.0%',
        remote: false,
        tags: ['Python', 'TensorFlow', 'PyTorch', 'NLP'],
        authorId: 'user_3',
        isActive: true
      }
    ]);

    console.log(`💼 Created 5 opportunities`);

    console.log('✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${createdUsers.length}`);
    console.log(`   Communities: ${createdCommunities.length}`);
    console.log(`   Posts: ${createdPosts.length}`);
    console.log(`   Comments: ${comments.length}`);
    console.log(`   Opportunities: 5`);
    console.log(`   Community Memberships: ${memberRelations.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed()
  .then(() => {
    console.log('\n🎉 Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
