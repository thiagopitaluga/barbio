export type BookingStatus =
  "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
export type PaymentMethod = "pix" | "credit" | "debit" | "cash";

export type Shop = {
  name: string;
  tagline: string;
  accent: string;
  logo: string;
  phone: string;
  address: string;
  open: string;
  close: string;
};
export type Staff = {
  id: string;
  name: string;
  title: string;
  color: string;
  commission: number;
  active: boolean;
  initials: string;
};
export type Service = {
  id: string;
  name: string;
  category: string;
  duration: number;
  price: number;
  active: boolean;
};
export type Client = {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  preferredStaffId: string;
  createdAt: string;
};
export type Booking = {
  id: string;
  clientId: string;
  staffId: string;
  serviceId: string;
  date: string;
  time: string;
  status: BookingStatus;
  notes: string;
  source: "online" | "balcao";
  charged?: number;
  productIds?: string[];
  paymentMethod?: PaymentMethod;
};
export type Expense = {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
};
export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
};
export type WaitItem = {
  id: string;
  clientId: string;
  staffId: string;
  serviceId: string;
  date: string;
  period: string;
};
export type BarbioData = {
  shop: Shop;
  staff: Staff[];
  services: Service[];
  clients: Client[];
  bookings: Booking[];
  expenses: Expense[];
  products: Product[];
  waitlist: WaitItem[];
};

export const uid = () => Math.random().toString(36).slice(2, 10);
export const money = (n: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(n);
export const localDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const offsetDate = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return localDate(d);
};
export const shortDate = (s: string) =>
  new Date(`${s}T12:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
export const longDate = (s: string) =>
  new Date(`${s}T12:00:00`).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
export const firstName = (name: string) => name.trim().split(" ")[0];
export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((x) => x[0] ?? "")
    .join("")
    .toUpperCase();
export const normalizePhone = (phone: string) => phone.replace(/\D/g, "");
export const statusLabel: Record<BookingStatus, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  completed: "Concluído",
  cancelled: "Cancelado",
  no_show: "Faltou",
};
export const paymentLabel: Record<PaymentMethod, string> = {
  pix: "Pix",
  credit: "Crédito",
  debit: "Débito",
  cash: "Dinheiro",
};

export function seedData(): BarbioData {
  const clients: Client[] = [
    [
      "c1",
      "Ricardo Almeida",
      "11987654321",
      "ricardo@email.com",
      "Prefere degradê baixo e acabamento natural.",
      "s1",
    ],
    [
      "c2",
      "Gustavo Martins",
      "11991234567",
      "gustavo@email.com",
      "Barba curta com toalha quente.",
      "s2",
    ],
    [
      "c3",
      "Felipe Costa",
      "11999887766",
      "felipe@email.com",
      "Corte social clássico.",
      "s1",
    ],
    ["c4", "André Oliveira", "11993456789", "andre@email.com", "", "s3"],
    [
      "c5",
      "Lucas Ferreira",
      "11994567890",
      "lucas@email.com",
      "Gosta de pomada matte.",
      "s2",
    ],
    ["c6", "Marcos Vinícius", "11995678901", "marcos@email.com", "", "s3"],
    [
      "c7",
      "Eduardo Ribeiro",
      "11996789012",
      "eduardo@email.com",
      "Prefere corte clássico e atendimento no fim da tarde.",
      "s1",
    ],
  ].map(([id, name, phone, email, notes, preferredStaffId]) => ({
    id,
    name,
    phone,
    email,
    notes,
    preferredStaffId,
    createdAt: offsetDate(-85),
  }));
  return {
    shop: {
      name: "Barbio Studio",
      tagline: "Seu estilo, no seu tempo.",
      accent: "#b77b52",
      logo: "",
      phone: "11999999999",
      address: "São Paulo, SP",
      open: "09:00",
      close: "20:00",
    },
    staff: [
      {
        id: "s1",
        name: "Gabriel Santos",
        title: "Master barber",
        color: "#c28a5f",
        commission: 45,
        active: true,
        initials: "GS",
      },
      {
        id: "s2",
        name: "Rafael Mendes",
        title: "Barbeiro",
        color: "#788a83",
        commission: 40,
        active: true,
        initials: "RM",
      },
      {
        id: "s3",
        name: "Pedro Lima",
        title: "Barbeiro",
        color: "#8c83a4",
        commission: 40,
        active: true,
        initials: "PL",
      },
    ],
    services: [
      {
        id: "v1",
        name: "Corte masculino",
        category: "Cabelo",
        duration: 45,
        price: 65,
        active: true,
      },
      {
        id: "v2",
        name: "Barba completa",
        category: "Barba",
        duration: 30,
        price: 45,
        active: true,
      },
      {
        id: "v3",
        name: "Corte + barba",
        category: "Combos",
        duration: 75,
        price: 99,
        active: true,
      },
      {
        id: "v4",
        name: "Acabamento",
        category: "Cabelo",
        duration: 20,
        price: 30,
        active: true,
      },
      {
        id: "v5",
        name: "Sobrancelha",
        category: "Extras",
        duration: 15,
        price: 25,
        active: true,
      },
    ],
    clients,
    bookings: [
      {
        id: "b1",
        clientId: "c1",
        staffId: "s1",
        serviceId: "v3",
        date: offsetDate(0),
        time: "09:00",
        status: "completed",
        notes: "",
        source: "online",
        charged: 99,
        paymentMethod: "pix",
      },
      {
        id: "b2",
        clientId: "c2",
        staffId: "s2",
        serviceId: "v1",
        date: offsetDate(0),
        time: "10:00",
        status: "confirmed",
        notes: "",
        source: "online",
      },
      {
        id: "b3",
        clientId: "c3",
        staffId: "s1",
        serviceId: "v1",
        date: offsetDate(0),
        time: "11:00",
        status: "confirmed",
        notes: "",
        source: "balcao",
      },
      {
        id: "b4",
        clientId: "c4",
        staffId: "s3",
        serviceId: "v2",
        date: offsetDate(0),
        time: "13:30",
        status: "pending",
        notes: "",
        source: "online",
      },
      {
        id: "b5",
        clientId: "c5",
        staffId: "s2",
        serviceId: "v3",
        date: offsetDate(0),
        time: "15:00",
        status: "confirmed",
        notes: "",
        source: "online",
      },
      {
        id: "b6",
        clientId: "c6",
        staffId: "s3",
        serviceId: "v1",
        date: offsetDate(1),
        time: "09:30",
        status: "confirmed",
        notes: "",
        source: "online",
      },
      {
        id: "b7",
        clientId: "c1",
        staffId: "s1",
        serviceId: "v1",
        date: offsetDate(-7),
        time: "10:00",
        status: "completed",
        notes: "",
        source: "online",
        charged: 65,
        paymentMethod: "credit",
      },
      {
        id: "b8",
        clientId: "c2",
        staffId: "s2",
        serviceId: "v3",
        date: offsetDate(-5),
        time: "11:00",
        status: "completed",
        notes: "",
        source: "online",
        charged: 99,
        paymentMethod: "pix",
      },
      {
        id: "b9",
        clientId: "c3",
        staffId: "s1",
        serviceId: "v2",
        date: offsetDate(-4),
        time: "14:00",
        status: "completed",
        notes: "",
        source: "balcao",
        charged: 45,
        paymentMethod: "cash",
      },
      {
        id: "b10",
        clientId: "c5",
        staffId: "s2",
        serviceId: "v1",
        date: offsetDate(-3),
        time: "16:00",
        status: "no_show",
        notes: "",
        source: "online",
      },
      {
        id: "b11",
        clientId: "c7",
        staffId: "s1",
        serviceId: "v1",
        date: offsetDate(-50),
        time: "17:00",
        status: "completed",
        notes: "",
        source: "online",
        charged: 65,
        paymentMethod: "pix",
      },
      ...Array.from({ length: 45 }, (_, i): Booking => {
        const serviceId = ["v1", "v2", "v3"][i % 3];
        const price = serviceId === "v1" ? 65 : serviceId === "v2" ? 45 : 99;
        return {
          id: `history-${i}`,
          clientId: `c${(i % 6) + 1}`,
          staffId: `s${(i % 3) + 1}`,
          serviceId,
          date: offsetDate(-(Math.floor(i / 3) + 1)),
          time: ["10:00", "12:00", "16:00"][i % 3],
          status: "completed",
          notes: "",
          source: "online",
          charged: price,
          paymentMethod: i % 2 ? "credit" : "pix",
        };
      }),
    ],
    expenses: [
      {
        id: "e1",
        description: "Produtos de higiene",
        amount: 180,
        date: offsetDate(-6),
        category: "Insumos",
      },
      {
        id: "e2",
        description: "Aluguel",
        amount: 1200,
        date: offsetDate(-10),
        category: "Estrutura",
      },
    ],
    products: [
      { id: "p1", name: "Pomada matte", price: 39, stock: 8 },
      { id: "p2", name: "Óleo de barba", price: 49, stock: 5 },
      { id: "p3", name: "Shampoo masculino", price: 35, stock: 12 },
    ],
    waitlist: [],
  };
}

export function isAvailable(
  data: BarbioData,
  staffId: string,
  serviceId: string,
  date: string,
  time: string,
  exceptId?: string,
) {
  const service = data.services.find((x) => x.id === serviceId);
  if (!service) return false;
  const start = Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
  const end = start + service.duration;
  const today = localDate();
  if (date < today) return false;
  if (date === today) {
    const now = new Date();
    if (start <= now.getHours() * 60 + now.getMinutes()) return false;
  }
  const open =
    Number(data.shop.open.slice(0, 2)) * 60 +
    Number(data.shop.open.slice(3, 5));
  const close =
    Number(data.shop.close.slice(0, 2)) * 60 +
    Number(data.shop.close.slice(3, 5));
  if (start < open || end > close) return false;
  return !data.bookings.some((b) => {
    if (
      b.id === exceptId ||
      b.staffId !== staffId ||
      b.date !== date ||
      b.status === "cancelled" ||
      b.status === "no_show"
    )
      return false;
    const other = data.services.find((x) => x.id === b.serviceId);
    const bStart = Number(b.time.slice(0, 2)) * 60 + Number(b.time.slice(3, 5));
    return start < bStart + (other?.duration ?? 30) && end > bStart;
  });
}

export function availableSlots(
  data: BarbioData,
  staffId: string,
  serviceId: string,
  date: string,
) {
  const slots: string[] = [];
  const open =
    Number(data.shop.open.slice(0, 2)) * 60 +
    Number(data.shop.open.slice(3, 5));
  const close =
    Number(data.shop.close.slice(0, 2)) * 60 +
    Number(data.shop.close.slice(3, 5));
  for (let minutes = open; minutes < close; minutes += 15) {
    const time = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
    if (isAvailable(data, staffId, serviceId, date, time)) slots.push(time);
  }
  return slots;
}
