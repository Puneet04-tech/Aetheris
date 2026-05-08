CREATE TABLE "applications" (
	"id" text PRIMARY KEY NOT NULL,
	"opportunity_id" text NOT NULL,
	"user_id" text NOT NULL,
	"message" text,
	"portfolio" text,
	"status" text DEFAULT 'applied',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "applications_opportunity_id_user_id_unique" UNIQUE("opportunity_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "case_studies" (
	"id" text PRIMARY KEY NOT NULL,
	"author_id" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"content" text,
	"thumbnail" text,
	"images" jsonb,
	"category" text,
	"tags" jsonb,
	"metrics" jsonb,
	"view_count" integer DEFAULT 0,
	"like_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" text PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"post_id" text,
	"author_id" text,
	"parent_id" text,
	"upvotes" integer DEFAULT 0,
	"downvotes" integer DEFAULT 0,
	"depth" integer DEFAULT 0,
	"is_approved_answer" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "communities" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"icon" text,
	"banner" text,
	"is_private" boolean DEFAULT false,
	"member_count" integer DEFAULT 0,
	"creator_id" text,
	"category" text,
	"tags" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "communities_name_unique" UNIQUE("name"),
	CONSTRAINT "communities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "community_members" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"community_id" text,
	"role" text DEFAULT 'member',
	"joined_at" timestamp DEFAULT now(),
	CONSTRAINT "community_members_user_id_community_id_unique" UNIQUE("user_id","community_id")
);
--> statement-breakpoint
CREATE TABLE "endorsements" (
	"id" text PRIMARY KEY NOT NULL,
	"skill_id" text NOT NULL,
	"endorser_id" text NOT NULL,
	"endorsed_user_id" text NOT NULL,
	"message" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "endorsements_skill_id_endorser_id_unique" UNIQUE("skill_id","endorser_id")
);
--> statement-breakpoint
CREATE TABLE "expert_answers" (
	"id" text PRIMARY KEY NOT NULL,
	"comment_id" text NOT NULL,
	"expert_id" text NOT NULL,
	"expertise" jsonb,
	"helpful_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"from_user_id" text,
	"related_post_id" text,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"company" text,
	"location" text,
	"type" text NOT NULL,
	"salary_min" integer,
	"salary_max" integer,
	"currency" text DEFAULT 'USD',
	"equity" text,
	"equity_percentage" numeric(5, 2),
	"remote" boolean DEFAULT false,
	"tags" jsonb,
	"skills" jsonb,
	"author_id" text,
	"is_active" boolean DEFAULT true,
	"view_count" integer DEFAULT 0,
	"application_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"stream_id" text,
	"title" text,
	"content" text,
	"excerpt" text,
	"image_url" text,
	"code_url" text,
	"code_language" text,
	"code_snippet" text,
	"link_url" text,
	"authorId" text,
	"communityId" text,
	"upvotes" integer DEFAULT 0,
	"downvotes" integer DEFAULT 0,
	"view_count" integer DEFAULT 0,
	"comment_count" integer DEFAULT 0,
	"is_pinned" boolean DEFAULT false,
	"is_featured" boolean DEFAULT false,
	"tags" jsonb,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"author_id" text NOT NULL,
	"category" text,
	"tags" jsonb,
	"view_count" integer DEFAULT 0,
	"answer_count" integer DEFAULT 0,
	"is_answered" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "saved_posts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"post_id" text NOT NULL,
	"collection" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "saved_posts_user_id_post_id_unique" UNIQUE("user_id","post_id")
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"category" text,
	"endorsements" integer DEFAULT 0,
	"is_verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_follows" (
	"id" text PRIMARY KEY NOT NULL,
	"follower_id" text NOT NULL,
	"followee_id" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "user_follows_follower_id_followee_id_unique" UNIQUE("follower_id","followee_id")
);
--> statement-breakpoint
CREATE TABLE "user_streams" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"color" text,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"image" text,
	"cover_image" text,
	"role" text DEFAULT 'professional',
	"badges" jsonb,
	"bio" text,
	"headline" text,
	"location" text,
	"website" text,
	"github" text,
	"linkedin" text,
	"twitter" text,
	"portfolio" text,
	"reputation" integer DEFAULT 0,
	"is_verified" boolean DEFAULT false,
	"verification_level" text DEFAULT 'unverified',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"user_id" text,
	"post_id" text,
	"comment_id" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "votes_user_id_post_id_comment_id_unique" UNIQUE("user_id","post_id","comment_id")
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_studies" ADD CONSTRAINT "case_studies_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communities" ADD CONSTRAINT "communities_creator_id_users_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_members" ADD CONSTRAINT "community_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_members" ADD CONSTRAINT "community_members_community_id_communities_id_fk" FOREIGN KEY ("community_id") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "endorsements" ADD CONSTRAINT "endorsements_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "endorsements" ADD CONSTRAINT "endorsements_endorser_id_users_id_fk" FOREIGN KEY ("endorser_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "endorsements" ADD CONSTRAINT "endorsements_endorsed_user_id_users_id_fk" FOREIGN KEY ("endorsed_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expert_answers" ADD CONSTRAINT "expert_answers_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expert_answers" ADD CONSTRAINT "expert_answers_expert_id_users_id_fk" FOREIGN KEY ("expert_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_related_post_id_posts_id_fk" FOREIGN KEY ("related_post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_stream_id_user_streams_id_fk" FOREIGN KEY ("stream_id") REFERENCES "public"."user_streams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_authorId_users_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_communityId_communities_id_fk" FOREIGN KEY ("communityId") REFERENCES "public"."communities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_posts" ADD CONSTRAINT "saved_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_posts" ADD CONSTRAINT "saved_posts_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skills" ADD CONSTRAINT "skills_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_followee_id_users_id_fk" FOREIGN KEY ("followee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_streams" ADD CONSTRAINT "user_streams_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_comment_id_comments_id_fk" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id") ON DELETE no action ON UPDATE no action;