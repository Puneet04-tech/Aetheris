import { pgTable, text, integer, boolean, timestamp, jsonb, decimal, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Core User Schema with Multimodal Identities
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  image: text("image"),
  coverImage: text("cover_image"),
  role: text("role").default("professional"), // CEO, Lead, Specialist
  badges: jsonb("badges"), // Dynamic ribbons/achievements
  bio: text("bio"),
  headline: text("headline"), // "CEO @ Startup | Designer | Developer"
  location: text("location"),
  website: text("website"),
  github: text("github"),
  linkedin: text("linkedin"),
  twitter: text("twitter"),
  portfolio: text("portfolio"),
  reputation: integer("reputation").default(0), // Points from engagement
  isVerified: boolean("is_verified").default(false),
  verificationLevel: text("verification_level").default("unverified"), // unverified, verified, expert
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Streams (Multi-Hyphenate Profiles)
export const userStreams = pgTable("user_streams", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(), // "Dev", "Designer", "Founder"
  description: text("description"),
  icon: text("icon"), // emoji or icon URL
  color: text("color"), // hex color for visual distinction
  order: integer("order").default(0), // sorting
  createdAt: timestamp("created_at").defaultNow(),
});

// Skills & Expertise
export const skills = pgTable("skills", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  category: text("category"), // programming, design, business, etc.
  endorsements: integer("endorsements").default(0),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Endorsements / Skill Verification
export const endorsements = pgTable("endorsements", {
  id: text("id").primaryKey(),
  skillId: text("skill_id").references(() => skills.id).notNull(),
  endorserId: text("endorser_id").references(() => users.id).notNull(),
  endorsedUserId: text("endorsed_user_id").references(() => users.id).notNull(),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique().on(table.skillId, table.endorserId) // One endorsement per skill per person
]);

// User Connections / Following
export const userFollows = pgTable("user_follows", {
  id: text("id").primaryKey(),
  followerId: text("follower_id").references(() => users.id).notNull(),
  followeeId: text("followee_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique().on(table.followerId, table.followeeId)
]);

// Community / Circles (Slack/Reddit Mix)
export const communities = pgTable("communities", {
  id: text("id").primaryKey(),
  name: text("name").unique().notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description"),
  icon: text("icon"),
  banner: text("banner"),
  isPrivate: boolean("is_private").default(false),
  memberCount: integer("member_count").default(0),
  creatorId: text("creator_id").references(() => users.id),
  category: text("category"), // 'tech', 'design', 'business', etc.
  tags: jsonb("tags"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Post Schema (The Nexus Feed)
export const posts = pgTable("posts", {
  id: text("id").primaryKey(),
  type: text("type").notNull(), // 'REPO', 'GALLERY', 'ARTICLE', 'PULSE', 'JOB', 'QUESTION', 'CASE_STUDY'
  streamId: text("stream_id").references(() => userStreams.id), // Which stream this belongs to
  title: text("title"),
  content: text("content"),
  excerpt: text("excerpt"), // Short preview
  imageUrl: text("image_url"),
  codeUrl: text("code_url"),
  codeLanguage: text("code_language"),
  codeSnippet: text("code_snippet"),
  linkUrl: text("link_url"),
  authorId: text("authorId").references(() => users.id),
  communityId: text("communityId").references(() => communities.id),
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  viewCount: integer("view_count").default(0),
  commentCount: integer("comment_count").default(0),
  isPinned: boolean("is_pinned").default(false),
  isFeatured: boolean("is_featured").default(false),
  tags: jsonb("tags"),
  metadata: jsonb("metadata"), // For storing type-specific data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Comments Schema (Nested Threading)
export const comments = pgTable("comments", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  postId: text("post_id").references(() => posts.id),
  authorId: text("author_id").references(() => users.id),
  parentId: text("parent_id"),
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  depth: integer("depth").default(0), // For tracking nesting level
  isApprovedAnswer: boolean("is_approved_answer").default(false), // For Q&A
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Votes Schema
export const votes = pgTable("votes", {
  id: text("id").primaryKey(),
  type: text("type").notNull(), // 'upvote' or 'downvote'
  userId: text("user_id").references(() => users.id),
  postId: text("post_id").references(() => posts.id),
  commentId: text("comment_id").references(() => comments.id),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique().on(table.userId, table.postId, table.commentId)
]);

// Community Members
export const communityMembers = pgTable("community_members", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id),
  communityId: text("community_id").references(() => communities.id),
  role: text("role").default("member"), // 'admin', 'moderator', 'member'
  joinedAt: timestamp("joined_at").defaultNow(),
}, (table) => [
  unique().on(table.userId, table.communityId)
]);

// Opportunities/Job Board
export const opportunities = pgTable("opportunities", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  company: text("company"),
  location: text("location"),
  type: text("type").notNull(), // 'full-time', 'part-time', 'contract', 'freelance'
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  currency: text("currency").default("USD"),
  equity: text("equity"),
  equityPercentage: decimal("equity_percentage", { precision: 5, scale: 2 }),
  remote: boolean("remote").default(false),
  tags: jsonb("tags"),
  skills: jsonb("skills"),
  authorId: text("author_id").references(() => users.id),
  isActive: boolean("is_active").default(true),
  viewCount: integer("view_count").default(0),
  applicationCount: integer("application_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Opportunity Applications / Leads
export const applications = pgTable("applications", {
  id: text("id").primaryKey(),
  opportunityId: text("opportunity_id").references(() => opportunities.id).notNull(),
  userId: text("user_id").references(() => users.id).notNull(),
  message: text("message"),
  portfolio: text("portfolio"), // Link to portfolio/cv
  status: text("status").default("applied"), // 'applied', 'reviewed', 'interviewing', 'accepted', 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  unique().on(table.opportunityId, table.userId)
]);

// Case Studies / Project Showcases
export const caseStudies = pgTable("case_studies", {
  id: text("id").primaryKey(),
  authorId: text("author_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"), // Long-form article
  thumbnail: text("thumbnail"),
  images: jsonb("images"), // Array of image URLs
  category: text("category"), // design, development, product, etc.
  tags: jsonb("tags"),
  metrics: jsonb("metrics"), // results, statistics, etc.
  viewCount: integer("view_count").default(0),
  likeCount: integer("like_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Q&A / Knowledge Base
export const questions = pgTable("questions", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: text("author_id").references(() => users.id).notNull(),
  category: text("category"), // tech, design, business, etc.
  tags: jsonb("tags"),
  viewCount: integer("view_count").default(0),
  answerCount: integer("answer_count").default(0),
  isAnswered: boolean("is_answered").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Expert Verification for Q&A
export const expertAnswers = pgTable("expert_answers", {
  id: text("id").primaryKey(),
  commentId: text("comment_id").references(() => comments.id).notNull(),
  expertId: text("expert_id").references(() => users.id).notNull(),
  expertise: jsonb("expertise"), // What they're verified in
  helpfulCount: integer("helpful_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // 'like', 'comment', 'follow', 'mention', 'opportunity'
  fromUserId: text("from_user_id").references(() => users.id),
  relatedPostId: text("related_post_id").references(() => posts.id),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Saved/Bookmarked Posts
export const savedPosts = pgTable("saved_posts", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id).notNull(),
  postId: text("post_id").references(() => posts.id).notNull(),
  collection: text("collection"), // e.g., "Design Inspiration", "Dev Tools"
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique().on(table.userId, table.postId)
]);

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  posts: many(posts),
  comments: many(comments),
  votes: many(votes),
  communities: many(communities),
  communityMemberships: many(communityMembers),
  opportunities: many(opportunities),
  applications: many(applications),
  caseStudies: many(caseStudies),
  questions: many(questions),
  streams: many(userStreams),
  skills: many(skills),
  endorsementsGiven: many(endorsements, { relationName: "endorser" }),
  endorsementsReceived: many(endorsements, { relationName: "endorsed" }),
  followers: many(userFollows, { relationName: "followee" }),
  following: many(userFollows, { relationName: "follower" }),
  notifications: many(notifications),
  savedPosts: many(savedPosts),
}));

export const userStreamsRelations = relations(userStreams, ({ one, many }) => ({
  user: one(users, {
    fields: [userStreams.userId],
    references: [users.id],
  }),
  posts: many(posts),
}));

export const skillsRelations = relations(skills, ({ one, many }) => ({
  user: one(users, {
    fields: [skills.userId],
    references: [users.id],
  }),
  endorsements: many(endorsements),
}));

export const endorsementsRelations = relations(endorsements, ({ one }) => ({
  skill: one(skills, {
    fields: [endorsements.skillId],
    references: [skills.id],
  }),
  endorser: one(users, {
    fields: [endorsements.endorserId],
    references: [users.id],
    relationName: "endorser",
  }),
  endorsed: one(users, {
    fields: [endorsements.endorsedUserId],
    references: [users.id],
    relationName: "endorsed",
  }),
}));

export const userFollowsRelations = relations(userFollows, ({ one }) => ({
  follower: one(users, {
    fields: [userFollows.followerId],
    references: [users.id],
    relationName: "follower",
  }),
  followee: one(users, {
    fields: [userFollows.followeeId],
    references: [users.id],
    relationName: "followee",
  }),
}));

export const communitiesRelations = relations(communities, ({ many, one }) => ({
  posts: many(posts),
  members: many(communityMembers),
  creator: one(users, {
    fields: [communities.creatorId],
    references: [users.id],
  }),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  stream: one(userStreams, {
    fields: [posts.streamId],
    references: [userStreams.id],
  }),
  community: one(communities, {
    fields: [posts.communityId],
    references: [communities.id],
  }),
  comments: many(comments),
  votes: many(votes),
  savedBy: many(savedPosts),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "parentComment",
  }),
  replies: many(comments, { relationName: "parentComment" }),
  votes: many(votes),
  expertAnswer: one(expertAnswers),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [votes.postId],
    references: [posts.id],
  }),
  comment: one(comments, {
    fields: [votes.commentId],
    references: [comments.id],
  }),
}));

export const communityMembersRelations = relations(communityMembers, ({ one }) => ({
  user: one(users, {
    fields: [communityMembers.userId],
    references: [users.id],
  }),
  community: one(communities, {
    fields: [communityMembers.communityId],
    references: [communities.id],
  }),
}));

export const opportunitiesRelations = relations(opportunities, ({ one, many }) => ({
  author: one(users, {
    fields: [opportunities.authorId],
    references: [users.id],
  }),
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  opportunity: one(opportunities, {
    fields: [applications.opportunityId],
    references: [opportunities.id],
  }),
  user: one(users, {
    fields: [applications.userId],
    references: [users.id],
  }),
}));

export const caseStudiesRelations = relations(caseStudies, ({ one }) => ({
  author: one(users, {
    fields: [caseStudies.authorId],
    references: [users.id],
  }),
}));

export const questionsRelations = relations(questions, ({ one }) => ({
  author: one(users, {
    fields: [questions.authorId],
    references: [users.id],
  }),
}));

export const expertAnswersRelations = relations(expertAnswers, ({ one }) => ({
  comment: one(comments, {
    fields: [expertAnswers.commentId],
    references: [comments.id],
  }),
  expert: one(users, {
    fields: [expertAnswers.expertId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  fromUser: one(users, {
    fields: [notifications.fromUserId],
    references: [users.id],
  }),
  relatedPost: one(posts, {
    fields: [notifications.relatedPostId],
    references: [posts.id],
  }),
}));

export const savedPostsRelations = relations(savedPosts, ({ one }) => ({
  user: one(users, {
    fields: [savedPosts.userId],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [savedPosts.postId],
    references: [posts.id],
  }),
}));
