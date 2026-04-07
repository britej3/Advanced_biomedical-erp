import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit2, Trash2, AlertCircle, Wrench } from "lucide-react";
import { toast } from "sonner";

export default function Maintenance() {
  const {
    data: maintenance,
    isLoading,
    refetch,
  } = trpc.maintenance.list.useQuery();
  const { data: equipment } = trpc.equipment.list.useQuery();
  const createMutation = trpc.maintenance.create.useMutation();
  const updateMutation = trpc.maintenance.update.useMutation();
  const deleteMutation = trpc.maintenance.delete.useMutation();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    equipmentId: "",
    type: "preventive",
    description: "",
    scheduledDate: "",
    status: "scheduled",
    notes: "",
  });

  const getEquipmentName = (equipmentId: number) => {
    const item = equipment?.find((e: any) => e.id === equipmentId);
    return item ? `${item.name} (${item.model})` : `Equipment #${equipmentId}`;
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      equipmentId: item.equipmentId?.toString() || "",
      type: item.type || "preventive",
      description: item.description || "",
      scheduledDate: item.scheduledDate
        ? new Date(item.scheduledDate).toISOString().slice(0, 16)
        : "",
      status: item.status || "scheduled",
      notes: item.notes || "",
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        equipmentId: parseInt(formData.equipmentId),
        type: formData.type as "preventive" | "corrective" | "inspection",
        description: formData.description,
        scheduledDate: new Date(formData.scheduledDate),
        status: formData.status as
          | "scheduled"
          | "in_progress"
          | "completed"
          | "cancelled",
        notes: formData.notes,
      };

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...data });
        toast.success("Maintenance record updated");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Maintenance record created");
      }
      setOpen(false);
      setFormData({
        equipmentId: "",
        type: "preventive",
        description: "",
        scheduledDate: "",
        status: "scheduled",
        notes: "",
      });
      setEditingId(null);
      refetch();
    } catch (error) {
      toast.error("Failed to save maintenance record");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this maintenance record?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("Maintenance record deleted");
        refetch();
      } catch (error) {
        toast.error("Failed to delete maintenance record");
      }
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "preventive":
        return "bg-blue-100 text-blue-800";
      case "corrective":
        return "bg-red-100 text-red-800";
      case "inspection":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Maintenance Scheduling
          </h1>
          <p className="text-slate-600 mt-1">
            Track preventive and corrective maintenance
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  equipmentId: "",
                  type: "preventive",
                  description: "",
                  scheduledDate: "",
                  status: "scheduled",
                  notes: "",
                });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Schedule Maintenance
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Maintenance" : "Schedule Maintenance"}
              </DialogTitle>
              <DialogDescription>
                Enter maintenance details below
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Equipment
                </label>
                <select
                  value={formData.equipmentId}
                  onChange={e =>
                    setFormData({ ...formData, equipmentId: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Equipment</option>
                  {equipment?.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.model}) - {item.location}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={e =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="preventive">Preventive</option>
                  <option value="corrective">Corrective</option>
                  <option value="inspection">Inspection</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Description
                </label>
                <Input
                  placeholder="Description"
                  value={formData.description}
                  onChange={e =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Scheduled Date
                </label>
                <Input
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={e =>
                    setFormData({ ...formData, scheduledDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={e =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Notes
                </label>
                <Input
                  placeholder="Notes"
                  value={formData.notes}
                  onChange={e =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
              <Button type="submit" className="w-full">
                <Wrench className="w-4 h-4 mr-2" />
                {editingId ? "Update" : "Schedule"} Maintenance
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Records</CardTitle>
          <CardDescription>
            All maintenance schedules and history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : maintenance && maintenance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-4">Equipment</th>
                    <th className="text-left py-2 px-4">Type</th>
                    <th className="text-left py-2 px-4">Description</th>
                    <th className="text-left py-2 px-4">Scheduled Date</th>
                    <th className="text-left py-2 px-4">Status</th>
                    <th className="text-left py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenance.map((item: any) => (
                    <tr key={item.id} className="border-b hover:bg-slate-50">
                      <td className="py-2 px-4 font-medium">
                        {getEquipmentName(item.equipmentId)}
                      </td>
                      <td className="py-2 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getTypeColor(item.type)}`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className="py-2 px-4">{item.description}</td>
                      <td className="py-2 px-4">
                        {new Date(item.scheduledDate).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-2 px-4 flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600">
                No maintenance records found. Schedule your first maintenance.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
