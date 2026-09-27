import Link from "next/link";
import {
  BadgePercent,
  Headphones,
  Leaf,
  Repeat,
  ShieldCheck,
  Sparkles,
  Tag,
  Truck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";

const trustBadges = [
  { icon: Truck, title: "Fast delivery", body: "Reliable shipping on every order" },
  { icon: ShieldCheck, title: "Secure payments", body: "Razorpay-protected checkout" },
  { icon: Repeat, title: "Easy 7-day returns", body: "Changed your mind? No problem" },
  { icon: Headphones, title: "Real support", body: "We actually answer your emails" },
];

const values = [
  {
    icon: Sparkles,
    title: "Thoughtfully curated",
    body: "We don't chase every trend — every product earns its spot in the catalog on quality and value, not just margin.",
  },
  {
    icon: Tag,
    title: "Simple, honest pricing",
    body: "No inflated list prices or fake discounts. The price you see is the price you pay.",
  },
  {
    icon: Leaf,
    title: "Built to last",
    body: "We favor products we'd be happy to use ourselves for years, not ones designed to be replaced next season.",
  },
];

export default async function HomePage() {
  const supabase = createClient();

  const [{ data: featured }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase.from("categories").select("*").order("name"),
  ]);

  return (
    <div>
      <section className="-mx-4 -mt-10 mb-4 rounded-b-3xl bg-hero px-4 pb-14 pt-16 text-center sm:-mx-6 sm:px-6">
        <span className="badge bg-brand-50 text-brand-dark">
          <Sparkles className="mr-1 inline h-3 w-3" /> New arrivals every week
        </span>
        <h1 className="mx-auto mt-4 max-w-xl text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl">
          Shop things you&apos;ll actually love
        </h1>
        <p className="mx-auto mt-3 max-w-md text-ink-400">
          Curated electronics, apparel, and home goods — thoughtfully picked, simply priced.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link href="/shop" className="btn">
            Browse the shop →
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-brand-200 bg-white/60 px-4 py-2 text-sm font-medium text-brand-dark">
            <BadgePercent className="h-4 w-4" /> Use <span className="font-mono">WELCOME10</span> for 10% off
          </span>
        </div>
      </section>

      {/* Trust badges */}
      <section className="mb-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {trustBadges.map(({ icon: Icon, title, body }) => (
          <div key={title} className="card flex flex-col items-center gap-2 p-4 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-dark">
              <Icon className="h-5 w-5" />
            </span>
            <p className="text-sm font-semibold text-ink-900">{title}</p>
            <p className="text-xs text-ink-400">{body}</p>
          </div>
        ))}
      </section>

      {/* Shop by category */}
      {categories && categories.length > 0 && (
        <section className="mb-16">
          <h2 className="mb-4 text-xl font-bold text-ink-900">Shop by category</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/shop?category=${c.id}`}
                className="card group flex items-center justify-between p-5 hover:-translate-y-0.5 hover:shadow-hover"
              >
                <span className="font-semibold text-ink-900">{c.name}</span>
                <span className="text-ink-400 transition group-hover:translate-x-1 group-hover:text-brand-dark">
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products teaser */}
      {featured && featured.length > 0 && (
        <section className="mb-16">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-ink-900">Featured products</h2>
              <p className="mt-1 text-sm text-ink-400">A few of our newest arrivals.</p>
            </div>
            <Link href="/shop" className="text-sm font-medium text-brand hover:text-brand-dark">
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* About us */}
      <section className="card overflow-hidden">
        <div className="grid grid-cols-1 gap-10 p-8 sm:p-10 md:grid-cols-2 md:gap-16">
          <div>
            <span className="badge bg-brand-50 text-brand-dark">About us</span>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
              We built the store we&apos;d want to shop at
            </h2>
            <p className="mt-4 leading-relaxed text-ink-600">
              E-Com started as a simple idea: online shopping doesn&apos;t need to be
              overwhelming. No endless scrolling, no dark patterns, no guessing whether a
              &quot;deal&quot; is real. Just a small, well-chosen catalog, clear pricing, and an
              experience that respects your time.
            </p>
            <p className="mt-4 leading-relaxed text-ink-600">
              We&apos;re a small team that tests everything we sell before it goes live, and we
              stand behind every order — every account you create is backed by secure,
              production-grade infrastructure, not a spreadsheet.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 md:grid-cols-1">
            {values.map((v) => (
              <div key={v.title} className="flex gap-3">
                <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-dark">
                  <v.icon className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-semibold text-ink-900">{v.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-400">{v.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
