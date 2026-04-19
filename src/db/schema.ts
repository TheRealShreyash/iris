import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const clientsTable = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  clientId: varchar("client_id", { length: 100 }).notNull().unique(),
  clientSecret: varchar("client_secret", { length: 100 }).notNull().unique(),
  redirect_uri: text("redirect_uri").notNull(),
});

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: varchar("first_name", { length: 45 }).notNull(),
  lastName: varchar("last_name", { length: 45 }),

  email: varchar("email", { length: 322 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),

  password: varchar("password", { length: 66 }),
  salt: text("salt"),
  refreshToken: text("refresh_token").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
