import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Package, Inbox, ArrowLeft, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type OrderStatus = "Принят" | "В полёте" | "Доставлен";
type StatusFilter = OrderStatus | "Все";
type SortKey = "date" | "time" | "price" | "none";
type SortDir = "asc" | "desc";

interface Order {
  id: string;
  customer: string;
  status: OrderStatus;
  date: string; // YYYY-MM-DD (апрель 2026)
  deliveryTime: string; // HH:MM
  fromAddress: string;
  toAddress: string;
  weightKg: number;
  priceRub: number;
}

interface Request {
  id: string;
  name: string;
  phone: string;
  email: string;
}

const initialOrders: Order[] = [
  {
    id: "LNT-1042",
    customer: "Анна Смирнова",
    status: "В полёте",
    date: "2026-04-18",
    deliveryTime: "12:40",
    fromAddress: "ул. Тверская, 10",
    toAddress: "Кутузовский пр-т, 24",
    weightKg: 1.2,
    priceRub: 1850,
  },
  {
    id: "LNT-1041",
    customer: "Игорь Петров",
    status: "Принят",
    date: "2026-04-19",
    deliveryTime: "13:05",
    fromAddress: "Ленинский пр-т, 45",
    toAddress: "ул. Арбат, 12",
    weightKg: 0.6,
    priceRub: 1200,
  },
  {
    id: "LNT-1040",
    customer: "Мария Иванова",
    status: "Доставлен",
    date: "2026-04-15",
    deliveryTime: "11:55",
    fromAddress: "Пресненская наб., 8",
    toAddress: "ул. Маросейка, 6",
    weightKg: 2.1,
    priceRub: 2950,
  },
  {
    id: "LNT-1039",
    customer: "Алексей Орлов",
    status: "В полёте",
    date: "2026-04-20",
    deliveryTime: "12:20",
    fromAddress: "Варшавское ш., 56",
    toAddress: "ул. Покровка, 18",
    weightKg: 2.8,
    priceRub: 4600,
  },
  {
    id: "LNT-1038",
    customer: "Ольга Кузнецова",
    status: "Доставлен",
    date: "2026-04-10",
    deliveryTime: "10:30",
    fromAddress: "Мичуринский пр-т, 22",
    toAddress: "Большая Никитская, 14",
    weightKg: 0.4,
    priceRub: 1050,
  },
  {
    id: "LNT-1037",
    customer: "Дмитрий Соколов",
    status: "Принят",
    date: "2026-04-22",
    deliveryTime: "13:25",
    fromAddress: "Ленинградский пр-т, 80",
    toAddress: "ул. Пятницкая, 30",
    weightKg: 1.7,
    priceRub: 2400,
  },
  {
    id: "LNT-1036",
    customer: "Елена Васильева",
    status: "Доставлен",
    date: "2026-04-05",
    deliveryTime: "09:15",
    fromAddress: "Профсоюзная ул., 100",
    toAddress: "ул. Солянка, 5",
    weightKg: 3.0,
    priceRub: 4900,
  },
  {
    id: "LNT-1035",
    customer: "Михаил Новиков",
    status: "В полёте",
    date: "2026-04-21",
    deliveryTime: "14:10",
    fromAddress: "Дмитровское ш., 71",
    toAddress: "ул. Большая Ордынка, 40",
    weightKg: 0.9,
    priceRub: 1500,
  },
];

const initialRequests: Request[] = [
  { id: "1", name: "Екатерина Морозова", phone: "+7 (900) 123-45-67", email: "kate.m@mail.ru" },
  { id: "2", name: "Павел Новиков", phone: "+7 (905) 765-43-21", email: "p.novikov@gmail.com" },
  { id: "3", name: "Виктория Лебедева", phone: "+7 (911) 222-33-44", email: "vika.l@yandex.ru" },
  { id: "4", name: "Сергей Волков", phone: "+7 (926) 555-66-77", email: "s.volkov@mail.ru" },
  { id: "5", name: "Наталья Зайцева", phone: "+7 (903) 888-99-00", email: "n.zaytseva@gmail.com" },
];

const statusStyles: Record<OrderStatus, string> = {
  "Принят": "bg-muted text-foreground hover:bg-muted",
  "В полёте": "bg-accent/15 text-accent hover:bg-accent/15 border-accent/30",
  "Доставлен": "bg-primary/10 text-primary hover:bg-primary/10 border-primary/30",
};

const formatDate = (iso: string) => {
  const [, m, d] = iso.split("-");
  const months = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
  return `${parseInt(d, 10)} ${months[parseInt(m, 10) - 1]} 2026`;
};

const formatPrice = (rub: number) =>
  new Intl.NumberFormat("ru-RU").format(rub) + " ₽";

const Admin = () => {
  const [tab, setTab] = useState<"orders" | "requests">("orders");
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Все");
  const [sortKey, setSortKey] = useState<SortKey>("none");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const updateStatus = (id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const toggleSort = (key: Exclude<SortKey, "none">) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortKey("none");
      setSortDir("desc");
    }
  };

  const visibleOrders = useMemo(() => {
    let list = [...orders];

    if (statusFilter !== "Все") {
      list = list.filter((o) => o.status === statusFilter);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.toLowerCase().includes(q) ||
          o.fromAddress.toLowerCase().includes(q) ||
          o.toAddress.toLowerCase().includes(q),
      );
    }

    if (sortKey !== "none") {
      list.sort((a, b) => {
        let cmp = 0;
        if (sortKey === "date") {
          cmp = a.date.localeCompare(b.date);
          if (cmp === 0) cmp = a.deliveryTime.localeCompare(b.deliveryTime);
        } else if (sortKey === "time") {
          cmp = a.deliveryTime.localeCompare(b.deliveryTime);
        } else if (sortKey === "price") {
          cmp = a.priceRub - b.priceRub;
        }
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return list;
  }, [orders, statusFilter, search, sortKey, sortDir]);

  const SortIcon = ({ active }: { active: boolean }) =>
    !active ? (
      <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
    ) : sortDir === "asc" ? (
      <ArrowUp className="h-3.5 w-3.5" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5" />
    );

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("Все");
    setSortKey("none");
    setSortDir("desc");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">L</span>
              </div>
              <span className="font-semibold text-lg">
                Lintu <span className="text-muted-foreground font-normal text-sm">/ Админ</span>
              </span>
            </Link>

            <nav className="flex items-center gap-1">
              <button
                onClick={() => setTab("orders")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  tab === "orders"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Package className="h-4 w-4" />
                Заказы
              </button>
              <button
                onClick={() => setTab("requests")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  tab === "requests"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Inbox className="h-4 w-4" />
                Заявки
              </button>
            </nav>
          </div>

          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            На сайт
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container py-8">
        {tab === "orders" ? (
          <section>
            <div className="mb-6 flex items-end justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Заказы</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Управление статусами активных доставок
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="font-normal">
                  Всего: {orders.length}
                </Badge>
                <Badge className="font-normal bg-accent text-accent-foreground hover:bg-accent">
                  В полёте: {orders.filter((o) => o.status === "В полёте").length}
                </Badge>
                <Badge variant="outline" className="font-normal">
                  Показано: {visibleOrders.length}
                </Badge>
              </div>
            </div>

            {/* Toolbar: search + filters */}
            <Card className="p-4 mb-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Поиск по номеру, клиенту, адресу…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Статус:</span>
                  <Select
                    value={statusFilter}
                    onValueChange={(v) => setStatusFilter(v as StatusFilter)}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Все">Все</SelectItem>
                      <SelectItem value="Принят">Принят</SelectItem>
                      <SelectItem value="В полёте">В полёте</SelectItem>
                      <SelectItem value="Доставлен">Доставлен</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Сортировка:</span>
                  <Select
                    value={sortKey === "none" ? "none" : `${sortKey}:${sortDir}`}
                    onValueChange={(v) => {
                      if (v === "none") {
                        setSortKey("none");
                        return;
                      }
                      const [k, d] = v.split(":") as [Exclude<SortKey, "none">, SortDir];
                      setSortKey(k);
                      setSortDir(d);
                    }}
                  >
                    <SelectTrigger className="w-[210px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Без сортировки</SelectItem>
                      <SelectItem value="date:asc">Дата ↑ (старые)</SelectItem>
                      <SelectItem value="date:desc">Дата ↓ (новые)</SelectItem>
                      <SelectItem value="time:asc">Время ↑</SelectItem>
                      <SelectItem value="time:desc">Время ↓</SelectItem>
                      <SelectItem value="price:asc">Стоимость ↑</SelectItem>
                      <SelectItem value="price:desc">Стоимость ↓</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Сбросить
                </Button>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-[120px]">Номер</TableHead>
                    <TableHead className="w-[160px]">Клиент</TableHead>
                    <TableHead className="w-[140px]">
                      <button
                        onClick={() => toggleSort("date")}
                        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Дата <SortIcon active={sortKey === "date"} />
                      </button>
                    </TableHead>
                    <TableHead className="w-[110px]">
                      <button
                        onClick={() => toggleSort("time")}
                        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Время <SortIcon active={sortKey === "time"} />
                      </button>
                    </TableHead>
                    <TableHead>Откуда</TableHead>
                    <TableHead>Куда</TableHead>
                    <TableHead className="w-[80px]">Вес</TableHead>
                    <TableHead className="w-[130px]">
                      <button
                        onClick={() => toggleSort("price")}
                        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                      >
                        Стоимость <SortIcon active={sortKey === "price"} />
                      </button>
                    </TableHead>
                    <TableHead className="w-[140px]">Статус</TableHead>
                    <TableHead className="w-[170px] text-right">Изменить статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-muted-foreground py-10">
                        Ничего не найдено
                      </TableCell>
                    </TableRow>
                  ) : (
                    visibleOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {formatDate(order.date)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{order.deliveryTime}</TableCell>
                        <TableCell className="text-sm">{order.fromAddress}</TableCell>
                        <TableCell className="text-sm">{order.toAddress}</TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap">
                          {order.weightKg.toFixed(1)} кг
                        </TableCell>
                        <TableCell className="font-bold whitespace-nowrap">
                          {formatPrice(order.priceRub)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("font-normal", statusStyles[order.status])}>
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={order.status}
                            onValueChange={(v) => updateStatus(order.id, v as OrderStatus)}
                          >
                            <SelectTrigger className="w-[150px] ml-auto">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Принят">Принят</SelectItem>
                              <SelectItem value="В полёте">В полёте</SelectItem>
                              <SelectItem value="Доставлен">Доставлен</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </section>
        ) : (
          <section>
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Заявки</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Новые обращения с сайта
                </p>
              </div>
              <Badge variant="outline" className="font-normal">
                Всего: {initialRequests.length}
              </Badge>
            </div>

            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Имя</TableHead>
                    <TableHead className="w-[220px]">Телефон</TableHead>
                    <TableHead className="w-[260px]">Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initialRequests.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell className="text-muted-foreground">{r.phone}</TableCell>
                      <TableCell className="text-muted-foreground">{r.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </section>
        )}
      </main>
    </div>
  );
};

export default Admin;
