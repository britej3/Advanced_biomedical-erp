# Biomedical Department ERP System

A comprehensive, enterprise-grade ERP system designed specifically for hospital biomedical departments. This system streamlines equipment management, maintenance scheduling, inventory tracking, and work order management with an elegant, intuitive interface.

## Overview

The Biomedical Department ERP System is a full-stack web application built with modern technologies to help biomedical teams efficiently manage critical hospital equipment, schedule preventive and corrective maintenance, track spare parts inventory, and coordinate work orders across the department.

### Key Features

**Equipment Management**
- Register and maintain comprehensive biomedical device records
- Track device specifications including model, serial number, location, and manufacturer
- Monitor equipment status (operational, maintenance, out of service, retired)
- Maintain purchase date and warranty expiration information

**Maintenance Scheduling**
- Schedule preventive and corrective maintenance tasks
- Track maintenance history and completion status
- Assign maintenance tasks to technicians
- Record maintenance costs and notes
- Monitor upcoming maintenance deadlines

**Inventory & Spare Parts Management**
- Track spare parts and consumables inventory
- Set low-stock thresholds with automatic alerts
- Monitor stock levels in real-time
- Record supplier information and unit costs
- Categorize items for better organization

**Staff & Work Orders**
- Create and assign work orders to team members
- Set priority levels (low, medium, high, urgent)
- Track work order status (open, in-progress, completed, on-hold, cancelled)
- Link work orders to specific equipment
- Monitor due dates and completion timelines

**Dashboard & Analytics**
- Real-time summary cards with key metrics
- Visual charts showing activity trends
- Equipment status distribution pie chart
- Monthly overview bar charts
- Low-stock alerts and notifications

**Role-Based Access Control**
- Admin role: Full system access and configuration
- Technician role: Limited access to assigned tasks
- Secure authentication with Manus OAuth
- Protected API endpoints with permission checks

**QR Code Equipment Tracking**
- Automatic QR code generation for each equipment
- Download and print QR codes for physical labeling
- Mobile-friendly QR code scanner
- Real-time camera scanning with automatic equipment lookup
- Works on iOS and Android devices

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19, TypeScript, Tailwind CSS 4 | Modern, responsive UI |
| **Backend** | Express.js, tRPC 11, TypeScript | Type-safe API layer |
| **Database** | MySQL/TiDB with Drizzle ORM | Reliable data persistence |
| **Authentication** | Manus OAuth | Secure user authentication |
| **Charts & Visualization** | Recharts | Interactive data visualization |
| **Icons** | Lucide React | Consistent icon library |
| **UI Components** | shadcn/ui, Radix UI | Accessible component library |
| **Styling** | Tailwind CSS 4 | Utility-first CSS framework |
| **Build Tools** | Vite, esbuild | Fast development and production builds |
| **Testing** | Vitest | Unit and integration testing |
| **QR Codes** | qrcode.react, html5-qrcode | QR code generation and scanning |

## Project Structure

```
biomedical-erp/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx          # Dashboard with charts and stats
│   │   │   ├── Equipment.tsx          # Equipment CRUD operations
│   │   │   ├── Maintenance.tsx        # Maintenance scheduling
│   │   │   ├── Inventory.tsx          # Inventory management
│   │   │   ├── WorkOrders.tsx         # Work order management
│   │   │   └── QRScanner.tsx          # QR code scanner for mobile
│   │   ├── components/
│   │   │   ├── DashboardLayout.tsx    # Main layout wrapper
│   │   │   ├── Sidebar.tsx            # Navigation sidebar
│   │   │   ├── QRCodeDisplay.tsx      # QR code display component
│   │   │   └── ui/                    # shadcn/ui components
│   │   ├── lib/
│   │   │   └── trpc.ts                # tRPC client configuration
│   │   ├── App.tsx                    # Main app routing
│   │   └── index.css                  # Global styles
│   └── public/
├── server/
│   ├── routers.ts                     # tRPC procedure definitions
│   ├── db.ts                          # Database query helpers
│   └── _core/                         # Framework infrastructure
├── drizzle/
│   ├── schema.ts                      # Database schema definitions
│   └── migrations/                    # SQL migration files
├── shared/                            # Shared types and constants
├── package.json                       # Dependencies and scripts
└── README.md                          # This file

```

## Database Schema

### Tables Overview

**users** - User profiles and authentication
- Stores user information and role assignments
- Integrates with Manus OAuth for authentication

**equipment** - Biomedical device registry
- Tracks all biomedical equipment with specifications
- Maintains status and location information
- Records warranty and purchase details

**maintenance** - Maintenance records
- Logs preventive, corrective, and inspection maintenance
- Links to equipment and assigned technicians
- Tracks scheduling and completion status

**inventory** - Spare parts and supplies
- Manages stock levels and thresholds
- Tracks suppliers and unit costs
- Supports low-stock alerting

**workOrders** - Task management and assignments
- Creates and assigns work tasks
- Tracks priority and status
- Links to equipment and assigned staff

## Getting Started

### Prerequisites

- Node.js 22.13.0 or higher
- pnpm 10.4.1 or higher
- MySQL database (or compatible TiDB)
- Manus account for OAuth integration

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd biomedical-erp
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Edit `.env.local` and fill in your configuration values (see .env.local.example for details)

4. **Set up the database**
   ```bash
   pnpm drizzle-kit generate
   pnpm drizzle-kit migrate
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

   The application will be available at `http://localhost:3000`

## Development Workflow

### Adding New Features

1. **Update the database schema** in `drizzle/schema.ts`
2. **Generate migrations** with `pnpm drizzle-kit generate`
3. **Add database queries** in `server/db.ts`
4. **Create tRPC procedures** in `server/routers.ts`
5. **Build UI components** in `client/src/pages/` or `client/src/components/`
6. **Write tests** in `server/*.test.ts`
7. **Test locally** with `pnpm dev`

### Running Tests

```bash
pnpm test
```

### Building for Production

```bash
pnpm build
pnpm start
```

## API Documentation

### tRPC Procedures

All API procedures are defined in `server/routers.ts` and follow the tRPC pattern. Key routers include:

**Equipment Router**
- `equipment.list` - Get all equipment
- `equipment.getById` - Get equipment by ID
- `equipment.create` - Create new equipment (admin only)
- `equipment.update` - Update equipment (admin only)
- `equipment.delete` - Delete equipment (admin only)

**Maintenance Router**
- `maintenance.list` - Get all maintenance records
- `maintenance.getById` - Get maintenance by ID
- `maintenance.create` - Create maintenance record
- `maintenance.update` - Update maintenance record
- `maintenance.delete` - Delete maintenance record (admin only)

**Inventory Router**
- `inventory.list` - Get all inventory items
- `inventory.getById` - Get inventory by ID
- `inventory.lowStock` - Get low-stock items
- `inventory.create` - Create inventory item (admin only)
- `inventory.update` - Update inventory item (admin only)
- `inventory.delete` - Delete inventory item (admin only)

**Work Orders Router**
- `workOrders.list` - Get all work orders
- `workOrders.getById` - Get work order by ID
- `workOrders.create` - Create work order
- `workOrders.update` - Update work order
- `workOrders.delete` - Delete work order (admin only)

**Dashboard Router**
- `dashboard.stats` - Get dashboard statistics

## Authentication & Authorization

The system uses Manus OAuth for secure authentication. Role-based access control is implemented through:

- **Admin Role**: Full system access, can create/edit/delete all records
- **Technician Role**: Can view and update assigned tasks, limited access to other modules

Protected procedures use `protectedProcedure` which requires authentication. Admin-only operations check `ctx.user.role === 'admin'`.

## Deployment

### Vercel Deployment

1. **Push code to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import the repository
   - Configure environment variables
   - Deploy

3. **Environment Variables on Vercel**
   Set all variables from `.env.local` in Vercel project settings

4. **Database Connection**
   - Ensure your MySQL database is accessible from Vercel
   - Update `DATABASE_URL` with production database connection string

### Alternative Hosting

The application can be deployed to any Node.js hosting platform:
- Railway
- Render
- DigitalOcean
- AWS EC2
- Self-hosted servers

## Performance Considerations

- **Database Indexing**: Add indexes on frequently queried columns (equipmentId, status, etc.)
- **Pagination**: Implement pagination for large datasets
- **Caching**: Consider caching dashboard statistics
- **Query Optimization**: Use Drizzle ORM query builders for efficient queries

## Security Best Practices

- All API endpoints require authentication
- Admin operations are protected with role checks
- Database credentials stored in environment variables
- HTTPS enforced in production
- CORS configured appropriately
- Input validation on all forms
- SQL injection prevention through Drizzle ORM

## Troubleshooting

### Database Connection Issues

```bash
# Test database connection
pnpm drizzle-kit migrate
```

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

### Port Already in Use

```bash
# Change port in development
PORT=3001 pnpm dev
```

## Contributing

1. Create a feature branch
2. Make changes and test locally
3. Write or update tests
4. Submit pull request
5. Code review and merge

## License

MIT License - See LICENSE file for details

## Support

For issues, feature requests, or questions:
- Create an issue in the repository
- Contact the development team
- Check documentation and FAQs

## QR Code Equipment Tracking

The system includes advanced QR code generation and scanning capabilities for efficient equipment tracking.

### Features

**QR Code Generation:**
- Automatic QR code creation for each equipment item
- Encodes equipment ID, serial number, and name
- Download QR codes as PNG images
- Print QR codes for physical equipment labeling
- Display in modal dialogs from equipment list

**QR Code Scanner:**
- Mobile-friendly scanner page accessible from sidebar
- Real-time camera access for scanning
- Automatic equipment information display
- Works on iOS and Android devices
- Responsive design for all screen sizes

### Usage

**Viewing Equipment QR Codes:**
1. Navigate to Equipment Management
2. Click the blue QR code icon next to any equipment
3. Modal displays the QR code with equipment details
4. Download or print the QR code for labeling

**Scanning Equipment:**
1. Go to QR Scanner from the sidebar
2. Click "Start Scanner"
3. Allow camera access on your device
4. Point camera at equipment QR code
5. Equipment information displays automatically

### Technical Details

**Libraries:**
- `qrcode.react` - QR code generation (SVG format)
- `html5-qrcode` - QR code scanning with camera access

**Data Format:**
QR codes encode JSON with equipment information:
```json
{
  "equipmentId": 1,
  "serialNumber": "SN-12345",
  "name": "Ultrasound Machine",
  "timestamp": "2026-04-01T10:00:00Z"
}
```

## Future Enhancements

- Mobile app for field technicians
- Real-time notifications and alerts
- Advanced reporting and analytics
- Integration with hospital management systems
- Predictive maintenance using ML
- Equipment lifecycle management
- Budget tracking and cost analysis
- Multi-location support
- API for third-party integrations
- QR code batch generation and printing
- Equipment location tracking with QR codes

---

**Version**: 1.0.0  
**Last Updated**: April 2026  
**Maintained By**: Biomedical ERP Team
