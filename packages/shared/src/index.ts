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
// SCHEMAS DE VALIDACIÓN SECCIONES (Sprint 3)
// ==========================================

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


