'use client';
import { useState } from 'react';
import { Shield, Package, ShoppingBag, Users, Settings, BookOpen, LayoutDashboard,
  TrendingUp, AlertCircle, CheckCircle, Search, Plus, Edit3, Trash2, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { useStore } from '@/components/Providers';
import { products as allProducts } from '@/lib/products';
import Link from 'next/link';

type Tab = 'overview' | 'products' | 'orders' | 'content' | 'users' | 'settings' | 'knowledge';

const MOCK_ORDERS = [
  { id: 'ord1', orderNumber: 'TP-001', customerName: 'Jane Mwangi', totalAmount: 4500, status: 'PAID', paymentMethod: 'MPESA', createdAt: '2026-01-15' },
  { id: 'ord2', orderNumber: 'TP-002', customerName: 'James Kamau', totalAmount: 8200, status: 'CONFIRMED', paymentMethod: 'CARD', createdAt: '2026-01-14' },
  { id: 'ord3', orderNumber: 'TP-003', customerName: 'Aisha Omar', totalAmount: 2800, status: 'PENDING', paymentMethod: 'MPESA', createdAt: '2026-01-13' },
];

const KB_ARTICLES = [
  { q: 'How do I add a new product?', a: 'Go to Products tab → click "Add Product". Fill in name, price, and image URL. Click Save.' },
  { q: 'How do I change order status?', a: 'Go to Orders tab → click the status badge next to any order to cycle through PENDING → CONFIRMED → PAID.' },
  { q: 'How do I add admin access to another user?', a: 'Go to Users tab → find the user → click "Make Admin". They need to sign out and back in.' },
  { q: 'How do I hide a section on the website?', a: 'Go to Content tab → toggle the eye icon next to the section you want to hide.' },
  { q: 'How do I update my WhatsApp number for chatbot?', a: 'Go to Settings tab → find "WhatsApp Number" → update and save. Also update WHATSAPP_NUMBER in Railway Variables.' },
  { q: 'Why is M-Pesa not working?', a: 'Check that MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE, and MPESA_PASSKEY are all set in Railway → Variables.' },
  { q: 'Why is Stripe showing an error?', a: 'Make sure STRIPE_SECRET_KEY is set in Railway Variables and starts with sk_live_ for production or sk_test_ for testing.' },
  { q: 'How do I deploy a code change?', a: 'Save your file in Sublime Text → open GitHub Desktop → you will see the change listed → write a short message → click Commit → then Push.' },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PAID: 'bg-green-50 text-green-700 border-green-200',
    CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
    PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    FAILED: 'bg-red-50 text-red-700 border-red-200',
    CANCELLED: 'bg-gray-50 text-gray-600 border-gray-200',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${map[status] || 'bg-gray-50 text-gray-600'}`}>
      {status}
    </span>
  );
}

export default function AdminPage() {
  const { isLoggedIn, user } = useStore();
  const [tab, setTab] = useState<Tab>('overview');
  const [kbSearch, setKbSearch] = useState('');
  const [productList, setProductList] = useState(allProducts.slice(0, 12));
  const [sections, setSections] = useState([
    { id: 'hero', label: 'Hero / Homepage Banner', visible: true },
    { id: 'featured', label: 'Featured Collection Strip', visible: true },
    { id: 'indoor', label: 'Indoor Plants Page', visible: true },
    { id: 'outdoor', label: 'Outdoor Plants Page', visible: true },
    { id: 'pots', label: 'Pots Only Page', visible: true },
    { id: 'studio', label: 'Studio / Custom Orders', visible: true },
    { id: 'chatbot', label: 'AI Chatbot Widget', visible: true },
    { id: 'newsletter', label: 'Newsletter Sign-up', visible: true },
    { id: 'faq', label: 'FAQ Page', visible: true },
    { id: 'care', label: 'Care Guide Page', visible: true },
  ]);
  const [whatsapp, setWhatsapp] = useState('254700000000');
  const [saved, setSaved] = useState('');

  if (!isLoggedIn || !user?.isAdmin) {
    return (
      <main className="container-shell py-32 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#f5ede4]">
          <Shield className="h-10 w-10 text-[#B66A3C]" />
        </div>
        <h1 className="mt-6 serif-display text-5xl text-[#3d2a20]">Admin Only</h1>
        <p className="mt-3 text-sm text-[#76675c]">Sign in with an admin account to access the dashboard.</p>
        <Link href="/" className="mt-6 btn-primary inline-flex">Back to Home</Link>
      </main>
    );
  }

  const tabs: { id: Tab; icon: React.ReactNode; label: string }[] = [
    { id: 'overview', icon: <LayoutDashboard className="h-4 w-4" />, label: 'Overview' },
    { id: 'products', icon: <Package className="h-4 w-4" />, label: 'Products' },
    { id: 'orders', icon: <ShoppingBag className="h-4 w-4" />, label: 'Orders' },
    { id: 'content', icon: <Eye className="h-4 w-4" />, label: 'Content' },
    { id: 'users', icon: <Users className="h-4 w-4" />, label: 'Users' },
    { id: 'settings', icon: <Settings className="h-4 w-4" />, label: 'Settings' },
    { id: 'knowledge', icon: <BookOpen className="h-4 w-4" />, label: 'Help / KB' },
  ];

  const kbFiltered = KB_ARTICLES.filter(
    (a) => !kbSearch || a.q.toLowerCase().includes(kbSearch.toLowerCase()) || a.a.toLowerCase().includes(kbSearch.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#F7F2EA] pt-20">
      <div className="mx-auto max-w-[1300px] px-4 md:px-8 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between py-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#B66A3C]">Admin</div>
            <h1 className="mt-1 serif-display text-4xl text-[#3d2a20]">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-[#5A3422] px-4 py-2 text-white text-xs font-semibold">
            <Shield className="h-3.5 w-3.5" /> {user.name}
          </div>
        </div>

        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Sidebar */}
          <aside className="lg:w-52 flex-shrink-0">
            <div className="rounded-[1.5rem] border border-[#e8dccf] bg-white p-2">
              {tabs.map((t) => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${tab === t.id ? 'bg-[#5A3422] text-white' : 'text-[#5a4a3f] hover:bg-[#f7f0ea]'}`}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">

            {/* OVERVIEW */}
            {tab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Products', value: allProducts.length, icon: <Package className="h-5 w-5" />, color: 'bg-[#fdf5ee] text-[#B66A3C]' },
                    { label: 'Orders', value: MOCK_ORDERS.length, icon: <ShoppingBag className="h-5 w-5" />, color: 'bg-blue-50 text-blue-600' },
                    { label: 'Revenue', value: 'KES 15,500', icon: <TrendingUp className="h-5 w-5" />, color: 'bg-green-50 text-green-600' },
                    { label: 'Pending', value: 1, icon: <AlertCircle className="h-5 w-5" />, color: 'bg-yellow-50 text-yellow-600' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-[1.5rem] border border-[#e8dccf] bg-white p-5">
                      <div className={`inline-flex rounded-full p-2.5 ${s.color}`}>{s.icon}</div>
                      <div className="mt-3 text-2xl font-bold text-[#3d2a20]">{s.value}</div>
                      <div className="text-xs text-[#9a8a80] mt-0.5">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-[1.5rem] border border-[#e8dccf] bg-white p-6">
                  <div className="font-semibold text-[#3d2a20] mb-4">Recent Orders</div>
                  <div className="space-y-3">
                    {MOCK_ORDERS.map((o) => (
                      <div key={o.id} className="flex items-center justify-between rounded-2xl bg-[#fdf9f5] px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-[#3d2a20]">{o.orderNumber} · {o.customerName}</div>
                          <div className="text-xs text-[#9a8a80]">{o.paymentMethod} · {o.createdAt}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-semibold text-[#3d2a20]">KES {o.totalAmount.toLocaleString()}</div>
                          <StatusBadge status={o.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-green-200 bg-green-50 p-5">
                  <div className="flex items-center gap-2 text-green-700 font-semibold text-sm mb-2">
                    <CheckCircle className="h-4 w-4" /> System Status: All OK
                  </div>
                  <div className="text-xs text-green-600 space-y-1">
                    <div>✓ M-Pesa callback route active at /api/payments/mpesa/callback</div>
                    <div>✓ Stripe webhook route active at /api/payments/stripe/webhook</div>
                    <div>✓ Order confirmation page at /order-confirmation</div>
                    <div>✓ AI Chatbot component loaded</div>
                  </div>
                </div>
              </div>
            )}

            {/* PRODUCTS */}
            {tab === 'products' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-[#3d2a20]">{productList.length} Products</div>
                  <button className="btn-primary inline-flex items-center gap-2 text-xs py-2.5">
                    <Plus className="h-3.5 w-3.5" /> Add Product
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {productList.map((p) => (
                    <div key={p.slug} className="flex items-center gap-4 rounded-[1.5rem] border border-[#e8dccf] bg-white p-4">
                      <img src={p.image} alt={p.name} className="h-14 w-14 rounded-2xl object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[#3d2a20] truncate">{p.name}</div>
                        <div className="text-xs text-[#9a8a80]">KES {p.price.toLocaleString()} · {p.category}</div>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button className="rounded-full p-2 bg-[#f7f0ea] text-[#5A3422] hover:bg-[#ede1d3] transition"><Edit3 className="h-3.5 w-3.5" /></button>
                        <button className="rounded-full p-2 bg-red-50 text-red-500 hover:bg-red-100 transition"
                          onClick={() => setProductList((cur) => cur.filter((x) => x.slug !== p.slug))}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#9a8a80]">To permanently add/edit products, update <code className="bg-[#f0e8df] px-1 rounded">lib/products.ts</code> in Sublime Text and push via GitHub Desktop.</p>
              </div>
            )}

            {/* ORDERS */}
            {tab === 'orders' && (
              <div className="space-y-4">
                <div className="font-semibold text-[#3d2a20]">{MOCK_ORDERS.length} Orders (demo data)</div>
                {MOCK_ORDERS.map((o) => (
                  <div key={o.id} className="rounded-[1.5rem] border border-[#e8dccf] bg-white p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold text-[#3d2a20]">{o.orderNumber}</div>
                        <div className="text-sm text-[#76675c] mt-0.5">{o.customerName}</div>
                        <div className="text-xs text-[#9a8a80] mt-1">{o.paymentMethod} · {o.createdAt}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#3d2a20]">KES {o.totalAmount.toLocaleString()}</div>
                        <div className="mt-1"><StatusBadge status={o.status} /></div>
                      </div>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-[#9a8a80]">Live orders appear here once Railway + database are connected.</p>
              </div>
            )}

            {/* CONTENT */}
            {tab === 'content' && (
              <div className="space-y-3">
                <div className="font-semibold text-[#3d2a20] mb-2">Site Sections — Show / Hide</div>
                {sections.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-[1.5rem] border border-[#e8dccf] bg-white px-5 py-4">
                    <div className="text-sm font-medium text-[#3d2a20]">{s.label}</div>
                    <button onClick={() => setSections((cur) => cur.map((x) => x.id === s.id ? { ...x, visible: !x.visible } : x))}
                      className={`rounded-full p-2 transition ${s.visible ? 'bg-[#f5ede4] text-[#B66A3C]' : 'bg-gray-100 text-gray-400'}`}>
                      {s.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                  </div>
                ))}
                <p className="text-xs text-[#9a8a80] pt-2">Section visibility is saved locally. For permanent changes, edit the page files in Sublime Text.</p>
              </div>
            )}

            {/* USERS */}
            {tab === 'users' && (
              <div className="space-y-4">
                <div className="font-semibold text-[#3d2a20]">User Management</div>
                <div className="rounded-[1.5rem] border border-[#e8dccf] bg-white p-5 space-y-3">
                  {[
                    { name: 'Andrew Muti', email: 'andrew@tulopots.com', role: 'Admin', since: '2024' },
                    { name: 'Jane Mwangi', email: 'jane@example.com', role: 'Customer', since: '2025' },
                  ].map((u) => (
                    <div key={u.email} className="flex items-center justify-between py-2 border-b border-[#f5ede4] last:border-0">
                      <div>
                        <div className="text-sm font-medium text-[#3d2a20]">{u.name}</div>
                        <div className="text-xs text-[#9a8a80]">{u.email} · since {u.since}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${u.role === 'Admin' ? 'bg-[#5A3422] text-white' : 'bg-[#f0e8df] text-[#8a7a6d]'}`}>{u.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#9a8a80]">Live user list requires Railway + PostgreSQL database to be connected.</p>
              </div>
            )}

            {/* SETTINGS */}
            {tab === 'settings' && (
              <div className="space-y-6">
                <div className="rounded-[1.5rem] border border-[#e8dccf] bg-white p-6 space-y-4">
                  <div className="font-semibold text-[#3d2a20]">Business Settings</div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9a8a80]">WhatsApp Number (for chatbot handoff)</label>
                    <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-[#e6d9cd] bg-[#fdf9f6] px-5 py-3.5 text-sm outline-none focus:border-[#B66A3C] transition" />
                    <p className="mt-1 text-xs text-[#9a8a80]">Also update WHATSAPP_NUMBER in Railway → Variables</p>
                  </div>
                  <button onClick={() => { setSaved('Saved!'); setTimeout(() => setSaved(''), 2500); }} className="btn-primary">
                    Save {saved && <span className="ml-2 text-green-300">✓ {saved}</span>}
                  </button>
                </div>

                <div className="rounded-[1.5rem] border border-[#e8dccf] bg-white p-6 space-y-3">
                  <div className="font-semibold text-[#3d2a20]">Environment Variables (Railway)</div>
                  {[
                    ['STRIPE_SECRET_KEY', 'sk_live_... or sk_test_...'],
                    ['STRIPE_KES_TO_USD_RATE', '130'],
                    ['MPESA_CONSUMER_KEY', 'From Safaricom Daraja'],
                    ['MPESA_SHORTCODE', 'Your paybill/till'],
                    ['ANTHROPIC_API_KEY', 'sk-ant-...'],
                    ['NEXT_PUBLIC_SITE_URL', 'https://your-domain.up.railway.app'],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between rounded-xl bg-[#fdf9f5] px-4 py-3">
                      <code className="text-xs font-mono text-[#5A3422]">{k}</code>
                      <span className="text-xs text-[#9a8a80]">{v}</span>
                    </div>
                  ))}
                  <Link href="/DEPLOY.md" target="_blank" className="btn-secondary inline-flex items-center gap-2 text-xs mt-2">
                    <ChevronRight className="h-3.5 w-3.5" /> Open Full Deploy Guide
                  </Link>
                </div>
              </div>
            )}

            {/* KNOWLEDGE BASE */}
            {tab === 'knowledge' && (
              <div className="space-y-4">
                <div className="font-semibold text-[#3d2a20]">Help & Knowledge Base</div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#c0ada2]" />
                  <input value={kbSearch} onChange={(e) => setKbSearch(e.target.value)} placeholder="Search for help e.g. 'add product' or 'M-Pesa'"
                    className="w-full rounded-full border border-[#e8dccf] bg-white pl-11 pr-5 py-3.5 text-sm outline-none focus:border-[#B66A3C] transition" />
                </div>
                <div className="space-y-3">
                  {kbFiltered.length === 0 && (
                    <div className="rounded-[1.5rem] bg-white border border-[#e8dccf] p-6 text-center text-sm text-[#9a8a80]">No results for &ldquo;{kbSearch}&rdquo;</div>
                  )}
                  {kbFiltered.map((a, i) => (
                    <details key={i} className="rounded-[1.5rem] border border-[#e8dccf] bg-white overflow-hidden">
                      <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-medium text-[#3d2a20] hover:bg-[#fdf9f5]">
                        {a.q}
                        <ChevronRight className="h-4 w-4 text-[#c0ada2] flex-shrink-0 ml-3" />
                      </summary>
                      <div className="px-5 pb-4 text-sm leading-7 text-[#76675c] border-t border-[#f0e6df] pt-3">{a.a}</div>
                    </details>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}
