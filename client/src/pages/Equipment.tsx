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
import { Plus, Edit2, Trash2, AlertCircle, QrCode } from "lucide-react";
import { toast } from "sonner";
import QRCodeDisplay from "@/components/QRCodeDisplay";

export default function Equipment() {
  const {
    data: equipment,
    isLoading,
    refetch,
  } = trpc.equipment.list.useQuery();
  const createMutation = trpc.equipment.create.useMutation();
  const updateMutation = trpc.equipment.update.useMutation();
  const deleteMutation = trpc.equipment.delete.useMutation();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedQrEquipment, setSelectedQrEquipment] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    model: "",
    serialNumber: "",
    location: "",
    status: "operational",
    manufacturer: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          ...formData,
          status: formData.status as any,
        });
        toast.success("Equipment updated successfully");
      } else {
        await createMutation.mutateAsync({
          ...formData,
          status: formData.status as any,
        });
        toast.success("Equipment created successfully");
      }
      setOpen(false);
      setFormData({
        name: "",
        model: "",
        serialNumber: "",
        location: "",
        status: "operational",
        manufacturer: "",
        notes: "",
      });
      setEditingId(null);
      refetch();
    } catch (error) {
      toast.error("Failed to save equipment");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this equipment?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("Equipment deleted successfully");
        refetch();
      } catch (error) {
        toast.error("Failed to delete equipment");
      }
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      model: item.model,
      serialNumber: item.serialNumber,
      location: item.location,
      status: item.status,
      manufacturer: item.manufacturer || "",
      notes: item.notes || "",
    });
    setOpen(true);
  };

  const handleShowQR = (item: any) => {
    setSelectedQrEquipment(item);
    setQrDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-100 text-green-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Equipment Management
          </h1>
          <p className="text-slate-600 mt-1">
            Manage biomedical devices and equipment
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  name: "",
                  model: "",
                  serialNumber: "",
                  location: "",
                  status: "operational",
                  manufacturer: "",
                  notes: "",
                });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Equipment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Equipment" : "Add New Equipment"}
              </DialogTitle>
              <DialogDescription>
                Enter the equipment details below
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Equipment Name"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <Input
                placeholder="Model"
                value={formData.model}
                onChange={e =>
                  setFormData({ ...formData, model: e.target.value })
                }
                required
              />
              <Input
                placeholder="Serial Number"
                value={formData.serialNumber}
                onChange={e =>
                  setFormData({ ...formData, serialNumber: e.target.value })
                }
                required
              />
              <Input
                placeholder="Location"
                value={formData.location}
                onChange={e =>
                  setFormData({ ...formData, location: e.target.value })
                }
                required
              />
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
                  <option value="operational">Operational</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="out_of_service">Out of Service</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
              <Input
                placeholder="Manufacturer"
                value={formData.manufacturer}
                onChange={e =>
                  setFormData({ ...formData, manufacturer: e.target.value })
                }
              />
              <Input
                placeholder="Notes"
                value={formData.notes}
                onChange={e =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
              <Button type="submit" className="w-full">
                {editingId ? "Update" : "Create"} Equipment
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equipment List</CardTitle>
          <CardDescription>All registered biomedical equipment</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : equipment && equipment.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-4">Name</th>
                    <th className="text-left py-2 px-4">Model</th>
                    <th className="text-left py-2 px-4">Serial Number</th>
                    <th className="text-left py-2 px-4">Location</th>
                    <th className="text-left py-2 px-4">Status</th>
                    <th className="text-left py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {equipment.map((item: any) => (
                    <tr key={item.id} className="border-b hover:bg-slate-50">
                      <td className="py-2 px-4">{item.name}</td>
                      <td className="py-2 px-4">{item.model}</td>
                      <td className="py-2 px-4 font-mono text-xs">
                        {item.serialNumber}
                      </td>
                      <td className="py-2 px-4">{item.location}</td>
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
                          onClick={() => handleShowQR(item)}
                          title="View QR Code"
                        >
                          <QrCode className="w-4 h-4 text-blue-600" />
                        </Button>
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
                No equipment found. Add your first equipment to get started.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="max-w-md">
          {selectedQrEquipment && (
            <QRCodeDisplay
              equipmentId={selectedQrEquipment.id}
              equipmentName={selectedQrEquipment.name}
              serialNumber={selectedQrEquipment.serialNumber}
              onClose={() => setQrDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
