import fs from "fs";
import path from "path";
import {
  InsertUser,
  User,
  InsertEquipment,
  Equipment,
  InsertMaintenance,
  Maintenance,
  InsertInventory,
  Inventory,
  InsertWorkOrder,
  WorkOrder,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

const DB_PATH = path.join(process.cwd(), "server", "db.json");

interface DbSchema {
  users: User[];
  equipment: Equipment[];
  maintenance: Maintenance[];
  inventory: Inventory[];
  workOrders: WorkOrder[];
}

function readDb(): DbSchema {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const initialDb: DbSchema = {
        users: [],
        equipment: [],
        maintenance: [],
        inventory: [],
        workOrders: [],
      };
      fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2));
      return initialDb;
    }
    const data = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading database:", error);
    return {
      users: [],
      equipment: [],
      maintenance: [],
      inventory: [],
      workOrders: [],
    };
  }
}

function writeDb(db: DbSchema) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
  } catch (error) {
    console.error("Error writing database:", error);
  }
}

export async function getDb() {
  return null; // Drizzle not used in mock
}

export async function upsertUser(user: InsertUser): Promise<void> {
  const db = readDb();
  const existingUserIndex = db.users.findIndex(u => u.openId === user.openId);

  const now = new Date();
  if (existingUserIndex >= 0) {
    db.users[existingUserIndex] = {
      ...db.users[existingUserIndex],
      ...user,
      updatedAt: now,
      lastSignedIn: user.lastSignedIn || now,
    } as User;
  } else {
    const newUser: User = {
      id: db.users.length + 1,
      openId: user.openId!,
      name: user.name ?? null,
      email: user.email ?? null,
      loginMethod: user.loginMethod ?? null,
      role: user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user"),
      createdAt: now,
      updatedAt: now,
      lastSignedIn: now,
    };
    db.users.push(newUser);
  }
  writeDb(db);
}

export async function getUserByOpenId(openId: string) {
  const db = readDb();
  return db.users.find(u => u.openId === openId);
}

export async function getUserList() {
  const db = readDb();
  return db.users.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
}

// Equipment queries
export async function createEquipment(data: InsertEquipment) {
  const db = readDb();
  const now = new Date();
  const newEquipment: Equipment = {
    id: db.equipment.length + 1,
    ...data,
    status: data.status ?? "operational",
    createdAt: now,
    updatedAt: now,
  } as Equipment;
  db.equipment.push(newEquipment);
  writeDb(db);
  return [newEquipment];
}

export async function getEquipmentList() {
  const db = readDb();
  return db.equipment.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getEquipmentById(id: number) {
  const db = readDb();
  return db.equipment.find(e => e.id === id);
}

export async function updateEquipment(
  id: number,
  data: Partial<InsertEquipment>
) {
  const db = readDb();
  const index = db.equipment.findIndex(e => e.id === id);
  if (index >= 0) {
    db.equipment[index] = {
      ...db.equipment[index],
      ...data,
      updatedAt: new Date(),
    } as Equipment;
    writeDb(db);
  }
  return [1];
}

export async function deleteEquipment(id: number) {
  const db = readDb();
  db.equipment = db.equipment.filter(e => e.id !== id);
  writeDb(db);
  return [1];
}

// Maintenance queries
export async function createMaintenance(data: InsertMaintenance) {
  const db = readDb();
  const now = new Date();
  const newMaintenance: Maintenance = {
    id: db.maintenance.length + 1,
    ...data,
    status: data.status ?? "scheduled",
    createdAt: now,
    updatedAt: now,
  } as Maintenance;
  db.maintenance.push(newMaintenance);
  writeDb(db);
  return [newMaintenance];
}

export async function getMaintenanceList() {
  const db = readDb();
  return db.maintenance.sort(
    (a, b) =>
      new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
  );
}

export async function getMaintenanceById(id: number) {
  const db = readDb();
  return db.maintenance.find(m => m.id === id);
}

export async function updateMaintenance(
  id: number,
  data: Partial<InsertMaintenance>
) {
  const db = readDb();
  const index = db.maintenance.findIndex(m => m.id === id);
  if (index >= 0) {
    db.maintenance[index] = {
      ...db.maintenance[index],
      ...data,
      updatedAt: new Date(),
    } as Maintenance;
    writeDb(db);
  }
  return [1];
}

export async function deleteMaintenance(id: number) {
  const db = readDb();
  db.maintenance = db.maintenance.filter(m => m.id !== id);
  writeDb(db);
  return [1];
}

// Inventory queries
export async function createInventory(data: InsertInventory) {
  const db = readDb();
  const now = new Date();
  const newInventory: Inventory = {
    id: db.inventory.length + 1,
    ...data,
    quantity: data.quantity ?? 0,
    threshold: data.threshold ?? 5,
    unit: data.unit ?? "piece",
    createdAt: now,
    updatedAt: now,
  } as Inventory;
  db.inventory.push(newInventory);
  writeDb(db);
  return [newInventory];
}

export async function getInventoryList() {
  const db = readDb();
  return db.inventory.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getInventoryById(id: number) {
  const db = readDb();
  return db.inventory.find(i => i.id === id);
}

export async function updateInventory(
  id: number,
  data: Partial<InsertInventory>
) {
  const db = readDb();
  const index = db.inventory.findIndex(i => i.id === id);
  if (index >= 0) {
    db.inventory[index] = {
      ...db.inventory[index],
      ...data,
      updatedAt: new Date(),
    } as Inventory;
    writeDb(db);
  }
  return [1];
}

export async function deleteInventory(id: number) {
  const db = readDb();
  db.inventory = db.inventory.filter(i => i.id !== id);
  writeDb(db);
  return [1];
}

export async function getLowStockItems() {
  const db = readDb();
  return db.inventory.filter(i => i.quantity <= i.threshold);
}

// Work Orders queries
export async function createWorkOrder(data: InsertWorkOrder) {
  const db = readDb();
  const now = new Date();
  const newWorkOrder: WorkOrder = {
    id: db.workOrders.length + 1,
    ...data,
    status: data.status ?? "open",
    priority: data.priority ?? "medium",
    createdAt: now,
    updatedAt: now,
  } as WorkOrder;
  db.workOrders.push(newWorkOrder);
  writeDb(db);
  return [newWorkOrder];
}

export async function getWorkOrdersList() {
  const db = readDb();
  return db.workOrders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getWorkOrderById(id: number) {
  const db = readDb();
  return db.workOrders.find(w => w.id === id);
}

export async function updateWorkOrder(
  id: number,
  data: Partial<InsertWorkOrder>
) {
  const db = readDb();
  const index = db.workOrders.findIndex(w => w.id === id);
  if (index >= 0) {
    db.workOrders[index] = {
      ...db.workOrders[index],
      ...data,
      updatedAt: new Date(),
    } as WorkOrder;
    writeDb(db);
  }
  return [1];
}

export async function deleteWorkOrder(id: number) {
  const db = readDb();
  db.workOrders = db.workOrders.filter(w => w.id !== id);
  writeDb(db);
  return [1];
}

// Dashboard statistics
export async function getDashboardStats() {
  const db = readDb();
  return {
    totalEquipment: db.equipment.length,
    totalMaintenance: db.maintenance.length,
    totalWorkOrders: db.workOrders.length,
    lowStockItems: db.inventory.filter(i => i.quantity <= i.threshold).length,
  };
}

// Equipment status distribution
export async function getEquipmentStatusDistribution() {
  const db = readDb();
  const distribution: Record<string, number> = {};
  db.equipment.forEach(e => {
    distribution[e.status] = (distribution[e.status] || 0) + 1;
  });

  return Object.entries(distribution).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " "),
    value: count,
    status,
  }));
}

// Monthly activity for last 6 months
export async function getMonthlyActivity() {
  const db = readDb();
  const months: {
    name: string;
    equipment: number;
    maintenance: number;
    workorders: number;
  }[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const monthName = startDate.toLocaleString("default", { month: "short" });

    const equipmentCount = db.equipment.filter(e => {
      const d = new Date(e.createdAt);
      return d >= startDate && d <= endDate;
    }).length;

    const maintenanceCount = db.maintenance.filter(m => {
      const d = new Date(m.createdAt);
      return d >= startDate && d <= endDate;
    }).length;

    const workOrdersCount = db.workOrders.filter(w => {
      const d = new Date(w.createdAt);
      return d >= startDate && d <= endDate;
    }).length;

    months.push({
      name: monthName,
      equipment: equipmentCount,
      maintenance: maintenanceCount,
      workorders: workOrdersCount,
    });
  }

  return months;
}
