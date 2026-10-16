"use client";
/* eslint-disable @next/next/no-img-element -- User-provided logo data URLs are already size-limited. */

import { useState, type CSSProperties, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  MapPin,
  Scissors,
  ShieldCheck,
} from "lucide-react";
import {
  availableSlots,
  firstName,
  initials,
  isAvailable,
  localDate,
  money,
  normalizePhone,
  uid,
} from "@/lib/barbio";
import { useBarbio } from "@/lib/use-barbio";

export default function BookingPage() {
  const { data, setData } = useBarbio();
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [date, setDate] = useState(localDate());
  const [time, setTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  if (!data)
    return (
      <div className="booking-loading">
        <Scissors size={27} /> Preparando os horários...
      </div>
    );
  const service = data.services.find((s) => s.id === serviceId);
  const staff = data.staff.find((s) => s.id === staffId);
  const slots =
    serviceId && staffId ? availableSlots(data, staffId, serviceId, date) : [];
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || normalizePhone(phone).length < 10)
      return setError("Informe nome e celular válidos.");
    if (!isAvailable(data, staffId, serviceId, date, time))
      return setError("Este horário ficou indisponível. Escolha outro.");
    const normalized = normalizePhone(phone);
    const existing = data.clients.find((c) => c.phone === normalized);
    const clientId = existing?.id ?? uid();
    setData((d) =>
      d
        ? {
            ...d,
            clients: existing
              ? d.clients
              : [
                  ...d.clients,
                  {
                    id: clientId,
                    name: name.trim(),
                    phone: normalized,
                    email: "",
                    notes: "",
                    preferredStaffId: staffId,
                    createdAt: localDate(),
                  },
                ],
            bookings: [
              ...d.bookings,
              {
                id: uid(),
                clientId,
                staffId,
                serviceId,
                date,
                time,
                status: "pending",
                notes: "",
                source: "online",
              },
            ],
          }
        : d,
    );
    setStep(5);
  };
  return (
    <div
      className="booking-page"
      style={{ "--accent": data.shop.accent } as CSSProperties}
    >
      <header>
        <Link href="/" className="booking-brand">
          <span>
            {data.shop.logo ? (
              <img src={data.shop.logo} alt="" />
            ) : (
              <Scissors size={21} />
            )}
          </span>
          <strong>{data.shop.name}</strong>
        </Link>
        <span className="booking-support">Seu momento começa aqui</span>
      </header>
      <div className="booking-layout">
        <aside className="booking-aside">
          <div className="booking-aside-content">
            <span className="eyebrow">
              BEM-VINDO À {data.shop.name.toUpperCase()}
            </span>
            <h1>
              Um novo visual.
              <br />
              <em>Do seu jeito.</em>
            </h1>
            <p>
              {data.shop.tagline} Escolha seu serviço, profissional e horário em
              poucos passos.
            </p>
            <div className="booking-steps">
              {[
                [1, "Serviço"],
                [2, "Profissional"],
                [3, "Data e horário"],
                [4, "Seus dados"],
              ].map(([n, label]) => (
                <div key={n} className={step >= Number(n) ? "active" : ""}>
                  <span>{step > Number(n) ? <Check size={14} /> : n}</span>
                  {label}
                </div>
              ))}
            </div>
          </div>
          <div className="booking-aside-footer">
            <MapPin size={16} />
            {data.shop.address}
          </div>
          <div className="booking-decor">
            B<span>.</span>
          </div>
        </aside>
        <main className="booking-main">
          <div className="demo-alert">
            <ShieldCheck size={17} />
            <span>
              Demonstração: a reserva fica salva apenas neste navegador e não
              envia confirmação automática.
            </span>
          </div>
          {step < 5 && (
            <div className="booking-progress">
              <span>ETAPA {step} DE 4</span>
              <div>
                <i style={{ width: `${step * 25}%` }} />
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="booking-step">
              <span className="eyebrow">ESCOLHA SUA EXPERIÊNCIA</span>
              <h2>O que vamos fazer hoje?</h2>
              <p>Selecione o serviço que combina com o seu momento.</p>
              <div className="booking-service-list">
                {data.services
                  .filter((s) => s.active)
                  .map((s) => (
                    <button
                      key={s.id}
                      className={serviceId === s.id ? "selected" : ""}
                      onClick={() => setServiceId(s.id)}
                    >
                      <span className="booking-service-icon">
                        <Scissors size={21} />
                      </span>
                      <span>
                        <strong>{s.name}</strong>
                        <small>
                          <Clock3 size={14} /> {s.duration} min · {s.category}
                        </small>
                      </span>
                      <b>{money(s.price)}</b>
                      <span className="radio-dot" />
                    </button>
                  ))}
              </div>
              <button
                className="btn primary booking-next"
                disabled={!serviceId}
                onClick={() => setStep(2)}
              >
                Continuar <ArrowRight size={17} />
              </button>
            </div>
          )}
          {step === 2 && (
            <div className="booking-step">
              <button className="booking-back" onClick={() => setStep(1)}>
                <ArrowLeft size={16} /> Voltar
              </button>
              <span className="eyebrow">QUEM CUIDA DE VOCÊ</span>
              <h2>Escolha seu profissional.</h2>
              <p>Um atendimento com a atenção que você merece.</p>
              <div className="booking-staff-list">
                {data.staff
                  .filter((s) => s.active)
                  .map((s) => (
                    <button
                      key={s.id}
                      className={staffId === s.id ? "selected" : ""}
                      onClick={() => {
                        setStaffId(s.id);
                        setTime("");
                      }}
                    >
                      <span
                        className="booking-staff-avatar"
                        style={{ background: `${s.color}22`, color: s.color }}
                      >
                        {initials(s.name)}
                      </span>
                      <span>
                        <strong>{s.name}</strong>
                        <small>{s.title}</small>
                      </span>
                      <span className="radio-dot" />
                    </button>
                  ))}
              </div>
              <button
                className="btn primary booking-next"
                disabled={!staffId}
                onClick={() => setStep(3)}
              >
                Continuar <ArrowRight size={17} />
              </button>
            </div>
          )}
          {step === 3 && (
            <div className="booking-step">
              <button className="booking-back" onClick={() => setStep(2)}>
                <ArrowLeft size={16} /> Voltar
              </button>
              <span className="eyebrow">SEU MELHOR HORÁRIO</span>
              <h2>Quando você vem?</h2>
              <p>Os horários disponíveis são atualizados conforme a agenda.</p>
              <label className="booking-date">
                <CalendarDays size={19} />
                <input
                  type="date"
                  min={localDate()}
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setTime("");
                  }}
                />
              </label>
              <span className="eyebrow slots-heading">
                HORÁRIOS DISPONÍVEIS
              </span>
              <div className="booking-slot-grid">
                {slots.length ? (
                  slots.map((s) => (
                    <button
                      key={s}
                      className={time === s ? "selected" : ""}
                      onClick={() => setTime(s)}
                    >
                      {s}
                    </button>
                  ))
                ) : (
                  <p>Nenhum horário livre nesta data. Escolha outro dia.</p>
                )}
              </div>
              <button
                className="btn primary booking-next"
                disabled={!time}
                onClick={() => setStep(4)}
              >
                Continuar <ArrowRight size={17} />
              </button>
            </div>
          )}
          {step === 4 && (
            <div className="booking-step">
              <button className="booking-back" onClick={() => setStep(3)}>
                <ArrowLeft size={16} /> Voltar
              </button>
              <span className="eyebrow">QUASE LÁ</span>
              <h2>Agora é só confirmar.</h2>
              <p>Precisamos de poucos dados para identificar sua reserva.</p>
              <div className="booking-summary">
                <div>
                  <Scissors size={18} />
                  <span>
                    <strong>{service?.name}</strong>
                    <small>com {staff?.name}</small>
                  </span>
                  <b>{money(service?.price ?? 0)}</b>
                </div>
                <div>
                  <CalendarDays size={18} />
                  <span>
                    <strong>
                      {new Date(`${date}T12:00:00`).toLocaleDateString(
                        "pt-BR",
                        { day: "numeric", month: "long", year: "numeric" },
                      )}
                    </strong>
                    <small>às {time}</small>
                  </span>
                </div>
              </div>
              <form onSubmit={submit} className="booking-form">
                <label>
                  Seu nome
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome completo"
                    required
                  />
                </label>
                <label>
                  Celular com DDD
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    inputMode="tel"
                    required
                  />
                </label>
                {error && <p className="form-error">{error}</p>}
                <button className="btn primary booking-next">
                  <Check size={17} /> Confirmar reserva
                </button>
              </form>
            </div>
          )}
          {step === 5 && (
            <div className="booking-done">
              <span className="done-icon">
                <Check size={35} />
              </span>
              <span className="eyebrow">RESERVA REGISTRADA</span>
              <h2>Até breve, {firstName(name)}!</h2>
              <p>
                Seu horário de {service?.name.toLowerCase()} com {staff?.name}{" "}
                foi registrado para{" "}
                {new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "long",
                })}
                , às {time}.
              </p>
              <div className="booking-summary">
                <div>
                  <CalendarDays size={18} />
                  <span>
                    <strong>
                      {date.split("-").reverse().join("/")} às {time}
                    </strong>
                    <small>{data.shop.address}</small>
                  </span>
                </div>
              </div>
              <Link href="/" className="btn primary">
                Voltar ao painel <ArrowRight size={17} />
              </Link>
            </div>
          )}
        </main>
      </div>
      <footer className="booking-footer">
        <span>Uma experiência Barbio</span>
        <span>Feito para cuidar do seu tempo.</span>
      </footer>
    </div>
  );
}
