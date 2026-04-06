import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createEquipment, getEquipmentList, getEquipmentById, updateEquipment, deleteEquipment,
  createMaintenance, getMaintenanceList, getMaintenanceById, updateMaintenance, deleteMaintenance,
  createInventory, getInventoryList, getInventoryById, updateInventory, deleteInventory, getLowStockItems,
  createWorkOrder, getWorkOrdersList, getWorkOrderById, updateWorkOrder, deleteWorkOrder,
  getDashboardStats, getEquipmentStatusDistribution, getMonthlyActivity,
  getUserList,
} from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  users: router({
    list: protectedProcedure.query(() => getUserList()),
  }),

  equipment: router({
    list: protectedProcedure.query(() => getEquipmentList()),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => getEquipmentById(input.id)),
    create: protectedProcedure.input(z.object({
      name: z.string(),
      model: z.string(),
      serialNumber: z.string(),
      location: z.string(),
      status: z.enum(['operational', 'maintenance', 'out_of_service', 'retired']).optional(),
      manufacturer: z.string().optional(),
      purchaseDate: z.date().optional(),
      warrantyExpiry: z.date().optional(),
      notes: z.string().optional(),
    })).mutation(({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
      return createEquipment({ status: 'operational', ...input });
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      model: z.string().optional(),
      serialNumber: z.string().optional(),
      location: z.string().optional(),
      status: z.enum(['operational', 'maintenance', 'out_of_service', 'retired']).optional(),
      manufacturer: z.string().optional(),
      purchaseDate: z.date().optional(),
      warrantyExpiry: z.date().optional(),
      notes: z.string().optional(),
    })).mutation(({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
      const { id, ...data } = input;
      return updateEquipment(id, data);
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
      return deleteEquipment(input.id);
    }),
  }),

  maintenance: router({
    list: protectedProcedure.query(() => getMaintenanceList()),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => getMaintenanceById(input.id)),
    create: protectedProcedure.input(z.object({
      equipmentId: z.number(),
      type: z.enum(['preventive', 'corrective', 'inspection']),
      description: z.string(),
      scheduledDate: z.date(),
      technicianId: z.number().optional(),
      cost: z.number().optional(),
      notes: z.string().optional(),
    })).mutation(({ input }) => createMaintenance({ ...input, status: 'scheduled' })),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      type: z.enum(['preventive', 'corrective', 'inspection']).optional(),
      description: z.string().optional(),
      scheduledDate: z.date().optional(),
      completedDate: z.date().optional(),
      status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
      technicianId: z.number().optional(),
      cost: z.number().optional(),
      notes: z.string().optional(),
    })).mutation(({ input }) => {
      const { id, ...data } = input;
      return updateMaintenance(id, data);
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
      return deleteMaintenance(input.id);
    }),
  }),

  inventory: router({
    list: protectedProcedure.query(() => getInventoryList()),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => getInventoryById(input.id)),
    lowStock: protectedProcedure.query(() => getLowStockItems()),
    create: protectedProcedure.input(z.object({
      name: z.string(),
      partNumber: z.string(),
      quantity: z.number(),
      threshold: z.number(),
      unit: z.string(),
      category: z.string().optional(),
      supplier: z.string().optional(),
      unitCost: z.number().optional(),
      notes: z.string().optional(),
    })).mutation(({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
      return createInventory(input);
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      partNumber: z.string().optional(),
      quantity: z.number().optional(),
      threshold: z.number().optional(),
      unit: z.string().optional(),
      category: z.string().optional(),
      supplier: z.string().optional(),
      unitCost: z.number().optional(),
      lastRestockDate: z.date().optional(),
      notes: z.string().optional(),
    })).mutation(({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
      const { id, ...data } = input;
      return updateInventory(id, data);
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
      return deleteInventory(input.id);
    }),
  }),

  workOrders: router({
    list: protectedProcedure.query(() => getWorkOrdersList()),
    getById: protectedProcedure.input(z.object({ id: z.number() })).query(({ input }) => getWorkOrderById(input.id)),
    create: protectedProcedure.input(z.object({
      title: z.string(),
      description: z.string().optional(),
      assignedTo: z.number().optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      dueDate: z.date().optional(),
      equipmentId: z.number().optional(),
    })).mutation(({ input, ctx }) => {
      if (!ctx.user?.id) throw new TRPCError({ code: 'UNAUTHORIZED' });
      return createWorkOrder({ ...input, createdBy: ctx.user.id, status: 'open' });
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      assignedTo: z.number().optional(),
      status: z.enum(['open', 'in_progress', 'completed', 'on_hold', 'cancelled']).optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      dueDate: z.date().optional(),
      completedDate: z.date().optional(),
      equipmentId: z.number().optional(),
    })).mutation(({ input }) => {
      const { id, ...data } = input;
      return updateWorkOrder(id, data);
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(({ input, ctx }) => {
      if (ctx.user?.role !== 'admin') throw new TRPCError({ code: 'FORBIDDEN' });
      return deleteWorkOrder(input.id);
    }),
  }),

  dashboard: router({
    stats: protectedProcedure.query(() => getDashboardStats()),
    equipmentStatus: protectedProcedure.query(() => getEquipmentStatusDistribution()),
    monthlyActivity: protectedProcedure.query(() => getMonthlyActivity()),
  }),
});

export type AppRouter = typeof appRouter;
