"use client";
/* eslint-disable @next/next/no-img-element -- User-provided logo data URLs are already size-limited. */

import { useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  Download,
  ExternalLink,
  LayoutDashboard,
  Menu,
  MessageCircle,
  Package,
  Palette,
  Plus,
  Scissors,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
  X,
} from "lucide-react";
import {
  availableSlots,
  type BarbioData,
  type Booking,
  type BookingStatus,
  type Client,
  type PaymentMethod,
  firstName,
  initials,
  isAvailable,
  localDate,
  longDate,
  money,
  normalizePhone,
  offsetDate,
  paymentLabel,
  shortDate,
  statusLabel,
  uid,
} from "@/lib/barbio";
import { downloadFile, useBarbio } from "@/lib/use-barbio";

type Tab =
  | "overview"
  | "agenda"
  | "clients"
  | "cash"
  | "team"
  | "services"
  | "marketing"
  | "reports"
  | "settings";
type Modal =
  | "booking"
  | "client"
  | "checkout"
  | "expense"
  | "staff"
  | "service"
  | "product"
  | "waitlist"
  | "detail"
  | null;
const nav: {
  id: Tab;
  label: string;
  icon: typeof LayoutDashboard;
  group?: string;
}[] = [
  {
    id: "overview",
    label: "Visão geral",
    icon: LayoutDashboard,
    group: "PRINCIPAL",
  },
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "clients", label: "Clientes", icon: Users },
  { id: "cash", label: "Caixa e finanças", icon: Wallet, group: "GESTÃO" },
  { id: "team", label: "Equipe", icon: UserRound },
  { id: "services", label: "Serviços e produtos", icon: Scissors },
  {
    id: "marketing",
    label: "Relacionamento",
    icon: MessageCircle,
    group: "CRESCIMENTO",
  },
  { id: "reports", label: "Relatórios", icon: Activity },
  {
    id: "settings",
    label: "Aparência e dados",
    icon: Palette,
    group: "SISTEMA",
  },
];
const colors = [
  "#b77b52",
  "#82745c",
  "#6b8f7b",
  "#647a9b",
  "#98729b",
  "#c78374",
];
const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="field">
    <span>{label}</span>
    {children}
  </label>
);
const Avatar = ({
  name,
  color = "#b77b52",
}: {
  name: string;
  color?: string;
}) => (
  <span className="avatar" style={{ background: `${color}22`, color }}>
    {initials(name)}
  </span>
);
const Pill = ({ status }: { status: BookingStatus }) => (
  <span className={`pill ${status}`}>
    <i />
    {statusLabel[status]}
  </span>
);
const Head = ({
  eyebrow,
  title,
  text,
  action,
}: {
  eyebrow: string;
  title: string;
  text: string;
  action?: ReactNode;
}) => (
  <div className="page-head">
    <div>
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p>{text}</p>
    </div>
    {action}
  </div>
);
const CardHead = ({
  kicker,
  title,
  action,
}: {
  kicker: string;
  title: string;
  action?: ReactNode;
}) => (
  <div className="card-head">
    <div>
      <span className="eyebrow">{kicker}</span>
      <h2>{title}</h2>
    </div>
    {action}
  </div>
);
const Empty = ({ title, text }: { title: string; text: string }) => (
  <div className="empty">
    <CalendarDays size={27} />
    <strong>{title}</strong>
    <span>{text}</span>
  </div>
);
const ModalBox = ({
  title,
  subtitle,
  close,
  children,
  wide,
}: {
  title: string;
  subtitle?: string;
  close: () => void;
  children: ReactNode;
  wide?: boolean;
}) => (
  <div
    className="scrim"
    onMouseDown={(e) => {
      if (e.target === e.currentTarget) close();
    }}
  >
    <div
      className={`modal ${wide ? "wide" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="modal-head">
        <div>
          <span className="eyebrow">BARBIO STUDIO</span>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        <button className="icon-button" onClick={close} aria-label="Fechar">
          <X size={20} />
        </button>
      </div>
      {children}
    </div>
  </div>
);
const Metric = ({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  detail: string;
}) => (
  <div className="metric">
    <div className="metric-label">
      <span>{label}</span>
      <Icon size={19} />
    </div>
    <strong>{value}</strong>
    <small>{detail}</small>
  </div>
);
const phoneFormat = (v: string) => {
  const p = normalizePhone(v);
  return p.length === 11
    ? `(${p.slice(0, 2)}) ${p.slice(2, 7)}-${p.slice(7)}`
    : v;
};
const wa = (phone: string, text: string) =>
  `https://wa.me/55${normalizePhone(phone)}?text=${encodeURIComponent(text)}`;

export default function BarbioApp() {
  const { data, setData } = useBarbio();
  const [tab, setTab] = useState<Tab>("overview");
  const [modal, setModal] = useState<Modal>(null);
  const [date, setDate] = useState(localDate());
  const [staffFilter, setStaffFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [role, setRole] = useState<"owner" | "barber">("owner");
  const [menu, setMenu] = useState(false);
  const [toast, setToast] = useState("");
  const update = (fn: (data: BarbioData) => BarbioData) =>
    setData((current) => (current ? fn(current) : current));
  const say = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3500);
  };
  const go = (next: Tab) => {
    setTab(next);
    setMenu(false);
    setQuery("");
  };
  const getClient = (id: string) => data?.clients.find((x) => x.id === id);
  const getStaff = (id: string) => data?.staff.find((x) => x.id === id);
  const getService = (id: string) => data?.services.find((x) => x.id === id);
  const openBooking = (id: string) => {
    setSelectedBooking(id);
    setModal("detail");
  };
  const setStatus = (id: string, status: BookingStatus) => {
    update((d) => ({
      ...d,
      bookings: d.bookings.map((b) => (b.id === id ? { ...b, status } : b)),
    }));
    setModal(null);
    say(`Agendamento ${statusLabel[status].toLowerCase()}.`);
  };
  const month = localDate().slice(0, 7);
  const completed =
    data?.bookings.filter(
      (b) => b.status === "completed" && b.date.startsWith(month),
    ) ?? [];
  const revenue = completed.reduce((n, b) => n + (b.charged ?? 0), 0);
  const costs =
    data?.expenses
      .filter((e) => e.date.startsWith(month))
      .reduce((n, e) => n + e.amount, 0) ?? 0;
  const commissions = completed.reduce(
    (n, b) =>
      n +
      ((getService(b.serviceId)?.price ?? 0) *
        (getStaff(b.staffId)?.commission ?? 0)) /
        100,
    0,
  );
  const profit = revenue - costs - commissions;
  const today =
    data?.bookings.filter(
      (b) => b.date === localDate() && b.status !== "cancelled",
    ) ?? [];
  const day =
    data?.bookings
      .filter(
        (b) =>
          b.date === date &&
          b.status !== "cancelled" &&
          (staffFilter === "all" || b.staffId === staffFilter),
      )
      .sort((a, b) => a.time.localeCompare(b.time)) ?? [];
  const cutoff = offsetDate(-30);
  const atRisk =
    data?.clients.filter((c) => {
      const visits = data.bookings
        .filter((b) => b.clientId === c.id && b.status === "completed")
        .sort((a, b) => b.date.localeCompare(a.date));
      return visits.length > 0 && visits[0].date < cutoff;
    }) ?? [];
  const selected = data?.bookings.find((b) => b.id === selectedBooking);
  const client = data?.clients.find((c) => c.id === selectedClient);
  const checkout = (id: string, method: PaymentMethod, products: string[]) => {
    if (!data) return;
    const b = data.bookings.find((x) => x.id === id);
    if (!b) return;
    const total =
      (getService(b.serviceId)?.price ?? 0) +
      products.reduce(
        (n, p) => n + (data.products.find((x) => x.id === p)?.price ?? 0),
        0,
      );
    update((d) => ({
      ...d,
      bookings: d.bookings.map((x) =>
        x.id === id
          ? {
              ...x,
              status: "completed",
              charged: total,
              paymentMethod: method,
              productIds: products,
            }
          : x,
      ),
      products: d.products.map((x) => ({
        ...x,
        stock: Math.max(0, x.stock - products.filter((p) => p === x.id).length),
      })),
    }));
    setModal(null);
    say(`Atendimento concluído · ${money(total)}`);
  };
  const exportCsv = () => {
    if (!data) return;
    const rows = [
      [
        "Data",
        "Hora",
        "Cliente",
        "Profissional",
        "Serviço",
        "Status",
        "Valor",
        "Pagamento",
      ],
      ...data.bookings.map((b) => [
        b.date,
        b.time,
        getClient(b.clientId)?.name ?? "",
        getStaff(b.staffId)?.name ?? "",
        getService(b.serviceId)?.name ?? "",
        statusLabel[b.status],
        String(b.charged ?? ""),
        b.paymentMethod ? paymentLabel[b.paymentMethod] : "",
      ]),
    ];
    downloadFile(
      `barbio-atendimentos-${localDate()}.csv`,
      "\uFEFF" +
        rows
          .map((r) =>
            r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(";"),
          )
          .join("\r\n"),
      "text/csv;charset=utf-8",
    );
  };
  if (!data)
    return (
      <div className="loading">
        <Scissors size={28} /> Preparando o Barbio...
      </div>
    );
  return (
    <div
      className="shell"
      style={{ "--accent": data.shop.accent } as CSSProperties}
    >
      <aside className={`sidebar ${menu ? "open" : ""}`}>
        <div className="brand">
          <span className="brand-symbol">
            {data.shop.logo ? (
              <img src={data.shop.logo} alt="" />
            ) : (
              <Scissors size={22} />
            )}
          </span>
          <div>
            <strong>
              barbio<span>.</span>
            </strong>
            <small>STUDIO MANAGEMENT</small>
          </div>
          <button
            className="icon-button menu-close"
            onClick={() => setMenu(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="workspace">
          <span className="shop-avatar">
            {data.shop.logo ? (
              <img src={data.shop.logo} alt="" />
            ) : (
              initials(data.shop.name)
            )}
          </span>
          <div>
            <strong>{data.shop.name}</strong>
            <small>Ambiente de demonstração</small>
          </div>
        </div>
        <nav>
          {nav
            .filter(
              (item) =>
                role === "owner" ||
                ["overview", "agenda", "clients", "marketing"].includes(
                  item.id,
                ),
            )
            .map((item) => (
              <div key={item.id}>
                {item.group && <span className="nav-group">{item.group}</span>}
                <button
                  className={`nav-item ${tab === item.id ? "active" : ""}`}
                  onClick={() => go(item.id)}
                >
                  <item.icon size={19} strokeWidth={1.8} />
                  {item.label}
                  {item.id === "agenda" && (
                    <small>
                      {
                        data.bookings.filter(
                          (b) =>
                            b.status === "pending" || b.status === "confirmed",
                        ).length
                      }
                    </small>
                  )}
                </button>
              </div>
            ))}
        </nav>
        <div className="sidebar-footer">
          <div className="side-promo">
            <Sparkles size={19} />
            <strong>Feito para evoluir</strong>
            <span>Mais tempo para o que realmente importa.</span>
            <Link href="/reservar">
              Ver página de reservas <ArrowRight size={14} />
            </Link>
          </div>
          <button
            className="profile"
            onClick={() => setRole(role === "owner" ? "barber" : "owner")}
            title="Alternar visão da demonstração"
          >
            <Avatar
              name={role === "owner" ? "Proprietário" : data.staff[0].name}
            />
            <span>
              <strong>
                {role === "owner" ? "Visão do dono" : "Visão do barbeiro"}
              </strong>
              <small>Trocar perfil de demonstração</small>
            </span>
            <Settings2 size={16} />
          </button>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <div>
            <button
              className="icon-button mobile-menu"
              onClick={() => setMenu(true)}
            >
              <Menu size={21} />
            </button>
            <span>Barbio</span>
            <ChevronRight size={14} />
            <strong>{nav.find((x) => x.id === tab)?.label}</strong>
          </div>
          <div>
            <span className="demo-badge">
              <i /> DEMONSTRAÇÃO
            </span>
            <Link href="/reservar" target="_blank">
              Página de reservas <ExternalLink size={15} />
            </Link>
            <button
              className="icon-button"
              onClick={() => say("Nenhuma nova notificação.")}
              aria-label="Notificações"
            >
              <Bell size={18} />
            </button>
            <Avatar name="Proprietário" />
          </div>
        </header>
        <main className="content">
          {tab === "overview" && (
            <>
              <Head
                eyebrow={`VISÃO GERAL · ${new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}`}
                title={`Bom dia, ${role === "owner" ? "Thiago" : firstName(data.staff[0].name)} ✳`}
                text="O dia está pronto para acontecer. Aqui está o que importa agora."
                action={
                  <button
                    className="btn primary"
                    onClick={() => setModal("booking")}
                  >
                    <Plus size={18} /> Novo agendamento
                  </button>
                }
              />
              <div className="hero">
                <div>
                  <span className="hero-kicker">
                    ✦ SEU NEGÓCIO EM BOAS MÃOS
                  </span>
                  <h2>
                    Mais tempo para
                    <br />
                    <em>o que realmente importa.</em>
                  </h2>
                  <p>
                    Agenda, clientes e resultados no mesmo lugar — com a
                    simplicidade que a sua rotina precisa.
                  </p>
                  <button onClick={() => go("reports")}>
                    Explorar resultados <ArrowRight size={17} />
                  </button>
                </div>
                <div className="hero-art">
                  <div className="hero-ring one" />
                  <div className="hero-ring two" />
                  <span>
                    B<span>.</span>
                  </span>
                  <div className="hero-mini">
                    <small>HOJE NA AGENDA</small>
                    <strong>{String(today.length).padStart(2, "0")}</strong>
                    <small>atendimentos</small>
                  </div>
                </div>
              </div>
              <div className="metrics">
                <Metric
                  icon={Wallet}
                  label="Faturamento do mês"
                  value={money(revenue)}
                  detail="Serviços e produtos"
                />
                <Metric
                  icon={CalendarDays}
                  label="Agendamentos hoje"
                  value={String(today.length).padStart(2, "0")}
                  detail={`${today.filter((b) => b.status === "completed").length} concluídos · ${today.filter((b) => b.status === "pending").length} pendentes`}
                />
                <Metric
                  icon={Users}
                  label="Clientes cadastrados"
                  value={String(data.clients.length).padStart(2, "0")}
                  detail="Base de relacionamento"
                />
                <Metric
                  icon={TrendingUp}
                  label="Lucro estimado"
                  value={money(profit)}
                  detail="Após despesas e comissões"
                />
              </div>
              <div className="dash-grid">
                <section className="card">
                  <CardHead
                    kicker="NO RITMO DO DIA"
                    title="Próximos atendimentos"
                    action={
                      <button
                        className="text-action"
                        onClick={() => go("agenda")}
                      >
                        Ver agenda <ArrowRight size={15} />
                      </button>
                    }
                  />
                  {today
                    .filter((b) => b.status !== "completed")
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .slice(0, 5)
                    .map((b) => (
                      <button
                        className="appointment"
                        key={b.id}
                        onClick={() => openBooking(b.id)}
                      >
                        <span className="appointment-time">{b.time}</span>
                        <Avatar
                          name={getClient(b.clientId)?.name ?? "Cliente"}
                        />
                        <span className="appointment-person">
                          <strong>{getClient(b.clientId)?.name}</strong>
                          <small>
                            {getService(b.serviceId)?.name} ·{" "}
                            {getStaff(b.staffId)?.name}
                          </small>
                        </span>
                        <Pill status={b.status} />
                        <ChevronRight size={16} />
                      </button>
                    ))}
                  {today.filter((b) => b.status !== "completed").length ===
                    0 && (
                    <Empty
                      title="Agenda tranquila"
                      text="Seus próximos atendimentos aparecerão aqui."
                    />
                  )}
                </section>
                <section className="card performance">
                  <CardHead
                    kicker="SAÚDE DO NEGÓCIO"
                    title="Seu mês em números"
                  />
                  <span>Resultado estimado</span>
                  <strong>{money(profit)}</strong>
                  <small>Faturamento menos despesas e comissões</small>
                  <div className="stat-lines">
                    {[
                      ["Receita", revenue, "var(--accent)"],
                      ["Comissões", commissions, "#738579"],
                      ["Despesas", costs, "#cfbba6"],
                    ].map(([label, value, color]) => (
                      <div key={label as string}>
                        <span>{label}</span>
                        <b>{money(value as number)}</b>
                        <i>
                          <em
                            style={{
                              width: `${revenue ? Math.min(100, ((value as number) / revenue) * 100) : 0}%`,
                              background: color as string,
                            }}
                          />
                        </i>
                      </div>
                    ))}
                  </div>
                  <button className="text-action" onClick={() => go("cash")}>
                    Abrir caixa <ArrowRight size={15} />
                  </button>
                </section>
              </div>
              <div className="lower-grid">
                <section className="card">
                  <CardHead
                    kicker="EQUIPE"
                    title="Profissionais em ação"
                    action={
                      <button
                        className="text-action"
                        onClick={() => go("team")}
                      >
                        Ver equipe <ArrowRight size={15} />
                      </button>
                    }
                  />
                  {data.staff
                    .filter((s) => s.active)
                    .map((s) => (
                      <div className="team-line" key={s.id}>
                        <Avatar name={s.name} color={s.color} />
                        <span>
                          <strong>{s.name}</strong>
                          <small>{s.title}</small>
                        </span>
                        <small>
                          {today.filter((b) => b.staffId === s.id).length}{" "}
                          horários
                        </small>
                      </div>
                    ))}
                </section>
                <section className="card insight">
                  <Sparkles size={24} />
                  <span className="eyebrow">OPORTUNIDADE DO DIA</span>
                  <h3>Relacionamentos que merecem atenção.</h3>
                  <p>
                    {atRisk.length
                      ? `${atRisk.length} cliente${atRisk.length > 1 ? "s" : ""} sem voltar há mais de 30 dias. Um convite pessoal pode fazer a diferença.`
                      : "Todos os clientes recentes estão em dia. Continue oferecendo uma experiência memorável."}
                  </p>
                  <button
                    className="text-action"
                    onClick={() => go("marketing")}
                  >
                    Cuidar dos clientes <ArrowRight size={15} />
                  </button>
                </section>
              </div>
            </>
          )}
          {tab === "agenda" && (
            <>
              <Head
                eyebrow="OPERAÇÃO EM TEMPO REAL"
                title="Agenda"
                text="Todos os horários, pessoas e encaixes em um só lugar."
                action={
                  <button
                    className="btn primary"
                    onClick={() => setModal("booking")}
                  >
                    <Plus size={18} /> Novo agendamento
                  </button>
                }
              />
              <div className="card date-toolbar">
                <div>
                  <button
                    className="icon-button"
                    onClick={() => setDate(shiftDate(date, -1))}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <CalendarDays size={19} />
                  <strong>{longDate(date)}</strong>
                  <button
                    className="icon-button"
                    onClick={() => setDate(shiftDate(date, 1))}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
                <div>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                  <select
                    value={staffFilter}
                    onChange={(e) => setStaffFilter(e.target.value)}
                  >
                    <option value="all">Todos os profissionais</option>
                    {data.staff
                      .filter((s) => s.active)
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="agenda-counts">
                <span>{day.length} agendamentos</span>
                <span>
                  {day.filter((b) => b.status === "confirmed").length}{" "}
                  confirmados
                </span>
                <span>
                  {day.filter((b) => b.status === "pending").length} aguardando
                </span>
                <span>
                  {day.filter((b) => b.status === "completed").length}{" "}
                  concluídos
                </span>
              </div>
              <section className="card schedule">
                {day.length ? (
                  day.map((b) => (
                    <button
                      className="schedule-line"
                      key={b.id}
                      onClick={() => openBooking(b.id)}
                    >
                      <span className="schedule-time">
                        <strong>{b.time}</strong>
                        <small>{getService(b.serviceId)?.duration} min</small>
                      </span>
                      <i className="timeline-line" />
                      <Avatar
                        name={getClient(b.clientId)?.name ?? "Cliente"}
                        color={getStaff(b.staffId)?.color}
                      />
                      <span className="schedule-person">
                        <strong>{getClient(b.clientId)?.name}</strong>
                        <small>
                          {getService(b.serviceId)?.name} ·{" "}
                          {getStaff(b.staffId)?.name}
                        </small>
                      </span>
                      <b>{money(getService(b.serviceId)?.price ?? 0)}</b>
                      <Pill status={b.status} />
                      <ChevronRight size={17} />
                    </button>
                  ))
                ) : (
                  <Empty
                    title="Nenhum horário marcado"
                    text="Este dia está livre. Adicione um agendamento ou compartilhe sua página de reservas."
                  />
                )}
              </section>
              <div className="wait-head">
                <div>
                  <strong>Fila de espera</strong>
                  <span>
                    {data.waitlist.filter((w) => w.date === date).length}{" "}
                    clientes aguardando uma oportunidade
                  </span>
                </div>
                <button
                  className="btn light"
                  onClick={() => setModal("waitlist")}
                >
                  <Plus size={16} /> Adicionar à fila
                </button>
              </div>
              {data.waitlist
                .filter((w) => w.date === date)
                .map((w) => (
                  <div className="wait-item" key={w.id}>
                    <Avatar name={getClient(w.clientId)?.name ?? "Cliente"} />
                    <strong>{getClient(w.clientId)?.name}</strong>
                    <span>
                      {getService(w.serviceId)?.name} · {w.period}
                    </span>
                    <button
                      className="text-action"
                      onClick={() => {
                        setSelectedClient(w.clientId);
                        setModal("booking");
                      }}
                    >
                      Encontrar horário <ArrowRight size={14} />
                    </button>
                  </div>
                ))}
            </>
          )}
          {tab === "clients" && (
            <>
              <Head
                eyebrow="CONHEÇA QUEM VOLTA"
                title="Clientes"
                text="Cada visita conta uma história. Guarde os detalhes que fazem a diferença."
                action={
                  <button
                    className="btn primary"
                    onClick={() => {
                      setSelectedClient("");
                      setModal("client");
                    }}
                  >
                    <Plus size={18} /> Novo cliente
                  </button>
                }
              />
              <div className="metrics three">
                <Metric
                  icon={Users}
                  label="Clientes cadastrados"
                  value={String(data.clients.length)}
                  detail="No seu relacionamento"
                />
                <Metric
                  icon={Activity}
                  label="Ativos no mês"
                  value={String(new Set(completed.map((b) => b.clientId)).size)}
                  detail="Com atendimento concluído"
                />
                <Metric
                  icon={Sparkles}
                  label="Precisam de atenção"
                  value={String(atRisk.length)}
                  detail="Sem visita há 30+ dias"
                />
              </div>
              <section className="card table-card">
                <div className="table-top">
                  <div>
                    <h2>Base de clientes</h2>
                    <span>{data.clients.length} contatos</span>
                  </div>
                  <label className="search">
                    <Search size={17} />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Buscar por nome ou telefone"
                    />
                  </label>
                </div>
                <div className="table-head">
                  <span>CLIENTE</span>
                  <span>CONTATO</span>
                  <span>ÚLTIMA VISITA</span>
                  <span>VISITAS</span>
                  <span />
                </div>
                {data.clients
                  .filter((c) =>
                    `${c.name} ${c.phone}`
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                  )
                  .map((c) => {
                    const visits = data.bookings
                      .filter(
                        (b) => b.clientId === c.id && b.status === "completed",
                      )
                      .sort((a, b) => b.date.localeCompare(a.date));
                    return (
                      <button
                        className="table-row"
                        key={c.id}
                        onClick={() => {
                          setSelectedClient(c.id);
                          setModal("client");
                        }}
                      >
                        <span className="person-cell">
                          <Avatar name={c.name} />
                          <strong>{c.name}</strong>
                        </span>
                        <span>{phoneFormat(c.phone)}</span>
                        <span>
                          {visits[0]
                            ? shortDate(visits[0].date)
                            : "Ainda não veio"}
                        </span>
                        <span>
                          {visits.length} visita{visits.length !== 1 ? "s" : ""}
                        </span>
                        <ChevronRight size={17} />
                      </button>
                    );
                  })}
              </section>
            </>
          )}
          {tab === "cash" && (
            <>
              <Head
                eyebrow="CADA DETALHE CONTA"
                title="Caixa e finanças"
                text="Receitas, despesas e comissões com clareza para decidir melhor."
                action={
                  <button
                    className="btn primary"
                    onClick={() => setModal("expense")}
                  >
                    <Plus size={18} /> Registrar despesa
                  </button>
                }
              />
              <div className="metrics">
                <Metric
                  icon={ArrowUpRight}
                  label="Receita do mês"
                  value={money(revenue)}
                  detail="Atendimentos concluídos"
                />
                <Metric
                  icon={ArrowDownRight}
                  label="Despesas"
                  value={money(costs)}
                  detail="Custos registrados"
                />
                <Metric
                  icon={Users}
                  label="Comissões"
                  value={money(commissions)}
                  detail="Por profissional"
                />
                <Metric
                  icon={Wallet}
                  label="Resultado estimado"
                  value={money(profit)}
                  detail="Receita − custos − comissões"
                />
              </div>
              <div className="dash-grid">
                <section className="card">
                  <CardHead kicker="MOVIMENTAÇÃO" title="Vendas recentes" />
                  {completed.length ? (
                    completed
                      .slice()
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((b) => (
                        <div className="finance-line" key={b.id}>
                          <span className="finance-icon positive">
                            <Scissors size={17} />
                          </span>
                          <span>
                            <strong>{getService(b.serviceId)?.name}</strong>
                            <small>
                              {getClient(b.clientId)?.name} ·{" "}
                              {shortDate(b.date)} ·{" "}
                              {b.paymentMethod
                                ? paymentLabel[b.paymentMethod]
                                : ""}
                            </small>
                          </span>
                          <b>+ {money(b.charged ?? 0)}</b>
                        </div>
                      ))
                  ) : (
                    <Empty
                      title="Nenhuma venda ainda"
                      text="Conclua um atendimento para registrar a primeira venda."
                    />
                  )}
                </section>
                <section className="card">
                  <CardHead kicker="CUSTOS" title="Despesas do mês" />
                  {data.expenses
                    .filter((e) => e.date.startsWith(month))
                    .map((e) => (
                      <div className="finance-line" key={e.id}>
                        <span className="finance-icon negative">
                          <ArrowDownRight size={17} />
                        </span>
                        <span>
                          <strong>{e.description}</strong>
                          <small>
                            {e.category} · {shortDate(e.date)}
                          </small>
                        </span>
                        <b>- {money(e.amount)}</b>
                      </div>
                    ))}
                  <button
                    className="text-action add-line"
                    onClick={() => setModal("expense")}
                  >
                    <Plus size={15} /> Nova despesa
                  </button>
                </section>
              </div>
              <section className="card commission-card">
                <CardHead kicker="TRANSPARÊNCIA" title="Comissões da equipe" />
                <div className="commission-grid">
                  {data.staff.map((s) => {
                    const base = completed
                      .filter((b) => b.staffId === s.id)
                      .reduce(
                        (n, b) => n + (getService(b.serviceId)?.price ?? 0),
                        0,
                      );
                    return (
                      <div key={s.id}>
                        <Avatar name={s.name} color={s.color} />
                        <strong>{s.name}</strong>
                        <small>{s.commission}% sobre serviços</small>
                        <b>{money((base * s.commission) / 100)}</b>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}
          {tab === "team" && (
            <>
              <Head
                eyebrow="AS PESSOAS POR TRÁS DO ESTILO"
                title="Equipe"
                text="Autonomia para cada profissional. Clareza para a gestão."
                action={
                  <button
                    className="btn primary"
                    onClick={() => setModal("staff")}
                  >
                    <Plus size={18} /> Adicionar profissional
                  </button>
                }
              />
              <div className="staff-grid">
                {data.staff.map((s) => (
                  <div className="card staff-card" key={s.id}>
                    <div>
                      <Avatar name={s.name} color={s.color} />
                      <span className={`staff-state ${s.active ? "" : "off"}`}>
                        {s.active ? "● Ativo" : "● Inativo"}
                      </span>
                    </div>
                    <h3>{s.name}</h3>
                    <p>{s.title}</p>
                    <footer>
                      <span>
                        <small>COMISSÃO</small>
                        <strong>{s.commission}%</strong>
                      </span>
                      <span>
                        <small>ATENDIMENTOS</small>
                        <strong>
                          {
                            data.bookings.filter(
                              (b) =>
                                b.staffId === s.id && b.status === "completed",
                            ).length
                          }
                        </strong>
                      </span>
                      <button
                        className="icon-button"
                        title={s.active ? "Desativar" : "Ativar"}
                        onClick={() => {
                          update((d) => ({
                            ...d,
                            staff: d.staff.map((x) =>
                              x.id === s.id ? { ...x, active: !x.active } : x,
                            ),
                          }));
                          say(
                            `Profissional ${s.active ? "desativado" : "ativado"}.`,
                          );
                        }}
                      >
                        <Settings2 size={18} />
                      </button>
                    </footer>
                  </div>
                ))}
              </div>
              <div className="notice">
                <ShieldCheck size={18} />
                <span>
                  <strong>Visão por perfil:</strong> use o seletor no rodapé do
                  menu para testar a interface simplificada. Permissões seguras
                  precisam do banco compartilhado.
                </span>
              </div>
            </>
          )}
          {tab === "services" && (
            <>
              <Head
                eyebrow="SEU CARDÁPIO DE EXPERIÊNCIAS"
                title="Serviços e produtos"
                text="Preços, duração e itens à venda sempre organizados."
                action={
                  <button
                    className="btn primary"
                    onClick={() => setModal("service")}
                  >
                    <Plus size={18} /> Novo serviço
                  </button>
                }
              />
              <div className="two-col">
                <section className="card">
                  <CardHead kicker="SERVIÇOS" title="O que você oferece" />
                  {data.services.map((s) => (
                    <div className="catalog-line" key={s.id}>
                      <span className="catalog-icon">
                        <Scissors size={18} />
                      </span>
                      <span>
                        <strong>{s.name}</strong>
                        <small>
                          {s.category} · {s.duration} min
                        </small>
                      </span>
                      <b>{money(s.price)}</b>
                      <button
                        className={`switch ${s.active ? "on" : ""}`}
                        onClick={() =>
                          update((d) => ({
                            ...d,
                            services: d.services.map((x) =>
                              x.id === s.id ? { ...x, active: !x.active } : x,
                            ),
                          }))
                        }
                        title={s.active ? "Desativar" : "Ativar"}
                      />
                    </div>
                  ))}
                  <button
                    className="text-action add-line"
                    onClick={() => setModal("service")}
                  >
                    <Plus size={15} /> Adicionar serviço
                  </button>
                </section>
                <section className="card">
                  <CardHead
                    kicker="VITRINE"
                    title="Produtos para venda"
                    action={
                      <button
                        className="text-action"
                        onClick={() => setModal("product")}
                      >
                        <Plus size={15} /> Novo produto
                      </button>
                    }
                  />
                  {data.products.map((p) => (
                    <div className="catalog-line" key={p.id}>
                      <span className="catalog-icon">
                        <Package size={18} />
                      </span>
                      <span>
                        <strong>{p.name}</strong>
                        <small>{p.stock} em estoque</small>
                      </span>
                      <b>{money(p.price)}</b>
                    </div>
                  ))}
                  <div className="notice compact">
                    <Package size={16} />
                    <span>
                      O estoque diminui quando o produto entra no fechamento.
                    </span>
                  </div>
                </section>
              </div>
            </>
          )}
          {tab === "marketing" && (
            <>
              <Head
                eyebrow="A EXPERIÊNCIA CONTINUA"
                title="Relacionamento"
                text="Aproxime-se dos clientes com mensagens relevantes no momento certo."
              />
              <div className="relationship-hero">
                <div>
                  <span className="eyebrow">CUIDADO QUE FIDELIZA</span>
                  <h2>Seu próximo atendimento começa com uma boa conversa.</h2>
                  <p>
                    Use o histórico para personalizar o contato e facilitar um
                    novo agendamento.
                  </p>
                </div>
                <MessageCircle size={78} strokeWidth={1} />
              </div>
              <div className="two-col">
                <section className="card">
                  <CardHead
                    kicker="RECONQUISTA"
                    title="Clientes para convidar"
                  />
                  {atRisk.length ? (
                    atRisk.map((c) => (
                      <div className="relation-line" key={c.id}>
                        <Avatar name={c.name} />
                        <span>
                          <strong>{c.name}</strong>
                          <small>Há mais de 30 dias sem visita</small>
                        </span>
                        <a
                          href={wa(
                            c.phone,
                            `Olá, ${firstName(c.name)}! Sentimos sua falta na ${data.shop.name}. Que tal reservar seu próximo horário? ${location.origin}/reservar`,
                          )}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <MessageCircle size={16} /> Conversar
                        </a>
                      </div>
                    ))
                  ) : (
                    <Empty
                      title="Tudo em dia"
                      text="Quando um cliente ficar 30 dias sem visitar, ele aparecerá aqui."
                    />
                  )}
                </section>
                <section className="card">
                  <CardHead
                    kicker="MENSAGENS MANUAIS"
                    title="Próximos horários"
                  />
                  {data.bookings
                    .filter(
                      (b) =>
                        (b.status === "pending" || b.status === "confirmed") &&
                        b.date >= localDate(),
                    )
                    .sort((a, b) =>
                      `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`),
                    )
                    .slice(0, 5)
                    .map((b) => {
                      const c = getClient(b.clientId);
                      return (
                        <div className="relation-line" key={b.id}>
                          <Avatar name={c?.name ?? "Cliente"} />
                          <span>
                            <strong>{c?.name}</strong>
                            <small>
                              {shortDate(b.date)} às {b.time} ·{" "}
                              {getService(b.serviceId)?.name}
                            </small>
                          </span>
                          <a
                            href={wa(
                              c?.phone ?? "",
                              `Olá, ${firstName(c?.name ?? "")}! Seu horário na ${data.shop.name} é ${shortDate(b.date)} às ${b.time}. Podemos confirmar?`,
                            )}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <MessageCircle size={16} /> Lembrar
                          </a>
                        </div>
                      );
                    })}
                  <div className="notice compact">
                    <Bell size={16} />
                    <span>
                      Abre uma mensagem pronta no WhatsApp. O envio automático
                      exige integração oficial.
                    </span>
                  </div>
                </section>
              </div>
            </>
          )}
          {tab === "reports" && (
            <>
              <Head
                eyebrow="DECISÕES COM CLAREZA"
                title="Relatórios"
                text="O que acontece na operação se transforma em direção para crescer."
                action={
                  <button className="btn light" onClick={exportCsv}>
                    <Download size={17} /> Exportar CSV
                  </button>
                }
              />
              <div className="metrics">
                <Metric
                  icon={Wallet}
                  label="Faturamento"
                  value={money(revenue)}
                  detail="Mês atual"
                />
                <Metric
                  icon={Scissors}
                  label="Atendimentos"
                  value={String(completed.length)}
                  detail="Concluídos no mês"
                />
                <Metric
                  icon={CreditCard}
                  label="Ticket médio"
                  value={money(
                    completed.length ? revenue / completed.length : 0,
                  )}
                  detail="Por atendimento"
                />
                <Metric
                  icon={Clock3}
                  label="Faltas"
                  value={String(
                    data.bookings.filter(
                      (b) => b.status === "no_show" && b.date.startsWith(month),
                    ).length,
                  )}
                  detail="Registradas no mês"
                />
              </div>
              <div className="dash-grid">
                <section className="card">
                  <CardHead
                    kicker="VISÃO POR DIA"
                    title="Atendimentos recentes"
                  />
                  <div className="chart">
                    {Array.from({ length: 7 }, (_, i) => {
                      const d = offsetDate(i - 6);
                      const n = data.bookings.filter(
                        (b) => b.date === d && b.status === "completed",
                      ).length;
                      return (
                        <div key={d}>
                          <span
                            title={`${n} atendimentos`}
                            style={{ height: `${Math.max(10, n * 35)}%` }}
                          />
                          <small>
                            {new Date(`${d}T12:00:00`)
                              .toLocaleDateString("pt-BR", { weekday: "short" })
                              .replace(".", "")}
                          </small>
                        </div>
                      );
                    })}
                  </div>
                </section>
                <section className="card">
                  <CardHead
                    kicker="MIX DE RECEITA"
                    title="Serviços mais escolhidos"
                  />
                  {data.services
                    .slice()
                    .sort(
                      (a, b) =>
                        data.bookings.filter(
                          (x) =>
                            x.serviceId === b.id && x.status === "completed",
                        ).length -
                        data.bookings.filter(
                          (x) =>
                            x.serviceId === a.id && x.status === "completed",
                        ).length,
                    )
                    .map((s) => {
                      const n = data.bookings.filter(
                        (b) => b.serviceId === s.id && b.status === "completed",
                      ).length;
                      return (
                        <div className="report-line" key={s.id}>
                          <span>{s.name}</span>
                          <i>
                            <em
                              style={{
                                width: `${completed.length ? Math.max(5, (n / completed.length) * 100) : 0}%`,
                              }}
                            />
                          </i>
                          <b>{n}</b>
                        </div>
                      );
                    })}
                </section>
              </div>
              <div className="notice">
                <ShieldCheck size={18} />
                <span>
                  Indicadores calculados a partir dos registros da demonstração.
                  Confirme lançamentos e conciliação antes de tomar decisões
                  financeiras.
                </span>
              </div>
            </>
          )}
          {tab === "settings" && (
            <>
              <Head
                eyebrow="A SUA MARCA, DO SEU JEITO"
                title="Aparência e dados"
                text="Uma experiência com a identidade da sua barbearia."
              />
              <div className="two-col">
                <section className="card settings-card">
                  <CardHead kicker="IDENTIDADE" title="Sua barbearia" />
                  <div className="form-stack">
                    <Field label="Nome da barbearia">
                      <input
                        value={data.shop.name}
                        onChange={(e) =>
                          update((d) => ({
                            ...d,
                            shop: { ...d.shop, name: e.target.value },
                          }))
                        }
                      />
                    </Field>
                    <Field label="Frase de apresentação">
                      <input
                        value={data.shop.tagline}
                        onChange={(e) =>
                          update((d) => ({
                            ...d,
                            shop: { ...d.shop, tagline: e.target.value },
                          }))
                        }
                      />
                    </Field>
                    <Field label="WhatsApp">
                      <input
                        value={data.shop.phone}
                        onChange={(e) =>
                          update((d) => ({
                            ...d,
                            shop: { ...d.shop, phone: e.target.value },
                          }))
                        }
                      />
                    </Field>
                    <Field label="Endereço">
                      <input
                        value={data.shop.address}
                        onChange={(e) =>
                          update((d) => ({
                            ...d,
                            shop: { ...d.shop, address: e.target.value },
                          }))
                        }
                      />
                    </Field>
                    <div className="form-grid">
                      <Field label="Abertura">
                        <input
                          type="time"
                          value={data.shop.open}
                          onChange={(e) =>
                            update((d) => ({
                              ...d,
                              shop: { ...d.shop, open: e.target.value },
                            }))
                          }
                        />
                      </Field>
                      <Field label="Fechamento">
                        <input
                          type="time"
                          value={data.shop.close}
                          onChange={(e) =>
                            update((d) => ({
                              ...d,
                              shop: { ...d.shop, close: e.target.value },
                            }))
                          }
                        />
                      </Field>
                    </div>
                    <Field label="Logotipo (até 500 KB)">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 500000)
                            return say("Escolha uma imagem de até 500 KB.");
                          const reader = new FileReader();
                          reader.onload = () =>
                            update((d) => ({
                              ...d,
                              shop: { ...d.shop, logo: String(reader.result) },
                            }));
                          reader.readAsDataURL(file);
                        }}
                      />
                    </Field>
                  </div>
                </section>
                <section className="card settings-card">
                  <CardHead kicker="ESTILO" title="Cor da marca" />
                  <p>
                    A cor escolhida aparece nos detalhes e na página de
                    reservas.
                  </p>
                  <div className="colors">
                    {colors.map((c) => (
                      <button
                        key={c}
                        style={{ background: c }}
                        className={data.shop.accent === c ? "selected" : ""}
                        onClick={() =>
                          update((d) => ({
                            ...d,
                            shop: { ...d.shop, accent: c },
                          }))
                        }
                      >
                        {data.shop.accent === c && <Check size={18} />}
                      </button>
                    ))}
                    <label>
                      <input
                        type="color"
                        value={data.shop.accent}
                        onChange={(e) =>
                          update((d) => ({
                            ...d,
                            shop: { ...d.shop, accent: e.target.value },
                          }))
                        }
                      />
                      <Palette size={18} />
                    </label>
                  </div>
                  <div className="brand-preview">
                    <small>PRÉVIA DA MARCA</small>
                    <div>
                      <span>
                        {data.shop.logo ? (
                          <img src={data.shop.logo} alt="" />
                        ) : (
                          <Scissors size={27} />
                        )}
                      </span>
                      <h3>{data.shop.name}</h3>
                      <p>{data.shop.tagline}</p>
                      <b>
                        Agendar meu horário <ArrowRight size={15} />
                      </b>
                    </div>
                  </div>
                  <Link
                    href="/reservar"
                    target="_blank"
                    className="btn light full"
                  >
                    <ExternalLink size={16} /> Abrir página de reservas
                  </Link>
                </section>
              </div>
              <section className="card data-card">
                <div>
                  <Download size={23} />
                  <span>
                    <strong>Seus dados, sempre com você</strong>
                    <small>
                      Exporte uma cópia de tudo o que foi registrado neste
                      navegador.
                    </small>
                  </span>
                </div>
                <button
                  className="btn light"
                  onClick={() => {
                    downloadFile(
                      `barbio-backup-${localDate()}.json`,
                      JSON.stringify(data, null, 2),
                      "application/json",
                    );
                    say("Backup exportado.");
                  }}
                >
                  <Download size={17} /> Baixar backup
                </button>
              </section>
              <div className="notice">
                <ShieldCheck size={18} />
                <span>
                  <strong>Modo de demonstração:</strong> alterações ficam neste
                  navegador. Agendamentos entre dispositivos, acesso seguro por
                  perfil e mensagens automáticas precisam de banco compartilhado
                  e integração oficial.
                </span>
              </div>
            </>
          )}
        </main>
      </div>
      {toast && (
        <div className="toast">
          <Check size={17} />
          {toast}
        </div>
      )}
      {modal === "booking" && (
        <BookingModal
          data={data}
          initialClientId={selectedClient}
          close={() => {
            setModal(null);
            setSelectedClient("");
          }}
          save={(b) => {
            if (!isAvailable(data, b.staffId, b.serviceId, b.date, b.time))
              return say("Horário indisponível. Escolha outro.");
            update((d) => ({
              ...d,
              bookings: [b, ...d.bookings],
              waitlist: d.waitlist.filter(
                (w) => w.clientId !== b.clientId || w.date !== b.date,
              ),
            }));
            setModal(null);
            setSelectedClient("");
            say("Agendamento criado.");
          }}
        />
      )}
      {modal === "detail" && selected && (
        <ModalBox
          title="Detalhes do horário"
          subtitle={`${shortDate(selected.date)} às ${selected.time}`}
          close={() => setModal(null)}
        >
          <div className="detail-person">
            <Avatar name={getClient(selected.clientId)?.name ?? "Cliente"} />
            <span>
              <strong>{getClient(selected.clientId)?.name}</strong>
              <small>
                {phoneFormat(getClient(selected.clientId)?.phone ?? "")}
              </small>
            </span>
            <Pill status={selected.status} />
          </div>
          <div className="detail-lines">
            <div>
              <span>Serviço</span>
              <strong>{getService(selected.serviceId)?.name}</strong>
            </div>
            <div>
              <span>Profissional</span>
              <strong>{getStaff(selected.staffId)?.name}</strong>
            </div>
            <div>
              <span>Duração</span>
              <strong>{getService(selected.serviceId)?.duration} min</strong>
            </div>
            <div>
              <span>Valor do serviço</span>
              <strong>
                {money(getService(selected.serviceId)?.price ?? 0)}
              </strong>
            </div>
            {selected.status === "completed" && (
              <>
                <div>
                  <span>Valor recebido</span>
                  <strong>{money(selected.charged ?? 0)}</strong>
                </div>
                <div>
                  <span>Pagamento</span>
                  <strong>
                    {selected.paymentMethod
                      ? paymentLabel[selected.paymentMethod]
                      : "—"}
                  </strong>
                </div>
              </>
            )}
          </div>
          {["pending", "confirmed"].includes(selected.status) && (
            <div className="modal-actions stacked">
              <button
                className="btn primary"
                onClick={() => setModal("checkout")}
              >
                <CreditCard size={17} /> Concluir e receber
              </button>
              {selected.status === "pending" && (
                <button
                  className="btn light"
                  onClick={() => setStatus(selected.id, "confirmed")}
                >
                  <Check size={17} /> Confirmar presença
                </button>
              )}
              <button
                className="btn light"
                onClick={() => {
                  setSelectedClient(selected.clientId);
                  setModal("booking");
                }}
              >
                Criar novo horário
              </button>
              <button
                className="btn danger"
                onClick={() => setStatus(selected.id, "no_show")}
              >
                Marcar falta
              </button>
              <button
                className="btn danger"
                onClick={() => setStatus(selected.id, "cancelled")}
              >
                Cancelar horário
              </button>
            </div>
          )}
        </ModalBox>
      )}
      {modal === "checkout" && selected && (
        <Checkout
          data={data}
          booking={selected}
          close={() => setModal(null)}
          submit={checkout}
        />
      )}
      {modal === "client" && (
        <ClientEditor
          data={data}
          client={client}
          close={() => {
            setModal(null);
            setSelectedClient("");
          }}
          save={(c) => {
            update((d) => ({
              ...d,
              clients: d.clients.some((x) => x.id === c.id)
                ? d.clients.map((x) => (x.id === c.id ? c : x))
                : [c, ...d.clients],
            }));
            setModal(null);
            say("Cliente salvo.");
          }}
          book={(id) => {
            setSelectedClient(id);
            setModal("booking");
          }}
        />
      )}
      {modal === "expense" && (
        <SimpleEditor
          title="Registrar despesa"
          fields={[
            ["description", "Descrição", "text"],
            ["amount", "Valor (R$)", "number"],
            ["date", "Data", "date"],
            ["category", "Categoria", "text"],
          ]}
          defaults={{ date: localDate() }}
          close={() => setModal(null)}
          save={(v) => {
            update((d) => ({
              ...d,
              expenses: [
                {
                  id: uid(),
                  description: v.description,
                  amount: Number(v.amount),
                  date: v.date,
                  category: v.category || "Outros",
                },
                ...d.expenses,
              ],
            }));
            setModal(null);
            say("Despesa registrada.");
          }}
        />
      )}
      {modal === "staff" && (
        <SimpleEditor
          title="Novo profissional"
          fields={[
            ["name", "Nome completo", "text"],
            ["title", "Função", "text"],
            ["commission", "Comissão (%)", "number"],
          ]}
          close={() => setModal(null)}
          save={(v) => {
            update((d) => ({
              ...d,
              staff: [
                ...d.staff,
                {
                  id: uid(),
                  name: v.name,
                  title: v.title || "Barbeiro",
                  commission: Number(v.commission),
                  color: colors[d.staff.length % colors.length],
                  active: true,
                  initials: initials(v.name),
                },
              ],
            }));
            setModal(null);
            say("Profissional adicionado.");
          }}
        />
      )}
      {modal === "service" && (
        <SimpleEditor
          title="Novo serviço"
          fields={[
            ["name", "Nome do serviço", "text"],
            ["category", "Categoria", "text"],
            ["duration", "Duração (minutos)", "number"],
            ["price", "Preço (R$)", "number"],
          ]}
          close={() => setModal(null)}
          save={(v) => {
            update((d) => ({
              ...d,
              services: [
                ...d.services,
                {
                  id: uid(),
                  name: v.name,
                  category: v.category || "Outros",
                  duration: Number(v.duration),
                  price: Number(v.price),
                  active: true,
                },
              ],
            }));
            setModal(null);
            say("Serviço adicionado.");
          }}
        />
      )}
      {modal === "product" && (
        <SimpleEditor
          title="Novo produto"
          fields={[
            ["name", "Nome do produto", "text"],
            ["price", "Preço (R$)", "number"],
            ["stock", "Quantidade em estoque", "number"],
          ]}
          close={() => setModal(null)}
          save={(v) => {
            update((d) => ({
              ...d,
              products: [
                ...d.products,
                {
                  id: uid(),
                  name: v.name,
                  price: Number(v.price),
                  stock: Number(v.stock),
                },
              ],
            }));
            setModal(null);
            say("Produto adicionado.");
          }}
        />
      )}
      {modal === "waitlist" && (
        <WaitEditor
          data={data}
          date={date}
          close={() => setModal(null)}
          save={(v) => {
            update((d) => ({
              ...d,
              waitlist: [
                ...d.waitlist,
                {
                  id: uid(),
                  clientId: v.clientId,
                  serviceId: v.serviceId,
                  staffId: v.staffId,
                  date,
                  period: v.period,
                },
              ],
            }));
            setModal(null);
            say("Cliente adicionado à fila.");
          }}
        />
      )}
    </div>
  );
}

function shiftDate(date: string, days: number) {
  const d = new Date(`${date}T12:00:00`);
  d.setDate(d.getDate() + days);
  return localDate(d);
}

function BookingModal({
  data,
  initialClientId,
  close,
  save,
}: {
  data: BarbioData;
  initialClientId: string;
  close: () => void;
  save: (b: Booking) => void;
}) {
  const [clientId, setClientId] = useState(
    initialClientId || data.clients[0]?.id || "",
  );
  const [staffId, setStaffId] = useState(
    data.staff.find((s) => s.active)?.id || "",
  );
  const [serviceId, setServiceId] = useState(
    data.services.find((s) => s.active)?.id || "",
  );
  const [date, setDate] = useState(localDate());
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const slots = availableSlots(data, staffId, serviceId, date);
  return (
    <ModalBox
      title="Novo agendamento"
      subtitle="Encontre o horário certo em poucos passos."
      close={close}
      wide
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (time)
            save({
              id: uid(),
              clientId,
              staffId,
              serviceId,
              date,
              time,
              notes,
              status: "confirmed",
              source: "balcao",
            });
        }}
      >
        <div className="form-grid">
          <Field label="Cliente">
            <select
              required
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
            >
              {data.clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Serviço">
            <select
              required
              value={serviceId}
              onChange={(e) => {
                setServiceId(e.target.value);
                setTime("");
              }}
            >
              {data.services
                .filter((s) => s.active)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {money(s.price)}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Profissional">
            <select
              required
              value={staffId}
              onChange={(e) => {
                setStaffId(e.target.value);
                setTime("");
              }}
            >
              {data.staff
                .filter((s) => s.active)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Data">
            <input
              required
              type="date"
              min={localDate()}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setTime("");
              }}
            />
          </Field>
        </div>
        <div className="slot-area">
          <span className="eyebrow">HORÁRIOS DISPONÍVEIS</span>
          <div className="slots">
            {slots.length ? (
              slots.map((s) => (
                <button
                  type="button"
                  key={s}
                  className={time === s ? "selected" : ""}
                  onClick={() => setTime(s)}
                >
                  {s}
                </button>
              ))
            ) : (
              <p>Nenhum horário disponível neste dia.</p>
            )}
          </div>
        </div>
        <Field label="Observações">
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Preferências ou detalhes importantes"
          />
        </Field>
        <div className="modal-actions">
          <button type="button" className="btn light" onClick={close}>
            Cancelar
          </button>
          <button className="btn primary" disabled={!time}>
            <Check size={17} /> Criar agendamento
          </button>
        </div>
      </form>
    </ModalBox>
  );
}

function Checkout({
  data,
  booking,
  close,
  submit,
}: {
  data: BarbioData;
  booking: Booking;
  close: () => void;
  submit: (id: string, method: PaymentMethod, products: string[]) => void;
}) {
  const [method, setMethod] = useState<PaymentMethod>("pix");
  const [products, setProducts] = useState<string[]>([]);
  const service = data.services.find((s) => s.id === booking.serviceId);
  const total =
    (service?.price ?? 0) +
    products.reduce(
      (n, id) => n + (data.products.find((p) => p.id === id)?.price ?? 0),
      0,
    );
  return (
    <ModalBox
      title="Concluir atendimento"
      subtitle="Serviço, produtos e pagamento no mesmo fechamento."
      close={close}
    >
      <div className="checkout-line">
        <span>{service?.name}</span>
        <strong>{money(service?.price ?? 0)}</strong>
      </div>
      <div className="slot-area">
        <span className="eyebrow">ADICIONAR PRODUTOS</span>
        <div className="product-checks">
          {data.products
            .filter((p) => p.stock > 0)
            .map((p) => (
              <label key={p.id}>
                <input
                  type="checkbox"
                  checked={products.includes(p.id)}
                  onChange={(e) =>
                    setProducts(
                      e.target.checked
                        ? [...products, p.id]
                        : products.filter((x) => x !== p.id),
                    )
                  }
                />
                <span>{p.name}</span>
                <b>{money(p.price)}</b>
              </label>
            ))}
        </div>
      </div>
      <div className="slot-area">
        <span className="eyebrow">FORMA DE PAGAMENTO</span>
        <div className="payment-options">
          {(["pix", "credit", "debit", "cash"] as PaymentMethod[]).map((p) => (
            <button
              key={p}
              className={method === p ? "selected" : ""}
              onClick={() => setMethod(p)}
            >
              {paymentLabel[p]}
            </button>
          ))}
        </div>
      </div>
      <div className="checkout-total">
        <span>Total a receber</span>
        <strong>{money(total)}</strong>
      </div>
      <div className="modal-actions">
        <button className="btn light" onClick={close}>
          Voltar
        </button>
        <button
          className="btn primary"
          onClick={() => submit(booking.id, method, products)}
        >
          <Check size={17} /> Registrar pagamento
        </button>
      </div>
    </ModalBox>
  );
}

function ClientEditor({
  data,
  client,
  close,
  save,
  book,
}: {
  data: BarbioData;
  client?: Client;
  close: () => void;
  save: (c: Client) => void;
  book: (id: string) => void;
}) {
  const [name, setName] = useState(client?.name ?? "");
  const [phone, setPhone] = useState(client?.phone ?? "");
  const [email, setEmail] = useState(client?.email ?? "");
  const [notes, setNotes] = useState(client?.notes ?? "");
  const [preferredStaffId, setPreferredStaffId] = useState(
    client?.preferredStaffId ?? "",
  );
  const visits = client
    ? data.bookings
        .filter((b) => b.clientId === client.id && b.status === "completed")
        .sort((a, b) => b.date.localeCompare(a.date))
    : [];
  return (
    <ModalBox
      title={client ? "Perfil do cliente" : "Novo cliente"}
      subtitle={
        client
          ? "Histórico e preferências em um só lugar."
          : "Comece um relacionamento que vale a pena."
      }
      close={close}
      wide
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save({
            id: client?.id ?? uid(),
            name: name.trim(),
            phone: normalizePhone(phone),
            email: email.trim(),
            notes,
            preferredStaffId,
            createdAt: client?.createdAt ?? localDate(),
          });
        }}
      >
        <div className="form-grid">
          <Field label="Nome completo">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>
          <Field label="Celular">
            <input
              required
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>
          <Field label="E-mail">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Field label="Profissional preferido">
            <select
              value={preferredStaffId}
              onChange={(e) => setPreferredStaffId(e.target.value)}
            >
              <option value="">Sem preferência</option>
              {data.staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Preferências e observações">
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Como esse cliente gosta do corte, da barba ou do atendimento?"
          />
        </Field>
        {client && (
          <div className="history">
            <span className="eyebrow">HISTÓRICO DE VISITAS</span>
            {visits.length ? (
              visits.map((v) => (
                <div key={v.id}>
                  <span>{shortDate(v.date)}</span>
                  <strong>
                    {data.services.find((s) => s.id === v.serviceId)?.name}
                  </strong>
                  <b>{money(v.charged ?? 0)}</b>
                </div>
              ))
            ) : (
              <p>Nenhuma visita concluída ainda.</p>
            )}
          </div>
        )}
        <div className="modal-actions">
          {client && (
            <button
              type="button"
              className="btn light"
              onClick={() => book(client.id)}
            >
              <CalendarDays size={17} /> Agendar
            </button>
          )}
          <button type="button" className="btn light" onClick={close}>
            Cancelar
          </button>
          <button className="btn primary">
            <Check size={17} /> Salvar cliente
          </button>
        </div>
      </form>
    </ModalBox>
  );
}

function SimpleEditor({
  title,
  fields,
  defaults = {},
  close,
  save,
}: {
  title: string;
  fields: [string, string, string][];
  defaults?: Record<string, string>;
  close: () => void;
  save: (v: Record<string, string>) => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(defaults);
  return (
    <ModalBox title={title} close={close}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save(values);
        }}
      >
        <div className="form-stack">
          {fields.map(([key, label, type]) => (
            <Field key={key} label={label}>
              <input
                required
                type={type}
                min={type === "number" ? 0 : undefined}
                step={type === "number" ? "any" : undefined}
                value={values[key] ?? ""}
                onChange={(e) =>
                  setValues({ ...values, [key]: e.target.value })
                }
              />
            </Field>
          ))}
        </div>
        <div className="modal-actions">
          <button type="button" className="btn light" onClick={close}>
            Cancelar
          </button>
          <button className="btn primary">
            <Check size={17} /> Salvar
          </button>
        </div>
      </form>
    </ModalBox>
  );
}

function WaitEditor({
  data,
  date,
  close,
  save,
}: {
  data: BarbioData;
  date: string;
  close: () => void;
  save: (v: Record<string, string>) => void;
}) {
  const [v, setV] = useState({
    clientId: data.clients[0]?.id ?? "",
    serviceId: data.services[0]?.id ?? "",
    staffId: data.staff[0]?.id ?? "",
    period: "Qualquer horário",
  });
  return (
    <ModalBox
      title="Fila de espera"
      subtitle={`Para ${shortDate(date)}`}
      close={close}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save(v);
        }}
      >
        <div className="form-stack">
          <Field label="Cliente">
            <select
              value={v.clientId}
              onChange={(e) => setV({ ...v, clientId: e.target.value })}
            >
              {data.clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Serviço">
            <select
              value={v.serviceId}
              onChange={(e) => setV({ ...v, serviceId: e.target.value })}
            >
              {data.services
                .filter((s) => s.active)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Profissional">
            <select
              value={v.staffId}
              onChange={(e) => setV({ ...v, staffId: e.target.value })}
            >
              {data.staff
                .filter((s) => s.active)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Período preferido">
            <select
              value={v.period}
              onChange={(e) => setV({ ...v, period: e.target.value })}
            >
              <option>Qualquer horário</option>
              <option>Manhã</option>
              <option>Tarde</option>
              <option>Noite</option>
            </select>
          </Field>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn light" onClick={close}>
            Cancelar
          </button>
          <button className="btn primary">
            <Plus size={17} /> Adicionar à fila
          </button>
        </div>
      </form>
    </ModalBox>
  );
}
