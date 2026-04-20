import { useState } from "react";
import { Link } from "react-router-dom";
import { Package, Inbox, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

interface Order {
  id: string;
  customer: string;
  status: OrderStatus;
  deliveryTime: string;
}

interface Request {
  id: string;
  name: string;
  phone: string;
  email: string;
}

const initialOrders: Order[] = [
  { id: "LNT-1042", customer: "Анна Смирнова", status: "В полёте", deliveryTime: "12:40" },
  { id: "LNT-1041", customer: "Игорь Петров", status: "Принят", deliveryTime: "13:05" },
  { id: "LNT-1040", customer: "Мария Иванова", status: "Доставлен", deliveryTime: "11:55" },
  { id: "LNT-1039", customer: "Алексей Орлов", status: "В полёте", deliveryTime: "12:20" },
  { id: "LNT-1038", customer: "Ольга Кузнецова", status: "Доставлен", deliveryTime: "10:30" },
  { id: "LNT-1037", customer: "Дмитрий Соколов", status: "Принят", deliveryTime: "13:25" },
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

const Admin = () => {
  const [tab, setTab] = useState<"orders" | "requests">("orders");
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const updateStatus = (id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
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
            <div className="mb-6 flex items-end justify-between">
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
              </div>
            </div>

            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-[140px]">Номер</TableHead>
                    <TableHead>Клиент</TableHead>
                    <TableHead className="w-[160px]">Статус</TableHead>
                    <TableHead className="w-[140px]">Доставка</TableHead>
                    <TableHead className="w-[180px] text-right">Изменить статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("font-normal", statusStyles[order.status])}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{order.deliveryTime}</TableCell>
                      <TableCell className="text-right">
                        <Select
                          value={order.status}
                          onValueChange={(v) => updateStatus(order.id, v as OrderStatus)}
                        >
                          <SelectTrigger className="w-[160px] ml-auto">
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
                  ))}
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
