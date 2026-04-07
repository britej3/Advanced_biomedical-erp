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
import { Plus, Edit2, Trash2, AlertCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function Inventory() {
  const {
    data: inventory,
    isLoading,
    refetch,
  } = trpc.inventory.list.useQuery();
  const { data: lowStock } = trpc.inventory.lowStock.useQuery();
  const createMutation = trpc.inventory.create.useMutation();
  const updateMutation = trpc.inventory.update.useMutation();
  const deleteMutation = trpc.inventory.delete.useMutation();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    partNumber: "",
    quantity: "",
    threshold: "",
    unit: "piece",
    category: "",
    supplier: "",
    notes: "",
  });

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      partNumber: item.partNumber,
      quantity: item.quantity.toString(),
      threshold: item.threshold.toString(),
      unit: item.unit || "piece",
      category: item.category || "",
      supplier: item.supplier || "",
      notes: item.notes || "",
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name,
        partNumber: formData.partNumber,
        quantity: parseInt(formData.quantity),
        threshold: parseInt(formData.threshold),
        unit: formData.unit,
        category: formData.category,
        supplier: formData.supplier,
        notes: formData.notes,
      };

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...data });
        toast.success("Inventory item updated");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Inventory item created");
      }
      setOpen(false);
      setFormData({
        name: "",
        partNumber: "",
        quantity: "",
        threshold: "",
        unit: "piece",
        category: "",
        supplier: "",
        notes: "",
      });
      setEditingId(null);
      refetch();
    } catch (error) {
      toast.error("Failed to save inventory item");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this inventory item?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        toast.success("Inventory item deleted");
        refetch();
      } catch (error) {
        toast.error("Failed to delete inventory item");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Inventory Management
          </h1>
          <p className="text-slate-600 mt-1">
            Track spare parts and stock levels
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  name: "",
                  partNumber: "",
                  quantity: "",
                  threshold: "",
                  unit: "piece",
                  category: "",
                  supplier: "",
                  notes: "",
                });
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Item" : "Add Inventory Item"}
              </DialogTitle>
              <DialogDescription>Enter item details below</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Item Name"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
              <Input
                placeholder="Part Number"
                value={formData.partNumber}
                onChange={e =>
                  setFormData({ ...formData, partNumber: e.target.value })
                }
                required
              />
              <Input
                type="number"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={e =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                required
              />
              <Input
                type="number"
                placeholder="Low Stock Threshold"
                value={formData.threshold}
                onChange={e =>
                  setFormData({ ...formData, threshold: e.target.value })
                }
                required
              />
              <Input
                placeholder="Unit"
                value={formData.unit}
                onChange={e =>
                  setFormData({ ...formData, unit: e.target.value })
                }
              />
              <Input
                placeholder="Category"
                value={formData.category}
                onChange={e =>
                  setFormData({ ...formData, category: e.target.value })
                }
              />
              <Input
                placeholder="Supplier"
                value={formData.supplier}
                onChange={e =>
                  setFormData({ ...formData, supplier: e.target.value })
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
                {editingId ? "Update" : "Add"} Item
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {lowStock && lowStock.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <CardTitle className="text-red-900">Low Stock Alert</CardTitle>
            </div>
            <CardDescription className="text-red-700">
              {lowStock.length} items are below threshold
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStock.map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="font-medium">{item.name}</span>
                  <span className="text-red-600">
                    {item.quantity}/{item.threshold}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>All spare parts and inventory</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : inventory && inventory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-2 px-4">Item Name</th>
                    <th className="text-left py-2 px-4">Part Number</th>
                    <th className="text-left py-2 px-4">Quantity</th>
                    <th className="text-left py-2 px-4">Threshold</th>
                    <th className="text-left py-2 px-4">Category</th>
                    <th className="text-left py-2 px-4">Status</th>
                    <th className="text-left py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item: any) => {
                    const isLowStock = item.quantity <= item.threshold;
                    return (
                      <tr
                        key={item.id}
                        className={`border-b hover:bg-slate-50 ${isLowStock ? "bg-red-50" : ""}`}
                      >
                        <td className="py-2 px-4">{item.name}</td>
                        <td className="py-2 px-4 font-mono text-xs">
                          {item.partNumber}
                        </td>
                        <td className="py-2 px-4">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-2 px-4">{item.threshold}</td>
                        <td className="py-2 px-4">{item.category || "N/A"}</td>
                        <td className="py-2 px-4">
                          {isLowStock ? (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                              Low Stock
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              In Stock
                            </span>
                          )}
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600">
                No inventory items found. Add your first item.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
