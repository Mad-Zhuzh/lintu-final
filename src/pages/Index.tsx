import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  { label: "Контакты", href: "#contact" },
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

const Index = () => {
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingResult, setTrackingResult] = useState<null | { status: string; time: string }>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Заявка отправлена!",
      description: "Мы свяжемся с вами в ближайшее время.",
    });
    setForm({ name: "", phone: "", email: "" });
  };

  const scrollTo = (href: string) => {
    setMobileMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
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
            <Button size="sm" onClick={() => scrollTo("#contact")}>
              Заказать доставку
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
            <Button size="sm" className="w-full" onClick={() => scrollTo("#contact")}>
              Заказать доставку
            </Button>
          </nav>
        )}
      </header>

      {/* ===== HERO ===== */}
      <section className="pt-20 pb-10 md:pt-24 md:pb-16 px-4 overflow-hidden">
        <div className="container mx-auto text-center max-w-3xl">
          <img
            src={droneHero}
            alt="Дрон в полёте"
            width={400}
            height={300}
            className="mx-auto mb-4 w-40 md:w-56 object-contain select-none"
          />
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-4">
            Доставка дронами —{" "}
            <span className="text-primary">быстро</span> и{" "}
            <span className="text-accent">удобно</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            Lintu — современный сервис доставки грузов с помощью автономных дронов.
            Забудьте о пробках и долгом ожидании.
          </p>
          <Button size="lg" className="text-base px-8 py-6 shadow-lg" onClick={() => scrollTo("#contact")}>
            Заказать доставку
          </Button>
        </div>
      </section>

      {/* ===== ADVANTAGES ===== */}
      <section id="advantages" className="py-20 px-4 bg-secondary/50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Почему Lintu?</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Мы объединяем передовые технологии и заботу о клиентах
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {advantages.map((a) => (
              <Card
                key={a.title}
                className="border-none shadow-md hover:shadow-lg transition-shadow bg-card"
              >
                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <a.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{a.title}</h3>
                  <p className="text-sm text-muted-foreground">{a.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how" className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Как это работает</h2>
          <p className="text-center text-muted-foreground mb-14 max-w-xl mx-auto">
            Три простых шага до получения посылки
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map((s) => (
              <div key={s.num} className="flex flex-col items-center text-center gap-4">
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
            ))}
          </div>
        </div>
      </section>

      {/* ===== REVIEWS ===== */}
      <section id="reviews" className="py-20 px-4 bg-secondary/50">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Отзывы клиентов</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Нам доверяют тысячи пользователей
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((r) => (
              <Card key={r.name} className="border-none shadow-md bg-card">
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < r.rating ? "fill-accent text-accent" : "text-border"}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">«{r.text}»</p>
                  <p className="font-semibold text-sm mt-auto">{r.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TRACKING ===== */}
      <section id="tracking" className="py-20 px-4">
        <div className="container mx-auto max-w-lg">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Отследить заказ</h2>
          <p className="text-center text-muted-foreground mb-10">
            Введите номер заказа, чтобы узнать его статус
          </p>
          <div className="flex gap-3">
            <Input
              placeholder="Например, LNT-20260401"
              value={trackingNumber}
              onChange={(e) => {
                setTrackingNumber(e.target.value);
                setTrackingResult(null);
              }}
            />
            <Button
              onClick={() => {
                if (trackingNumber.trim()) {
                  setTrackingResult({ status: "В полёте", time: "15 минут" });
                }
              }}
              className="shrink-0"
            >
              <Search className="mr-2 h-4 w-4" />
              Отследить
            </Button>
          </div>
          {trackingResult && (
            <Card className="mt-6 border-none shadow-md bg-card">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Plane className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    Статус: <span className="text-primary">{trackingResult.status}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ожидаемое время доставки — {trackingResult.time}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* ===== CONTACT FORM ===== */}
      <section id="contact" className="py-20 px-4">
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
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
      </section>

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

          <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
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
        </div>
      </footer>
    </div>
  );
};

export default Index;
