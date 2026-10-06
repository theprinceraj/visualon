import Lenis from "lenis";

type Currency = "INR" | "USD";
type Pkg = {
  id: string;
  name: string;
  sub: string;
  price: Record<Currency, number>;
  delivery: string;
  includes: string[];
  formats: string[];
  dodo: Record<Currency, string>;
};

const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];
// Navigation goes through one place so checkout/mailto hand-offs can be observed in tests.
const go = (url: string) => {
  const hook = (window as unknown as { __voGo?: (u: string) => void }).__voGo;
  if (hook) hook(url);
  else location.href = url;
};
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const store = {
  get: (k: string) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {}
  },
};

// ---------- smooth scroll ----------
let lenis: Lenis | null = null;
if (!reduced) {
  lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
  const raf = (t: number) => {
    lenis!.raf(t);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
}
const scrollTo = (target: string | HTMLElement) => {
  const el = typeof target === "string" ? $(target) : target;
  if (!el) return false;
  if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.4 });
  else el.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  return true;
};
document.addEventListener("click", (e) => {
  const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href*='#']");
  if (!a) return;
  const url = new URL(a.href);
  if (url.pathname.replace(/\/$/, "") !== location.pathname.replace(/\/$/, "") || !url.hash) return;
  if (scrollTo(url.hash)) {
    e.preventDefault();
    closeMenu();
    history.replaceState(null, "", url.hash);
  }
});
if (location.hash) addEventListener("load", () => setTimeout(() => scrollTo(location.hash), 50));

// pages without the hero loader are "loaded" immediately
if (!$(".hero-canvas")) document.body.classList.add("loaded");

// ---------- mobile menu ----------
const burger = $<HTMLButtonElement>(".burger");
const menu = $("#mobile-menu");
function closeMenu() {
  if (!menu || menu.hidden) return;
  menu.hidden = true;
  burger?.setAttribute("aria-expanded", "false");
  lenis?.start();
}
burger?.addEventListener("click", () => {
  if (!menu) return;
  const open = menu.hidden;
  menu.hidden = !open;
  burger.setAttribute("aria-expanded", String(open));
  open ? lenis?.stop() : lenis?.start();
});
menu?.addEventListener("click", (e) => {
  if ((e.target as HTMLElement).closest("a")) closeMenu();
});

// ---------- reveal on scroll ----------
const io = new IntersectionObserver(
  (entries) =>
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        io.unobserve(en.target);
      }
    }),
  { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
);
$$("[data-reveal]").forEach((el, i) => {
  (el as HTMLElement).style.transitionDelay = `${Math.min((i % 6) * 60, 300)}ms`;
  io.observe(el);
});

// ---------- videos: play only when visible / hovered ----------
const playIO = new IntersectionObserver((entries) =>
  entries.forEach((en) => {
    const v = en.target as HTMLVideoElement;
    if (en.isIntersecting) v.play().catch(() => {});
    else v.pause();
  }),
);
$$<HTMLVideoElement>("video[data-inview-play]").forEach((v) => playIO.observe(v));

const canHover = matchMedia("(hover: hover)").matches;
$$("[data-hoverplay]").forEach((card) => {
  const v = $<HTMLVideoElement>("video", card);
  if (!v) return;
  if (canHover) {
    card.addEventListener("mouseenter", () => v.play().catch(() => {}));
    card.addEventListener("mouseleave", () => v.pause());
  } else playIO.observe(v);
});

// work list: hovering a row swaps the preview
const preview = $<HTMLAnchorElement>("[data-preview]");
if (preview) {
  const vids = $$<HTMLVideoElement>("video", preview);
  const title = $("[data-pv-title]", preview);
  const line = $("[data-pv-line]", preview);
  const show = (row: HTMLElement) => {
    const slug = row.dataset.row!;
    vids.forEach((v) => {
      const on = v.dataset.slug === slug;
      v.classList.toggle("on", on);
      if (on) {
        if (v.preload === "none") v.preload = "auto";
        v.play().catch(() => {});
      } else v.pause();
    });
    preview.href = `/work/${slug}`;
    if (title) title.textContent = row.dataset.title ?? "";
    if (line) line.textContent = row.dataset.line ?? "";
  };
  $$("[data-row]").forEach((row) => {
    row.addEventListener("mouseenter", () => show(row));
    row.addEventListener("focus", () => show(row));
  });
  playIO.observe(vids[0]);
  new IntersectionObserver(([en]) => {
    const on = vids.find((v) => v.classList.contains("on"));
    if (!on) return;
    en.isIntersecting ? on.play().catch(() => {}) : on.pause();
  }).observe(preview);
}

// ---------- chip groups ----------
$$("[data-group]").forEach((group) => {
  group.addEventListener("click", (e) => {
    const chip = (e.target as HTMLElement).closest<HTMLButtonElement>("button.chip");
    if (!chip) return;
    const multi = group.hasAttribute("data-multi");
    const was = chip.getAttribute("aria-pressed") === "true";
    if (!multi) $$("button.chip", group).forEach((c) => c.setAttribute("aria-pressed", "false"));
    chip.setAttribute("aria-pressed", String(!was));
  });
});
const picked = (root: ParentNode, name: string) =>
  $$<HTMLButtonElement>(`[data-group="${name}"] button[aria-pressed="true"]`, root).map((b) => b.dataset.value!);

// ---------- currency ----------
const guessCurrency = (): Currency => {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  return /Asia\/(Kolkata|Calcutta)/.test(tz) ? "INR" : "USD";
};
let currency: Currency = (store.get("vo-currency") as Currency) || guessCurrency();
const fmt = (n: number, c: Currency) => (c === "INR" ? "₹" : "$") + n.toLocaleString(c === "INR" ? "en-IN" : "en-US");
const applyCurrency = () => {
  $$("[data-price]").forEach((el) => {
    const n = Number(currency === "INR" ? el.dataset.inr : el.dataset.usd);
    el.textContent = fmt(n, currency);
  });
  $$<HTMLButtonElement>("[data-currency]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.currency === currency)));
  const budget = $("[data-group='budget']");
  if (budget?.dataset.budgets) {
    const list = JSON.parse(budget.dataset.budgets)[currency] as string[];
    $$<HTMLButtonElement>("button", budget).forEach((b, i) => {
      b.textContent = list[i];
      b.dataset.value = list[i];
    });
  }
  updateOrder();
};
$$<HTMLButtonElement>("[data-currency]").forEach((b) =>
  b.addEventListener("click", () => {
    currency = b.dataset.currency as Currency;
    store.set("vo-currency", currency);
    applyCurrency();
  }),
);

// ---------- order dialog → Dodo checkout ----------
const dialog = $<HTMLDialogElement>("#order");
const cfgEl = $("#order-config");
const cfg = cfgEl ? (JSON.parse(cfgEl.textContent || "{}") as { packages: Pkg[]; checkoutBase: string; email: string }) : null;
let current: Pkg | null = null;

function updateOrder() {
  if (!dialog || !current) return;
  const set = (k: string, v: string) => {
    const el = $(`[data-o="${k}"]`, dialog);
    if (el) el.textContent = v;
  };
  set("name", current.name);
  set("price", fmt(current.price[currency], currency));
  set("summary", `${current.sub}. ${current.includes.join(" · ")}. delivered in ${current.delivery}.`);
}

function openOrder(id: string) {
  if (!dialog || !cfg) return;
  current = cfg.packages.find((p) => p.id === id) ?? null;
  if (!current) return;
  const formats = $(`[data-o="formats"]`, dialog)!;
  formats.innerHTML = "";
  formats.dataset.group = "formats";
  if (current.id === "launch" || current.id === "series") formats.setAttribute("data-multi", "");
  else formats.removeAttribute("data-multi");
  current.formats.forEach((f, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.dataset.value = f;
    b.textContent = f;
    b.setAttribute("aria-pressed", String(i === 0 || (formats.hasAttribute("data-multi") && i < 3)));
    formats.appendChild(b);
  });
  $(".error", dialog)!.hidden = true;
  updateOrder();
  dialog.showModal();
  lenis?.stop();
}
// formats chips are created per order, so bind their group once
const formatsBox = dialog ? $(`[data-o="formats"]`, dialog) : null;
formatsBox?.addEventListener("click", (e) => {
  const chip = (e.target as HTMLElement).closest<HTMLButtonElement>("button.chip");
  if (!chip) return;
  const multi = formatsBox.hasAttribute("data-multi");
  const was = chip.getAttribute("aria-pressed") === "true";
  if (!multi) $$("button.chip", formatsBox).forEach((c) => c.setAttribute("aria-pressed", "false"));
  chip.setAttribute("aria-pressed", String(multi ? !was : true));
});

document.addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-order]");
  if (btn) openOrder(btn.dataset.order!);
});
dialog?.addEventListener("close", () => lenis?.start());
dialog?.addEventListener("click", (e) => {
  if (e.target === dialog || (e.target as HTMLElement).closest("[data-close]")) dialog.close();
});
const countEl = dialog ? $(`[data-o="count"]`, dialog) : null;
dialog?.querySelector("textarea")?.addEventListener("input", (e) => {
  if (countEl) countEl.textContent = String((e.target as HTMLTextAreaElement).value.length);
});
dialog?.addEventListener("input", () => {
  const err = $(".error", dialog);
  if (err) err.hidden = true;
});

dialog?.querySelector("form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!current || !cfg) return;
  const form = e.target as HTMLFormElement;
  const data = new FormData(form);
  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  let link = String(data.get("link") || "").trim();
  const brief = String(data.get("brief") || "").trim();
  if (link && !/^https?:\/\//i.test(link)) link = `https://${link}`;
  const err = $(".error", dialog)!;
  const fail = (m: string) => {
    err.textContent = m;
    err.hidden = false;
  };
  if (!name) return fail("we need a name to put on the order.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("that email doesn't look right.");
  if (!link) return fail("add a link to the product, site or app.");
  if (brief.length < 10) return fail("give us a line or two of brief.");
  const formats = $$<HTMLButtonElement>(`[data-o="formats"] button[aria-pressed="true"]`, dialog).map((b) => b.dataset.value);
  const tone = picked(dialog, "tone");
  const productId = current.dodo[currency];

  if (!productId) {
    // Checkout not configured yet: send the order as an email instead.
    const body = [
      `Package: ${current.name} (${fmt(current.price[currency], currency)})`,
      `Name: ${name}`,
      `Email: ${email}`,
      `Product: ${link}`,
      `Formats: ${formats.join(", ")}`,
      ...(tone.length ? [`Feel: ${tone.join(", ")}`] : []),
      "",
      brief,
    ].join("\n");
    go(`mailto:${cfg.email}?subject=${encodeURIComponent(`Order: ${current.name}`)}&body=${encodeURIComponent(body)}`);
    return;
  }

  const q = new URLSearchParams({
    quantity: "1",
    fullName: name,
    email,
    redirect_url: `${location.origin}/thanks?package=${current.id}`,
    paymentCurrency: currency,
    showCurrencySelector: "false",
    metadata_package: current.id,
    metadata_product_link: link.slice(0, 300),
    metadata_formats: formats.join(", "),
    metadata_feel: tone.join(", "),
    metadata_brief: brief.slice(0, 450),
  });
  go(`${cfg.checkoutBase}/buy/${productId}?${q}`);
});

// ---------- contact → pre-filled email ----------
const contact = $<HTMLFormElement>("form[data-mailto]");
contact?.addEventListener("submit", (e) => {
  e.preventDefault();
  const d = new FormData(contact);
  const name = String(d.get("name") || "").trim();
  const regarding = picked(contact, "regarding");
  const body = [
    "Hi VisualOn,",
    "",
    String(d.get("message") || "").trim() || "(tell us about the product and what you need)",
    "",
    regarding.length ? `Regarding: ${regarding.join(", ")}` : "",
    picked(contact, "start").length ? `Start with: ${picked(contact, "start")[0]}` : "",
    picked(contact, "budget").length ? `Rough budget: ${picked(contact, "budget")[0]}` : "",
    "",
    name ? `— ${name}` : "",
    d.get("email") ? `Reply to: ${d.get("email")}` : "",
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  const subject = `Quote request${regarding.length ? `: ${regarding.join(", ")}` : ""}${name ? ` from ${name}` : ""}`;
  go(`mailto:${contact.dataset.mailto}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
});

applyCurrency();
