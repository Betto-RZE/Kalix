import { z } from 'zod';

// ==========================================
// KALIX ENUMS (Alineados con la Especificación v1.0)
// ==========================================

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum RoleName {
  ADMIN = 'ADMIN',
  RESIDENT = 'RESIDENT',
  OWNER = 'OWNER',
  SECURITY = 'SECURITY',
  MAINTENANCE = 'MAINTENANCE',
}

export enum CommunityStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum PropertyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

export enum PropertyMemberType {
  OWNER = 'OWNER',
  RESIDENT = 'RESIDENT',
}

export enum VehicleType {
  CAR = 'CAR',
  MOTORCYCLE = 'MOTORCYCLE',
  TRUCK = 'TRUCK',
  OTHER = 'OTHER',
}

export enum VehicleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum FeeStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  CARD = 'CARD',
  OTHER = 'OTHER',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum MaintenancePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum MaintenanceStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CANCELLED = 'CANCELLED',
}

export enum CommonAreaStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum VisitorPassStatus {
  ACTIVE = 'ACTIVE',
  USED = 'USED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export enum AccessType {
  ENTRY = 'ENTRY',
  EXIT = 'EXIT',
}

export enum AccessStatus {
  AUTHORIZED = 'AUTHORIZED',
  DENIED = 'DENIED',
}

export enum AnnouncementType {
  GENERAL = 'GENERAL',
  MAINTENANCE = 'MAINTENANCE',
  SECURITY = 'SECURITY',
  PAYMENT = 'PAYMENT',
  EVENT = 'EVENT',
  URGENT = 'URGENT',
}

export enum AnnouncementStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum NotificationType {
  FEE_CREATED = 'FEE_CREATED',
  PAYMENT_REGISTERED = 'PAYMENT_REGISTERED',
  FEE_OVERDUE = 'FEE_OVERDUE',
  MAINTENANCE_UPDATED = 'MAINTENANCE_UPDATED',
  RESERVATION_CONFIRMED = 'RESERVATION_CONFIRMED',
  RESERVATION_UPCOMING = 'RESERVATION_UPCOMING',
  VISITOR_REGISTERED = 'VISITOR_REGISTERED',
  ANNOUNCEMENT_PUBLISHED = 'ANNOUNCEMENT_PUBLISHED',
  GENERAL = 'GENERAL',
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  ASSIGN = 'ASSIGN',
  PAY = 'PAY',
  CANCEL = 'CANCEL',
  PUBLISH = 'PUBLISH',
  ACCESS = 'ACCESS',
  LOGIN = 'LOGIN',
}

// ==========================================
// SCHEMAS DE VALIDACIÓN ZOD BASE (Ejemplos)
// ==========================================

export const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginDto = z.infer<typeof loginSchema>;

// ==========================================
// SCHEMAS DE VALIDACIÓN ESTRUCTURA RESIDENCIAL (Sprint 3)
// ==========================================

export const createSectionSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre de la sección es obligatorio')
    .max(100, 'El nombre no puede exceder los 100 caracteres'),
  description: z.string().optional(),
});
export const updateSectionSchema = createSectionSchema.partial();
export type CreateSectionDtoType = z.infer<typeof createSectionSchema>;
export type UpdateSectionDtoType = z.infer<typeof updateSectionSchema>;

export const createPropertySchema = z.object({
  sectionId: z.string().uuid('ID de sección inválido'),
  number: z
    .string()
    .min(1, 'El número o identificador del inmueble es obligatorio')
    .max(50, 'El número no puede exceder 50 caracteres'),
  address: z.string().optional(),
  status: z.nativeEnum(PropertyStatus).optional().default(PropertyStatus.ACTIVE),
});
export const updatePropertySchema = createPropertySchema.partial();
export type CreatePropertyDtoType = z.infer<typeof createPropertySchema>;
export type UpdatePropertyDtoType = z.infer<typeof updatePropertySchema>;

export const assignPropertyMemberSchema = z.object({
  userId: z.string().uuid('ID de usuario inválido'),
  type: z.nativeEnum(PropertyMemberType),
  isPrimary: z.boolean().optional().default(false),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
export type AssignPropertyMemberDtoType = z.infer<typeof assignPropertyMemberSchema>;

// ==========================================
// SCHEMAS DE VALIDACIÓN VEHÍCULOS (Sprint 3)
// ==========================================

export const createVehicleSchema = z.object({
  propertyId: z.string().uuid('ID de propiedad inválido'),
  userId: z.string().uuid('ID de usuario inválido'),
  brand: z.string().min(1, 'La marca es obligatoria').max(50),
  model: z.string().min(1, 'El modelo es obligatorio').max(50),
  color: z.string().min(1, 'El color es obligatorio').max(30),
  licensePlate: z.string().min(1, 'La placa es obligatoria').max(20),
  type: z.nativeEnum(VehicleType).optional().default(VehicleType.CAR),
  status: z.nativeEnum(VehicleStatus).optional().default(VehicleStatus.ACTIVE),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export type CreateVehicleDtoType = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleDtoType = z.infer<typeof updateVehicleSchema>;

// ==========================================
// SCHEMAS DE VALIDACIÓN CUOTAS & FINANZAS (Sprint 4)
// ==========================================

export const createFeeSchema = z.object({
  propertyId: z.string().uuid('ID de propiedad inválido'),
  concept: z.string().min(1, 'El concepto de la cuota es obligatorio').max(200),
  amount: z.number().positive('El monto debe ser un número positivo'),
  dueDate: z.string().min(1, 'La fecha límite de pago es obligatoria'),
  status: z.nativeEnum(FeeStatus).optional().default(FeeStatus.PENDING),
});

export const createBulkFeeSchema = z.object({
  sectionId: z.string().uuid('ID de sección inválido').optional(),
  concept: z.string().min(1, 'El concepto es obligatorio').max(200),
  amount: z.number().positive('El monto debe ser positivo'),
  dueDate: z.string().min(1, 'La fecha límite de pago es obligatoria'),
});

export const updateFeeSchema = createFeeSchema.partial();

export type CreateFeeDtoType = z.infer<typeof createFeeSchema>;
export type CreateBulkFeeDtoType = z.infer<typeof createBulkFeeSchema>;
export type UpdateFeeDtoType = z.infer<typeof updateFeeSchema>;

// ==========================================
// SCHEMAS DE VALIDACIÓN PAGOS (Sprint 4)
// ==========================================

export const createPaymentSchema = z.object({
  feeId: z.string().uuid('ID de cuota inválido'),
  amount: z.number().positive('El monto debe ser un número positivo'),
  paymentDate: z.string().optional(),
  method: z.nativeEnum(PaymentMethod).optional().default(PaymentMethod.TRANSFER),
  reference: z.string().optional(),
  status: z.nativeEnum(PaymentStatus).optional().default(PaymentStatus.COMPLETED),
  receiptUrl: z.string().optional(),
});

export const updatePaymentStatusSchema = z.object({
  status: z.nativeEnum(PaymentStatus),
});

export type CreatePaymentDtoType = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentStatusDtoType = z.infer<typeof updatePaymentStatusSchema>;


