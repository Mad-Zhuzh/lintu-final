import { useState } from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Zap,
  ShieldCheck,
  Banknote,
  Leaf,
  ClipboardList,
  Package,
  MapPin,
  Star,
  Phone,
  Mail,
  Send,
  Menu,
  X,
  Search,
  Plane,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import droneHero from "@/assets/drone-hero.png";

const navLinks = [
  { label: "Преимущества", href: "#advantages" },
  { label: "Как это работает", href: "#how" },
  { label: "Отзывы", href: "#reviews" },
];

const advantages = [
  {
    icon: Zap,
    title: "Скорость",
    desc: "Доставка за 30 минут в пределах города. Никаких пробок и задержек.",
  },
  {
    icon: ShieldCheck,
    title: "Надёжность",
    desc: "GPS-трекинг в реальном времени и страховка каждой посылки.",
  },
  {
    icon: Banknote,
    title: "Выгодная стоимость",
    desc: "Дешевле традиционных курьеров до 40%. Прозрачное ценообразование.",
  },
  {
    icon: Leaf,
    title: "Экологичность",
    desc: "Нулевые выбросы CO₂. Заботимся о планете вместе с вами.",
  },
];

const steps = [
  {
    icon: ClipboardList,
    num: "01",
    title: "Оформите заказ",
    desc: "Заполните заявку на сайте или в мобильном приложении.",
  },
  {
    icon: Package,
    num: "02",
    title: "Дрон забирает посылку",
    desc: "Наш дрон прибывает по указанному адресу и забирает груз.",
  },
  {
    icon: MapPin,
    num: "03",
    title: "Доставка к вашей двери",
    desc: "Посылка доставляется прямо к получателю — быстро и аккуратно.",
  },
];

const reviews = [
  {
    name: "Алексей М.",
    text: "Заказал доставку документов — дрон прилетел через 20 минут! Невероятный сервис, буду пользоваться постоянно.",
    rating: 5,
  },
  {
    name: "Екатерина С.",
    text: "Удобно, быстро и недорого. Отслеживала посылку в реальном времени. Очень довольна!",
    rating: 5,
  },
  {
    name: "Дмитрий К.",
    text: "Приятно, что сервис экологичный. Качество доставки на высоте, рекомендую всем.",
    rating: 4,
  },
];

const REQUESTS_STORAGE_KEY = "lintu_requests";
type RequestStatus = "Новая" | "Отменена" | "Заказ сформирован";

const Index = () => {
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [gameDialogOpen, setGameDialogOpen] = useState(false);
  const [gameFrameKey, setGameFrameKey] = useState(0);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingResult, setTrackingResult] = useState<null | { status: string; time: string }>(null);

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";

    const normalized = digits.startsWith("8") ? `7${digits.slice(1)}` : digits;
    const national = normalized.startsWith("7") ? normalized.slice(1, 11) : normalized.slice(0, 10);

    let formatted = "+7";
    if (national.length > 0) formatted += ` (${national.slice(0, 3)}`;
    if (national.length >= 4) formatted += `) ${national.slice(3, 6)}`;
    if (national.length >= 7) formatted += `-${national.slice(6, 8)}`;
    if (national.length >= 9) formatted += `-${national.slice(8, 10)}`;

    return formatted;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newRequest = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      status: "Новая" as RequestStatus,
    };

    const stored = localStorage.getItem(REQUESTS_STORAGE_KEY);
    const requests = stored ? (JSON.parse(stored) as typeof newRequest[]) : [];
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify([newRequest, ...requests]));

    toast({
      title: "Заявка отправлена!",
      description: "Мы свяжемся с вами в ближайшее время.",
    });
    setForm({ name: "", phone: "", email: "" });
  };

  const handleOpenGamePreview = () => {
    setGameDialogOpen(true);
  };

  const handleGameDialogChange = (open: boolean) => {
    setGameDialogOpen(open);
    if (!open) {
      // Force iframe remount on close to reset game state.
      setGameFrameKey((prev) => prev + 1);
    }
  };

  const scrollTo = (href: string) => {
    setMobileMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] text-foreground">
      {/* ===== NAVIGATION ===== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <a href="#" className="text-2xl font-bold tracking-tight text-primary">
            Lintu
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {l.label}
              </button>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setTrackingDialogOpen(true)}>
              Отследить заказ
            </Button>
            <Button size="sm" onClick={() => scrollTo("#contact")}>
              Вызвать дрон
            </Button>
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Меню"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-border bg-background px-4 pb-4 flex flex-col gap-3">
            {navLinks.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                className="text-sm text-muted-foreground hover:text-foreground text-left py-2"
              >
                {l.label}
              </button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                setMobileMenuOpen(false);
                setTrackingDialogOpen(true);
              }}
            >
              Отследить заказ
            </Button>
            <Button size="sm" className="w-full" onClick={() => scrollTo("#contact")}>
              Заказать доставку
            </Button>
          </nav>
        )}
      </header>

      {/* ===== HERO ===== */}
      <section className="bg-[#fafbfc] pt-20 pb-24 md:pt-24 md:pb-32 px-4 overflow-hidden">
        <div className="container mx-auto text-center max-w-3xl">
          <ScrollReveal>
            <img
              src={droneHero}
              alt="Дрон в полёте"
              width={400}
              height={300}
              className="mx-auto -mb-3 w-52 md:w-72 object-contain select-none"
            />
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-4">
              Доставка дронами —{" "}
              <span className="text-primary">быстро</span> и{" "}
              <span className="text-accent">удобно</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={2}>
            <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              Lintu — современный сервис доставки грузов с помощью автономных дронов.
              Забудьте о пробках и долгом ожидании.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={3}>
            <Button size="lg" className="text-base px-8 py-6 shadow-lg" onClick={() => scrollTo("#contact")}>
              Заказать доставку
            </Button>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== ADVANTAGES ===== */}
      <section id="advantages" className="py-24 md:py-32 px-4 bg-[#fafbfc]">
        <div className="container mx-auto max-w-5xl">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Почему Lintu?</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
              Мы объединяем передовые технологии и заботу о клиентах
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((a, i) => (
              <ScrollReveal key={a.title} delay={(i % 4) as 0 | 1 | 2 | 3}>
                <Card className="border-none shadow-md hover:shadow-lg transition-shadow bg-card h-full">
                  <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <a.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">{a.title}</h3>
                    <p className="text-sm text-muted-foreground">{a.desc}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" className="py-24 md:py-32 px-4 bg-[#fafbfc]">
        <div className="container mx-auto max-w-4xl">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Как это работает</h2>
            <p className="text-center text-muted-foreground mb-14 max-w-xl mx-auto">
              Три простых шага до получения посылки
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map((s, i) => (
              <ScrollReveal key={s.num} delay={(i % 4) as 0 | 1 | 2 | 3}>
                <div className="flex flex-col items-center text-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
                      <s.icon className="h-9 w-9 text-accent" />
                    </div>
                    <span className="absolute -top-2 -right-2 text-xs font-bold bg-accent text-accent-foreground w-7 h-7 rounded-full flex items-center justify-center">
                      {s.num}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground max-w-xs">{s.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DELIVERY GAME PREVIEW ===== */}
      <section id="game-preview" className="py-24 md:py-32 px-4 bg-[#fafbfc]">
        <div className="container mx-auto max-w-5xl">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Мини-игра: доставка дроном</h2>
            <p className="text-center text-muted-foreground mb-0 max-w-2xl mx-auto">
              Попробуйте, как работает доставка в формате игры. Управляйте дроном, облетайте препятствия и
              доставьте заказ до точки назначения.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={1} className="mt-0">
            <div
              className="relative mx-auto min-h-[280px] max-w-5xl overflow-hidden rounded-2xl bg-center bg-no-repeat max-sm:bg-[length:100%_auto] sm:bg-cover sm:min-h-[340px]"
              style={{ backgroundImage: "url(/images/background-game1.png)" }}
            >
              {/* Явная «коробка» под дрон: иначе flex-1 схлопывается по высоте картинки и justify-end не работает */}
              <div className="absolute inset-x-6 bottom-8 top-12 flex items-end justify-center sm:inset-x-10 sm:bottom-10 sm:top-14">
                <img
                  src="/images/friendly-drone.png"
                  alt="Иллюстрация дрона Lintu"
                  width={360}
                  height={270}
                  className="game-preview-drone w-52 object-contain object-bottom select-none sm:w-64 md:w-72"
                />
              </div>
            </div>
            <div className="mt-0 flex justify-center">
              <Button size="lg" className="min-w-36" onClick={handleOpenGamePreview}>
                Играть
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== REVIEWS ===== */}
      <section id="reviews" className="py-24 md:py-32 px-4 bg-[#fafbfc]">
        <div className="container mx-auto max-w-5xl">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Отзывы клиентов</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
              Нам доверяют тысячи пользователей
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((r, i) => (
              <ScrollReveal key={r.name} delay={(i % 4) as 0 | 1 | 2 | 3}>
                <Card className="border-none shadow-md bg-card h-full">
                  <CardContent className="p-6 flex flex-col gap-4">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star
                          key={j}
                          className={`h-4 w-4 ${j < r.rating ? "fill-accent text-accent" : "text-border"}`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">«{r.text}»</p>
                    <p className="font-semibold text-sm mt-auto">{r.name}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CONTACT FORM ===== */}
      <section id="contact" className="py-24 md:py-32 px-4 bg-[#fafbfc]">
        <ScrollReveal>
          <div className="container mx-auto max-w-lg">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Оставьте заявку</h2>
            <p className="text-center text-muted-foreground mb-10">
              Мы свяжемся с вами и обсудим детали доставки
            </p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <Input
                  id="name"
                  placeholder="Ваше имя"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: formatPhoneNumber(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="mail@example.com"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <Button type="submit" size="lg" className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Отправить заявку
              </Button>
            </form>
          </div>
        </ScrollReveal>
      </section>

      <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl md:text-3xl">Отследить заказ</DialogTitle>
            <DialogDescription>Введите номер заказа, чтобы узнать его статус</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="Например, LNT-20260401"
              value={trackingNumber}
              onChange={(e) => {
                setTrackingNumber(e.target.value);
                setTrackingResult(null);
              }}
              className="w-full"
            />
            <Button
              onClick={() => {
                if (trackingNumber.trim()) {
                  setTrackingResult({ status: "В полёте", time: "15 минут" });
                }
              }}
              className="w-full sm:w-auto sm:shrink-0"
            >
              <Search className="mr-2 h-4 w-4" />
              Отследить
            </Button>
          </div>

          {trackingResult && (
            <Card className="border-none shadow-md bg-card">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Plane className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    Статус: <span className="text-primary">{trackingResult.status}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">Ожидаемое время доставки — {trackingResult.time}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={gameDialogOpen} onOpenChange={handleGameDialogChange}>
        <DialogPortal>
          <DialogOverlay />
          <div className="fixed inset-0 z-50 flex items-stretch justify-center px-4 py-2 sm:py-8">
            <div className="relative flex w-full max-w-[440px] flex-col">
              {/* Крестик над игрой на мобильных — закреплён в потоке */}
              <div className="flex justify-end sm:hidden">
                <DialogClose asChild>
                  <button
                    type="button"
                    aria-label="Закрыть мини-игру"
                    className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </DialogClose>
              </div>

              {/* Крестик сбоку на десктопе */}
              <DialogClose asChild>
                <button
                  type="button"
                  aria-label="Закрыть мини-игру"
                  className="absolute right-0 top-0 z-[60] hidden translate-x-[120%] rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground sm:block"
                >
                  <X className="h-6 w-6" />
                </button>
              </DialogClose>

              {/* Игра — заполняет доступное место */}
              <div className="min-h-0 w-full flex-1">
                <iframe
                  key={gameFrameKey}
                  src="https://mad-zhuzh.github.io/Lintu-Delivery-Game/?embed=true"
                  title="Мини-игра Lintu Delivery"
                  className="block h-full w-full border-0"
                  scrolling="no"
                />
              </div>

              {/* Ссылка под игрой — без подложки */}
              <div className="shrink-0 pt-2 text-center sm:pt-3">
                <button
                  type="button"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary hover:underline"
                  onClick={() => {
                    handleGameDialogChange(false);
                    setTimeout(() => scrollTo("#contact"), 0);
                  }}
                >
                  Оформить доставку →
                </button>
              </div>
            </div>
          </div>
        </DialogPortal>
      </Dialog>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border bg-card py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Brand */}
            <div>
              <p className="text-2xl font-bold text-primary mb-3">Lintu</p>
              <p className="text-sm text-muted-foreground">
                Доставка грузов дронами нового поколения.
              </p>
            </div>

            {/* Contacts */}
            <div>
              <p className="font-semibold mb-3">Контакты</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" /> +7 (800) 123-45-67
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" /> info@lintu.delivery
                </li>
              </ul>
            </div>

            {/* Links */}
            <div>
              <p className="font-semibold mb-3">Приложение</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Скачать в App Store
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Скачать в Google Play
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-border text-xs text-muted-foreground">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p>© {new Date().getFullYear()} Lintu. Все права защищены.</p>
              <div className="flex gap-4">
                <a href="#" className="hover:text-foreground transition-colors">
                  Политика конфиденциальности
                </a>
                <a href="#" className="hover:text-foreground transition-colors">
                  Оферта
                </a>
              </div>
            </div>
            <div className="mt-3 flex justify-center md:justify-end">
              <a
                href="/admin"
                className="text-muted-foreground/50 underline underline-offset-2 hover:text-foreground transition-colors"
              >
                Вход для сотрудников
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
