import React from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Wrench, ClipboardList, Stethoscope } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  operational: "#10b981",
  maintenance: "#f59e0b",
  out_of_service: "#ef4444",
  retired: "#6b7280",
};

export default function Dashboard() {
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();
  const { data: statusData } = trpc.dashboard.equipmentStatus.useQuery();
  const { data: monthlyData } = trpc.dashboard.monthlyActivity.useQuery();

  const StatCard = ({ icon: Icon, label, value, color, description }: { icon: React.ElementType; label: string; value?: number; color: string; description?: string }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{label}</CardTitle>
        <Icon className={`w-5 h-5 ${color}`} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value || 0}</div>
            {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Welcome to the Biomedical ERP System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Stethoscope}
          label="Total Equipment"
          value={stats?.totalEquipment}
          color="text-blue-600"
          description="All registered devices"
        />
        <StatCard
          icon={Wrench}
          label="Maintenance Records"
          value={stats?.totalMaintenance}
          color="text-green-600"
          description="Total maintenance entries"
        />
        <StatCard
          icon={ClipboardList}
          label="Work Orders"
          value={stats?.totalWorkOrders}
          color="text-purple-600"
          description="All work orders"
        />
        <StatCard
          icon={AlertCircle}
          label="Low Stock Items"
          value={stats?.lowStockItems}
          color="text-red-600"
          description="Items below threshold"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Activity Trend</CardTitle>
            <CardDescription>Last 6 months overview</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyData && monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="equipment" stroke="#3b82f6" name="Equipment" />
                  <Line type="monotone" dataKey="maintenance" stroke="#10b981" name="Maintenance" />
                  <Line type="monotone" dataKey="workorders" stroke="#f59e0b" name="Work Orders" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500">
                No activity data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Equipment Status</CardTitle>
            <CardDescription>Current status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            {statusData && statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.status] || `#${(index * 1234567).toString(16).padStart(6, '0')}`}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500">
                No equipment data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
            <CardDescription>Equipment, maintenance, and work orders comparison</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyData && monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="equipment" fill="#3b82f6" name="Equipment" />
                  <Bar dataKey="maintenance" fill="#10b981" name="Maintenance" />
                  <Bar dataKey="workorders" fill="#f59e0b" name="Work Orders" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-slate-500">
                No activity data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
