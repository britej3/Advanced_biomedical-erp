import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Equipment Management Table
 * Stores biomedical devices with their specifications and current status
 */
export const equipment = mysqlTable("equipment", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  model: varchar("model", { length: 255 }).notNull(),
  serialNumber: varchar("serialNumber", { length: 255 }).notNull().unique(),
  location: varchar("location", { length: 255 }).notNull(),
  status: mysqlEnum("status", [
    "operational",
    "maintenance",
    "out_of_service",
    "retired",
  ])
    .default("operational")
    .notNull(),
  manufacturer: varchar("manufacturer", { length: 255 }),
  purchaseDate: timestamp("purchaseDate"),
  warrantyExpiry: timestamp("warrantyExpiry"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Equipment = typeof equipment.$inferSelect;
export type InsertEquipment = typeof equipment.$inferInsert;

/**
 * Maintenance Records Table
 * Tracks preventive and corrective maintenance for equipment
 */
export const maintenance = mysqlTable("maintenance", {
  id: int("id").autoincrement().primaryKey(),
  equipmentId: int("equipmentId")
    .notNull()
    .references(() => equipment.id),
  type: mysqlEnum("type", ["preventive", "corrective", "inspection"]).notNull(),
  description: text("description").notNull(),
  scheduledDate: timestamp("scheduledDate").notNull(),
  completedDate: timestamp("completedDate"),
  status: mysqlEnum("status", [
    "scheduled",
    "in_progress",
    "completed",
    "cancelled",
  ])
    .default("scheduled")
    .notNull(),
  technicianId: int("technicianId").references(() => users.id),
  cost: int("cost"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Maintenance = typeof maintenance.$inferSelect;
export type InsertMaintenance = typeof maintenance.$inferInsert;

/**
 * Inventory/Spare Parts Table
 * Manages stock levels and low-stock alerts for spare parts
 */
export const inventory = mysqlTable("inventory", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  partNumber: varchar("partNumber", { length: 255 }).notNull().unique(),
  quantity: int("quantity").notNull().default(0),
  threshold: int("threshold").notNull().default(5),
  unit: varchar("unit", { length: 50 }).notNull().default("piece"),
  category: varchar("category", { length: 255 }),
  supplier: varchar("supplier", { length: 255 }),
  unitCost: int("unitCost"),
  lastRestockDate: timestamp("lastRestockDate"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = typeof inventory.$inferInsert;

/**
 * Work Orders Table
 * Tracks tasks and assignments for biomedical staff
 */
export const workOrders = mysqlTable("workOrders", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  assignedTo: int("assignedTo").references(() => users.id),
  status: mysqlEnum("status", [
    "open",
    "in_progress",
    "completed",
    "on_hold",
    "cancelled",
  ])
    .default("open")
    .notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"])
    .default("medium")
    .notNull(),
  dueDate: timestamp("dueDate"),
  completedDate: timestamp("completedDate"),
  equipmentId: int("equipmentId").references(() => equipment.id),
  createdBy: int("createdBy")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WorkOrder = typeof workOrders.$inferSelect;
export type InsertWorkOrder = typeof workOrders.$inferInsert;
