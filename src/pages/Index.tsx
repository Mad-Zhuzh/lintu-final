import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
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
  Menu,
  X,
  Search,
  Plane,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
    title: "Выгодная цена",
    desc: "Дешевле обычных курьеров до 40%. Прозрачное ценообразование.",
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

type RequestForm = { name: string; phone: string; email: string };
type RequestFormField = keyof RequestForm;
type RequestFormErrors = Partial<Record<RequestFormField, string>>;

const heroBackgroundMetrics = {
  width: 1915,
  height: 821,
  horizonY: 614,
};

const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [gameDialogOpen, setGameDialogOpen] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameFrameKey, setGameFrameKey] = useState(0);
  const [form, setForm] = useState<RequestForm>({ name: "", phone: "", email: "" });
  const [formErrors, setFormErrors] = useState<RequestFormErrors>({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccessDialogOpen, setFormSuccessDialogOpen] = useState(false);
  const [formSubmitError, setFormSubmitError] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingResult, setTrackingResult] = useState<null | { status: string; time: string }>(null);
  const [heroCtaVisible, setHeroCtaVisible] = useState(true);
  const [contactFormFullyVisible, setContactFormFullyVisible] = useState(false);
  const [heroBackgroundStyle, setHeroBackgroundStyle] = useState<React.CSSProperties>({});
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const heroCtaRef = useRef<HTMLButtonElement | null>(null);
  const headerCtaRef = useRef<HTMLButtonElement | null>(null);
  const contactFormRef = useRef<HTMLFormElement | null>(null);
  const gameIframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        setHeroCtaVisible(entry.isIntersecting);
      },
      { rootMargin: "-72px 0px 0px 0px", threshold: 0 },
    );

    const contactObserver = new IntersectionObserver(
      ([entry]) => setContactFormFullyVisible(entry.intersectionRatio >= 0.99),
      { threshold: [0.99, 1] },
    );

    if (heroCtaRef.current) heroObserver.observe(heroCtaRef.current);
    if (contactFormRef.current) contactObserver.observe(contactFormRef.current);

    return () => {
      heroObserver.disconnect();
      contactObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const updateHeroBackground = () => {
      const hero = heroSectionRef.current;
      const heroCta = heroCtaRef.current;

      if (window.innerWidth < 1280 || !hero || !heroCta) {
        setHeroBackgroundStyle({});
        return;
      }

      const heroRect = hero.getBoundingClientRect();
      const ctaRect = heroCta.getBoundingClientRect();
      const ctaCenterY = ctaRect.top - heroRect.top + ctaRect.height / 2;
      const coverScale = Math.max(
        heroRect.width / heroBackgroundMetrics.width,
        heroRect.height / heroBackgroundMetrics.height,
      );
      const ctaAlignedScale = ctaCenterY / heroBackgroundMetrics.horizonY;
      const scale = Math.max(coverScale, ctaAlignedScale);
      const scaledHeight = heroBackgroundMetrics.height * scale;
      const desiredTop = ctaCenterY - heroBackgroundMetrics.horizonY * scale;
      const top = Math.min(0, Math.max(heroRect.height - scaledHeight, desiredTop));

      setHeroBackgroundStyle({
        backgroundSize: `${heroBackgroundMetrics.width * scale}px ${scaledHeight}px`,
        backgroundPosition: `center ${top}px`,
      });
    };

    const animationFrame = window.requestAnimationFrame(updateHeroBackground);
    const settledLayoutTimeout = window.setTimeout(updateHeroBackground, 700);
    window.addEventListener("resize", updateHeroBackground);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(settledLayoutTimeout);
      window.removeEventListener("resize", updateHeroBackground);
    };
  }, []);

  const showHeaderCta = !heroCtaVisible && !contactFormFullyVisible;

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

  const validateFormField = (field: RequestFormField, value: string) => {
    if (field === "name") return value.trim() ? undefined : "Введите имя";
    if (field === "phone") {
      const digits = value.replace(/\D/g, "");
      return digits.length === 11 && digits.startsWith("7") ? undefined : "Введите номер телефона в формате +7 (***) ***-**-**";
    }
    if (!value.trim()) return undefined;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
      ? undefined
      : "Введите email в формате name@example.com";
  };

  const updateFormField = (field: RequestFormField, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFormSubmitError(false);
    setFormErrors((current) => {
      if (!current[field]) return current;
      const error = validateFormField(field, value);
      const next = { ...current };
      if (error) next[field] = error;
      else delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = (Object.keys(form) as RequestFormField[]).reduce<RequestFormErrors>((current, field) => {
      const error = validateFormField(field, form[field]);
      if (error) current[field] = error;
      return current;
    }, {});

    setFormErrors(errors);
    setFormSubmitError(false);
    if (Object.keys(errors).length > 0) return;

    setFormSubmitting(true);

    const { error } = await supabase.from("requests").insert({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
    });

    if (error) {
      console.error("Unable to submit request", error);
      setFormSubmitError(true);
      setFormSubmitting(false);
      return;
    }

    setFormSubmitting(false);
    setForm({ name: "", phone: "", email: "" });
    setFormErrors({});
    setFormSuccessDialogOpen(true);
  };

  const handleOpenGamePreview = () => {
    setGameWon(false);
    setGameDialogOpen(true);
  };

  const handleGameDialogChange = (open: boolean) => {
    setGameDialogOpen(open);
    if (open) {
      setGameWon(false);
      return;
    }

    setGameWon(false);
    // Force iframe remount on close to reset game state.
    setGameFrameKey((prev) => prev + 1);
  };

  const scrollTo = (href: string) => {
    setMobileMenuOpen(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
  };

  const closeGameAndScrollToOrderForm = () => {
    handleGameDialogChange(false);
    window.setTimeout(() => scrollTo("#contact"), 0);
  };

  useEffect(() => {
    const handleGameMessage = (event: MessageEvent) => {
      if (event.source !== gameIframeRef.current?.contentWindow) {
        return;
      }

      if (event.data?.type === "lintu:game-won") {
        setGameWon(true);
        return;
      }

      if (event.data?.type === "lintu:open-order-form") {
        closeGameAndScrollToOrderForm();
      }
    };

    window.addEventListener("message", handleGameMessage);
    return () => window.removeEventListener("message", handleGameMessage);
  }, []);

  return (
    <div className="min-h-screen bg-[#fafbfc] text-foreground">
      {/* ===== NAVIGATION ===== */}
      <header className="public-header fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/30">
        <div className="relative flex h-16 w-full items-center px-4 sm:px-6 lg:px-6 xl:px-[clamp(24px,4vw,80px)]">
          <a href="#" className="text-3xl font-bold tracking-tight text-primary">
            Lintu
          </a>

          {/* Desktop nav */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Button
              ref={headerCtaRef}
              size="lg"
              aria-hidden={!showHeaderCta}
              tabIndex={showHeaderCta ? 0 : -1}
              className={`px-4 py-6 text-sm shadow-lg transition-[opacity,transform] duration-200 ease-out sm:px-5 sm:text-base lg:px-2 xl:px-8 ${showHeaderCta ? "translate-y-0 opacity-100" : contactFormFullyVisible ? "-translate-y-2 opacity-0 pointer-events-none" : "translate-y-2 opacity-0 pointer-events-none"}`}
              onClick={() => scrollTo("#contact")}
            >
              <span className="xl:hidden">Заказать</span>
              <span className="hidden xl:inline">Заказать доставку</span>
            </Button>
          </div>

          <nav className="ml-auto hidden shrink-0 items-center gap-2 whitespace-nowrap lg:flex xl:gap-6">
            {navLinks.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {l.label}
              </button>
            ))}
            <Button variant="ghost" size="sm" className="lg:px-1 xl:px-3" onClick={() => setTrackingDialogOpen(true)}>
              Отследить заказ
            </Button>
          </nav>

          {/* Mobile toggle */}
          <button
            className="ml-auto justify-self-end p-2 text-foreground lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Меню"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav className="absolute right-4 top-full z-50 flex w-max max-w-[calc(100vw-2rem)] flex-col items-center gap-3 border border-border bg-background px-4 py-4 shadow-lg sm:right-6 lg:hidden">
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
          </nav>
        )}
      </header>

      {/* ===== HERO ===== */}
      <section
        ref={heroSectionRef}
        className="relative mt-16 pt-4 pb-24 md:min-h-[calc(100svh-4rem)] md:py-8 md:flex md:items-center px-4 overflow-hidden"
      >
        <div
          aria-hidden="true"
          className="hero-background pointer-events-none absolute inset-0 bg-cover bg-top bg-no-repeat"
        style={{
          "--hero-background-ultrawide": `url(${import.meta.env.BASE_URL}images/hero-background.png)`,
          ...heroBackgroundStyle,
        } as React.CSSProperties}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[180px]"
          style={{
            backgroundImage:
              "linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.7) 20%, rgba(255, 255, 255, 0.25) 55%, rgba(255, 255, 255, 0) 100%)",
          }}
        />
        <div className="relative z-10 container w-full mx-auto translate-y-5 text-center max-w-5xl">
          <ScrollReveal delay={1}>
            <h1 className="hero-title mb-8 font-extrabold tracking-tight leading-none">
              <span className="block bg-gradient-to-br from-[#111216] to-[#49413B] bg-clip-text text-[clamp(2.5rem,5.5vw,4.75rem)] text-transparent">
                Доставка дронами
              </span>
              <span className="mt-3 block bg-gradient-to-br from-[#eb7000] to-accent bg-clip-text pb-1 text-[clamp(2rem,3vw,2.7rem)] leading-[1.15] text-transparent">
                Быстро и удобно
              </span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={2}>
            <p className="relative isolate mb-24 max-w-2xl mx-auto text-lg text-foreground/75 before:pointer-events-none before:absolute before:-inset-x-12 before:-inset-y-8 before:-z-10 before:content-[''] before:bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0.42)_46%,transparent_76%)] md:text-xl">
              Lintu — доставка для тех, кто ценит скорость и не хочет ждать.
              <br />
              Дроны привозят посылки напрямую — быстрее, чем курьеры.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={3}>
            <div className="flex translate-y-2.5 flex-col items-center gap-4">
              <Button ref={heroCtaRef} size="lg" className="text-base px-8 py-6 shadow-lg" onClick={() => scrollTo("#contact")}>
                Заказать доставку
              </Button>
              <button
                type="button"
                className="text-base text-muted-foreground transition-colors hover:text-foreground hover:underline underline-offset-4"
                onClick={() => scrollTo("#game-preview")}
              >
                ... или доставить самостоятельно →
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== ADVANTAGES ===== */}
      <section id="advantages" className="py-24 md:py-32 px-4 bg-[linear-gradient(to_bottom,#fafbfc_0%,#EDF5FF_50%,#fafbfc_100%)]">
        <div className="container mx-auto max-w-5xl">
          <ScrollReveal>
            <h2 className="section-title text-3xl md:text-4xl text-center mb-4">Почему Lintu?</h2>
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
      <section id="how" className="py-24 md:py-32 px-4 bg-[linear-gradient(to_bottom,#fafbfc_0%,#F1F7FD_50%,#fafbfc_100%)]">
        <div className="container mx-auto max-w-4xl">
          <ScrollReveal>
            <h2 className="section-title text-3xl md:text-4xl text-center mb-4">Как это работает</h2>
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
            <h2 className="section-title text-3xl md:text-4xl text-center mb-4">Мини-игра: доставка дроном</h2>
            <p className="text-center text-muted-foreground mb-0 max-w-2xl mx-auto">
              Попробуйте, как работает доставка в формате игры. Управляйте дроном, облетайте препятствия и
              доставьте заказ до точки назначения.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={1} className="mt-0">
            <div
              className="relative mx-auto min-h-[280px] max-w-5xl overflow-hidden rounded-2xl bg-center bg-no-repeat before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:z-10 before:w-10 before:bg-gradient-to-r before:from-[#fafbfc] before:to-transparent before:content-[''] after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:z-10 after:w-10 after:bg-gradient-to-l after:from-[#fafbfc] after:to-transparent after:content-[''] max-sm:bg-[length:100%_auto] sm:bg-cover sm:min-h-[340px]"
              style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/background-game1.png)` }}
            >
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-[#fafbfc] to-transparent" />
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-[#fafbfc] to-transparent" />
              {/* Явная «коробка» под дрон: иначе flex-1 схлопывается по высоте картинки и justify-end не работает */}
              <div className="absolute inset-x-6 bottom-8 top-12 flex items-end justify-center sm:inset-x-10 sm:bottom-10 sm:top-14">
                <img
                  src={`${import.meta.env.BASE_URL}images/friendly-drone.png`}
                  alt="Иллюстрация дрона Lintu"
                  width={360}
                  height={270}
                  className="game-preview-drone w-52 object-contain object-bottom select-none sm:w-64 md:w-72"
                />
              </div>
            </div>
            <div className="mt-0 flex justify-center">
              <Button
                size="lg"
                className="min-w-36 bg-accent/10 text-base font-medium text-[#ff7a00] hover:bg-accent hover:text-accent-foreground hover:brightness-100"
                onClick={handleOpenGamePreview}
              >
                Играть
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== REVIEWS ===== */}
      <section id="reviews" className="py-24 md:py-32 px-4 bg-[linear-gradient(to_bottom,#fafbfc_0%,#F4F8FC_50%,#fafbfc_100%)]">
        <div className="container mx-auto max-w-5xl">
          <ScrollReveal>
            <h2 className="section-title text-3xl md:text-4xl text-center mb-4">Отзывы клиентов</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
              Нам доверяют тысячи пользователей
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((r, i) => (
              <ScrollReveal key={r.name} delay={(i % 4) as 0 | 1 | 2 | 3} className="h-full">
                <Card className="border-none shadow-md bg-card h-full">
                  <CardContent className="p-6 flex h-full flex-col gap-4">
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
            <h2 className="section-title text-3xl md:text-4xl text-center mb-4">Оставьте заявку</h2>
            <p className="text-center text-muted-foreground mb-10">
              Мы свяжемся с вами и обсудим детали доставки
            </p>
            <form ref={contactFormRef} noValidate onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Имя *</Label>
                  <Input
                    id="name"
                    placeholder="Ваше имя"
                    required
                    value={form.name}
                    aria-invalid={Boolean(formErrors.name)}
                    aria-describedby={formErrors.name ? "name-error" : undefined}
                    className={formErrors.name ? "border-destructive focus-visible:ring-destructive" : undefined}
                    onChange={(e) => updateFormField("name", e.target.value)}
                  />
                  {formErrors.name && <p id="name-error" className="text-sm text-destructive">{formErrors.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Телефон *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+7 (___) ___-__-__"
                    required
                    value={form.phone}
                    aria-invalid={Boolean(formErrors.phone)}
                    aria-describedby={formErrors.phone ? "phone-error" : undefined}
                    className={formErrors.phone ? "border-destructive focus-visible:ring-destructive" : undefined}
                    onChange={(e) => updateFormField("phone", formatPhoneNumber(e.target.value))}
                  />
                  {formErrors.phone && <p id="phone-error" className="text-sm text-destructive">{formErrors.phone}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="mail@example.com"
                    value={form.email}
                    aria-invalid={Boolean(formErrors.email)}
                    aria-describedby={formErrors.email ? "email-error" : undefined}
                    className={formErrors.email ? "border-destructive focus-visible:ring-destructive" : undefined}
                    onChange={(e) => updateFormField("email", e.target.value)}
                  />
                  {formErrors.email && <p id="email-error" className="text-sm text-destructive">{formErrors.email}</p>}
                </div>
                {formSubmitError && <p role="alert" className="text-sm text-destructive">Не удалось отправить заявку. Попробуйте ещё раз.</p>}
                <Button type="submit" size="lg" className="w-full" disabled={formSubmitting}>{formSubmitting ? "Отправляем…" : "Отправить заявку"}</Button>
            </form>
          </div>
        </ScrollReveal>
      </section>

      <Dialog open={formSuccessDialogOpen} onOpenChange={setFormSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Заявка отправлена <span className="text-primary">✓</span></DialogTitle>
            <DialogDescription>Мы свяжемся с вами в ближайшее время.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setFormSuccessDialogOpen(false)}>Закрыть</Button>
          </div>
        </DialogContent>
      </Dialog>

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
          <DialogOverlay className="!bg-white !opacity-100 !backdrop-blur-none" />
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
                  ref={gameIframeRef}
                  key={gameFrameKey}
                  src="https://mad-zhuzh.github.io/Lintu-Delivery-Game/?embed=true"
                  title="Мини-игра Lintu Delivery"
                  className="block h-full w-full border-0"
                  scrolling="no"
                />
              </div>

              {/* Ссылка под игрой — без подложки, лёгкий текстовый ореол для читаемости на тёмном фоне */}
              {!gameWon && (
                <div className="shrink-0 pt-2 text-center sm:pt-3">
                  <button
                    type="button"
                    className="text-sm text-foreground transition-colors [text-shadow:0_0_1px_rgb(255_255_255),0_0_4px_rgb(255_255_255/0.95),0_0_10px_rgb(255_255_255/0.85),0_0_20px_rgb(255_255_255/0.55)] hover:text-primary hover:underline"
                    onClick={closeGameAndScrollToOrderForm}
                  >
                    Оформить доставку →
                  </button>
                </div>
              )}
            </div>
          </div>
        </DialogPortal>
      </Dialog>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-border bg-card py-12 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_auto_auto] md:gap-x-16">
            {/* Brand */}
            <div className="md:flex md:h-full md:flex-col">
              <p className="text-4xl font-bold text-primary mb-3">Lintu</p>
              <p className="text-sm text-muted-foreground md:mt-auto">
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
              <Link
                to="/admin"
                className="text-muted-foreground/50 underline underline-offset-2 hover:text-foreground transition-colors"
              >
                Вход для сотрудников
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
