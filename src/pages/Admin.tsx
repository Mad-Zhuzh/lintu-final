import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowDown, ArrowLeft, ArrowUp, ArrowUpDown, Check, ChevronDown, Inbox, Loader2, LogOut, MoreHorizontal, Package, Search, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Order = Database["public"]["Tables"]["orders"]["Row"];
type Request = Database["public"]["Tables"]["requests"]["Row"];
type OrderStatus = Database["public"]["Enums"]["order_status"];
type RequestStatus = Database["public"]["Enums"]["request_status"];
type StatusFilter = OrderStatus | "Все";
type SortKey = "delivery" | "price" | "none";
type SortDir = "asc" | "desc";
type DeleteTarget = { kind: "order" | "request"; id: string };
type AdminMode = "admin" | "demo";

const orderStatusStyles: Record<OrderStatus, string> = {
  "Принят": "text-foreground",
  "В полёте": "text-accent",
  "Доставлен": "text-primary",
  "Отменён": "text-muted-foreground",
};

const requestStatusStyles: Record<RequestStatus, string> = {
  "Новая": "text-accent",
  "Заказ сформирован": "text-primary",
  "Отменена": "text-muted-foreground",
};

const statusTextClass = "text-xs font-medium leading-5 whitespace-nowrap";
const summaryPillClass = "h-6 rounded-md px-2.5 py-0 text-[11px] font-medium leading-none";

const demoRequests: Request[] = [
  { id: "d1000000-0000-4000-8000-000000000001", created_at: "2026-04-30T10:35:00+03:00", name: "Наталья Зайцева", phone: "+7 (903) 888-99-00", email: "n.zaytseva@gmail.com", status: "Новая" },
  { id: "d1000000-0000-4000-8000-000000000002", created_at: "2026-04-24T16:20:00+03:00", name: "Сергей Волков", phone: "+7 (926) 555-66-77", email: "s.volkov@mail.ru", status: "Заказ сформирован" },
  { id: "d1000000-0000-4000-8000-000000000003", created_at: "2026-04-16T11:05:00+03:00", name: "Виктория Лебедева", phone: "+7 (911) 222-33-44", email: "vika.l@yandex.ru", status: "Отменена" },
  { id: "d1000000-0000-4000-8000-000000000004", created_at: "2026-04-09T14:40:00+03:00", name: "Павел Новиков", phone: "+7 (905) 765-43-21", email: "p.novikov@gmail.com", status: "Заказ сформирован" },
  { id: "d1000000-0000-4000-8000-000000000005", created_at: "2026-04-03T09:15:00+03:00", name: "Екатерина Морозова", phone: "+7 (900) 123-45-67", email: "kate.m@mail.ru", status: "Новая" },
];

const demoOrders: Order[] = [
  { id: "e1000000-0000-4000-8000-000000000001", request_id: "d1000000-0000-4000-8000-000000000002", created_at: "2026-04-24T16:45:00+03:00", order_number: 1044, customer: "Сергей Волков", status: "Принят", delivery_date: "2026-04-24", delivery_time: "17:10:00", from_address: "Варшавское ш., 56", to_address: "ул. Покровка, 18", weight_kg: 1.4, price_rub: 1850 },
  { id: "e1000000-0000-4000-8000-000000000002", request_id: null, created_at: "2026-04-28T08:55:00+03:00", order_number: 1043, customer: "Анна Смирнова", status: "Доставлен", delivery_date: "2026-04-26", delivery_time: "12:40:00", from_address: "ул. Тверская, 10", to_address: "Кутузовский пр-т, 24", weight_kg: 1.2, price_rub: 1850 },
  { id: "e1000000-0000-4000-8000-000000000003", request_id: "d1000000-0000-4000-8000-000000000004", created_at: "2026-04-09T15:10:00+03:00", order_number: 1042, customer: "Павел Новиков", status: "В полёте", delivery_date: "2026-04-19", delivery_time: "13:05:00", from_address: "Ленинский пр-т, 45", to_address: "ул. Арбат, 12", weight_kg: 0.6, price_rub: 1200 },
  { id: "e1000000-0000-4000-8000-000000000004", request_id: null, created_at: "2026-04-28T08:55:00+03:00", order_number: 1041, customer: "Мария Иванова", status: "Отменён", delivery_date: "2026-04-28", delivery_time: "10:30:00", from_address: "Пресненская наб., 8", to_address: "ул. Маросейка, 6", weight_kg: 2.1, price_rub: 2950 },
];

const formatPrice = (rub: number) => new Intl.NumberFormat("ru-RU").format(rub) + " ₽";
const formatOrderNumber = (number: number) => `LNT-${number}`;

const formatRequestCreatedAt = (iso: string) => {
  const date = new Date(iso);
  const options = { timeZone: "Europe/Moscow" } as const;
  return {
    date: new Intl.DateTimeFormat("ru-RU", { ...options, day: "numeric", month: "short", year: "numeric" }).format(date),
    time: new Intl.DateTimeFormat("ru-RU", { ...options, hour: "2-digit", minute: "2-digit" }).format(date),
  };
};

const formatDelivery = (date: string, time: string) => {
  const [year, month, day] = date.split("-");
  const months = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
  return { date: `${Number(day)} ${months[Number(month) - 1]} ${year}`, time: time.slice(0, 5) };
};

const Admin = ({ mode = "admin" }: { mode?: AdminMode }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState<"orders" | "requests">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [createOrderDialogOpen, setCreateOrderDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(null);
  const orderRows = useRef<Record<string, HTMLTableRowElement | null>>({});
  const [orderDraft, setOrderDraft] = useState<{ requestId: string; customer: string; fromAddress: string; toAddress: string; weightKg: string; priceRub: number } | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Все");
  const [sortKey, setSortKey] = useState<SortKey>("none");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [requestSearch, setRequestSearch] = useState("");
  const [requestStatusFilter, setRequestStatusFilter] = useState<RequestStatus | "Все">("Все");
  const [requestSortDir, setRequestSortDir] = useState<SortDir>("desc");

  const reportError = (description: string) => toast({ title: "Не удалось выполнить действие", description, variant: "destructive" });

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    const [ordersResult, requestsResult] = await Promise.all([
      supabase.from("orders").select("*").order("delivery_date", { ascending: false }).order("delivery_time", { ascending: false }),
      supabase.from("requests").select("*").order("created_at", { ascending: false }),
    ]);
    if (ordersResult.error || requestsResult.error) {
      setLoadError(ordersResult.error?.message ?? requestsResult.error?.message ?? "Не удалось загрузить данные.");
    } else {
      setOrders(ordersResult.data);
      setRequests(requestsResult.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (mode === "demo") {
      setOrders(demoOrders.map((order) => ({ ...order })));
      setRequests(demoRequests.map((request) => ({ ...request })));
      setLoading(false);
      return;
    }
    void loadData();
  }, [mode]);

  const handleLogout = async () => {
    if (mode === "admin") await supabase.auth.signOut();
    navigate("/admin/login", { replace: true, state: mode === "demo" ? { demo: true } : undefined });
  };

  const updateRequestStatus = async (id: string, status: RequestStatus) => {
    if (mode === "demo") {
      setRequests((current) => current.map((request) => request.id === id ? { ...request, status } : request));
      return;
    }
    const { data, error } = await supabase.from("requests").update({ status }).eq("id", id).select().single();
    if (error) return reportError(error.message);
    setRequests((current) => current.map((request) => request.id === id ? data : request));
  };

  const deleteRequest = async (id: string) => {
    if (mode === "demo") {
      setRequests((current) => current.filter((request) => request.id !== id));
      setOrders((current) => current.map((order) => order.request_id === id ? { ...order, request_id: null } : order));
      return;
    }
    const { error } = await supabase.from("requests").delete().eq("id", id);
    if (error) return reportError(error.message);
    setRequests((current) => current.filter((request) => request.id !== id));
  };

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    if (mode === "demo") {
      setOrders((current) => current.map((order) => order.id === id ? { ...order, status } : order));
      return;
    }
    const { data, error } = await supabase.from("orders").update({ status }).eq("id", id).select().single();
    if (error) return reportError(error.message);
    setOrders((current) => current.map((order) => order.id === id ? data : order));
  };

  const deleteOrder = async (id: string) => {
    if (mode === "demo") {
      setOrders((current) => current.filter((order) => order.id !== id));
      return;
    }
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) return reportError(error.message);
    setOrders((current) => current.filter((order) => order.id !== id));
  };

  const openCreateOrderFromRequest = (request: Request) => {
    setOrderDraft({ requestId: request.id, customer: request.name, fromAddress: "", toAddress: "", weightKg: "", priceRub: 1000 });
    setCreateOrderDialogOpen(true);
  };

  const handleConfirmCreateOrder = async () => {
    if (!orderDraft) return;
    const now = new Date();
    if (mode === "demo") {
      const nextOrderNumber = Math.max(1044, ...orders.map((order) => order.order_number)) + 1;
      const demoOrder: Order = {
        id: crypto.randomUUID(),
        request_id: orderDraft.requestId,
        order_number: nextOrderNumber,
        customer: orderDraft.customer.trim() || "Без имени",
        status: "Принят",
        delivery_date: now.toISOString().slice(0, 10),
        delivery_time: now.toTimeString().slice(0, 8),
        from_address: orderDraft.fromAddress.trim() || "Не указан",
        to_address: orderDraft.toAddress.trim() || "Не указан",
        weight_kg: Number.parseFloat(orderDraft.weightKg) || 0,
        price_rub: orderDraft.priceRub,
        created_at: now.toISOString(),
      };
      setOrders((current) => [demoOrder, ...current]);
      setRequests((current) => current.map((request) => request.id === orderDraft.requestId ? { ...request, status: "Заказ сформирован" } : request));
      setCreateOrderDialogOpen(false);
      setOrderDraft(null);
      setTab("orders");
      return;
    }
    const { data, error } = await supabase.rpc("create_order_from_request", {
      p_request_id: orderDraft.requestId,
      p_customer: orderDraft.customer.trim() || "Без имени",
      p_from_address: orderDraft.fromAddress.trim() || "Не указан",
      p_to_address: orderDraft.toAddress.trim() || "Не указан",
      p_weight_kg: Number.parseFloat(orderDraft.weightKg) || 0,
      p_price_rub: orderDraft.priceRub,
      p_delivery_date: now.toISOString().slice(0, 10),
      p_delivery_time: now.toTimeString().slice(0, 8),
    });
    if (error) return reportError(error.message);
    setOrders((current) => [data, ...current]);
    setRequests((current) => current.map((request) => request.id === orderDraft.requestId ? { ...request, status: "Заказ сформирован" } : request));
    setCreateOrderDialogOpen(false);
    setOrderDraft(null);
    setTab("orders");
  };

  const openLinkedOrder = (order: Order) => {
    setTab("orders");
    setHighlightedOrderId(order.id);
    window.setTimeout(() => orderRows.current[order.id]?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
    window.setTimeout(() => setHighlightedOrderId((current) => current === order.id ? null : current), 1800);
  };

  const toggleSort = (key: Exclude<SortKey, "none">) => {
    if (sortKey !== key) { setSortKey(key); setSortDir("asc"); }
    else if (sortDir === "asc") setSortDir("desc");
    else { setSortKey("none"); setSortDir("desc"); }
  };

  const visibleOrders = useMemo(() => {
    let list = [...orders];
    if (statusFilter !== "Все") list = list.filter((order) => order.status === statusFilter);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((order) => formatOrderNumber(order.order_number).toLowerCase().includes(q) || order.customer.toLowerCase().includes(q) || order.from_address.toLowerCase().includes(q) || order.to_address.toLowerCase().includes(q));
    if (sortKey !== "none") list.sort((a, b) => {
      const compare = sortKey === "delivery"
        ? `${a.delivery_date}T${a.delivery_time}`.localeCompare(`${b.delivery_date}T${b.delivery_time}`)
        : a.price_rub - b.price_rub;
      return sortDir === "asc" ? compare : -compare;
    });
    return list;
  }, [orders, search, statusFilter, sortKey, sortDir]);

  const visibleRequests = useMemo(() => {
    let list = [...requests];
    if (requestStatusFilter !== "Все") list = list.filter((request) => request.status === requestStatusFilter);
    const q = requestSearch.trim().toLowerCase();
    if (q) list = list.filter((request) => request.name.toLowerCase().includes(q) || request.phone.toLowerCase().includes(q) || request.email.toLowerCase().includes(q));
    return list.sort((a, b) => (requestSortDir === "asc" ? 1 : -1) * a.created_at.localeCompare(b.created_at));
  }, [requests, requestSearch, requestSortDir, requestStatusFilter]);

  const SortIcon = ({ active }: { active: boolean }) => !active ? <ArrowUpDown className="h-3.5 w-3.5 opacity-50" /> : sortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />;
  const resetFilters = () => { setSearch(""); setStatusFilter("Все"); setSortKey("none"); setSortDir("desc"); };
  const resetRequestFilters = () => { setRequestSearch(""); setRequestStatusFilter("Все"); };

  return <div className="min-h-screen bg-background">
    <header className="border-b bg-card"><div className="container flex h-16 items-center justify-between">
      <div className="flex items-center gap-8"><Link to="/" className="flex items-center gap-2"><div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center"><span className="text-primary-foreground font-bold text-sm">L</span></div><span className="font-semibold text-lg">Lintu <span className="text-muted-foreground font-normal text-sm">/ Админ</span></span></Link>
        <nav className="flex items-center gap-1 rounded-lg border border-border/70 bg-muted/60 p-1">
          <button onClick={() => setTab("orders")} className={cn("flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors", tab === "orders" ? "bg-background text-foreground shadow-sm ring-1 ring-border/60" : "text-muted-foreground hover:bg-background/70 hover:text-foreground")}><Package className="h-4 w-4" />Заказы</button>
          <button onClick={() => setTab("requests")} className={cn("flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors", tab === "requests" ? "bg-background text-foreground shadow-sm ring-1 ring-border/60" : "text-muted-foreground hover:bg-background/70 hover:text-foreground")}><Inbox className="h-4 w-4" />Заявки</button>
        </nav></div>
      <div className="flex items-center gap-4">{mode === "demo" && <Badge variant="outline" className="text-muted-foreground">Демо-режим</Badge>}<Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="h-4 w-4" />На сайт</Link><Button variant="outline" size="sm" onClick={handleLogout}><LogOut className="h-4 w-4 mr-2" />Выйти</Button></div>
    </div></header>
    <main className="container py-8">
      {loading ? <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div> : loadError ? <Card className="p-6 text-sm text-destructive">Не удалось загрузить данные: {loadError}</Card> : tab === "orders" ? <section>
        <div className="mb-6 flex items-end justify-between gap-4 flex-wrap"><div><h1 className="text-2xl font-semibold tracking-tight">Заказы</h1><p className="text-sm text-muted-foreground mt-1">Управление статусами активных доставок</p></div><div className="flex gap-2"><Badge variant="outline" className={summaryPillClass}>Всего: {orders.length}</Badge><Badge className={cn(summaryPillClass, "bg-accent text-accent-foreground hover:bg-accent")}>В полёте: {orders.filter((order) => order.status === "В полёте").length}</Badge><Badge variant="outline" className={summaryPillClass}>Показано: {visibleOrders.length}</Badge></div></div>
        <Card className="p-4 mb-4"><div className="flex flex-wrap items-center gap-3"><div className="relative flex-1 min-w-[220px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Номер, клиент или адрес" value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" /></div><div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">Статус:</span><Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}><SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Все">Все</SelectItem><SelectItem value="Принят">Принят</SelectItem><SelectItem value="В полёте">В полёте</SelectItem><SelectItem value="Доставлен">Доставлен</SelectItem><SelectItem value="Отменён">Отменён</SelectItem></SelectContent></Select></div><div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">Сортировка:</span><Select value={sortKey === "none" ? "none" : `${sortKey}:${sortDir}`} onValueChange={(value) => { if (value === "none") return setSortKey("none"); const [key, direction] = value.split(":") as [Exclude<SortKey, "none">, SortDir]; setSortKey(key); setSortDir(direction); }}><SelectTrigger className="w-[210px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">Без сортировки</SelectItem><SelectItem value="delivery:asc">Доставка ↑</SelectItem><SelectItem value="delivery:desc">Доставка ↓</SelectItem><SelectItem value="price:asc">Стоимость ↑</SelectItem><SelectItem value="price:desc">Стоимость ↓</SelectItem></SelectContent></Select></div><Button variant="ghost" size="sm" onClick={resetFilters}>Сбросить</Button></div></Card>
        <Card className="overflow-hidden"><Table className="w-full [&_th]:align-middle [&_th]:px-4 [&_th]:py-3 [&_td]:align-middle [&_td]:px-4 [&_td]:py-3"><TableHeader><TableRow className="bg-muted/40 hover:bg-muted/40"><TableHead className="whitespace-nowrap">Номер</TableHead><TableHead className="min-w-[170px]">Клиент</TableHead><TableHead className="whitespace-nowrap"><button onClick={() => toggleSort("delivery")} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">Доставка <SortIcon active={sortKey === "delivery"} /></button></TableHead><TableHead>Откуда</TableHead><TableHead>Куда</TableHead><TableHead className="whitespace-nowrap">Вес</TableHead><TableHead className="whitespace-nowrap"><button onClick={() => toggleSort("price")} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">Стоимость <SortIcon active={sortKey === "price"} /></button></TableHead><TableHead className="whitespace-nowrap !pl-6 !pr-4">Статус</TableHead></TableRow></TableHeader><TableBody>{visibleOrders.length === 0 ? <TableRow><TableCell colSpan={8} className="py-10 text-center text-muted-foreground">Ничего не найдено</TableCell></TableRow> : visibleOrders.map((order) => { const delivery = formatDelivery(order.delivery_date, order.delivery_time); return <TableRow ref={(node) => { orderRows.current[order.id] = node; }} key={order.id} className={cn("hover:bg-muted/30", highlightedOrderId === order.id && "bg-primary/10") }><TableCell className="whitespace-nowrap font-mono text-sm font-medium">{formatOrderNumber(order.order_number)}</TableCell><TableCell className="min-w-[170px] whitespace-normal text-sm leading-5 [overflow-wrap:anywhere]">{order.customer}</TableCell><TableCell className="whitespace-nowrap text-sm text-muted-foreground"><div>{delivery.date}</div><div>{delivery.time}</div></TableCell><TableCell className="whitespace-normal text-sm leading-5 [overflow-wrap:anywhere]">{order.from_address}</TableCell><TableCell className="whitespace-normal text-sm leading-5 [overflow-wrap:anywhere]">{order.to_address}</TableCell><TableCell className="whitespace-nowrap text-muted-foreground">{Number(order.weight_kg).toFixed(1)} кг</TableCell><TableCell className="whitespace-nowrap font-normal text-muted-foreground">{formatPrice(order.price_rub)}</TableCell><TableCell className="whitespace-nowrap"><DropdownMenu><DropdownMenuTrigger asChild><button type="button" className="inline-flex w-[110px] items-center justify-between gap-1.5 rounded-md px-2 py-1.5 text-left text-xs font-medium transition-colors hover:bg-muted focus:outline-none focus:ring-0 focus:ring-offset-0"><span className={orderStatusStyles[order.status]}>{order.status}</span><ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /></button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-[156px]">{(["Принят", "В полёте", "Доставлен", "Отменён"] as OrderStatus[]).map((status) => <DropdownMenuItem key={status} onSelect={() => void updateOrderStatus(order.id, status)} className="flex items-center justify-between text-xs focus:bg-muted focus:text-foreground"><span className={orderStatusStyles[status]}>{status}</span>{order.status === status && <Check className="h-3.5 w-3.5 text-foreground" />}</DropdownMenuItem>)}<DropdownMenuSeparator /><DropdownMenuItem onSelect={() => setDeleteTarget({ kind: "order", id: order.id })} className="text-xs text-destructive focus:bg-muted focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Удалить заказ</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell></TableRow>; })}</TableBody></Table></Card>
      </section> : <section>
        <div className="mb-6 flex items-end justify-between gap-4 flex-wrap"><div><h1 className="text-2xl font-semibold tracking-tight">Заявки</h1><p className="text-sm text-muted-foreground mt-1">Новые обращения с сайта</p></div><div className="flex gap-2"><Badge variant="outline" className={summaryPillClass}>Всего: {requests.length}</Badge><Badge className={cn(summaryPillClass, "bg-accent text-accent-foreground hover:bg-accent")}>Новых: {requests.filter((request) => request.status === "Новая").length}</Badge></div></div>
        <Card className="p-4 mb-4"><div className="flex flex-wrap items-center gap-3"><div className="relative flex-1 min-w-[220px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Имя, телефон или email" value={requestSearch} onChange={(event) => setRequestSearch(event.target.value)} className="pl-9" /></div><div className="flex items-center gap-2"><span className="text-sm text-muted-foreground">Статус:</span><Select value={requestStatusFilter} onValueChange={(value) => setRequestStatusFilter(value as RequestStatus | "Все")}><SelectTrigger className="w-[190px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Все">Все</SelectItem><SelectItem value="Новая">Новая</SelectItem><SelectItem value="Заказ сформирован">Заказ сформирован</SelectItem><SelectItem value="Отменена">Отменена</SelectItem></SelectContent></Select></div>{(requestSearch || requestStatusFilter !== "Все") && <Button variant="ghost" size="sm" onClick={resetRequestFilters}>Сбросить</Button>}</div></Card>
        <Card className="overflow-hidden"><Table><TableHeader><TableRow className="bg-muted/40 hover:bg-muted/40"><TableHead className="w-[140px]"><button onClick={() => setRequestSortDir((direction) => direction === "desc" ? "asc" : "desc")} className="inline-flex items-center gap-1 hover:text-foreground transition-colors">Создана {requestSortDir === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}</button></TableHead><TableHead>Имя</TableHead><TableHead className="w-[220px]">Телефон</TableHead><TableHead className="w-[260px]">Email</TableHead><TableHead className="w-[180px]">Статус</TableHead><TableHead className="w-[220px] pr-5 text-right"><span className="sr-only">Действия</span></TableHead></TableRow></TableHeader><TableBody>{visibleRequests.length === 0 ? <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">{requests.length === 0 ? "Заявок пока нет" : "Ничего не найдено"}</TableCell></TableRow> : visibleRequests.map((request) => { const created = formatRequestCreatedAt(request.created_at); const linkedOrder = orders.find((order) => order.request_id === request.id); return <TableRow key={request.id}><TableCell className="whitespace-nowrap text-sm text-muted-foreground"><div>{created.date}</div><div>{created.time}</div></TableCell><TableCell className="font-medium">{request.name}</TableCell><TableCell className="text-muted-foreground">{request.phone}</TableCell><TableCell className="text-muted-foreground">{request.email}</TableCell><TableCell><span className={cn(statusTextClass, requestStatusStyles[request.status])}>{request.status}</span></TableCell><TableCell className="pr-5"><div className="flex items-center justify-end gap-2">{request.status === "Новая" && <Button size="sm" onClick={() => openCreateOrderFromRequest(request)}>Сформировать заказ</Button>}{request.status === "Заказ сформирован" && linkedOrder && <Button variant="outline" size="sm" onClick={() => openLinkedOrder(linkedOrder)}>Открыть заказ</Button>}<DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label="Действия с заявкой"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-[190px]">{request.status === "Новая" && <><DropdownMenuItem onSelect={() => void updateRequestStatus(request.id, "Отменена")} className="focus:bg-muted focus:text-foreground">Отменить заявку</DropdownMenuItem><DropdownMenuSeparator /></>}<DropdownMenuItem onSelect={() => setDeleteTarget({ kind: "request", id: request.id })} className="text-destructive focus:bg-muted focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" />Удалить заявку</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div></TableCell></TableRow>; })}</TableBody></Table></Card>
      </section>}
    </main>
    <Dialog open={createOrderDialogOpen} onOpenChange={setCreateOrderDialogOpen}><DialogContent className="sm:max-w-xl !p-12" overlayClassName="bg-black/40 backdrop-blur-0" onOpenAutoFocus={(event) => event.preventDefault()}><DialogHeader><DialogTitle>Новый заказ</DialogTitle><p className="mt-4 text-sm font-normal text-muted-foreground">Номер заказа будет присвоен автоматически после создания.</p></DialogHeader>{orderDraft && <div className="grid gap-3"><div className="space-y-2"><Label htmlFor="order-customer">Клиент</Label><Input id="order-customer" value={orderDraft.customer} onChange={(event) => setOrderDraft((draft) => draft ? { ...draft, customer: event.target.value } : draft)} /></div><div className="space-y-2"><Label htmlFor="order-from">Адрес отправления</Label><Input id="order-from" value={orderDraft.fromAddress} onChange={(event) => setOrderDraft((draft) => draft ? { ...draft, fromAddress: event.target.value } : draft)} /></div><div className="space-y-2"><Label htmlFor="order-to">Адрес доставки</Label><Input id="order-to" value={orderDraft.toAddress} onChange={(event) => setOrderDraft((draft) => draft ? { ...draft, toAddress: event.target.value } : draft)} /></div><div className="space-y-2"><Label htmlFor="order-weight">Вес (кг)</Label><Input id="order-weight" type="number" step="0.1" min="0" value={orderDraft.weightKg} onChange={(event) => setOrderDraft((draft) => draft ? { ...draft, weightKg: event.target.value } : draft)} /></div><div className="space-y-2"><Label>Стоимость</Label><Input value={`${orderDraft.priceRub} ₽`} readOnly /></div></div>}<DialogFooter><Button variant="outline" onClick={() => setCreateOrderDialogOpen(false)}>Отменить</Button><Button onClick={() => void handleConfirmCreateOrder()}>Создать заказ</Button></DialogFooter></DialogContent></Dialog>
    <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{deleteTarget?.kind === "order" ? `Удалить заказ ${formatOrderNumber(orders.find((order) => order.id === deleteTarget.id)?.order_number ?? 0)}?` : "Удалить заявку?"}</AlertDialogTitle><AlertDialogDescription>{deleteTarget?.kind === "order" ? "Это действие нельзя отменить. Заказ будет удалён из списка." : "Это действие нельзя отменить. Заявка будет удалена из списка."}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0">Отменить</AlertDialogCancel><AlertDialogAction onClick={() => { if (deleteTarget?.kind === "order") void deleteOrder(deleteTarget.id); if (deleteTarget?.kind === "request") void deleteRequest(deleteTarget.id); setDeleteTarget(null); }}>Удалить</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
  </div>;
};

export default Admin;
