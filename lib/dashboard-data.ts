import { cars, type Car } from "@/data/cars";

export type InventoryStatus = "Available" | "Reserved" | "Sold";

export interface InventoryItem extends Car {
  status: InventoryStatus;
}

const INVENTORY_STATUS_BY_ID: Record<string, InventoryStatus> = {
  "range-rover-sport-2023": "Available",
  "bmw-m5-2023": "Available",
  "porsche-panamera-2024": "Reserved",
  "tesla-roadster-2024": "Available",
  "honda-crv-2022": "Sold",
  "nissan-gtr-2023": "Available",
  "ford-expedition-2023": "Reserved",
  "mercedes-amg-gtr-2023": "Available",
  "lamborghini-aventador-2023": "Sold",
};

export const seedInventory: InventoryItem[] = cars.map((car) => ({
  ...car,
  status: INVENTORY_STATUS_BY_ID[car.id] ?? "Available",
}));

export type LeadStatus = "New" | "Contacted" | "Negotiating" | "Won";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  interestedIn: string;
  source: string;
  status: LeadStatus;
  createdAt: string;
}

export const seedLeads: Lead[] = [
  { id: "lead-1", name: "Jordan Avery", email: "jordan.avery@email.com", phone: "(415) 555-0148", interestedIn: "BMW M5 Competition", source: "Sitio web", status: "New", createdAt: "2026-09-14" },
  { id: "lead-2", name: "Priya Nair", email: "priya.nair@email.com", phone: "(650) 555-0122", interestedIn: "Porsche Panamera 4S", source: "Teléfono", status: "Contacted", createdAt: "2026-09-12" },
  { id: "lead-3", name: "Marcus Webb", email: "marcus.webb@email.com", phone: "(510) 555-0177", interestedIn: "Tesla Roadster", source: "Presencial", status: "Negotiating", createdAt: "2026-09-10" },
  { id: "lead-4", name: "Elena Castillo", email: "elena.castillo@email.com", phone: "(408) 555-0193", interestedIn: "Range Rover Sport", source: "Sitio web", status: "Won", createdAt: "2026-09-05" },
  { id: "lead-5", name: "Sam Okafor", email: "sam.okafor@email.com", phone: "(925) 555-0164", interestedIn: "Nissan GT-R", source: "Referido", status: "New", createdAt: "2026-09-15" },
  { id: "lead-6", name: "Grace Lin", email: "grace.lin@email.com", phone: "(707) 555-0159", interestedIn: "Honda CR-V", source: "Sitio web", status: "Contacted", createdAt: "2026-09-11" },
  { id: "lead-7", name: "Devon Price", email: "devon.price@email.com", phone: "(831) 555-0141", interestedIn: "Ford Expedition", source: "Teléfono", status: "New", createdAt: "2026-09-13" },
  { id: "lead-8", name: "Nina Torres", email: "nina.torres@email.com", phone: "(628) 555-0136", interestedIn: "Mercedes-AMG GT R", source: "Sitio web", status: "Negotiating", createdAt: "2026-09-09" },
];

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  receivedAt: string;
  read: boolean;
}

export const seedMessages: ContactMessage[] = [
  { id: "msg-1", name: "Alicia Roman", email: "alicia.roman@email.com", subject: "Pregunta sobre garantía extendida", message: "Hola, estoy interesada en el Porsche Panamera 4S que tienen publicado. ¿Viene con opción de garantía extendida y, de ser así, cuánto suma al precio?", receivedAt: "2026-09-15T09:20:00", read: false },
  { id: "msg-2", name: "Tom Baird", email: "tom.baird@email.com", subject: "Entrega de mi Audi 2019 como parte de pago", message: "Me gustaría entregar mi Audi A6 2019 como parte de pago por una de sus camionetas. ¿Podrían darme una estimación aproximada antes de llevarlo?", receivedAt: "2026-09-14T15:42:00", read: false },
  { id: "msg-3", name: "Keisha Brown", email: "keisha.brown@email.com", subject: "Disponibilidad para prueba de manejo", message: "¿Está disponible el Tesla Roadster para una prueba de manejo este fin de semana? El sábado por la tarde me quedaría mejor.", receivedAt: "2026-09-13T11:05:00", read: true },
  { id: "msg-4", name: "Victor Huang", email: "victor.huang@email.com", subject: "Preaprobación de financiamiento", message: "Usé su calculadora de financiamiento y quiero obtener la preaprobación antes de visitarlos. ¿Qué documentos necesito llevar?", receivedAt: "2026-09-12T08:30:00", read: false },
  { id: "msg-5", name: "Sophie Marsh", email: "sophie.marsh@email.com", subject: "Informe del historial del vehículo", message: "¿Podrían enviarme el informe del historial del Nissan GT-R Premium que tienen publicado en su sitio?", receivedAt: "2026-09-10T17:15:00", read: true },
];

export type TeamRole = "Admin" | "Manager" | "Sales";
export type TeamStatus = "Active" | "Invited";

export interface TeamUser {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: TeamStatus;
}

export const seedUsers: TeamUser[] = [
  { id: "user-1", name: "Alejandro Gonzalez", email: "alejandro@drivetime.com", role: "Admin", status: "Active" },
  { id: "user-2", name: "Maria Chen", email: "maria.chen@drivetime.com", role: "Manager", status: "Active" },
  { id: "user-3", name: "Robert Kim", email: "robert.kim@drivetime.com", role: "Sales", status: "Active" },
  { id: "user-4", name: "Jasmine Patel", email: "jasmine.patel@drivetime.com", role: "Sales", status: "Invited" },
];
