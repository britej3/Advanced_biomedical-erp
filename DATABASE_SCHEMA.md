# Biomedical ERP Database Schema

Complete documentation of all database tables, columns, relationships, and constraints for the Biomedical Department ERP System.

## Table of Contents

1. [users](#users)
2. [equipment](#equipment)
3. [maintenance](#maintenance)
4. [inventory](#inventory)
5. [workOrders](#workorders)
6. [Relationships](#relationships)
7. [Indexes](#indexes)
8. [Constraints](#constraints)

---

## users

Stores user profiles and authentication information. Integrated with Manus OAuth.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| `openId` | VARCHAR(64) | NOT NULL, UNIQUE | Manus OAuth identifier |
| `name` | TEXT | NULLABLE | User's full name |
| `email` | VARCHAR(320) | NULLABLE | User's email address |
| `loginMethod` | VARCHAR(64) | NULLABLE | Authentication method used |
| `role` | ENUM('user', 'admin') | NOT NULL, DEFAULT 'user' | User role for access control |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Account creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL, DEFAULT NOW(), ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |
| `lastSignedIn` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last login timestamp |

**Indexes**:
- PRIMARY KEY: `id`
- UNIQUE: `openId`

**Notes**:
- `openId` is the unique identifier from Manus OAuth
- `role` determines access level (admin has full access, user has limited access)
- Timestamps are automatically managed by the database

---

## equipment

Stores biomedical device registry with specifications and status information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique equipment identifier |
| `name` | VARCHAR(255) | NOT NULL | Device name/model name |
| `model` | VARCHAR(255) | NOT NULL | Manufacturer model number |
| `serialNumber` | VARCHAR(255) | NOT NULL, UNIQUE | Serial number (unique per device) |
| `location` | VARCHAR(255) | NOT NULL | Physical location in hospital |
| `status` | ENUM('operational', 'maintenance', 'out_of_service', 'retired') | NOT NULL, DEFAULT 'operational' | Current device status |
| `manufacturer` | VARCHAR(255) | NULLABLE | Device manufacturer name |
| `purchaseDate` | TIMESTAMP | NULLABLE | Date equipment was purchased |
| `warrantyExpiry` | TIMESTAMP | NULLABLE | Warranty expiration date |
| `notes` | TEXT | NULLABLE | Additional notes about equipment |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL, DEFAULT NOW(), ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

**Indexes**:
- PRIMARY KEY: `id`
- UNIQUE: `serialNumber`

**Status Values**:
- `operational` - Device is functioning normally
- `maintenance` - Device is currently undergoing maintenance
- `out_of_service` - Device is not available for use
- `retired` - Device is no longer in use

**Notes**:
- Serial number must be unique to prevent duplicates
- Status changes are tracked via `updatedAt`
- Location helps identify device physical placement

---

## maintenance

Tracks maintenance records including preventive, corrective, and inspection activities.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique maintenance record ID |
| `equipmentId` | INT | NOT NULL, FOREIGN KEY → equipment.id | Reference to equipment being maintained |
| `type` | ENUM('preventive', 'corrective', 'inspection') | NOT NULL | Type of maintenance |
| `description` | TEXT | NOT NULL | Detailed description of work |
| `scheduledDate` | TIMESTAMP | NOT NULL | Scheduled maintenance date/time |
| `completedDate` | TIMESTAMP | NULLABLE | Actual completion date/time |
| `status` | ENUM('scheduled', 'in_progress', 'completed', 'cancelled') | NOT NULL, DEFAULT 'scheduled' | Current status |
| `technicianId` | INT | NULLABLE, FOREIGN KEY → users.id | Assigned technician |
| `cost` | INT | NULLABLE | Maintenance cost in cents |
| `notes` | TEXT | NULLABLE | Additional maintenance notes |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL, DEFAULT NOW(), ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

**Indexes**:
- PRIMARY KEY: `id`
- FOREIGN KEY: `equipmentId` → equipment.id
- FOREIGN KEY: `technicianId` → users.id

**Maintenance Types**:
- `preventive` - Scheduled maintenance to prevent failures
- `corrective` - Maintenance to fix a problem
- `inspection` - Routine inspection and testing

**Status Values**:
- `scheduled` - Maintenance is scheduled but not started
- `in_progress` - Maintenance is currently being performed
- `completed` - Maintenance has been finished
- `cancelled` - Maintenance was cancelled

**Notes**:
- `cost` is stored in cents (multiply by 100 for database storage)
- `technicianId` can be NULL if not yet assigned
- `completedDate` is NULL until maintenance is completed

---

## inventory

Manages spare parts and consumables inventory with stock tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique inventory item ID |
| `name` | VARCHAR(255) | NOT NULL | Item name/description |
| `partNumber` | VARCHAR(255) | NOT NULL, UNIQUE | Manufacturer part number |
| `quantity` | INT | NOT NULL, DEFAULT 0 | Current stock quantity |
| `threshold` | INT | NOT NULL, DEFAULT 5 | Low-stock alert threshold |
| `unit` | VARCHAR(50) | NOT NULL, DEFAULT 'piece' | Unit of measurement |
| `category` | VARCHAR(255) | NULLABLE | Item category/type |
| `supplier` | VARCHAR(255) | NULLABLE | Supplier name |
| `unitCost` | INT | NULLABLE | Cost per unit in cents |
| `lastRestockDate` | TIMESTAMP | NULLABLE | Last restocking date |
| `notes` | TEXT | NULLABLE | Additional notes |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL, DEFAULT NOW(), ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

**Indexes**:
- PRIMARY KEY: `id`
- UNIQUE: `partNumber`

**Unit Examples**:
- `piece` - Individual items
- `box` - Boxes of items
- `roll` - Rolls of material
- `bottle` - Bottles of liquid
- `pack` - Packs of items

**Low-Stock Alert Logic**:
- Alert triggered when `quantity <= threshold`
- Alerts displayed on dashboard and inventory page
- Helps prevent stockouts of critical items

**Notes**:
- `unitCost` is stored in cents
- `quantity` should never be negative
- Part number must be unique to prevent duplicates

---

## workOrders

Manages work orders and task assignments for staff.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique work order ID |
| `title` | VARCHAR(255) | NOT NULL | Work order title/summary |
| `description` | TEXT | NULLABLE | Detailed description of work |
| `assignedTo` | INT | NULLABLE, FOREIGN KEY → users.id | Assigned staff member |
| `status` | ENUM('open', 'in_progress', 'completed', 'on_hold', 'cancelled') | NOT NULL, DEFAULT 'open' | Current status |
| `priority` | ENUM('low', 'medium', 'high', 'urgent') | NOT NULL, DEFAULT 'medium' | Priority level |
| `dueDate` | TIMESTAMP | NULLABLE | Due date for completion |
| `completedDate` | TIMESTAMP | NULLABLE | Actual completion date |
| `equipmentId` | INT | NULLABLE, FOREIGN KEY → equipment.id | Related equipment |
| `createdBy` | INT | NOT NULL, FOREIGN KEY → users.id | User who created order |
| `createdAt` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL, DEFAULT NOW(), ON UPDATE CURRENT_TIMESTAMP | Last update timestamp |

**Indexes**:
- PRIMARY KEY: `id`
- FOREIGN KEY: `assignedTo` → users.id
- FOREIGN KEY: `equipmentId` → equipment.id
- FOREIGN KEY: `createdBy` → users.id

**Status Values**:
- `open` - Work order is created but not started
- `in_progress` - Work is currently being performed
- `completed` - Work has been finished
- `on_hold` - Work is paused temporarily
- `cancelled` - Work order was cancelled

**Priority Levels**:
- `low` - Can be done when convenient
- `medium` - Should be done soon
- `high` - Should be prioritized
- `urgent` - Must be done immediately

**Notes**:
- `assignedTo` can be NULL if not yet assigned
- `equipmentId` can be NULL if not related to specific equipment
- `createdBy` is required and tracks who created the order
- `completedDate` is NULL until work is completed

---

## Relationships

### Foreign Key Relationships

```
maintenance.equipmentId → equipment.id
  - Each maintenance record belongs to one equipment
  - Equipment can have many maintenance records

maintenance.technicianId → users.id
  - Each maintenance record can be assigned to one technician
  - Technician can have many maintenance records

workOrders.assignedTo → users.id
  - Each work order can be assigned to one staff member
  - Staff member can have many work orders

workOrders.equipmentId → equipment.id
  - Each work order can relate to one equipment
  - Equipment can have many work orders

workOrders.createdBy → users.id
  - Each work order is created by one user
  - User can create many work orders
```

### Cascading Behavior

- **ON DELETE**: NO ACTION (prevent deletion of referenced records)
- **ON UPDATE**: NO ACTION (prevent update of referenced records)

This ensures referential integrity and prevents orphaned records.

---

## Indexes

### Performance Indexes

Recommended indexes for optimal query performance:

```sql
-- Equipment indexes
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_location ON equipment(location);

-- Maintenance indexes
CREATE INDEX idx_maintenance_equipmentId ON maintenance(equipmentId);
CREATE INDEX idx_maintenance_status ON maintenance(status);
CREATE INDEX idx_maintenance_scheduledDate ON maintenance(scheduledDate);
CREATE INDEX idx_maintenance_technicianId ON maintenance(technicianId);

-- Inventory indexes
CREATE INDEX idx_inventory_category ON inventory(category);
CREATE INDEX idx_inventory_quantity_threshold ON inventory(quantity, threshold);

-- Work Orders indexes
CREATE INDEX idx_workOrders_status ON workOrders(status);
CREATE INDEX idx_workOrders_priority ON workOrders(priority);
CREATE INDEX idx_workOrders_assignedTo ON workOrders(assignedTo);
CREATE INDEX idx_workOrders_equipmentId ON workOrders(equipmentId);
CREATE INDEX idx_workOrders_dueDate ON workOrders(dueDate);
```

---

## Constraints

### Data Integrity Constraints

1. **Unique Constraints**
   - `equipment.serialNumber` - No duplicate serial numbers
   - `inventory.partNumber` - No duplicate part numbers
   - `users.openId` - No duplicate OAuth IDs

2. **Not Null Constraints**
   - All primary keys must have values
   - Equipment name, model, serial number, location required
   - Maintenance type, description, scheduled date required
   - Inventory name, part number, quantity, threshold required
   - Work order title and creator required

3. **Enum Constraints**
   - Equipment status limited to defined values
   - Maintenance type limited to defined values
   - Maintenance status limited to defined values
   - Work order status limited to defined values
   - Work order priority limited to defined values
   - User role limited to defined values

4. **Foreign Key Constraints**
   - Maintenance must reference existing equipment
   - Maintenance technician must reference existing user
   - Work order assignee must reference existing user
   - Work order creator must reference existing user
   - Work order equipment must reference existing equipment

---

## Migration Notes

### Initial Setup

The database schema is managed using Drizzle ORM with automatic migrations:

```bash
# Generate migration from schema changes
pnpm drizzle-kit generate

# Apply migrations to database
pnpm drizzle-kit migrate
```

### Adding New Columns

1. Update `drizzle/schema.ts`
2. Run `pnpm drizzle-kit generate`
3. Review generated SQL in `drizzle/migrations/`
4. Apply with `pnpm drizzle-kit migrate`

### Modifying Existing Columns

- Drizzle ORM generates appropriate ALTER TABLE statements
- Review migrations carefully before applying
- Test on development database first

### Backup Recommendations

- Daily automated backups
- Weekly full database backups
- Test backup restoration regularly
- Keep backups in secure location

---

## Performance Optimization

### Query Optimization Tips

1. **Use indexes** on frequently filtered columns
2. **Limit result sets** with pagination
3. **Use appropriate data types** (INT vs VARCHAR)
4. **Avoid N+1 queries** by joining related tables
5. **Cache frequently accessed data** (dashboard stats)

### Database Maintenance

- Regular VACUUM/OPTIMIZE operations
- Monitor slow query logs
- Update table statistics
- Archive old records periodically
- Monitor disk space usage

---

## Security Considerations

1. **Access Control**
   - All queries go through tRPC procedures
   - Role-based access control enforced
   - Admin operations protected

2. **Data Protection**
   - Use SSL/TLS for database connections
   - Encrypt sensitive data in transit
   - Regular security audits

3. **Backup Security**
   - Encrypt backups at rest
   - Restrict backup access
   - Test backup integrity

---

**Last Updated**: April 2026  
**Schema Version**: 1.0.0  
**Database**: MySQL 8.0+
