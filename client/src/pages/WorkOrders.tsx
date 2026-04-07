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
import { Plus, Edit2, Trash2, AlertCircle, ClipboardList } from "lucide-react";
import { toast } from "sonner";

export default function WorkOrders() {
  const {
    data: workOrders,
    isLoading,
    refetch,
  } = trpc.workOrders.list.useQuery();
  const { data: equipment } = trpc.equipment.list.useQuery();
  const { data: users } = trpc.users.list.useQuery();
  const createMutation = trpc.workOrders.create.useMutation();
  const updateMutation = trpc.workOrders.update.useMutation();
  const deleteMutation = trpc.workOrders.delete.useMutation();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "open",
    dueDate: "",
    assignedTo: "",
    equipmentId: "",
  });

  const getEquipmentName = (equipmentId: number | null) => {
    if (!equipmentId) return "N/A";
    const item = equipment?.find((e: any) => e.id === equipmentId);
    return item ? `${item.name} (${item.model})` : `Equipment #${equipmentId}`;
  };

  const getUserName = (userId: number | null) => {
    if (!userId) return "Unassigned";
    const user = users?.find((u: any) => u.id === userId);
    return user ? user.name || user.email : `User #${userId}`;
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      title: item.title || "",
      description: item.description || "",
      priority: item.priority || "medium",
      status: item.status || "open",
      dueDate: item.dueDate
        ? new Date(item.dueDate).toISOString().slice(0, 16)
        : "",
      assignedTo: item.assignedTo?.toString() || "",
      equipmentId: item.equipmentId?.toString() || "",
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority as "low" | "medium" | "high" | "urgent",
        status: formData.status as
          | "open"
          | "in_progress"
          | "completed"
          | "on_hold"
          | "cancelled",
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        assignedTo: formData.assignedTo
          ? parseInt(formData.assignedTo)
          : undefined,
        equipmentId: formData.equipmentId
          ? parseInt(formData.equipmentId)
          : undefined,
      };

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...data });
        toast.success("Work order updated");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Work order created");
      }
      setOpen(false);
      setFormData({
        title: "",
        description: "",
        priority: "medium",
        status: "open",
        dueDate: "",
        assignedTo: "",
        equipmentId: "",
      });
      setEditingId(null);
      refetch();
    } catch (error) {
      toast.error("Failed to save work order");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this work order?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("Work order deleted");
        refetch();
      } catch (error) {
        toast.error("Failed to delete work order");
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "on_hold":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Work Orders</h1>
          <p className="text-slate-600 mt-1">
            Create and manage work orders for your team
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  title: "",
                  description: "",
                  priority: "medium",
                  status: "open",
                  dueDate: "",
                  assignedTo: "",
                  equipmentId: "",
                });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Work Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Work Order" : "Create Work Order"}
              </DialogTitle>
              <DialogDescription>
                Enter work order details below
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Title
                </label>
                <Input
                  placeholder="Title"
                  value={formData.title}
                  onChange={e =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
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
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={e =>
                    setFormData({ ...formData, priority: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
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
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Due Date
                </label>
                <Input
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={e =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Assign To
                </label>
                <select
                  value={formData.assignedTo}
                  onChange={e =>
                    setFormData({ ...formData, assignedTo: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Unassigned</option>
                  {users?.map((user: any) => (
                    <option key={user.id} value={user.id}>
                      {user.name || user.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Related Equipment
                </label>
                <select
                  value={formData.equipmentId}
                  onChange={e =>
                    setFormData({ ...formData, equipmentId: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">None</option>
                  {equipment?.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.model})
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full">
                <ClipboardList className="w-4 h-4 mr-2" />
                {editingId ? "Update" : "Create"} Work Order
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Work Orders</CardTitle>
          <CardDescription>All work orders and assignments</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : workOrders && workOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-4">Title</th>
                    <th className="text-left py-2 px-4">Priority</th>
                    <th className="text-left py-2 px-4">Status</th>
                    <th className="text-left py-2 px-4">Assigned To</th>
                    <th className="text-left py-2 px-4">Equipment</th>
                    <th className="text-left py-2 px-4">Due Date</th>
                    <th className="text-left py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workOrders.map((item: any) => (
                    <tr key={item.id} className="border-b hover:bg-slate-50">
                      <td className="py-2 px-4 font-medium">{item.title}</td>
                      <td className="py-2 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(item.priority)}`}
                        >
                          {item.priority}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        {getUserName(item.assignedTo)}
                      </td>
                      <td className="py-2 px-4">
                        {getEquipmentName(item.equipmentId)}
                      </td>
                      <td className="py-2 px-4">
                        {item.dueDate
                          ? new Date(item.dueDate).toLocaleDateString()
                          : "N/A"}
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
                No work orders found. Create your first work order.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
