import { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";

const STORAGE_KEYS = {
  employees: "nyh_employees",
  hours: "nyh_hours",
  suppliers: "nyh_suppliers",
  products: "nyh_products",
  invoices: "nyh_invoices",
  sales: "nyh_sales",
  settings: "nyh_settings",
  pending: "nyh_pending",
  expenses: "nyh_expenses",
  deliveries: "nyh_deliveries",
  inventory: "nyh_inventory",
  inventoryCategories: "nyh_inv_categories",
  cashDeposits: "nyh_cash_deposits",
};

const DEFAULT_SETTINGS = { greenMax: 28, yellowMax: 32, laborGreenMax: 25, laborYellowMax: 30, expenseGreenMax: 20, expenseYellowMax: 28 };

const BRANCH_ID = "ashdod"; // כל סניף יכול לקבל ID שלו

async function load(key) {
  try {
    const ref = doc(db, "branches", BRANCH_ID, "data", key);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data().value : null;
  } catch { return null; }
}

async function save(key, val) {
  try {
    const ref = doc(db, "branches", BRANCH_ID, "data", key);
    await setDoc(ref, { value: val });
  } catch (e) {
    console.error("🔴 Firebase save error:", key, e.message);
    alert("שגיאת שמירה: " + e.message);
  }
}

const fmt = (n) => Number(n || 0).toFixed(2);
const pct = (a, b) => (b > 0 ? ((a / b) * 100).toFixed(1) : "0.0");

function StatusBadge({ value, settings }) {
  const v = parseFloat(value);
  const isGreen = v <= settings.greenMax;
  const isYellow = !isGreen && v <= settings.yellowMax;
  const color = isGreen ? "#22c55e" : isYellow ? "#f59e0b" : "#ef4444";
  const bg = isGreen ? "#f0fdf4" : isYellow ? "#fffbeb" : "#fff5f5";
  const label = isGreen ? "תקין ✓" : isYellow ? "גבולי ⚠" : "גבוה ✗";
  return (
    <span style={{ background: bg, color, border: `1px solid ${color}`, borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
      {v}% — {label}
    </span>
  );
}

const TABS = [
  { id: "dashboard", label: "📊 דשבורד" },
  { id: "suppliers", label: "🏭 ספקים" },
  { id: "invoices", label: "🧾 חשבוניות" },
  { id: "deliveries", label: "🚚 תעודות משלוח" },
  { id: "sales", label: "💰 מכירות" },
  { id: "employees", label: "👷 עובדים" },
  { id: "hours", label: "⏱️ שעות" },
  { id: "inventory", label: "📦 מלאי" },
  { id: "expenses", label: "🏢 הוצאות תפעול" },
  { id: "cash", label: "💵 הפקדת מזומן" },
  { id: "notifications", label: "🔔 התראות" },
  { id: "settings", label: "⚙️ הגדרות" },
];

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [sales, setSales] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [hours, setHours] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [pending, setPending] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [inventoryCategories, setInventoryCategories] = useState([]);
  const [cashDeposits, setCashDeposits] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Real-time listeners — כל שינוי ב-Firebase מתעדכן מיד בכל המכשירים
    const setters = {
      [STORAGE_KEYS.suppliers]: setSuppliers,
      [STORAGE_KEYS.products]: setProducts,
      [STORAGE_KEYS.invoices]: setInvoices,
      [STORAGE_KEYS.sales]: setSales,
      [STORAGE_KEYS.employees]: setEmployees,
      [STORAGE_KEYS.hours]: setHours,
      [STORAGE_KEYS.settings]: (v) => setSettings(v || DEFAULT_SETTINGS),
      [STORAGE_KEYS.pending]: setPending,
      [STORAGE_KEYS.expenses]: setExpenses,
      [STORAGE_KEYS.deliveries]: setDeliveries,
      [STORAGE_KEYS.inventory]: setInventory,
      [STORAGE_KEYS.cashDeposits]: setCashDeposits,
      [STORAGE_KEYS.inventoryCategories]: setInventoryCategories,
    };
    const keys = Object.keys(setters);
    const loadedKeys = new Set();
    const unsubs = keys.map(key => {
      const setter = setters[key];
      const ref = doc(db, "branches", BRANCH_ID, "data", key);
      return onSnapshot(ref, (snap) => {
        setter(snap.exists() ? (snap.data().value || []) : (key === STORAGE_KEYS.settings ? DEFAULT_SETTINGS : []));
        loadedKeys.add(key);
        if (loadedKeys.size >= keys.length) setLoaded(true);
      }, () => {
        loadedKeys.add(key);
        if (loadedKeys.size >= keys.length) setLoaded(true);
      });
    });
    return () => unsubs.forEach(u => u());
  }, []);

  useEffect(() => { if (loaded) save(STORAGE_KEYS.suppliers, suppliers); }, [suppliers, loaded]);
  useEffect(() => { if (loaded) save(STORAGE_KEYS.products, products); }, [products, loaded]);
  useEffect(() => { if (loaded) save(STORAGE_KEYS.invoices, invoices); }, [invoices, loaded]);
  useEffect(() => { if (loaded) save(STORAGE_KEYS.sales, sales); }, [sales, loaded]);
  useEffect(() => { if (loaded) save(STORAGE_KEYS.employees, employees); }, [employees, loaded]);
  useEffect(() => { if (loaded) save(STORAGE_KEYS.hours, hours); }, [hours, loaded]);
  useEffect(() => { if (loaded) save(STORAGE_KEYS.settings, settings); }, [settings, loaded]);
  useEffect(() => { if (loaded) save(STORAGE_KEYS.pending, pending); }, [pending, loaded]);
  useEffect(() => { if (loaded) save(STORAGE_KEYS.expenses, expenses); }, [expenses, loaded]);
  useEffect(() => { if (loaded) save(STORAGE_KEYS.deliveries, deliveries); }, [deliveries, loaded]);
  useEffect(() => { if (loaded) save(STORAGE_KEYS.inventory, inventory); }, [inventory, loaded]);
  useEffect(() => { if (loaded) save(STORAGE_KEYS.cashDeposits, cashDeposits); }, [cashDeposits, loaded]);
  useEffect(() => { if (loaded) save(STORAGE_KEYS.inventoryCategories, inventoryCategories); }, [inventoryCategories, loaded]);

  if (!loaded) return <div style={{ background: "#f1f5f9", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#1e293b" }}>טוען...</div>;

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'Segoe UI', Tahoma, sans-serif", color: "#1e293b" }}>
      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg, #cc0000 0%, #8b0000 100%)", borderBottom: "1px solid #b91c1c", padding: "16px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 28 }}>🌭</span>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#ffffff", letterSpacing: 0.5 }}>New York Hotdog — מערכת ניהול פוד קוסט</div>
          <div style={{ fontSize: 12, color: "#fecaca" }}>סניף אשדוד</div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: 2, padding: "0 24px", borderBottom: "2px solid #e2e8f0", overflowX: "auto", background: "#ffffff" }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: "transparent",
            color: tab === t.id ? "#cc0000" : "#64748b",
            border: "none", borderBottom: tab === t.id ? "3px solid #cc0000" : "3px solid transparent",
            borderRadius: 0, padding: "12px 16px",
            cursor: "pointer", fontSize: 13, fontWeight: tab === t.id ? 700 : 400,
            whiteSpace: "nowrap", transition: "all 0.2s", position: "relative"
          }}>
            {t.label}
            {t.id === "notifications" && pending.length > 0 && (
              <span style={{ position: "absolute", top: 4, left: 4, background: "#ef4444", color: "#fff", borderRadius: "50%", width: 18, height: 18, fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>{pending.length}</span>
            )}
          </button>
        ))}
      </div>

      <div style={{ padding: 24, background: "#f1f5f9", minHeight: "calc(100vh - 120px)" }}>
        {tab === "dashboard" && <Dashboard invoices={invoices} sales={sales} suppliers={suppliers} products={products} settings={settings} hours={hours} employees={employees} expenses={expenses} cashDeposits={cashDeposits} deliveries={deliveries} />}
        {tab === "suppliers" && <Suppliers suppliers={suppliers} setSuppliers={setSuppliers} products={products} setProducts={setProducts} inventoryCategories={inventoryCategories} />}
        {tab === "invoices" && <Invoices invoices={invoices} setInvoices={setInvoices} suppliers={suppliers} setSuppliers={setSuppliers} products={products} setProducts={setProducts} settings={settings} pending={pending} setPending={setPending} />}
        {tab === "sales" && <Sales sales={sales} setSales={setSales} />}
        {tab === "employees" && <Employees employees={employees} setEmployees={setEmployees} />}
        {tab === "hours" && <Hours hours={hours} setHours={setHours} employees={employees} sales={sales} settings={settings} />}
        {tab === "deliveries" && <Deliveries deliveries={deliveries} setDeliveries={setDeliveries} suppliers={suppliers} products={products} setSuppliers={setSuppliers} setProducts={setProducts} pending={pending} setPending={setPending} invoices={invoices} setInvoices={setInvoices} />}
        {tab === "inventory" && <Inventory inventory={inventory} setInventory={setInventory} products={products} invoices={invoices} deliveries={deliveries} suppliers={suppliers} inventoryCategories={inventoryCategories} setSuppliers={setSuppliers} />}
        {tab === "expenses" && <Expenses expenses={expenses} setExpenses={setExpenses} />}
        {tab === "cash" && <CashDeposits cashDeposits={cashDeposits} setCashDeposits={setCashDeposits} sales={sales} />}
        {tab === "notifications" && <Notifications pending={pending} setPending={setPending} suppliers={suppliers} products={products} invoices={invoices} setInvoices={setInvoices} setSuppliers={setSuppliers} setProducts={setProducts} />}
        {tab === "settings" && <Settings settings={settings} setSettings={setSettings} inventoryCategories={inventoryCategories} setInventoryCategories={setInventoryCategories} suppliers={suppliers} setSuppliers={setSuppliers} />}
      </div>
    </div>
  );
}

function Dashboard({ invoices, sales, suppliers, products, settings, hours, employees, expenses, cashDeposits = [], deliveries = [] }) {
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const parseXlsxSales = async (file) => {
    setImporting(true);
    setImportError("");
    setImportPreview(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      // Use SheetJS (XLSX) if available, otherwise parse CSV
      if (typeof window.XLSX === "undefined") {
        throw new Error("ספריית XLSX לא נטענה — נסה לרענן");
      }
      const wb = window.XLSX.read(uint8, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = window.XLSX.utils.sheet_to_json(ws, { header: 1 });

      // Find header row (contains תאריך מכירה)
      let headerRow = -1;
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].some(c => String(c||"").includes("תאריך"))) { headerRow = i; break; }
      }
      if (headerRow === -1) throw new Error("לא נמצאה שורת כותרות בקובץ");

      const headers = rows[headerRow];
      const dateCol = headers.findIndex(h => String(h||"").includes("תאריך"));
      const typeCol = headers.findIndex(h => String(h||"").includes("סוג"));
      const amountCol = headers.findIndex(h => String(h||"").includes("סה") || String(h||"").includes("סכום"));
      const customerCol = headers.findIndex(h => String(h||"").includes("לקוח"));

      const byDate = {};
      for (let i = headerRow + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[dateCol]) continue;
        const rawDate = String(row[dateCol] || "");
        // Parse DD/MM/YYYY
        const parts = rawDate.split("/");
        if (parts.length !== 3) continue;
        const isoDate = `${parts[2]}-${parts[1].padStart(2,"0")}-${parts[0].padStart(2,"0")}`;
        const type = String(row[typeCol] || "");
        const amount = parseFloat(row[amountCol] || 0);
        const customer = String(row[customerCol] || "");
        if (!byDate[isoDate]) byDate[isoDate] = { kupa: 0, wolt: 0 };
        if (type === "חיוב") {
          byDate[isoDate].kupa += amount;
        } else if (type === "תעודת משלוח") {
          byDate[isoDate].wolt += amount;
        }
      }

      const preview = Object.entries(byDate)
        .filter(([, v]) => v.kupa > 0 || v.wolt > 0)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, v]) => ({ date, kupa: String(Math.round(v.kupa * 100) / 100), wolt: String(Math.round(v.wolt * 100) / 100) }));

      if (preview.length === 0) throw new Error("לא נמצאו נתוני מכירות בקובץ");
      setImportPreview(preview);
    } catch(e) {
      setImportError("שגיאה: " + e.message);
    }
    setImporting(false);
  };

  const confirmImport = () => {
    if (!importPreview) return;
    setSales(prev => {
      let updated = [...prev];
      for (const row of importPreview) {
        const idx = updated.findIndex(s => s.date === row.date);
        if (idx >= 0) {
          updated[idx] = { ...updated[idx], kupa: row.kupa, wolt: row.wolt };
        } else {
          updated.push({ id: Date.now().toString() + Math.random(), date: row.date, kupa: row.kupa, wolt: row.wolt });
        }
      }
      return updated;
    });
    setImportPreview(null);
    alert(`✅ יובאו ${importPreview.length} ימי מכירה בהצלחה!`);
  };

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthlySales = sales.filter((s) => s.date?.startsWith(monthKey));
  const totalSales = monthlySales.reduce((a, s) => a + (parseFloat(s.kupa) || 0) + (parseFloat(s.wolt) || 0), 0);
  const totalKupa = monthlySales.reduce((a, s) => a + (parseFloat(s.kupa) || 0), 0);
  const totalWolt = monthlySales.reduce((a, s) => a + (parseFloat(s.wolt) || 0), 0);
  const monthlyInvoices = invoices.filter((i) => i.date?.startsWith(monthKey));
  const monthlyDeliveries = deliveries.filter((d) => d.date?.startsWith(monthKey));

  // פוד קוסט חכם: ספק עם חשבונית החודש → חשבונית בלבד; ספק ללא חשבונית → תעודות משלוח
  const suppliersWithInvoice = new Set(monthlyInvoices.map(i => i.supplierId));
  const invoiceCost = monthlyInvoices.reduce((a, i) => a + (parseFloat(i.total) || 0), 0);
  const deliveryCostNoInvoice = monthlyDeliveries
    .filter(d => !suppliersWithInvoice.has(d.supplierId))
    .reduce((a, d) => a + (parseFloat(d.total) || 0), 0);
  const totalCost = invoiceCost + deliveryCostNoInvoice;
  const deliveryCovered = monthlyDeliveries.filter(d => suppliersWithInvoice.has(d.supplierId)).reduce((a, d) => a + (parseFloat(d.total) || 0), 0);
  const foodCostPct = parseFloat(pct(totalCost, totalSales));

  // Labor cost
  const monthlyHours = hours.filter((h) => h.date?.startsWith(monthKey));
  const totalLaborCost = monthlyHours.reduce((a, h) => {
    const emp = employees.find((e) => e.id === h.employeeId);
    return a + (parseFloat(h.hours) || 0) * (parseFloat(emp?.hourlyRate) || 0);
  }, 0);
  const totalLaborHours = monthlyHours.reduce((a, h) => a + (parseFloat(h.hours) || 0), 0);
  const laborCostPct = parseFloat(pct(totalLaborCost, totalSales));
  const primeCostPct = parseFloat((foodCostPct + laborCostPct).toFixed(1));

  // Operational expenses this month
  const monthlyExpenses = (expenses || []).filter(e => e.date?.startsWith(monthKey));
  const totalExpenses = monthlyExpenses.reduce((a, e) => a + parseFloat(e.amount || 0), 0);
  const netProfit = totalSales - totalCost - totalLaborCost - totalExpenses;
  const netProfitPct = parseFloat(pct(netProfit, totalSales));
  const netColor = netProfitPct >= 15 ? "#22c55e" : netProfitPct >= 5 ? "#f59e0b" : "#ef4444";
  const expensePct = parseFloat(pct(totalExpenses, totalSales));
  const expenseColor = expensePct <= (settings.expenseGreenMax ?? 20) ? "#22c55e" : expensePct <= (settings.expenseYellowMax ?? 28) ? "#f59e0b" : "#ef4444";

  const lcColor = laborCostPct <= settings.laborGreenMax ? "#22c55e" : laborCostPct <= settings.laborYellowMax ? "#f59e0b" : "#ef4444";
  const pcColor = primeCostPct <= 55 ? "#22c55e" : primeCostPct <= 65 ? "#f59e0b" : "#ef4444";

  const alerts = [];
  invoices.forEach((inv) => {
    (inv.items || []).forEach((item) => {
      const prod = products.find((p) => p.id === item.productId);
      if (prod && prod.basePrice > 0) {
        const diff = ((parseFloat(item.price) - parseFloat(prod.basePrice)) / parseFloat(prod.basePrice)) * 100;
        if (diff > 5) alerts.push({ inv, item, prod, diff });
      }
    });
  });

  const supplierStats = suppliers.map((sup) => {
    const supInvoices = monthlyInvoices.filter((i) => i.supplierId === sup.id);
    const invoiceCostSup = supInvoices.reduce((a, i) => a + (parseFloat(i.total) || 0), 0);
    // אם אין חשבונית לספק זה החודש — קח מתעודות משלוח
    const hasInvoice = supInvoices.length > 0;
    const deliveryCostSup = hasInvoice ? 0 : monthlyDeliveries
      .filter(d => d.supplierId === sup.id)
      .reduce((a, d) => a + (parseFloat(d.total) || 0), 0);
    const cost = invoiceCostSup + deliveryCostSup;
    return { ...sup, cost, pct: parseFloat(pct(cost, totalSales)), fromDelivery: !hasInvoice && deliveryCostSup > 0 };
  }).filter((s) => s.cost > 0);

  const fcColor = foodCostPct <= settings.greenMax ? "#22c55e" : foodCostPct <= settings.yellowMax ? "#f59e0b" : "#ef4444";

  // Labor per employee this month
  const empStats = employees.map((emp) => {
    const empHours = monthlyHours.filter((h) => h.employeeId === emp.id);
    const hrs = empHours.reduce((a, h) => a + (parseFloat(h.hours) || 0), 0);
    const cost = hrs * (parseFloat(emp.hourlyRate) || 0);
    return { ...emp, hrs, cost };
  }).filter((e) => e.hrs > 0);

  const lcSettings = { greenMax: settings.laborGreenMax, yellowMax: settings.laborYellowMax };

  const buildContext = () => {
    const allSales = [...sales].sort((a,b) => a.date.localeCompare(b.date));
    const monthlySalesData = allSales.filter(s => s.date?.startsWith(monthKey));
    const dayOfWeekStats = {};
    monthlySalesData.forEach(s => {
      const d = new Date(s.date);
      const day = ["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"][d.getDay()];
      if (!dayOfWeekStats[day]) dayOfWeekStats[day] = { total: 0, count: 0 };
      dayOfWeekStats[day].total += (parseFloat(s.kupa)||0) + (parseFloat(s.wolt)||0);
      dayOfWeekStats[day].count++;
    });
    const dayStats = Object.entries(dayOfWeekStats).map(([d,v]) => `${d}: ממוצע ₪${(v.total/v.count).toFixed(0)}`).join(", ");
    const topSuppliers = supplierStats.slice(0,5).map(s => `${s.name}: ₪${s.cost.toFixed(0)} (${s.pct}%)`).join(", ");
    const priceAlerts = alerts.slice(0,5).map(a => `${a.prod.name} אצל ${suppliers.find(s=>s.id===a.inv.supplierId)?.name||"?"}: +${a.diff.toFixed(1)}%`).join(", ");
    const empData = empStats.map(e => `${e.name}: ${e.hrs}ש, ₪${e.cost.toFixed(0)}`).join(", ");
    const expenseData = (expenses||[]).filter(e=>e.date?.startsWith(monthKey)).reduce((a,e)=>a+parseFloat(e.amount||0),0);

    return `אתה יועץ עסקי מומחה למסעדות מזון מהיר וניהול עלויות. אתה מנתח את עסק "New York Hotdog" בסניף אשדוד — רשת נקניקיות גורמה כשרה.

תפריט העסק: נקניקיות ניו-יורק (קלאסי ₪37, מנהטן ₪42, ברודווי ₪40, ברוקלין ₪40, הארלם ₪42), טוסט נקניק ₪37, נקניקיית נשנוש ₪13, ילדים ₪18, נאצ'וס ₪15. גם מכירות ב-Wolt.

נתוני החודש הנוכחי (${monthKey}):
- סה"כ מכירות: ₪${totalSales.toFixed(0)} (קופה: ₪${totalKupa.toFixed(0)} | וולט: ₪${totalWolt.toFixed(0)})
- עלות מזון (פוד קוסט): ₪${totalCost.toFixed(0)} = ${foodCostPct}% | יעד: עד ${settings.greenMax}%
- עלות עבודה (לייבור): ₪${totalLaborCost.toFixed(0)} = ${laborCostPct}% | יעד: עד ${settings.laborGreenMax}%
- פריים קוסט: ${primeCostPct}% | יעד: עד 55%
- הוצאות תפעול: ₪${totalExpenses.toFixed(0)} = ${expensePct.toFixed(1)}%
- רווח נקי: ₪${netProfit.toFixed(0)} = ${netProfitPct}%
- ימי מכירה מוזנים: ${monthlySalesData.length}

ספקים עיקריים החודש: ${topSuppliers || "אין עדיין"}
חריגות מחיר: ${priceAlerts || "אין חריגות"}
עובדים פעילים: ${empData || "אין נתונים"}
הוצאות תפעול החודש: ₪${expenseData.toFixed(0)}
מכירות לפי יום בשבוע: ${dayStats || "אין מספיק נתונים"}

ענה בעברית, תהיה ספציפי לנתונים האמיתיים, תזהה בעיות ותתן המלצות מעשיות. אל תאמר "אני לא יכול לדעת" — נתח את מה שיש. השתמש בנתונים המספריים הספציפיים בתשובתך.`;
  };

  const sendAIMessage = async () => {
    const msg = aiInput.trim();
    if (!msg || aiLoading) return;
    setAiInput("");
    const userMsg = { role: "user", content: msg };
    setAiMessages(prev => [...prev, userMsg]);
    setAiLoading(true);
    try {
      const systemPrompt = buildContext();
      const history = [...aiMessages, userMsg].slice(-10);
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: history.map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await response.json();
      const text = data.content?.find(b => b.type === "text")?.text || "שגיאה בקבלת תשובה";
      setAiMessages(prev => [...prev, { role: "assistant", content: text }]);
      setTimeout(() => {
        const el = document.getElementById("ai-messages");
        if (el) el.scrollTop = el.scrollHeight;
      }, 100);
    } catch(e) {
      setAiMessages(prev => [...prev, { role: "assistant", content: "❌ שגיאה: " + e.message }]);
    }
    setAiLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Prime Cost banner */}
      {totalSales > 0 && (
        <div style={{ background: `linear-gradient(135deg, #fff8f8, #f8fafc)`, border: `2px solid ${pcColor}`, borderRadius: 12, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>PRIME COST — פוד + לייבור</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: pcColor }}>{primeCostPct}%</div>
            <div style={{ fontSize: 12, color: pcColor, marginTop: 2 }}>
              {primeCostPct <= 55 ? "✓ מצוין" : primeCostPct <= 65 ? "⚠ גבולי" : "✗ גבוה — נדרשת פעולה"}
              {" | "}יעד: מתחת ל-55%
            </div>
            {deliveryCostNoInvoice > 0 && (
              <div style={{ fontSize: 11, color: "#f59e0b", marginTop: 4 }}>
                ⚠ כולל ₪{fmt(deliveryCostNoInvoice)} מתעודות משלוח ללא חשבונית
              </div>
            )}
            {deliveryCovered > 0 && (
              <div style={{ fontSize: 11, color: "#22c55e", marginTop: 2 }}>
                ✓ ₪{fmt(deliveryCovered)} מתעודות — מכוסות ע"י חשבוניות (לא נספרות פעמיים)
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>פוד קוסט</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: fcColor }}>{foodCostPct}%</div>
            </div>
            <div style={{ color: "#cbd5e1", fontSize: 24, alignSelf: "center" }}>+</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>לייבור קוסט</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: lcColor }}>{laborCostPct}%</div>
            </div>
          </div>
        </div>
      )}

      {/* Net Profit banner */}
      {totalSales > 0 && totalExpenses > 0 && (
        <div style={{ background: "linear-gradient(135deg, #f0fdf4, #dcfce7)", border: `2px solid ${netColor}`, borderRadius: 12, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>רווח נקי — אחרי כל ההוצאות</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: netColor }}>₪{fmt(netProfit)}</div>
            <div style={{ fontSize: 12, color: netColor, marginTop: 2 }}>
              {netProfitPct >= 15 ? "✓ מצוין" : netProfitPct >= 5 ? "⚠ גבולי" : "✗ הפסד"}
              {" | "}{netProfitPct}% מהמכירות
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>מכירות</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#1e293b" }}>₪{fmt(totalSales)}</div>
            </div>
            <div style={{ color: "#cbd5e1", fontSize: 20, alignSelf: "center" }}>−</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>פוד קוסט</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#1e293b" }}>₪{fmt(totalCost)}</div>
            </div>
            <div style={{ color: "#cbd5e1", fontSize: 20, alignSelf: "center" }}>−</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>עבודה</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#fb923c" }}>₪{fmt(totalLaborCost)}</div>
            </div>
            <div style={{ color: "#cbd5e1", fontSize: 20, alignSelf: "center" }}>−</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>תפעול</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: expenseColor }}>₪{fmt(totalExpenses)}</div>
              <div style={{ fontSize: 11, color: expenseColor }}>{expensePct}%</div>
            </div>
            <div style={{ color: "#cbd5e1", fontSize: 20, alignSelf: "center" }}>=</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>רווח</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: netColor }}>₪{fmt(netProfit)}</div>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <KpiCard label="מכירות החודש" value={`₪${fmt(totalSales)}`} accent="#0284c7" sub={`קופה ₪${fmt(totalKupa)} | וולט ₪${fmt(totalWolt)}`} />
        <KpiCard label="עלות ספקים" value={`₪${fmt(totalCost)}`} accent="#64748b" sub={`${monthlyInvoices.length} חשבוניות${deliveryCostNoInvoice > 0 ? ` + ₪${fmt(deliveryCostNoInvoice)} תעודות` : ""}`} />
        <KpiCard label="פוד קוסט" value={<StatusBadge value={foodCostPct} settings={settings} />} accent="#f472b6" raw />
        <KpiCard label="עלות עבודה" value={`₪${fmt(totalLaborCost)}`} accent="#fb923c" sub={`${totalLaborHours.toFixed(1)} שעות`} />
        <KpiCard label="לייבור קוסט" value={<StatusBadge value={laborCostPct} settings={lcSettings} />} accent="#fb923c" raw />
        <KpiCard label="התראות מחיר" value={alerts.length} accent={alerts.length > 0 ? "#f59e0b" : "#22c55e"} sub={alerts.length > 0 ? "דרוש טיפול" : "הכל תקין"} />
      </div>

      {/* Food cost bar */}
      <Card title="פוד קוסט חודשי">
        <div style={{ marginBottom: 8, color: "#64748b", fontSize: 13 }}>
          יעד: עד {settings.greenMax}% | גבולי: {settings.greenMax}%–{settings.yellowMax}% | גבוה: מעל {settings.yellowMax}%
        </div>
        <div style={{ background: "#f1f5f9", borderRadius: 8, height: 28, overflow: "hidden" }}>
          <div style={{ width: `${Math.min(foodCostPct, 100)}%`, height: "100%", background: fcColor, borderRadius: 8, transition: "width 0.6s ease", display: "flex", alignItems: "center", paddingRight: 10, fontSize: 13, fontWeight: 700, color: "#fff" }}>
            {foodCostPct > 5 ? `${foodCostPct}%` : ""}
          </div>
        </div>
        <div style={{ marginTop: 6, display: "flex", gap: 16, fontSize: 12 }}>
          <span>🟢 תקין עד {settings.greenMax}%</span>
          <span>🟡 גבולי עד {settings.yellowMax}%</span>
          <span>🔴 גבוה מעל {settings.yellowMax}%</span>
        </div>
      </Card>

      {/* Labor cost bar */}
      {totalLaborCost > 0 && (
        <Card title="לייבור קוסט חודשי">
          <div style={{ marginBottom: 8, color: "#64748b", fontSize: 13 }}>
            יעד: עד {settings.laborGreenMax}% | גבולי: {settings.laborGreenMax}%–{settings.laborYellowMax}% | גבוה: מעל {settings.laborYellowMax}%
          </div>
          <div style={{ background: "#f1f5f9", borderRadius: 8, height: 28, overflow: "hidden" }}>
            <div style={{ width: `${Math.min(laborCostPct, 100)}%`, height: "100%", background: lcColor, borderRadius: 8, transition: "width 0.6s ease", display: "flex", alignItems: "center", paddingRight: 10, fontSize: 13, fontWeight: 700, color: "#fff" }}>
              {laborCostPct > 5 ? `${laborCostPct}%` : ""}
            </div>
          </div>
          <div style={{ marginTop: 6, display: "flex", gap: 16, fontSize: 12 }}>
            <span>🟢 תקין עד {settings.laborGreenMax}%</span>
            <span>🟡 גבולי עד {settings.laborYellowMax}%</span>
            <span>🔴 גבוה מעל {settings.laborYellowMax}%</span>
          </div>
          {empStats.length > 0 && (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginTop: 14 }}>
              <thead><tr style={{ color: "#64748b", borderBottom: "1px solid #cbd5e1" }}><Th>עובד</Th><Th>שעות</Th><Th>₪/שעה</Th><Th>עלות</Th><Th>% ממכירות</Th></tr></thead>
              <tbody>
                {empStats.map((e) => (
                  <tr key={e.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <Td>{e.name}</Td>
                    <Td>{e.hrs.toFixed(1)}</Td>
                    <Td style={{ color: "#64748b" }}>₪{fmt(e.hourlyRate)}</Td>
                    <Td style={{ color: "#fb923c" }}>₪{fmt(e.cost)}</Td>
                    <Td>{pct(e.cost, totalSales)}%</Td>
                  </tr>
                ))}
                <tr style={{ borderTop: "2px solid #cbd5e1", fontWeight: 700 }}>
                  <Td style={{ color: "#64748b" }}>סה״כ</Td>
                  <Td>{totalLaborHours.toFixed(1)}</Td>
                  <Td></Td>
                  <Td style={{ color: "#fb923c" }}>₪{fmt(totalLaborCost)}</Td>
                  <Td><StatusBadge value={laborCostPct} settings={lcSettings} /></Td>
                </tr>
              </tbody>
            </table>
          )}
        </Card>
      )}

      {supplierStats.length > 0 && (
        <Card title="פוד קוסט לפי ספק — חודש נוכחי">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr style={{ color: "#64748b", borderBottom: "1px solid #cbd5e1" }}><Th>ספק</Th><Th>עלות</Th><Th>% מהמכירות</Th><Th>סטטוס</Th></tr></thead>
            <tbody>
              {supplierStats.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <Td>
                    {s.name}
                    {s.fromDelivery && <span style={{ fontSize: 10, color: "#f59e0b", marginRight: 6, background: "#fffbeb", border: "1px solid #f59e0b", borderRadius: 4, padding: "1px 5px" }}>תעודה</span>}
                  </Td>
                  <Td>₪{fmt(s.cost)}</Td><Td>{s.pct}%</Td>
                  <Td><StatusBadge value={s.pct} settings={settings} /></Td>
                </tr>
              ))}
              <tr style={{ borderBottom: "1px solid #e2e8f0", fontWeight: 700 }}>
                <Td style={{ color: "#64748b" }}>סה״כ</Td><Td>₪{fmt(totalCost)}</Td><Td>{foodCostPct}%</Td>
                <Td><StatusBadge value={foodCostPct} settings={settings} /></Td>
              </tr>
            </tbody>
          </table>
        </Card>
      )}

      {alerts.length > 0 && (
        <Card title={`⚠️ התראות חריגת מחיר — דרוש זיכוי (${alerts.length})`}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr style={{ color: "#64748b", borderBottom: "1px solid #cbd5e1" }}><Th>תאריך</Th><Th>ספק</Th><Th>פריט</Th><Th>מחיר בסיס</Th><Th>מחיר בחשבונית</Th><Th>חריגה</Th></tr></thead>
            <tbody>
              {alerts.map((a, i) => {
                const sup = suppliers.find((s) => s.id === a.inv.supplierId);
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #e2e8f0", background: "#fff5f5" }}>
                    <Td>{a.inv.date}</Td><Td>{sup?.name || "—"}</Td>
                    <Td><strong>{a.prod.name}</strong></Td>
                    <Td>₪{fmt(a.prod.basePrice)}</Td>
                    <Td style={{ color: "#f87171" }}>₪{fmt(a.item.price)}</Td>
                    <Td style={{ color: "#ef4444", fontWeight: 700 }}>+{a.diff.toFixed(1)}% 🔴 דרוש זיכוי</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {totalSales === 0 && supplierStats.length === 0 && (
        <div style={{ textAlign: "center", color: "#64748b", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌭</div>
          <div style={{ fontSize: 16 }}>התחל בהכנסת ספקים, מחירי בסיס, מכירות וחשבוניות</div>
        </div>
      )}

      {/* Cash Deposits summary */}
      {(() => {
        const monthCash = cashDeposits.filter(d => d.date?.startsWith(monthKey));
        const totalWithdrawn = monthCash.reduce((a, d) => a + parseFloat(d.amount || 0), 0);
        const totalDeposited = monthCash.reduce((a, d) => a + parseFloat(d.bankAmount || 0), 0);
        const pendingDeposit = monthCash.filter(d => !d.bankAmount).reduce((a, d) => a + parseFloat(d.amount || 0), 0);
        const gap = totalDeposited - totalWithdrawn;
        if (totalWithdrawn === 0) return null;
        return (
          <Card title="💵 מזומן — בקרת הפקדות החודש">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
              <div style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 14px", border: "1px solid #e2e8f0" }}>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>הוצא מהקופה</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#cc0000" }}>₪{fmt(totalWithdrawn)}</div>
              </div>
              <div style={{ background: "#f0fdf4", borderRadius: 8, padding: "10px 14px", border: "1px solid #22c55e" }}>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>הופקד בבנק</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#22c55e" }}>₪{fmt(totalDeposited)}</div>
              </div>
              <div style={{ background: pendingDeposit > 0 ? "#fffbeb" : "#f0fdf4", borderRadius: 8, padding: "10px 14px", border: `1px solid ${pendingDeposit > 0 ? "#f59e0b" : "#22c55e"}` }}>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>ממתין להפקדה</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: pendingDeposit > 0 ? "#f59e0b" : "#22c55e" }}>₪{fmt(pendingDeposit)}</div>
              </div>
              <div style={{ background: Math.abs(gap) < 5 ? "#f0fdf4" : gap < 0 ? "#fff5f5" : "#fffbeb", borderRadius: 8, padding: "10px 14px", border: `1px solid ${Math.abs(gap) < 5 ? "#22c55e" : gap < 0 ? "#ef4444" : "#f59e0b"}` }}>
                <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>הפרש: הופקד vs. הוצא</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: Math.abs(gap) < 5 ? "#22c55e" : gap < 0 ? "#ef4444" : "#f59e0b" }}>{gap >= 0 ? "+" : ""}₪{fmt(gap)}</div>
                <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{Math.abs(gap) < 5 ? "✓ תקין" : gap < 0 ? "⚠ חסר" : "⚠ עודף"}</div>
              </div>
            </div>
          </Card>
        );
      })()}

      {/* AI Agent */}
      <div style={{ border: "2px solid #cc0000", borderRadius: 14, overflow: "hidden", background: "#fff" }}>
        <div onClick={() => setShowAI(p => !p)} style={{ padding: "14px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(135deg, #cc0000, #8b0000)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 24 }}>🤖</span>
            <div>
              <div style={{ fontWeight: 800, color: "#1e293b", fontSize: 15 }}>סוכן AI — יועץ עסקי</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>מנתח את הנתונים שלך בזמן אמת | מתמחה במסעדות מזון מהיר</div>
            </div>
          </div>
          <span style={{ color: "#ffffff", fontSize: 18 }}>{showAI ? "▲" : "▼ לחץ לפתיחה"}</span>
        </div>

        {showAI && (
          <div style={{ padding: 16 }}>
            {/* Quick action buttons */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
              {[
                "נתח את הפוד קוסט שלי החודש",
                "איפה אני מפסיד כסף?",
                "מה ה-Prime Cost שלי ואיך לשפר?",
                "נתח את הספקים היקרים ביותר",
                "מה ימי המכירה החזקים/חלשים?",
                "תן לי 3 המלצות לשיפור הרווחיות",
              ].map(q => (
                <button key={q} onClick={() => { setAiInput(q); }} style={{ background: "#fff1f1", border: "1px solid #cc0000", color: "#1e293b", borderRadius: 20, padding: "5px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                  {q}
                </button>
              ))}
            </div>

            {/* Messages */}
            {aiMessages.length > 0 && (
              <div style={{ maxHeight: 420, overflowY: "auto", marginBottom: 12, display: "flex", flexDirection: "column", gap: 10 }} id="ai-messages">
                {aiMessages.map((m, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                    <div style={{
                      maxWidth: "85%", padding: "10px 14px", borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                      background: m.role === "user" ? "#cc0000" : "#f8fafc",
                      color: "#1e293b", fontSize: 13, lineHeight: 1.6,
                      border: m.role === "assistant" ? "1px solid #e2e8f0" : "none",
                      whiteSpace: "pre-wrap"
                    }}>
                      {m.role === "assistant" && <div style={{ fontSize: 11, color: "#cc0000", marginBottom: 4, fontWeight: 700 }}>🤖 יועץ AI</div>}
                      {m.content}
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div style={{ display: "flex", justifyContent: "flex-start" }}>
                    <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "14px 14px 14px 4px", padding: "10px 16px", color: "#cc0000", fontSize: 13 }}>
                      ⏳ מנתח את הנתונים...
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Input */}
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAIMessage(); } }}
                placeholder="שאל אותי כל שאלה על העסק..."
                style={{ ...inputStyle, flex: 1, fontSize: 13 }}
              />
              <Btn onClick={sendAIMessage} style={{ background: aiLoading ? "#94a3b8" : "#cc0000", minWidth: 70 }} disabled={aiLoading}>
                {aiLoading ? "⏳" : "שלח ➤"}
              </Btn>
              {aiMessages.length > 0 && <Btn onClick={() => setAiMessages([])} style={{ background: "#f1f5f9", color: "#64748b", fontSize: 11 }}>נקה</Btn>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Suppliers({ suppliers, setSuppliers, products, setProducts, inventoryCategories }) {
  const DEFAULT_CATS = [
    { id: "naknikiyot", label: "נקניקיות", emoji: "🌭" },
    { id: "shtiya_cola", label: "שתייה — קוקה קולה", emoji: "🥤" },
    { id: "shtiya_agm", label: 'שתייה — אג"מ', emoji: "🍺" },
    { id: "chad_pami", label: "חד פעמי", emoji: "🥡" },
    { id: "levamot_naknik", label: "לחמניות נקניקייה", emoji: "🍞" },
    { id: "levamot_toast", label: "לחמניות טוסט", emoji: "🥖" },
    { id: "ratabim", label: "רטבים", emoji: "🫙" },
    { id: "other", label: "שונות", emoji: "📦" },
  ];
  const CATS = inventoryCategories?.length > 0 ? inventoryCategories : DEFAULT_CATS;
  const [newSupName, setNewSupName] = useState("");
  const [selSup, setSelSup] = useState(null);
  const [newProd, setNewProd] = useState({ name: "", unit: "ק\"ג", basePrice: "" });

  const [newSupContact, setNewSupContact] = useState("");
  const [newSupPhone, setNewSupPhone] = useState("");
  const [editSupId, setEditSupId] = useState(null);
  const [editSupVals, setEditSupVals] = useState({ name: "", contact: "", phone: "" });
  const [editProdId, setEditProdId] = useState(null);
  const [editProdVals, setEditProdVals] = useState({ name: "", unit: "ק\"ג", basePrice: "" });

  const addSupplier = () => {
    if (!newSupName.trim()) return;
    setSuppliers((p) => [...p, { id: Date.now().toString(), name: newSupName.trim(), contact: newSupContact.trim(), phone: newSupPhone.trim() }]);
    setNewSupName(""); setNewSupContact(""); setNewSupPhone("");
  };
  const addProduct = () => {
    if (!selSup || !newProd.name.trim() || !newProd.basePrice) return;
    setProducts((prev) => [...prev, { id: Date.now().toString(), supplierId: selSup, name: newProd.name.trim(), unit: newProd.unit, basePrice: parseFloat(newProd.basePrice) }]);
    setNewProd({ name: "", unit: "ק\"ג", basePrice: "" });
  };
  const updateBasePrice = (id, val) => setProducts((p) => p.map((pr) => pr.id === id ? { ...pr, basePrice: parseFloat(val) || 0 } : pr));
  const delSupplier = (id) => { setSuppliers((p) => p.filter((s) => s.id !== id)); setProducts((p) => p.filter((pr) => pr.supplierId !== id)); if (selSup === id) setSelSup(null); };
  const delProduct = (id) => setProducts((p) => p.filter((pr) => pr.id !== id));
  const supProds = selSup ? products.filter((p) => p.supplierId === selSup) : [];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
      <Card title="רשימת ספקים">
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
          <input value={newSupName} onChange={(e) => setNewSupName(e.target.value)} placeholder="שם ספק *" onKeyDown={(e) => e.key === "Enter" && addSupplier()} style={inputStyle} />
          <input value={newSupContact} onChange={(e) => setNewSupContact(e.target.value)} placeholder="👤 שם איש קשר (אופציונלי)" style={inputStyle} />
          <input value={newSupPhone} onChange={(e) => setNewSupPhone(e.target.value)} placeholder="📞 טלפון (אופציונלי)" style={inputStyle} />
          <Btn onClick={addSupplier}>+ הוסף ספק</Btn>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {suppliers.length === 0 && <div style={{ color: "#64748b", fontSize: 13, padding: 8 }}>אין ספקים עדיין</div>}
          {suppliers.map((s) => (
            <div key={s.id} style={{ borderRadius: 8, overflow: "hidden", border: `1px solid ${selSup === s.id ? "#cc0000" : "#e2e8f0"}`, marginBottom: 2 }}>
              <div onClick={() => { setSelSup(s.id); setEditSupId(null); }} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 12px", cursor: "pointer",
                background: selSup === s.id ? "#fee2e2" : "#ffffff", transition: "all 0.15s"
              }}>
                <div>
                  <div style={{ fontWeight: selSup === s.id ? 700 : 400 }}>{s.name}</div>
                  {s.contact && <div style={{ fontSize: 11, color: "#64748b" }}>👤 {s.contact}</div>}
                  {s.phone && <div style={{ fontSize: 11, color: "#64748b" }}>📞 <a href={`tel:${s.phone}`} onClick={e=>e.stopPropagation()} style={{ color: "#1e293b", textDecoration: "none" }}>{s.phone}</a></div>}
                </div>
                <span style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12 }}>
                  <span style={{ color: "#64748b" }}>{products.filter((p) => p.supplierId === s.id).length} פריטים</span>
                  <button onClick={(e) => { e.stopPropagation(); setEditSupId(editSupId === s.id ? null : s.id); setEditSupVals({ name: s.name, contact: s.contact||"", phone: s.phone||"" }); }} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 13 }}>✏️</button>
                  <button onClick={(e) => { e.stopPropagation(); delSupplier(s.id); }} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16 }}>×</button>
                </span>
              </div>
              {editSupId === s.id && (
                <div style={{ background: "#ffffff", padding: "10px 12px", borderTop: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: 6 }}>
                  <input value={editSupVals.name} onChange={e => setEditSupVals(p=>({...p, name: e.target.value}))} placeholder="שם ספק" style={{ ...inputStyle, fontSize: 12 }} />
                  <input value={editSupVals.contact} onChange={e => setEditSupVals(p=>({...p, contact: e.target.value}))} placeholder="👤 שם איש קשר" style={{ ...inputStyle, fontSize: 12 }} />
                  <input value={editSupVals.phone} onChange={e => setEditSupVals(p=>({...p, phone: e.target.value}))} placeholder="📞 טלפון" style={{ ...inputStyle, fontSize: 12 }} />
                  <div>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 3 }}>📦 קטגוריית מלאי</div>
                    <select value={editSupVals.inventoryCategory || "other"} onChange={e => setEditSupVals(p=>({...p, inventoryCategory: e.target.value}))} style={{ ...inputStyle, fontSize: 12 }}>
                      <option value="other">📦 שונות (ברירת מחדל)</option>
                      <option value="naknikiyot">🌭 נקניקיות — הנדלס</option>
                      <option value="shtiya_cola">🥤 שתייה — קוקה קולה</option>
                      <option value="shtiya_agm">🍺 שתייה — אג"מ סחר</option>
                      <option value="chad_pami">🥡 חד פעמי</option>
                      <option value="levamot_naknik">🍞 לחמניות נקניקייה</option>
                      <option value="levamot_toast">🥖 לחמניות טוסט</option>
                      <option value="ratabim">🫙 רטבים — גורן</option>
                    </select>
                  </div>
                  <Btn onClick={() => { setSuppliers(p => p.map(x => x.id===s.id ? {...x, ...editSupVals} : x)); setEditSupId(null); }} style={{ background: "#22c55e", fontSize: 12, padding: "5px 10px" }}>💾 שמור</Btn>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card title={selSup ? `מחירי בסיס — ${suppliers.find((s) => s.id === selSup)?.name}` : "← בחר ספק"}>
        {selSup ? (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              <input value={newProd.name} onChange={(e) => setNewProd((p) => ({ ...p, name: e.target.value }))}
                placeholder="שם פריט" style={{ ...inputStyle, flex: 3 }} />
              <select value={newProd.unit} onChange={(e) => setNewProd((p) => ({ ...p, unit: e.target.value }))}
                style={{ ...inputStyle, flex: 1, minWidth: 90 }}>
                {["ק\"ג", "יחידה", "ליטר", "קרטון", "שק", "קופסה", "100 גרם"].map((u) => <option key={u}>{u}</option>)}
              </select>
              <input value={newProd.basePrice} onChange={(e) => setNewProd((p) => ({ ...p, basePrice: e.target.value }))}
                placeholder="מחיר ₪" type="number" style={{ ...inputStyle, flex: 1, minWidth: 90 }} />
              <Btn onClick={addProduct}>הוסף פריט</Btn>
            </div>
            {supProds.length === 0
              ? <div style={{ color: "#aaa", fontSize: 13 }}>הוסף פריטים לספק זה</div>
              : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead><tr style={{ color: "#64748b", borderBottom: "1px solid #cbd5e1" }}><Th>פריט</Th><Th>יחידה</Th><Th>מחיר בסיס (₪)</Th><Th>יח׳ לאריזה</Th><Th>קטגוריה</Th><Th>🔴 מינימום</Th><Th>🟢 מקסימום</Th><Th></Th></tr></thead>
                  <tbody>
                    {supProds.map((p) => (
                      <tr key={p.id} style={{ borderBottom: "1px solid #e2e8f0", background: editProdId === p.id ? "#fff8f8" : "transparent" }}>
                        {editProdId === p.id ? (
                          <>
                            <Td><input value={editProdVals.name} onChange={e => setEditProdVals(v => ({ ...v, name: e.target.value }))} style={{ ...inputStyle, width: "100%" }} /></Td>
                            <Td>
                              <select value={editProdVals.unit} onChange={e => setEditProdVals(v => ({ ...v, unit: e.target.value }))} style={inputStyle}>
                                {["ק\"ג", "יחידה", "ליטר", "קרטון", "שק", "קופסה", "100 גרם"].map(u => <option key={u}>{u}</option>)}
                              </select>
                            </Td>
                            <Td><input type="number" value={editProdVals.basePrice} onChange={e => setEditProdVals(v => ({ ...v, basePrice: e.target.value }))} style={{ ...inputStyle, width: 90 }} /></Td>
                            <Td>
                              <input type="number" value={editProdVals.unitsPerPack || ""} onChange={e => setEditProdVals(v => ({ ...v, unitsPerPack: e.target.value }))} placeholder="1" style={{ ...inputStyle, width: 70, color: "#0284c7" }} />
                              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>יח׳ ב{editProdVals.unit || "אריזה"}</div>
                            </Td>
                            <Td>
                              <select value={editProdVals.inventoryCategory || ""} onChange={e => setEditProdVals(v => ({ ...v, inventoryCategory: e.target.value }))} style={{ ...inputStyle, fontSize: 12 }}>
                                <option value="">— כמו הספק —</option>
                                {CATS.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
                              </select>
                            </Td>
                            <Td><input type="number" value={editProdVals.minStock || ""} onChange={e => setEditProdVals(v => ({ ...v, minStock: e.target.value }))} placeholder="מינ׳" style={{ ...inputStyle, width: 70, color: "#dc2626" }} /></Td>
                            <Td><input type="number" value={editProdVals.maxStock || ""} onChange={e => setEditProdVals(v => ({ ...v, maxStock: e.target.value }))} placeholder="מקס׳" style={{ ...inputStyle, width: 70, color: "#16a34a" }} /></Td>
                            <Td>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button onClick={() => {
                                  setProducts(prev => prev.map(pr => pr.id === p.id ? { ...pr, name: editProdVals.name, unit: editProdVals.unit, basePrice: parseFloat(editProdVals.basePrice) || 0, unitsPerPack: parseFloat(editProdVals.unitsPerPack) || 1, minStock: parseFloat(editProdVals.minStock) || 0, maxStock: parseFloat(editProdVals.maxStock) || 0, inventoryCategory: editProdVals.inventoryCategory || undefined } : pr));
                                  setEditProdId(null);
                                }} style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 5, padding: "3px 8px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>✓</button>
                                <button onClick={() => setEditProdId(null)} style={{ background: "#e2e8f0", color: "#64748b", border: "none", borderRadius: 5, padding: "3px 8px", cursor: "pointer", fontSize: 12 }}>✕</button>
                              </div>
                            </Td>
                          </>
                        ) : (
                          <>
                            <Td>{p.name}</Td>
                            <Td style={{ color: "#64748b" }}>{p.unit}</Td>
                            <Td>₪{fmt(p.basePrice)}</Td>
                            <Td style={{ color: "#0284c7", fontWeight: 600 }}>{p.unitsPerPack > 1 ? `${p.unitsPerPack} יח׳` : <span style={{ color: "#cbd5e1" }}>—</span>}</Td>
                            <Td style={{ fontSize: 11 }}>
                              {p.inventoryCategory
                                ? <span style={{ color: "#cc0000", fontWeight: 600 }}>{CATS.find(c => c.id === p.inventoryCategory)?.emoji} {CATS.find(c => c.id === p.inventoryCategory)?.label}</span>
                                : <span style={{ color: "#cbd5e1" }}>כמו הספק</span>}
                            </Td>
                            <Td style={{ color: "#dc2626", fontWeight: p.minStock ? 700 : 400 }}>{p.minStock || <span style={{ color: "#cbd5e1" }}>—</span>}</Td>
                            <Td style={{ color: "#16a34a", fontWeight: p.maxStock ? 700 : 400 }}>{p.maxStock || <span style={{ color: "#cbd5e1" }}>—</span>}</Td>
                            <Td>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button onClick={() => { setEditProdId(p.id); setEditProdVals({ name: p.name, unit: p.unit, basePrice: String(p.basePrice), unitsPerPack: String(p.unitsPerPack || ""), minStock: String(p.minStock || ""), maxStock: String(p.maxStock || ""), inventoryCategory: p.inventoryCategory || "" }); }} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 13 }}>✏️</button>
                                <button onClick={() => delProduct(p.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 15 }}>×</button>
                              </div>
                            </Td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
          </>
        ) : <div style={{ color: "#aaa", fontSize: 13, padding: 20, textAlign: "center" }}>בחר ספק מהרשימה לניהול מחירי הבסיס</div>}
      </Card>
    </div>
  );
}

// Compress image before upload — reduces mobile photo size from ~5MB to ~500KB
async function compressImage(file, maxWidthPx = 1600, quality = 0.82) {
  if (file.type === "application/pdf") {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res({ base64: r.result.split(",")[1], mediaType: "application/pdf" });
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }
  return new Promise((res, rej) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxWidthPx / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL("image/jpeg", quality).split(",")[1];
      res({ base64, mediaType: "image/jpeg" });
    };
    img.onerror = rej;
    img.src = url;
  });
}


function Invoices({ invoices, setInvoices, suppliers, products, setSuppliers, setProducts, settings, pending, setPending }) {
  const [form, setForm] = useState({ supplierId: "", date: today(), invoiceNum: "", items: [] });
  const [newItem, setNewItem] = useState({ productId: "", price: "", qty: "1" });
  const [showForm, setShowForm] = useState(false);
  const [editInvoice, setEditInvoice] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState("");
  const [originalImageUrl, setOriginalImageUrl] = useState(null);
  const [showLightbox, setShowLightbox] = useState(false);

  const scanInvoice = async (file) => {
    setScanning(true);
    setScanResult(null);
    setScanError("");
    // Save original image for viewing
    if (file.type !== "application/pdf") {
      setOriginalImageUrl(URL.createObjectURL(file));
    } else {
      setOriginalImageUrl(null);
    }
    try {
      const { base64, mediaType } = await compressImage(file);
      const isPdf = mediaType === "application/pdf";
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages: [{
            role: "user",
            content: [
              { type: isPdf ? "document" : "image", source: { type: "base64", media_type: mediaType, data: base64 } },
              { type: "text", text: `אתה מומחה בקריאת חשבוניות ישראליות. קרא את החשבונית בקפידה.

הכלל הקריטי לזיהוי כמות מול מחיר:
- כמות (qty): מספר שלם קטן — 1, 2, 3, 5, 10, 24, 48. לעולם לא יהיה מספר גדול עם נקודה עשרונית.
- מחיר (price): מספר עם אגורות — 12.50, 45.90, 120.00, 8.40. לרוב גדול מ-5.
- סה"כ שורה = qty × price. השתמש בזה לאימות: אם qty=2 ו-price=45.90 אז סה"כ שורה=91.80.
- אם רואים שתי עמודות מספרים ואחת קטנה (1-50) ואחת גדולה — הקטנה היא qty, הגדולה היא price.
- לעולם אל תשים מחיר בשדה qty!

החזר JSON בלבד, ללא markdown, ללא backticks:
{
  "supplierName": "שם הספק/חברה כפי שמופיע בראש החשבונית",
  "date": "YYYY-MM-DD",
  "invoiceNum": "מספר החשבונית",
  "items": [{ "name": "שם פריט", "unit": "יחידת מידה", "qty": 1.0, "price": 0.0 }],
  "total": 0.0
}

לפני שליחה — בדוק כל פריט: האם qty × price = סה"כ שורה? אם לא, תקן.` }
            ]
          }]
        })
      });
      const rawText = await response.text();
      const data = JSON.parse(rawText);
      const text = data.content?.find(b => b.type === "text")?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setScanResult(parsed);
    } catch (e) {
      setScanError("שגיאה: " + e.message);
    }
    setScanning(false);
  };

  const applyScanResult = () => {
    if (!scanResult) return;
    const existingSupplier = suppliers.find(s => s.name.trim() === scanResult.supplierName?.trim());
    const isNewSupplier = !existingSupplier;
    const supId = existingSupplier?.id || Date.now().toString();
    const supName = scanResult.supplierName;

    // Check for new products and price alerts
    const itemsAnalysis = (scanResult.items || []).map(item => {
      const existingProd = products.find(p => p.supplierId === supId && p.name.trim() === item.name?.trim());
      const isNew = !existingProd;
      const priceDiff = existingProd ? ((parseFloat(item.price) - existingProd.basePrice) / existingProd.basePrice) * 100 : 0;
      const hasAlert = !isNew && priceDiff > 5;
      return { ...item, isNew, hasAlert, priceDiff, existingProd };
    });

    const needsApproval = isNewSupplier || itemsAnalysis.some(i => i.isNew || i.hasAlert);

    // Build the pending item
    const pendingItem = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      scanResult,
      supId,
      supName,
      isNewSupplier,
      itemsAnalysis,
      needsApproval,
      status: "pending"
    };

    setPending(p => [...p, pendingItem]);
    setScanResult(null);

    if (needsApproval) {
      const msg = ["⏳ החשבונית נשלחה לאישור אוהד!",
        isNewSupplier ? "• ספק חדש: " + supName : "",
        itemsAnalysis.filter(i => i.isNew).length > 0 ? "• " + itemsAnalysis.filter(i => i.isNew).length + " מוצרים חדשים" : "",
        itemsAnalysis.filter(i => i.hasAlert).length > 0 ? "• " + itemsAnalysis.filter(i => i.hasAlert).length + " חריגות מחיר" : "",
        "", "לחץ על טאב 🔔 התראות לאישור"
      ].filter(Boolean).join("\n");
      alert(msg);
    } else {
      // No approval needed - save directly
      approvePendingItem(pendingItem, suppliers, products, setSuppliers, setProducts, setInvoices, setPending);
    }
  };

  // Also update the Invoices component to pass setPending
  const handleScanResult = (result) => { setScanResult(result); };

  const supProducts = products.filter((p) => p.supplierId === form.supplierId);
  const addItem = () => {
    if (!newItem.productId || !newItem.price || !newItem.qty) return;
    setForm((f) => ({ ...f, items: [...f.items, { ...newItem, id: Date.now().toString() }] }));
    setNewItem({ productId: "", price: "", qty: "1" });
  };
  const removeItem = (id) => setForm((f) => ({ ...f, items: f.items.filter((i) => i.id !== id) }));
  const saveInvoice = () => {
    if (!form.supplierId || !form.date || form.items.length === 0) return;
    const total = form.items.reduce((a, i) => a + parseFloat(i.price) * parseFloat(i.qty), 0);
    setInvoices((p) => [...p, { ...form, id: Date.now().toString(), total }]);
    setForm({ supplierId: "", date: today(), invoiceNum: "", items: [] });
    setShowForm(false);
  };

  const formAlerts = form.items.filter((item) => {
    const prod = products.find((p) => p.id === item.productId);
    return prod && prod.basePrice > 0 && ((parseFloat(item.price) - prod.basePrice) / prod.basePrice) * 100 > 5;
  });
  const formTotal = form.items.reduce((a, i) => a + (parseFloat(i.price) || 0) * (parseFloat(i.qty) || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ color: "#888", fontSize: 13 }}>{invoices.length} חשבוניות במערכת</div>
        <div style={{ display: "flex", gap: 8 }}>
          <label style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", opacity: scanning ? 0.6 : 1 }}>
            {scanning ? "⏳ סורק..." : "📸 סרוק חשבונית"}
            <input type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={e => e.target.files[0] && scanInvoice(e.target.files[0])} disabled={scanning} />
          </label>
          <Btn onClick={() => setShowForm(!showForm)} style={showForm ? { background: "#666" } : {}}>{showForm ? "✕ סגור" : "+ הכנסה ידנית"}</Btn>
        </div>
      </div>

      {scanError && <div style={{ background: "#fff5f5", border: "1px solid #ef4444", borderRadius: 8, padding: "10px 14px", color: "#f87171", fontSize: 13 }}>❌ {scanError}</div>}

      {/* Lightbox */}
      {showLightbox && originalImageUrl && (
        <div onClick={() => setShowLightbox(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.93)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out" }}>
          <img src={originalImageUrl} style={{ maxWidth: "95vw", maxHeight: "95vh", objectFit: "contain", borderRadius: 8 }} alt="חשבונית מקורית" />
          <div style={{ position: "absolute", top: 16, right: 16, background: "#f1f5f9", color: "#fff", borderRadius: 8, padding: "6px 14px", fontSize: 13 }}>לחץ לסגירה ✕</div>
        </div>
      )}

      {scanResult && (
        <Card title="📋 תוצאת סריקה — ערוך ואשר">
          {/* Magnifier button */}
          {originalImageUrl && (
            <div style={{ marginBottom: 12 }}>
              <button onClick={() => setShowLightbox(true)} style={{ background: "#f1f5f9", border: "1px solid #cc0000", color: "#1e293b", borderRadius: 8, padding: "7px 16px", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "inherit" }}>
                🔍 הצג חשבונית מקורית להשוואה
              </button>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>ספק</div>
              <input value={scanResult.supplierName || ""} onChange={e => setScanResult(p => ({ ...p, supplierName: e.target.value }))} style={{ ...inputStyle, width: "100%", color: "#1e293b", fontWeight: 700 }} />
              <select
                value={suppliers.find(s => s.name.trim() === scanResult.supplierName?.trim())?.id || ""}
                onChange={e => {
                  const sup = suppliers.find(s => s.id === e.target.value);
                  if (sup) setScanResult(p => ({ ...p, supplierName: sup.name }));
                }}
                style={{ ...inputStyle, marginTop: 4, fontSize: 12, color: "#64748b" }}
              >
                <option value="">— בחר מהרשימה —</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>תאריך</div>
              <input type="date" value={scanResult.date || ""} onChange={e => setScanResult(p => ({ ...p, date: e.target.value }))} style={{ ...inputStyle, width: "100%" }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>מס׳ חשבונית</div>
              <input value={scanResult.invoiceNum || ""} onChange={e => setScanResult(p => ({ ...p, invoiceNum: e.target.value }))} style={{ ...inputStyle, width: "100%" }} />
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 14 }}>
            <thead><tr style={{ color: "#64748b", borderBottom: "1px solid #cbd5e1" }}><Th>פריט (ערוך/בחר מרשימה)</Th><Th>כמות</Th><Th>יחידה</Th><Th>מחיר ליחידה</Th><Th>סה״כ</Th><Th></Th></tr></thead>
            <tbody>
              {(scanResult.items || []).map((item, i) => {
                const sup = suppliers.find(s => s.name.trim() === scanResult.supplierName?.trim());
                const supProds = sup ? products.filter(p => p.supplierId === sup.id) : [];
                const matchedProd = supProds.find(p => p.name.trim() === item.name?.trim());
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <Td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <input value={item.name || ""} onChange={e => setScanResult(p => ({ ...p, items: p.items.map((it, idx) => idx === i ? { ...it, name: e.target.value } : it) }))} style={{ ...inputStyle, width: "100%", color: matchedProd ? "#22c55e" : "#e2e8f0", fontSize: 12 }} placeholder="שם פריט" />
                        {supProds.length > 0 && (
                          <select onChange={e => { if (e.target.value) { const p = supProds.find(x => x.id === e.target.value); if (p) setScanResult(prev => ({ ...prev, items: prev.items.map((it, idx) => idx === i ? { ...it, name: p.name, unit: p.unit, price: String(p.basePrice) } : it) })); e.target.value = ""; }}} style={{ ...inputStyle, fontSize: 11, color: "#64748b" }}>
                            <option value="">🔗 קשר לפריט קיים...</option>
                            {supProds.map(p => <option key={p.id} value={p.id}>{p.name} | בסיס: ₪{fmt(p.basePrice)}</option>)}
                          </select>
                        )}
                        {matchedProd && <div style={{ fontSize: 10, color: "#22c55e" }}>✓ מקושר למוצר במערכת</div>}
                      </div>
                    </Td>
                    <Td><input type="number" value={item.qty || ""} onChange={e => setScanResult(p => ({ ...p, items: p.items.map((it, idx) => idx === i ? { ...it, qty: e.target.value } : it) }))} style={{ ...inputStyle, width: 70, textAlign: "center" }} /></Td>
                    <Td>
                      <select value={item.unit || "יחידה"} onChange={e => setScanResult(p => ({ ...p, items: p.items.map((it, idx) => idx === i ? { ...it, unit: e.target.value } : it) }))} style={{ ...inputStyle, minWidth: 70 }}>
                        {['ק"ג', "יחידה", "ליטר", "קרטון", "שק", "קופסה", "100 גרם"].map(u => <option key={u}>{u}</option>)}
                      </select>
                    </Td>
                    <Td><input type="number" value={item.price || ""} onChange={e => setScanResult(p => ({ ...p, items: p.items.map((it, idx) => idx === i ? { ...it, price: e.target.value } : it) }))} style={{ ...inputStyle, width: 90, textAlign: "center", color: "#1e293b" }} /></Td>
                    <Td style={{ color: "#1e293b", fontWeight: 700 }}>₪{fmt(parseFloat(item.price || 0) * parseFloat(item.qty || 0))}</Td>
                    <Td><button onClick={() => setScanResult(p => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }))} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16 }}>×</button></Td>
                  </tr>
                );
              })}
              <tr style={{ borderTop: "2px solid #cbd5e1", fontWeight: 700 }}>
                <Td colSpan={4} style={{ color: "#64748b" }}>סה״כ</Td>
                <Td style={{ color: "#22c55e" }}>₪{fmt((scanResult.items || []).reduce((a, i) => a + parseFloat(i.price || 0) * parseFloat(i.qty || 0), 0))}</Td>
                <Td></Td>
              </tr>
            </tbody>
          </table>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={applyScanResult} style={{ background: "#22c55e" }}>✅ אשר ושמור חשבונית</Btn>
            <Btn onClick={() => setScanResult(null)} style={{ background: "#94a3b8" }}>✕ בטל</Btn>
          </div>
        </Card>
      )}

      {showForm && (
        <Card title="הכנסת חשבונית חדשה" accent="#cc0000">
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <select value={form.supplierId} onChange={(e) => setForm((f) => ({ ...f, supplierId: e.target.value, items: [] }))}
              style={{ ...inputStyle, flex: 2 }}>
              <option value="">— בחר ספק —</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
            <input value={form.invoiceNum} onChange={(e) => setForm((f) => ({ ...f, invoiceNum: e.target.value }))} placeholder="מס׳ חשבונית" style={{ ...inputStyle, flex: 1 }} />
          </div>

          {form.supplierId && (
            <>
              <div style={{ background: "#f1f5f9", borderRadius: 8, padding: "12px 14px", marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8, fontWeight: 600 }}>הוספת פריט:</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <select value={newItem.productId} onChange={(e) => {
                    const prod = products.find((p) => p.id === e.target.value);
                    setNewItem((p) => ({ ...p, productId: e.target.value, price: prod ? String(prod.basePrice) : "" }));
                  }} style={{ ...inputStyle, flex: 3 }}>
                    <option value="">— בחר פריט —</option>
                    {supProducts.map((p) => <option key={p.id} value={p.id}>{p.name} | בסיס: ₪{fmt(p.basePrice)}/{p.unit}</option>)}
                  </select>
                  <input value={newItem.qty} onChange={(e) => setNewItem((p) => ({ ...p, qty: e.target.value }))} placeholder="כמות" type="number" style={{ ...inputStyle, flex: 1, minWidth: 70 }} />
                  <input value={newItem.price} onChange={(e) => setNewItem((p) => ({ ...p, price: e.target.value }))} placeholder="מחיר ₪" type="number" style={{ ...inputStyle, flex: 1, minWidth: 90 }} />
                  <Btn onClick={addItem}>הוסף</Btn>
                </div>
              </div>

              {formAlerts.length > 0 && (
                <div style={{ background: "#fff5f5", border: "1px solid #ef4444", borderRadius: 8, padding: "10px 14px", marginBottom: 12, color: "#f87171", fontSize: 13 }}>
                  ⚠️ <strong>שים לב!</strong> {formAlerts.length} פריט/ים חרגו ביותר מ-5% ממחיר הבסיס. בדוק לפני שמירה!
                </div>
              )}

              {form.items.length > 0 && (
                <>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 14 }}>
                    <thead><tr style={{ color: "#64748b", borderBottom: "1px solid #cbd5e1" }}><Th>פריט</Th><Th>כמות</Th><Th>מחיר בסיס</Th><Th>מחיר בחשבונית</Th><Th>סה״כ שורה</Th><Th>סטטוס</Th><Th></Th></tr></thead>
                    <tbody>
                      {form.items.map((item) => {
                        const prod = products.find((p) => p.id === item.productId);
                        const base = parseFloat(prod?.basePrice || 0);
                        const price = parseFloat(item.price);
                        const qty = parseFloat(item.qty);
                        const diff = base > 0 ? ((price - base) / base) * 100 : 0;
                        const alert = diff > 5;
                        return (
                          <tr key={item.id} style={{ borderBottom: "1px solid #e2e8f0", background: alert ? "#fff5f5" : "transparent" }}>
                            <Td>{prod?.name}</Td>
                            <Td>{qty} {prod?.unit}</Td>
                            <Td style={{ color: "#64748b" }}>₪{fmt(base)}</Td>
                            <Td style={{ color: alert ? "#f87171" : "#e2e8f0", fontWeight: alert ? 700 : 400 }}>₪{fmt(price)}</Td>
                            <Td style={{ color: "#1e293b" }}>₪{fmt(price * qty)}</Td>
                            <Td>{alert ? <span style={{ color: "#ef4444", fontWeight: 700, fontSize: 12 }}>+{diff.toFixed(1)}% ⚠️</span> : <span style={{ color: "#22c55e", fontSize: 12 }}>✓ תקין</span>}</Td>
                            <Td><button onClick={() => removeItem(item.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16 }}>×</button></Td>
                          </tr>
                        );
                      })}
                      <tr style={{ borderTop: "2px solid #cbd5e1" }}>
                        <Td colSpan={4} style={{ color: "#64748b", fontWeight: 700 }}>סה״כ חשבונית:</Td>
                        <Td style={{ color: "#1e293b", fontWeight: 700, fontSize: 15 }}>₪{fmt(formTotal)}</Td>
                        <Td colSpan={2}></Td>
                      </tr>
                    </tbody>
                  </table>
                  <Btn onClick={saveInvoice} style={{ background: "#22c55e" }}>💾 שמור חשבונית</Btn>
                </>
              )}
            </>
          )}
        </Card>
      )}

      <Card title="חשבוניות קיימות">
        {invoices.length === 0 && <div style={{ color: "#aaa", fontSize: 13 }}>אין חשבוניות עדיין</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[...invoices].reverse().map((inv) => {
            const sup = suppliers.find((s) => s.id === inv.supplierId);
            const itemAlerts = (inv.items || []).filter((item) => {
              const prod = products.find((p) => p.id === item.productId);
              return prod && prod.basePrice > 0 && ((parseFloat(item.price) - prod.basePrice) / prod.basePrice) * 100 > 5;
            });
            const isEditing = editInvoice?.id === inv.id;
            return (
              <div key={inv.id} style={{ background: "#ffffff", border: `1px solid ${isEditing ? "#cc0000" : "#e2e8f0"}`, borderRadius: 8, overflow: "hidden" }}>
                {/* Row */}
                <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                  onClick={() => setEditInvoice(isEditing ? null : { ...inv, items: inv.items.map(i => ({ ...i })) })}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{sup?.name || "ספק לא ידוע"}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>{inv.date} | חשבונית {inv.invoiceNum || "—"} | {(inv.items || []).length} פריטים</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {itemAlerts.length > 0 && <span style={{ background: "#fff5f5", color: "#f87171", border: "1px solid #ef4444", borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>⚠️ {itemAlerts.length} חריגות</span>}
                    <span style={{ color: "#1e293b", fontWeight: 800, fontSize: 15 }}>₪{fmt(inv.total)}</span>
                    <span style={{ color: "#64748b", fontSize: 12 }}>{isEditing ? "▲ סגור" : "✏️ ערוך"}</span>
                    <button onClick={(e) => { e.stopPropagation(); if (window.confirm("למחוק חשבונית זו?")) setInvoices((p) => p.filter((i) => i.id !== inv.id)); }}
                      style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 18 }}>×</button>
                  </div>
                </div>

                {/* Edit panel */}
                {isEditing && (
                  <div style={{ borderTop: "1px solid #e2e8f0", padding: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>ספק</div>
                        <select value={editInvoice.supplierId} onChange={e => setEditInvoice(p => ({ ...p, supplierId: e.target.value }))} style={{ ...inputStyle, width: "100%" }}>
                          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>תאריך</div>
                        <input type="date" value={editInvoice.date} onChange={e => setEditInvoice(p => ({ ...p, date: e.target.value }))} style={{ ...inputStyle, width: "100%" }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>מס׳ חשבונית</div>
                        <input value={editInvoice.invoiceNum || ""} onChange={e => setEditInvoice(p => ({ ...p, invoiceNum: e.target.value }))} style={{ ...inputStyle, width: "100%" }} />
                      </div>
                    </div>

                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 12 }}>
                      <thead><tr style={{ color: "#64748b", borderBottom: "1px solid #cbd5e1" }}><Th>פריט</Th><Th>כמות</Th><Th>מחיר ליחידה</Th><Th>סה״כ</Th><Th></Th></tr></thead>
                      <tbody>
                        {editInvoice.items.map((item, idx) => {
                          const prod = products.find(p => p.id === item.productId);
                          return (
                            <tr key={item.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                              <Td style={{ color: "#1e293b" }}>{prod?.name || "—"}</Td>
                              <Td><input type="number" value={item.qty} onChange={e => setEditInvoice(p => ({ ...p, items: p.items.map((it, i) => i === idx ? { ...it, qty: e.target.value } : it) }))} style={{ ...inputStyle, width: 70, textAlign: "center" }} /></Td>
                              <Td><input type="number" value={item.price} onChange={e => setEditInvoice(p => ({ ...p, items: p.items.map((it, i) => i === idx ? { ...it, price: e.target.value } : it) }))} style={{ ...inputStyle, width: 90, textAlign: "center", color: "#1e293b" }} /></Td>
                              <Td style={{ color: "#1e293b" }}>₪{fmt(parseFloat(item.price || 0) * parseFloat(item.qty || 0))}</Td>
                              <Td><button onClick={() => setEditInvoice(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }))} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16 }}>×</button></Td>
                            </tr>
                          );
                        })}
                        <tr style={{ borderTop: "2px solid #cbd5e1", fontWeight: 700 }}>
                          <Td colSpan={3} style={{ color: "#64748b" }}>סה״כ</Td>
                          <Td style={{ color: "#22c55e" }}>₪{fmt(editInvoice.items.reduce((a, i) => a + parseFloat(i.price || 0) * parseFloat(i.qty || 0), 0))}</Td>
                          <Td></Td>
                        </tr>
                      </tbody>
                    </table>

                    <div style={{ display: "flex", gap: 10 }}>
                      <Btn onClick={() => {
                        const total = editInvoice.items.reduce((a, i) => a + parseFloat(i.price || 0) * parseFloat(i.qty || 0), 0);
                        setInvoices(p => p.map(i => i.id === editInvoice.id ? { ...editInvoice, total } : i));
                        setEditInvoice(null);
                      }} style={{ background: "#22c55e" }}>💾 שמור שינויים</Btn>
                      <Btn onClick={() => setEditInvoice(null)} style={{ background: "#94a3b8" }}>✕ ביטול</Btn>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function Sales({ sales, setSales }) {
  const [form, setForm] = useState({ date: today(), kupa: "", wolt: "" });
  const [editId, setEditId] = useState(null);
  const [editVals, setEditVals] = useState({ kupa: "", wolt: "" });
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [importError, setImportError] = useState("");

  useEffect(() => {
    if (typeof window.XLSX === "undefined") {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      document.head.appendChild(s);
    }
  }, []);

  const addSale = () => {
    if (!form.date) return;
    if (!form.kupa && !form.wolt) return;
    const existing = sales.findIndex((s) => s.date === form.date);
    if (existing >= 0) {
      setSales((p) => p.map((s, i) => i === existing ? { ...s, kupa: form.kupa || "0", wolt: form.wolt || "0" } : s));
    } else {
      setSales((p) => [...p, { ...form, id: Date.now().toString(), kupa: form.kupa || "0", wolt: form.wolt || "0" }]);
    }
    setForm({ date: today(), kupa: "", wolt: "" });
  };

  const startEdit = (s) => {
    setEditId(s.id);
    setEditVals({ kupa: s.kupa || "0", wolt: s.wolt || "0" });
  };

  const saveEdit = (id) => {
    setSales((p) => p.map((s) => s.id === id ? { ...s, kupa: editVals.kupa || "0", wolt: editVals.wolt || "0" } : s));
    setEditId(null);
  };

  const parseXlsxSales = async (file) => {
    setImporting(true);
    setImportError("");
    setImportPreview(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      if (typeof window.XLSX === "undefined") throw new Error("ספריית XLSX לא נטענה — נסה לרענן");
      const wb = window.XLSX.read(uint8, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = window.XLSX.utils.sheet_to_json(ws, { header: 1 });
      let headerRow = -1;
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].some(c => String(c||"").includes("תאריך"))) { headerRow = i; break; }
      }
      if (headerRow === -1) throw new Error("לא נמצאה שורת כותרות בקובץ");
      const headers = rows[headerRow];
      const dateCol = headers.findIndex(h => String(h||"").includes("תאריך"));
      const typeCol = headers.findIndex(h => String(h||"").includes("סוג"));
      const amountCol = headers.findIndex(h => String(h||"").includes("סה") || String(h||"").includes("סכום"));
      const customerCol = headers.findIndex(h => String(h||"").includes("לקוח"));
      const byDate = {};
      for (let i = headerRow + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[dateCol]) continue;
        const parts = String(row[dateCol] || "").split("/");
        if (parts.length !== 3) continue;
        const isoDate = `${parts[2]}-${parts[1].padStart(2,"0")}-${parts[0].padStart(2,"0")}`;
        const type = String(row[typeCol] || "");
        const amount = parseFloat(row[amountCol] || 0);
        const customer = String(row[customerCol] || "");
        if (!byDate[isoDate]) byDate[isoDate] = { kupa: 0, taprit: 0, mishlocha: 0, other: 0 };
        if (type === "חיוב") {
          byDate[isoDate].kupa += amount;
        } else if (type === "תעודת משלוח") {
          // All delivery notes go to kupa total, but track by company
          if (customer.includes("Menu") || customer.includes("Ashdod")) byDate[isoDate].taprit += amount;
          else if (customer.includes("משלוחה") || customer.includes("111")) byDate[isoDate].mishlocha += amount;
          else byDate[isoDate].other += amount;
        }
      }
      const preview = Object.entries(byDate)
        .filter(([, v]) => v.kupa > 0 || v.taprit > 0 || v.mishlocha > 0 || v.other > 0)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, v]) => {
          const deliveries = v.taprit + v.mishlocha + v.other;
          const totalKupa = v.kupa + deliveries;
          return { date, kupa: String(Math.round(totalKupa*100)/100), wolt: "0",
            taprit: String(Math.round(v.taprit*100)/100),
            mishlocha: String(Math.round(v.mishlocha*100)/100),
            otherDelivery: String(Math.round(v.other*100)/100) };
        });
      if (preview.length === 0) throw new Error("לא נמצאו נתוני מכירות בקובץ");
      setImportPreview({ type: "caspit", rows: preview });
    } catch(e) { setImportError("שגיאה: " + e.message); }
    setImporting(false);
  };

  const parseCsvWolt = async (file) => {
    setImporting(true);
    setImportError("");
    setImportPreview(null);
    try {
      const text = await file.text();
      // Parse CSV properly handling quoted fields
      const parseCSVLine = (line) => {
        const result = [];
        let cur = "", inQ = false;
        for (let i = 0; i < line.length; i++) {
          if (line[i] === '"') { inQ = !inQ; }
          else if (line[i] === ',' && !inQ) { result.push(cur.trim()); cur = ""; }
          else { cur += line[i]; }
        }
        result.push(cur.trim());
        return result;
      };
      const lines = text.split("\n").filter(l => l.trim());
      const headers = parseCSVLine(lines[0]);
      const dateIdx = headers.findIndex(h => h.includes("שעת") || h.includes("תאריך"));
      const statusIdx = headers.findIndex(h => h.includes("מצב"));
      const priceIdx = headers.findIndex(h => h.includes("מחיר"));
      const byDate = {};
      for (let i = 1; i < lines.length; i++) {
        const cols = parseCSVLine(lines[i]);
        if (!cols[dateIdx]) continue;
        const status = (cols[statusIdx] || "").trim();
        if (status !== "delivered") continue;
        const rawDate = cols[dateIdx];
        const match = rawDate.match(/(\d+)\.(\d+)\.(\d+)/);
        if (!match) continue;
        const isoDate = `${match[3]}-${match[2].padStart(2,"0")}-${match[1].padStart(2,"0")}`;
        const amount = parseFloat(cols[priceIdx] || 0);
        if (!isNaN(amount)) byDate[isoDate] = (byDate[isoDate] || 0) + amount;
      }
      const preview = Object.entries(byDate)
        .filter(([, v]) => v > 0)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, v]) => ({ date, kupa: "0", wolt: String(Math.round(v*100)/100) }));
      if (preview.length === 0) throw new Error("לא נמצאו הזמנות וולט בקובץ");
      setImportPreview({ type: "wolt", rows: preview });
    } catch(e) { setImportError("שגיאה: " + e.message); }
    setImporting(false);
  };

  const confirmImport = () => {
    if (!importPreview) return;
    const rows = importPreview.rows;
    setSales(prev => {
      let updated = [...prev];
      for (const row of rows) {
        const idx = updated.findIndex(s => s.date === row.date);
        if (importPreview.type === "caspit") {
          const entry = { kupa: row.kupa, taprit: row.taprit||"0", mishlocha: row.mishlocha||"0", otherDelivery: row.otherDelivery||"0" };
          if (idx >= 0) updated[idx] = { ...updated[idx], ...entry };
          else updated.push({ id: Date.now().toString() + Math.random(), date: row.date, wolt: "0", ...entry });
        } else {
          if (idx >= 0) updated[idx] = { ...updated[idx], wolt: row.wolt };
          else updated.push({ id: Date.now().toString() + Math.random(), date: row.date, kupa: "0", wolt: row.wolt });
        }
      }
      return updated;
    });
    const count = rows.length;
    setImportPreview(null);
    alert(`✅ יובאו ${count} ימי מכירה בהצלחה!`);
  };

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthSales = sales.filter((s) => s.date?.startsWith(monthKey));
  const totalKupa = monthSales.reduce((a, s) => a + (parseFloat(s.kupa) || 0), 0);
  const totalWolt = monthSales.reduce((a, s) => a + (parseFloat(s.wolt) || 0), 0);
  const totalTaprit = monthSales.reduce((a, s) => a + (parseFloat(s.taprit) || 0), 0);
  const totalMishlocha = monthSales.reduce((a, s) => a + (parseFloat(s.mishlocha) || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
        <KpiCard label="🖥️ קופה (Caspit) — חודש נוכחי" value={`₪${fmt(totalKupa)}`}
          sub={<span>מזה: תפריט <strong style={{color:"#475569"}}>₪{fmt(totalTaprit)}</strong> | משלוחה <strong style={{color:"#f87171"}}>₪{fmt(totalMishlocha)}</strong></span>}
          accent="#0284c7" raw />
        <KpiCard label="📱 Wolt — חודש נוכחי" value={`₪${fmt(totalWolt)}`} sub="הזמנות אונליין" accent="#64748b" />
      </div>
      <div style={{ background: "linear-gradient(135deg, #fff1f1, #fff8f8)", border: "1px solid #cc0000", borderRadius: 10, padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <span style={{ color: "#64748b", fontSize: 13 }}>סה״כ מכירות החודש ({monthSales.length} ימים)</span>
        <span style={{ color: "#22c55e", fontWeight: 900, fontSize: 22 }}>₪{fmt(totalKupa + totalWolt)}</span>
      </div>

      {/* Import buttons */}
      <Card title="📥 ייבוא נתוני מכירות">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
          <div>
            <label style={{ background: "#cc0000", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13, opacity: importing ? 0.6 : 1, display: "inline-block" }}>
              {importing ? "⏳ מעבד..." : "🖥️ ייבוא מ-Caspit (Excel)"}
              <input type="file" accept=".xlsx,.xls" style={{ display: "none" }}
                onChange={e => e.target.files[0] && parseXlsxSales(e.target.files[0])} disabled={importing} />
            </label>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>דוח מכירות תקופתי — קופה + תעודות משלוח</div>
          </div>
          <div>
            <label style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13, opacity: importing ? 0.6 : 1, display: "inline-block" }}>
              {importing ? "⏳ מעבד..." : "📱 ייבוא מ-Wolt (CSV)"}
              <input type="file" accept=".csv" style={{ display: "none" }}
                onChange={e => e.target.files[0] && parseCsvWolt(e.target.files[0])} disabled={importing} />
            </label>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>קובץ purchases מ-Wolt — הזמנות delivered בלבד</div>
          </div>
        </div>
        {importError && <div style={{ color: "#f87171", fontSize: 13, background: "#fff5f5", borderRadius: 8, padding: "8px 12px" }}>❌ {importError}</div>}
        {importPreview && (
          <div style={{ marginTop: 14 }}>
            {importPreview.type === "caspit" ? (
              <>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                  📊 Caspit — <strong style={{ color: "#1e293b" }}>{importPreview.rows.length} ימים</strong> |
                  סה״כ קופה: <strong style={{ color: "#22c55e" }}>₪{fmt(importPreview.rows.reduce((a,r) => a+parseFloat(r.kupa||0),0))}</strong> |
                  תפריט: <strong style={{ color: "#1e293b" }}>₪{fmt(importPreview.rows.reduce((a,r) => a+parseFloat(r.taprit||0),0))}</strong> |
                  משלוחה: <strong style={{ color: "#f87171" }}>₪{fmt(importPreview.rows.reduce((a,r) => a+parseFloat(r.mishlocha||0),0))}</strong>
                </div>
                <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 12, border: "1px solid #e2e8f0", borderRadius: 8 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead><tr style={{ background: "#f1f5f9" }}><Th>תאריך</Th><Th>סה״כ קופה</Th><Th>מזה: תפריט</Th><Th>מזה: משלוחה</Th></tr></thead>
                    <tbody>
                      {importPreview.rows.map(r => (
                        <tr key={r.date} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <Td style={{ color: "#64748b" }}>{r.date}</Td>
                          <Td style={{ color: "#22c55e", fontWeight: 700 }}>₪{fmt(r.kupa)}</Td>
                          <Td style={{ color: "#1e293b" }}>{parseFloat(r.taprit||0)>0 ? `₪${fmt(r.taprit)}` : "—"}</Td>
                          <Td style={{ color: "#f87171" }}>{parseFloat(r.mishlocha||0)>0 ? `₪${fmt(r.mishlocha)}` : "—"}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 8 }}>
                  📱 Wolt — <strong style={{ color: "#1e293b" }}>{importPreview.rows.length} ימים</strong> |
                  סה״כ: <strong style={{ color: "#1e293b" }}>₪{fmt(importPreview.rows.reduce((a,r) => a+parseFloat(r.wolt||0),0))}</strong>
                </div>
                <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 12, border: "1px solid #e2e8f0", borderRadius: 8 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead><tr style={{ background: "#f1f5f9" }}><Th>תאריך</Th><Th>וולט ₪</Th></tr></thead>
                    <tbody>
                      {importPreview.rows.map(r => (
                        <tr key={r.date} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <Td style={{ color: "#64748b" }}>{r.date}</Td>
                          <Td style={{ color: "#1e293b", fontWeight: 700 }}>₪{fmt(r.wolt)}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <Btn onClick={confirmImport} style={{ background: "#22c55e" }}>✅ אשר וייבא</Btn>
              <Btn onClick={() => setImportPreview(null)} style={{ background: "#94a3b8" }}>✕ ביטול</Btn>
            </div>
          </div>
        )}
      </Card>

      <Card title="הכנסת מכירות יומיות">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>תאריך</label>
            <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} style={{ ...inputStyle, minWidth: 160 }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>🖥️ קופה (₪)</label>
            <input value={form.kupa} onChange={(e) => setForm((f) => ({ ...f, kupa: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && addSale()} placeholder="0" type="number" style={{ ...inputStyle, minWidth: 120 }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>📱 וולט (₪)</label>
            <input value={form.wolt} onChange={(e) => setForm((f) => ({ ...f, wolt: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && addSale()} placeholder="0" type="number" style={{ ...inputStyle, minWidth: 120 }} />
          </div>
          <Btn onClick={addSale}>💾 שמור</Btn>
        </div>
      </Card>

      <Card title="מכירות חודש נוכחי">
        {monthSales.length === 0 && <div style={{ color: "#64748b", fontSize: 13 }}>אין נתוני מכירות לחודש זה</div>}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr style={{ color: "#64748b", borderBottom: "1px solid #cbd5e1" }}><Th>תאריך</Th><Th>קופה</Th><Th>וולט</Th><Th>סה״כ יומי</Th><Th></Th></tr></thead>
          <tbody>
            {[...monthSales].sort((a, b) => b.date?.localeCompare(a.date)).map((s) => (
              <tr key={s.id} style={{ borderBottom: "1px solid #e2e8f0", background: editId === s.id ? "#fff1f1" : "transparent" }}>
                <Td>{s.date}</Td>
                {editId === s.id ? (
                  <>
                    <Td>
                      <input type="number" value={editVals.kupa} onChange={(e) => setEditVals((v) => ({ ...v, kupa: e.target.value }))}
                        style={{ ...inputStyle, width: 110 }} autoFocus />
                    </Td>
                    <Td>
                      <input type="number" value={editVals.wolt} onChange={(e) => setEditVals((v) => ({ ...v, wolt: e.target.value }))}
                        style={{ ...inputStyle, width: 110 }} />
                    </Td>
                    <Td style={{ color: "#1e293b", fontWeight: 700 }}>
                      ₪{fmt((parseFloat(editVals.kupa) || 0) + (parseFloat(editVals.wolt) || 0))}
                    </Td>
                    <Td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => saveEdit(s.id)} style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 5, padding: "4px 10px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>שמור</button>
                        <button onClick={() => setEditId(null)} style={{ background: "#cbd5e1", color: "#64748b", border: "none", borderRadius: 5, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>ביטול</button>
                      </div>
                    </Td>
                  </>
                ) : (
                  <>
                    <Td style={{ color: "#1e293b" }}>₪{fmt(s.kupa || 0)}</Td>
                    <Td style={{ color: "#1e293b" }}>₪{fmt(s.wolt || 0)}</Td>
                    <Td style={{ fontWeight: 700 }}>₪{fmt((parseFloat(s.kupa) || 0) + (parseFloat(s.wolt) || 0))}</Td>
                    <Td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => startEdit(s)} style={{ background: "none", border: "none", color: "#cc0000", cursor: "pointer", fontSize: 14 }} title="עריכה">✏️</button>
                        <button onClick={() => setSales((p) => p.filter((i) => i.id !== s.id))} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 14 }} title="מחיקה">×</button>
                      </div>
                    </Td>
                  </>
                )}
              </tr>
            ))}
            {monthSales.length > 0 && (
              <tr style={{ borderTop: "2px solid #cbd5e1", fontWeight: 700 }}>
                <Td style={{ color: "#64748b" }}>סה״כ חודש</Td>
                <Td style={{ color: "#1e293b" }}>₪{fmt(totalKupa)}</Td>
                <Td style={{ color: "#1e293b" }}>₪{fmt(totalWolt)}</Td>
                <Td style={{ color: "#22c55e" }}>₪{fmt(totalKupa + totalWolt)}</Td><Td></Td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Employees({ employees, setEmployees }) {
  const [form, setForm] = useState({ name: "", hourlyRate: "" });
  const [editId, setEditId] = useState(null);
  const [editVals, setEditVals] = useState({ name: "", hourlyRate: "" });

  const addEmployee = () => {
    if (!form.name.trim() || !form.hourlyRate) return;
    setEmployees((p) => [...p, { id: Date.now().toString(), name: form.name.trim(), hourlyRate: parseFloat(form.hourlyRate) }]);
    setForm({ name: "", hourlyRate: "" });
  };

  const saveEdit = (id) => {
    setEmployees((p) => p.map((e) => e.id === id ? { ...e, name: editVals.name, hourlyRate: parseFloat(editVals.hourlyRate) } : e));
    setEditId(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 600 }}>
      <Card title="הוספת עובד חדש">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 3 }}>
            <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>שם עובד</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && addEmployee()}
              placeholder="שם מלא" style={inputStyle} />
          </div>
          <div style={{ flex: 2 }}>
            <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>₪ לשעה</label>
            <input value={form.hourlyRate} onChange={(e) => setForm((f) => ({ ...f, hourlyRate: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && addEmployee()}
              placeholder="45" type="number" style={inputStyle} />
          </div>
          <Btn onClick={addEmployee}>+ הוסף</Btn>
        </div>
      </Card>

      <Card title="רשימת עובדים">
        {employees.length === 0 && <div style={{ color: "#64748b", fontSize: 13 }}>אין עובדים — הוסף עובדים כדי לעקוב אחר לייבור קוסט</div>}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          {employees.length > 0 && <thead><tr style={{ color: "#64748b", borderBottom: "1px solid #cbd5e1" }}><Th>שם עובד</Th><Th>₪ לשעה</Th><Th></Th></tr></thead>}
          <tbody>
            {employees.map((e) => (
              <tr key={e.id} style={{ borderBottom: "1px solid #e2e8f0", background: editId === e.id ? "#fff1f1" : "transparent" }}>
                {editId === e.id ? (
                  <>
                    <Td><input value={editVals.name} onChange={(ev) => setEditVals((v) => ({ ...v, name: ev.target.value }))} style={{ ...inputStyle, width: "100%" }} autoFocus /></Td>
                    <Td><input type="number" value={editVals.hourlyRate} onChange={(ev) => setEditVals((v) => ({ ...v, hourlyRate: ev.target.value }))} style={{ ...inputStyle, width: 100 }} /></Td>
                    <Td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => saveEdit(e.id)} style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 5, padding: "4px 10px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>שמור</button>
                        <button onClick={() => setEditId(null)} style={{ background: "#cbd5e1", color: "#64748b", border: "none", borderRadius: 5, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>ביטול</button>
                      </div>
                    </Td>
                  </>
                ) : (
                  <>
                    <Td style={{ fontWeight: 600 }}>{e.name}</Td>
                    <Td style={{ color: "#fb923c" }}>₪{fmt(e.hourlyRate)}</Td>
                    <Td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => { setEditId(e.id); setEditVals({ name: e.name, hourlyRate: String(e.hourlyRate) }); }}
                          style={{ background: "none", border: "none", color: "#cc0000", cursor: "pointer", fontSize: 14 }}>✏️</button>
                        <button onClick={() => setEmployees((p) => p.filter((x) => x.id !== e.id))}
                          style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16 }}>×</button>
                      </div>
                    </Td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Hours({ hours, setHours, employees, sales, settings }) {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [form, setForm] = useState({ date: today(), employeeId: "", hours: "" });
  const [editId, setEditId] = useState(null);
  const [editHours, setEditHours] = useState("");
  const [importPreview, setImportPreview] = useState(null);
  const [importError, setImportError] = useState("");

  const addHours = () => {
    if (!form.date || !form.employeeId || !form.hours) return;
    const existing = hours.findIndex((h) => h.date === form.date && h.employeeId === form.employeeId);
    if (existing >= 0) {
      setHours((p) => p.map((h, i) => i === existing ? { ...h, hours: form.hours } : h));
    } else {
      setHours((p) => [...p, { id: Date.now().toString(), ...form }]);
    }
    setForm((f) => ({ ...f, hours: "" }));
  };

  const saveEdit = (id) => {
    setHours((p) => p.map((h) => h.id === id ? { ...h, hours: editHours } : h));
    setEditId(null);
  };

  // ייבוא מיכפל CSV
  const importMichpal = async (file) => {
    setImportError("");
    setImportPreview(null);
    try {
      const buffer = await file.arrayBuffer();
      // Decode windows-1255
      const decoder = new TextDecoder("windows-1255");
      const text = decoder.decode(buffer);
      const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

      // Parse rows: תאריך,שעה,קוד פעולה,זיהוי כרטיס,זיהוי בפוזיטיב,מספר חנות
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",");
        if (cols.length < 5) continue;
        const dateStr = cols[0].trim(); // DD/MM/YYYY
        const timeStr = cols[1].trim(); // HH:MM:SS
        const action = cols[2].trim();  // 0=כניסה, 1=יציאה
        const identity = cols[4].trim(); // "ID - שם - מספר"
        if (!dateStr || !timeStr) continue;

        // Parse date DD/MM/YYYY → YYYY-MM-DD
        const [dd, mm, yyyy] = dateStr.split("/");
        const isoDate = `${yyyy}-${mm.padStart(2,"0")}-${dd.padStart(2,"0")}`;

        // Extract employee name from "97589 - נהוראי מלול - 7078"
        const parts = identity.split(" - ");
        const empName = parts.length >= 2 ? parts[1].trim() : identity;

        rows.push({ date: isoDate, time: timeStr, action, empName });
      }

      // Match pairs: כניסה (0) + יציאה (1) per employee
      // מטפל במשמרות לילה שחוצות חצות וריבוי משמרות
      const preview = [];
      const empNames = [...new Set(rows.map(r => r.empName))];

      empNames.forEach(empName => {
        const empRows = rows
          .filter(r => r.empName === empName)
          .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

        const availableExits = empRows
          .filter(r => r.action === "1")
          .map(r => ({ ...r, used: false }));

        empRows.filter(r => r.action === "0").forEach(entry => {
          const entryDT = new Date(`${entry.date}T${entry.time}`);

          const matchExit = availableExits.find(x => {
            if (x.used) return false;
            const exitDT = new Date(`${x.date}T${x.time}`);
            const diffMs = exitDT - entryDT;
            return diffMs > 0 && diffMs < 24 * 3600 * 1000;
          });

          if (!matchExit) return;
          matchExit.used = true;

          const exitDT = new Date(`${matchExit.date}T${matchExit.time}`);
          const totalHours = Math.round((exitDT - entryDT) / 3600000 * 4) / 4;

          const normalize = n => n.trim().replace(/\s+/g, " ").replace(/['"]/g, "");
          const csvName = normalize(empName);
          const matchedEmp = employees.find(e => {
            const eName = normalize(e.name);
            return eName === csvName || eName.includes(csvName) || csvName.includes(eName);
          });

          preview.push({
            date: entry.date,
            empName,
            employeeId: matchedEmp?.id || null,
            entry: entry.time,
            exit: matchExit.time,
            exitDate: matchExit.date,
            hours: totalHours,
            matched: !!matchedEmp
          });
        });
      });

      if (preview.length === 0) throw new Error("לא נמצאו משמרות מלאות בקובץ");
      preview.sort((a, b) => a.date.localeCompare(b.date) || a.empName.localeCompare(b.empName));
      setImportPreview(preview);
    } catch(e) {
      setImportError("שגיאה: " + e.message);
    }
  };

  const confirmImport = () => {
    if (!importPreview) return;
    let updated = [...hours];
    let added = 0, updated_count = 0, skipped = 0;
    importPreview.forEach(row => {
      if (!row.employeeId) { skipped++; return; }
      const record = {
        id: Date.now().toString() + Math.random(),
        date: row.date,
        employeeId: row.employeeId,
        hours: String(row.hours),
        entryTime: row.entry,
        exitTime: row.exit,
        exitDate: row.exitDate,
      };
      // Match by date + employee + entry time (supports multiple shifts per day)
      const existing = updated.findIndex(h =>
        h.date === row.date &&
        h.employeeId === row.employeeId &&
        h.entryTime === row.entry
      );
      if (existing >= 0) {
        updated[existing] = { ...updated[existing], ...record, id: updated[existing].id };
        updated_count++;
      } else {
        updated.push(record);
        added++;
      }
    });
    setHours(updated);
    setImportPreview(null);
    alert(`✅ יובאו ${added} רשומות חדשות, עודכנו ${updated_count}${skipped > 0 ? ` | ${skipped} דולגו` : ""}`);
  };

  const monthHours = hours.filter((h) => h.date?.startsWith(monthKey));
  const monthlySales = sales.filter((s) => s.date?.startsWith(monthKey));
  const totalSales = monthlySales.reduce((a, s) => a + (parseFloat(s.kupa) || 0) + (parseFloat(s.wolt) || 0), 0);
  const totalLaborCost = monthHours.reduce((a, h) => {
    const emp = employees.find((e) => e.id === h.employeeId);
    return a + (parseFloat(h.hours) || 0) * (parseFloat(emp?.hourlyRate) || 0);
  }, 0);
  const totalLaborHours = monthHours.reduce((a, h) => a + (parseFloat(h.hours) || 0), 0);
  const laborPct = parseFloat(pct(totalLaborCost, totalSales));
  const lcSettings = { greenMax: settings.laborGreenMax, yellowMax: settings.laborYellowMax };

  // Group by date for display
  const byDate = {};
  [...monthHours].sort((a, b) => b.date?.localeCompare(a.date)).forEach((h) => {
    if (!byDate[h.date]) byDate[h.date] = [];
    byDate[h.date].push(h);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        <KpiCard label="שעות החודש" value={totalLaborHours.toFixed(1)} accent="#fb923c" sub={`${Object.keys(byDate).length} ימים`} />
        <KpiCard label="עלות עבודה" value={`₪${fmt(totalLaborCost)}`} accent="#f472b6" sub="החודש הנוכחי" />
        <KpiCard label="לייבור קוסט" value={<StatusBadge value={laborPct} settings={lcSettings} />} accent="#fb923c" raw />
      </div>

      <Card title="הכנסת שעות יומיות">
        {employees.length === 0
          ? <div style={{ color: "#64748b", fontSize: 13 }}>יש להוסיף עובדים קודם בטאב 👷 עובדים</div>
          : (
            <>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>תאריך</label>
                <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} style={{ ...inputStyle, minWidth: 155 }} />
              </div>
              <div style={{ flex: 2 }}>
                <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>עובד</label>
                <select value={form.employeeId} onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))} style={{ ...inputStyle }}>
                  <option value="">— בחר עובד —</option>
                  {employees.map((e) => <option key={e.id} value={e.id}>{e.name} (₪{fmt(e.hourlyRate)}/שעה)</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#64748b", display: "block", marginBottom: 4 }}>שעות</label>
                <input type="number" value={form.hours} onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addHours()}
                  placeholder="8" step="0.5" style={{ ...inputStyle, width: 90 }} />
              </div>
              <Btn onClick={addHours}>💾 שמור</Btn>
            </div>
            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
              <label style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 14px", cursor: "pointer", fontSize: 13, color: "#475569", fontWeight: 600 }}>
                📂 ייבוא מיכפל CSV
                <input type="file" accept=".csv" style={{ display: "none" }} onChange={e => e.target.files[0] && importMichpal(e.target.files[0])} />
              </label>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>מייבא שעות אוטומטית מקובץ נוכחות מיכפל</span>
            </div>
            {importError && <div style={{ marginTop: 8, color: "#ef4444", fontSize: 13 }}>❌ {importError}</div>}
            </>
          )}
      </Card>

      {importPreview && (
        <Card title={`📋 תצוגה מקדימה — ${importPreview.length} משמרות`}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b" }}>
                <Th>תאריך</Th><Th>עובד (מקובץ)</Th><Th>התאמה במערכת</Th><Th>כניסה</Th><Th>יציאה</Th><Th>שעות</Th>
              </tr>
            </thead>
            <tbody>
              {importPreview.map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #e2e8f0", background: !row.matched ? "#fffbeb" : "transparent" }}>
                  <Td>{row.date}</Td>
                  <Td style={{ fontWeight: 600 }}>{row.empName}</Td>
                  <Td>
                    {row.matched
                      ? <span style={{ color: "#22c55e", fontSize: 12 }}>✓ {employees.find(e => e.id === row.employeeId)?.name}</span>
                      : <select
                          style={{ ...inputStyle, fontSize: 12, padding: "4px 8px" }}
                          value={row.employeeId || ""}
                          onChange={e => setImportPreview(p => p.map((r, idx) => idx === i ? { ...r, employeeId: e.target.value, matched: !!e.target.value } : r))}
                        >
                          <option value="">— לא זוהה — בחר ידנית</option>
                          {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    }
                  </Td>
                  <Td style={{ color: "#64748b" }}>{row.entry}</Td>
                  <Td style={{ color: "#64748b" }}>{row.exit}</Td>
                  <Td style={{ fontWeight: 700, color: "#fb923c" }}>{row.hours}</Td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={confirmImport} style={{ background: "#22c55e" }}>✅ אשר וייבא</Btn>
            <Btn onClick={() => setImportPreview(null)} style={{ background: "#94a3b8" }}>✕ בטל</Btn>
          </div>
        </Card>
      )}

      <Card title="שעות חודש נוכחי">
        {Object.keys(byDate).length === 0 && <div style={{ color: "#64748b", fontSize: 13 }}>אין שעות מוזנות לחודש זה</div>}
        {Object.entries(byDate).map(([date, entries]) => {
          const dayTotal = entries.reduce((a, h) => a + (parseFloat(h.hours) || 0), 0);
          const dayCost = entries.reduce((a, h) => {
            const emp = employees.find((e) => e.id === h.employeeId);
            return a + (parseFloat(h.hours) || 0) * (parseFloat(emp?.hourlyRate) || 0);
          }, 0);
          return (
            <div key={date} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontWeight: 700, color: "#64748b", fontSize: 13 }}>{date}</span>
                <span style={{ fontSize: 12, color: "#64748b" }}>{dayTotal.toFixed(1)} שעות | ₪{fmt(dayCost)}</span>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#94a3b8", fontSize: 11 }}>
                    <Th>עובד</Th><Th>▶ כניסה</Th><Th>■ יציאה</Th><Th>שעות</Th><Th>עלות</Th><Th></Th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((h) => {
                    const emp = employees.find((e) => e.id === h.employeeId);
                    const cost = (parseFloat(h.hours) || 0) * (parseFloat(emp?.hourlyRate) || 0);
                    return (
                      <tr key={h.id} style={{ borderBottom: "1px solid #e2e8f0", background: editId === h.id ? "#fff1f1" : "transparent" }}>
                        <Td style={{ color: "#1e293b", fontWeight: 600 }}>{emp?.name || "—"}</Td>
                        {/* שעות כניסה/יציאה */}
                        <Td>
                          {h.entryTime
                            ? <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}>▶ {h.entryTime.slice(0,5)}</span>
                            : <span style={{ fontSize: 11, color: "#cbd5e1" }}>—</span>}
                        </Td>
                        <Td>
                          {h.exitTime
                            ? <span style={{ fontSize: 12, color: "#ef4444", fontWeight: 600 }}>
                                ■ {h.exitTime.slice(0,5)}
                                {h.exitDate && h.exitDate !== h.date && <span style={{ fontSize: 10, color: "#94a3b8", marginRight: 3 }}>(+1)</span>}
                              </span>
                            : <span style={{ fontSize: 11, color: "#cbd5e1" }}>—</span>}
                        </Td>
                        {editId === h.id ? (
                          <>
                            <Td><input type="number" value={editHours} onChange={(e) => setEditHours(e.target.value)} step="0.5" style={{ ...inputStyle, width: 80 }} autoFocus /></Td>
                            <Td><span style={{ color: "#fb923c" }}>₪{fmt((parseFloat(editHours) || 0) * (parseFloat(emp?.hourlyRate) || 0))}</span></Td>
                            <Td>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button onClick={() => saveEdit(h.id)} style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 5, padding: "3px 8px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>✓</button>
                                <button onClick={() => setEditId(null)} style={{ background: "#cbd5e1", color: "#64748b", border: "none", borderRadius: 5, padding: "3px 8px", cursor: "pointer", fontSize: 12 }}>✕</button>
                              </div>
                            </Td>
                          </>
                        ) : (
                          <>
                            <Td><span style={{ color: "#fb923c", fontWeight: 600 }}>{parseFloat(h.hours).toFixed(1)} שעות</span></Td>
                            <Td style={{ color: "#64748b" }}>₪{fmt(cost)}</Td>
                            <Td>
                              <div style={{ display: "flex", gap: 8 }}>
                                <button onClick={() => { setEditId(h.id); setEditHours(h.hours); }} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 13 }}>✏️</button>
                                <button onClick={() => setHours((p) => p.filter((x) => x.id !== h.id))} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 15 }}>×</button>
                              </div>
                            </Td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
        {totalLaborHours > 0 && (
          <div style={{ borderTop: "2px solid #cbd5e1", paddingTop: 12, display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700 }}>
            <span style={{ color: "#64748b" }}>סה״כ חודש</span>
            <span style={{ color: "#fb923c" }}>{totalLaborHours.toFixed(1)} שעות | ₪{fmt(totalLaborCost)}</span>
            <StatusBadge value={laborPct} settings={lcSettings} />
          </div>
        )}
      </Card>
    </div>
  );
}

function approvePendingItem(item, suppliers, products, setSuppliers, setProducts, setInvoices, setPending) {
  let currentSuppliers = [...suppliers];
  let currentProducts = [...products];

  // Create supplier if new
  let sup = currentSuppliers.find(s => s.id === item.supId || s.name.trim() === item.supName?.trim());
  if (!sup) {
    sup = { id: item.supId, name: item.supName };
    currentSuppliers = [...currentSuppliers, sup];
    setSuppliers(currentSuppliers);
  }

  // Create products if new
  const invoiceItems = [];
  for (const itemData of item.itemsAnalysis || []) {
    let prod = currentProducts.find(p => p.supplierId === sup.id && p.name.trim() === itemData.name?.trim());
    if (!prod) {
      prod = { id: (Date.now() + Math.random() * 1000).toString(), supplierId: sup.id, name: itemData.name, unit: itemData.unit || "יחידה", basePrice: parseFloat(itemData.price) || 0 };
      currentProducts = [...currentProducts, prod];
    }
    invoiceItems.push({ id: (Date.now() + Math.random() * 1000).toString(), productId: prod.id, price: String(itemData.price), qty: String(itemData.qty) });
  }
  setProducts(currentProducts);

  const total = invoiceItems.reduce((a, i) => a + parseFloat(i.price) * parseFloat(i.qty), 0);
  setInvoices(p => [...p, {
    id: Date.now().toString(),
    supplierId: sup.id,
    date: item.scanResult?.date || new Date().toISOString().split("T")[0],
    invoiceNum: item.scanResult?.invoiceNum || "",
    items: invoiceItems,
    total
  }]);

  // Remove from pending
  setPending(p => p.filter(x => x.id !== item.id));
}

function InvSettings({ inventoryCategories, setInventoryCategories, suppliers, setSuppliers }) {
  const DEFAULT_CATS = [
    { id: "naknikiyot", label: "נקניקיות", emoji: "🌭", color: "#ef4444" },
    { id: "shtiya_cola", label: "שתייה — קוקה קולה", emoji: "🥤", color: "#1e293b" },
    { id: "shtiya_agm", label: 'שתייה — אג"מ', emoji: "🍺", color: "#60a5fa" },
    { id: "chad_pami", label: "חד פעמי", emoji: "🥡", color: "#f59e0b" },
    { id: "levamot_naknik", label: "לחמניות נקניקייה", emoji: "🍞", color: "#1e293b" },
    { id: "levamot_toast", label: "לחמניות טוסט", emoji: "🥖", color: "#fb923c" },
    { id: "ratabim", label: "רטבים", emoji: "🫙", color: "#22c55e" },
    { id: "other", label: "שונות", emoji: "📦", color: "#64748b" },
  ];

  const cats = inventoryCategories.length > 0 ? inventoryCategories : DEFAULT_CATS;
  const [newCat, setNewCat] = useState({ label: "", emoji: "📦", color: "#cc0000" });
  const [editId, setEditId] = useState(null);
  const [editVals, setEditVals] = useState({});

  const initIfEmpty = () => {
    if (inventoryCategories.length === 0) setInventoryCategories(DEFAULT_CATS);
  };

  const addCat = () => {
    if (!newCat.label.trim()) return;
    const updated = [...cats, { id: Date.now().toString(), ...newCat }];
    setInventoryCategories(updated);
    setNewCat({ label: "", emoji: "📦", color: "#cc0000" });
  };

  const deleteCat = (id) => {
    if (id === "other") return alert("לא ניתן למחוק קטגוריית ברירת מחדל");
    setInventoryCategories(cats.filter(c => c.id !== id));
    // Reset suppliers that had this category
    setSuppliers(p => p.map(s => s.inventoryCategory === id ? { ...s, inventoryCategory: "other" } : s));
  };

  const saveEdit = () => {
    setInventoryCategories(cats.map(c => c.id === editId ? { ...c, ...editVals } : c));
    setEditId(null);
  };

  const COLORS = ["#ef4444","#f97316","#f59e0b","#22c55e","#0369a1","#60a5fa","#475569","#fb923c","#cc0000","#ec4899","#64748b","#f1f5f9"];
  const EMOJIS = ["🌭","🥤","🍺","🥡","🍞","🥖","🫙","📦","🥩","🧂","🧴","🧻","🍟","🧃","🥛","🫒"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {inventoryCategories.length === 0 && (
        <div style={{ background: "#fffbeb", border: "1px solid #f59e0b", borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: "#92400e", fontSize: 13 }}>⚠️ טרם הוגדרו קטגוריות — לחץ לטעון ברירות מחדל</span>
          <Btn onClick={initIfEmpty} style={{ background: "#f59e0b", color: "#1e293b" }}>טען ברירות מחדל</Btn>
        </div>
      )}

      {/* Categories list */}
      <Card title="📋 קטגוריות מלאי">
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {cats.map(cat => (
            <div key={cat.id} style={{ border: `1px solid ${cat.color}44`, borderRadius: 10, overflow: "hidden" }}>
              {editId === cat.id ? (
                <div style={{ padding: 14, background: "#f8fafc", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ flex: 3 }}>
                      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>שם קטגוריה</div>
                      <input value={editVals.label || ""} onChange={e => setEditVals(p => ({ ...p, label: e.target.value }))} style={{ ...inputStyle }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>אמוג'י</div>
                      <select value={editVals.emoji || "📦"} onChange={e => setEditVals(p => ({ ...p, emoji: e.target.value }))} style={{ ...inputStyle, fontSize: 18, textAlign: "center" }}>
                        {EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>צבע</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {COLORS.map(c => (
                        <div key={c} onClick={() => setEditVals(p => ({ ...p, color: c }))}
                          style={{ width: 28, height: 28, borderRadius: 6, background: c, cursor: "pointer", border: editVals.color === c ? "3px solid #1e293b" : "2px solid transparent" }} />
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn onClick={saveEdit} style={{ background: "#22c55e" }}>💾 שמור</Btn>
                    <Btn onClick={() => setEditId(null)} style={{ background: "#64748b" }}>✕ ביטול</Btn>
                  </div>
                </div>
              ) : (
                <div style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", background: `${cat.color}10` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 22 }}>{cat.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 700, color: cat.color }}>{cat.label}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>
                        {suppliers.filter(s => s.inventoryCategory === cat.id).map(s => s.name).join(", ") || "אין ספקים משויכים"}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => { setEditId(cat.id); setEditVals({ label: cat.label, emoji: cat.emoji, color: cat.color }); }}
                      style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", color: "#cc0000", cursor: "pointer", borderRadius: 6, padding: "4px 10px", fontSize: 12, fontWeight: 700 }}>✏️ ערוך</button>
                    {cat.id !== "other" && <button onClick={() => deleteCat(cat.id)}
                      style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 18 }}>×</button>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add new */}
        <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#94a3b8", marginBottom: 10 }}>+ הוספת קטגוריה חדשה</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
            <input value={newCat.label} onChange={e => setNewCat(p => ({ ...p, label: e.target.value }))} placeholder="שם הקטגוריה" style={{ ...inputStyle, flex: 3 }} />
            <select value={newCat.emoji} onChange={e => setNewCat(p => ({ ...p, emoji: e.target.value }))} style={{ ...inputStyle, flex: 1, fontSize: 18, textAlign: "center" }}>
              {EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            {COLORS.map(c => (
              <div key={c} onClick={() => setNewCat(p => ({ ...p, color: c }))}
                style={{ width: 28, height: 28, borderRadius: 6, background: c, cursor: "pointer", border: newCat.color === c ? "3px solid #1e293b" : "2px solid transparent" }} />
            ))}
          </div>
          <Btn onClick={addCat} style={{ background: "#cc0000" }}>+ הוסף קטגוריה</Btn>
        </div>
      </Card>

      {/* Supplier assignment */}
      <Card title="🏭 שיוך ספקים לקטגוריות">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {suppliers.length === 0 && <div style={{ color: "#64748b", fontSize: 13 }}>אין ספקים — הקם ספקים בטאב ספקים</div>}
          {suppliers.map(sup => (
            <div key={sup.id} style={{ display: "flex", alignItems: "center", gap: 12, background: "#f8fafc", borderRadius: 8, padding: "10px 14px", border: "1px solid #e2e8f0" }}>
              <div style={{ flex: 1, fontWeight: 600, fontSize: 13 }}>{sup.name}</div>
              <select
                value={sup.inventoryCategory || "other"}
                onChange={e => setSuppliers(p => p.map(s => s.id === sup.id ? { ...s, inventoryCategory: e.target.value } : s))}
                style={{ ...inputStyle, width: "auto", minWidth: 200 }}>
                {cats.map(cat => <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>)}
              </select>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}


const INVENTORY_CATEGORIES = [
  { id: "naknikiyot", label: "🌭 נקניקיות — הנדלס", color: "#ef4444", supplierKeyword: "הנדלס" },
  { id: "shtiya_cola", label: "🥤 שתייה — קוקה קולה", color: "#1e293b", supplierKeyword: "קוקה קולה" },
  { id: "shtiya_agm", label: 'שתייה — אג"מ סחר 🍺', color: "#60a5fa", supplierKeyword: "אגמ" },
  { id: "chad_pami", label: "🥡 חד פעמי", color: "#f59e0b", supplierKeyword: "חד פעמי" },
  { id: "levamot_naknik", label: "🍞 לחמניות נקניקייה", color: "#1e293b", supplierKeyword: "לחמניות נקניקייה" },
  { id: "levamot_toast", label: "🥖 לחמניות טוסט", color: "#fb923c", supplierKeyword: "לחמניות טוסט" },
  { id: "ratabim", label: "🫙 רטבים — גורן", color: "#22c55e", supplierKeyword: "גורן" },
  { id: "other", label: "📦 שונות", color: "#64748b", supplierKeyword: "" },
];

function Inventory({ inventory, setInventory, products, invoices, deliveries, suppliers, inventoryCategories: dynCats }) {
  const CATS = dynCats && dynCats.length > 0 ? dynCats : [
    { id: "naknikiyot", label: "נקניקיות", emoji: "🌭", color: "#dc2626" },
    { id: "shtiya_cola", label: "שתייה — קוקה קולה", emoji: "🥤", color: "#0284c7" },
    { id: "shtiya_agm", label: 'שתייה — אג"מ', emoji: "🍺", color: "#7c3aed" },
    { id: "chad_pami", label: "חד פעמי", emoji: "🥡", color: "#d97706" },
    { id: "levamot_naknik", label: "לחמניות נקניקייה", emoji: "🍞", color: "#b45309" },
    { id: "levamot_toast", label: "לחמניות טוסט", emoji: "🥖", color: "#ea580c" },
    { id: "ratabim", label: "רטבים", emoji: "🫙", color: "#16a34a" },
    { id: "other", label: "שונות", emoji: "📦", color: "#64748b" },
  ];

  const [openCats, setOpenCats] = useState({});
  const [editItem, setEditItem] = useState(null);
  const [editVal, setEditVal] = useState("");

  const sup = (supplierId) => suppliers.find(s => s.id === supplierId);
  // קטגוריה ברמת המוצר גוברת על קטגוריית הספק
  const getCat = (prod) => prod.inventoryCategory || sup(prod.supplierId)?.inventoryCategory || "other";

  // Live stock = most recent base (opening/closing/manual) + invoices+deliveries since then
  const getLiveStock = (productId) => {
    const lastOpening = inventory.filter(c => c.productId === productId && c.type === "פתיחה").sort((a, b) => b.date.localeCompare(a.date))[0];
    const latestClosing = inventory.filter(c => c.productId === productId && c.type === "סגירה").sort((a, b) => b.date.localeCompare(a.date))[0];
    const lastManual = inventory.filter(c => c.productId === productId && c.type === "עדכון ידני").sort((a, b) => b.date.localeCompare(a.date))[0];
    const candidates = [lastOpening, latestClosing, lastManual].filter(Boolean);
    if (candidates.length === 0) return null;
    const base = candidates.sort((a, b) => b.date.localeCompare(a.date))[0];
    const prod = products.find(p => p.id === productId);
    const upp = parseFloat(prod?.unitsPerPack) || 1; // יחידות לאריזה
    const entriesSince = [...invoices, ...deliveries]
      .flatMap(doc => (doc.items || []).map(item => ({ ...item, date: doc.date })))
      .filter(item => item.productId === productId && item.date > base.date)
      .reduce((a, item) => a + parseFloat(item.qty || 0) * upp, 0); // המרה ליחידות
    // base.qty: אם עדכון ידני — כבר ביחידות. אם כניסה מחשבונית — בקרטונים
    const baseInUnits = base.type === "עדכון ידני" ? base.qty : base.qty * upp;
    return baseInUnits + entriesSince;
  };

  const getLevel = (qty, minStock, maxStock) => {
    if (qty === null) return "unknown";
    if (minStock && qty <= minStock) return "low";
    if (maxStock && qty >= maxStock * 0.7) return "high";
    if (minStock || maxStock) return "medium";
    return "unknown";
  };

  const LEVEL = {
    high:    { bg: "#f0fdf4", border: "#86efac", num: "#16a34a", badge: "גבוה ✓",  badgeBg: "#dcfce7", badgeColor: "#16a34a" },
    medium:  { bg: "#fffbeb", border: "#fde68a", num: "#d97706", badge: "סביר",    badgeBg: "#fef3c7", badgeColor: "#d97706" },
    low:     { bg: "#fff5f5", border: "#fca5a5", num: "#dc2626", badge: "נמוך !",  badgeBg: "#fee2e2", badgeColor: "#dc2626" },
    unknown: { bg: "#f8fafc", border: "#e2e8f0", num: "#94a3b8", badge: "—",       badgeBg: "#f1f5f9", badgeColor: "#94a3b8" },
  };

  const saveManualUpdate = (productId, newQty) => {
    setInventory(p => [...p, { id: Date.now().toString() + Math.random(), productId, date: today(), type: "עדכון ידני", qty: parseFloat(newQty) || 0 }]);
    setEditItem(null);
  };

  const allLow = products.filter(p => { const q = getLiveStock(p.id); return q !== null && p.minStock > 0 && q <= p.minStock; });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Alert banner */}
      {allLow.length > 0 && (
        <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 10, padding: "12px 18px", fontSize: 13, color: "#dc2626", fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
          🚨 {allLow.length} פריטים בסף מינימום — נדרשת הזמנה: {allLow.map(p => p.name).join(", ")}
        </div>
      )}

      {/* Categories */}
      {CATS.map(cat => {
        const catProds = products.filter(p => getCat(p) === cat.id);
        if (catProds.length === 0) return null;
        const isOpen = openCats[cat.id] !== false;

        const low = catProds.filter(p => getLevel(getLiveStock(p.id), p.minStock, p.maxStock) === "low").length;
        const med = catProds.filter(p => getLevel(getLiveStock(p.id), p.minStock, p.maxStock) === "medium").length;
        const high = catProds.filter(p => getLevel(getLiveStock(p.id), p.minStock, p.maxStock) === "high").length;

        return (
          <div key={cat.id} style={{ borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: `1px solid ${cat.color}33` }}>

            {/* Category header */}
            <div onClick={() => setOpenCats(p => ({ ...p, [cat.id]: !p[cat.id] }))}
              style={{ background: `linear-gradient(135deg, ${cat.color}20, ${cat.color}0d)`, padding: "16px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 30 }}>{cat.emoji}</span>
                <div>
                  <div style={{ fontWeight: 800, color: cat.color, fontSize: 17 }}>{cat.label}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 1 }}>{catProds.length} פריטים</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {low > 0  && <span style={{ background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>🔴 {low}</span>}
                {med > 0  && <span style={{ background: "#fef3c7", color: "#d97706", border: "1px solid #fde68a", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>🟡 {med}</span>}
                {high > 0 && <span style={{ background: "#dcfce7", color: "#16a34a", border: "1px solid #86efac", borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>🟢 {high}</span>}
                <span style={{ color: cat.color, fontSize: 16, marginRight: 6 }}>{isOpen ? "▲" : "▼"}</span>
              </div>
            </div>

            {/* Products grid */}
            {isOpen && (
              <div style={{ background: "#fff", padding: "16px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 12 }}>
                {catProds.map(prod => {
                  const qty = getLiveStock(prod.id);
                  const level = getLevel(qty, prod.minStock, prod.maxStock);
                  const st = LEVEL[level];
                  const hasRange = prod.minStock > 0 && prod.maxStock > 0;
                  const barPct = hasRange && qty !== null ? Math.min(100, Math.max(0, (qty / prod.maxStock) * 100)) : null;
                  const displayQty = qty !== null ? (qty % 1 === 0 ? String(qty) : qty.toFixed(1)) : "";

                  return (
                    <div key={prod.id}
                      style={{ background: st.bg, border: `1.5px solid ${st.border}`, borderRadius: 12, padding: "14px 12px", position: "relative", transition: "transform 0.15s, box-shadow 0.15s" }}
                      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.1)"; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>

                      {/* Status badge */}
                      <div style={{ position: "absolute", top: 8, left: 8, background: st.badgeBg, color: st.badgeColor, borderRadius: 20, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>{st.badge}</div>

                      {/* Product name */}
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b", marginTop: 22, marginBottom: 2, lineHeight: 1.3 }}>{prod.name}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 8 }}>
                        {sup(prod.supplierId)?.name || "—"}
                        {prod.unitsPerPack > 1 && <span style={{ marginRight: 6, color: "#0284c7", fontWeight: 600 }}>· {prod.unitsPerPack} יח׳/{prod.unit}</span>}
                      </div>

                      {/* Always-visible quantity input */}
                      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                        <input
                          type="number"
                          inputMode="decimal"
                          defaultValue={displayQty}
                          key={displayQty}
                          placeholder="0"
                          onBlur={e => { if (e.target.value !== "" && e.target.value !== displayQty) saveManualUpdate(prod.id, e.target.value); }}
                          onKeyDown={e => { if (e.key === "Enter") e.target.blur(); }}
                          style={{ width: "100%", background: "transparent", border: "none", borderBottom: `2px solid ${st.border}`, borderRadius: 0, padding: "2px 0", fontSize: 30, fontWeight: 900, color: qty !== null ? st.num : "#cbd5e1", textAlign: "center", outline: "none", fontFamily: "inherit" }}
                        />
                        <span style={{ fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>{prod.unit}</span>
                      </div>

                      {/* Progress bar */}
                      {barPct !== null && (
                        <div style={{ background: "#e2e8f0", borderRadius: 4, height: 6, overflow: "hidden", marginBottom: 6 }}>
                          <div style={{ width: `${barPct}%`, height: "100%", background: st.num, borderRadius: 4, transition: "width 0.5s ease" }} />
                        </div>
                      )}

                      {/* Min/Max labels */}
                      {(prod.minStock > 0 || prod.maxStock > 0) && (
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#94a3b8" }}>
                          <span style={{ color: "#dc2626" }}>מינ׳ {prod.minStock || "—"}</span>
                          <span style={{ color: "#16a34a" }}>מקס׳ {prod.maxStock || "—"}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


function Deliveries({ deliveries, setDeliveries, suppliers, products, setSuppliers, setProducts, pending, setPending, invoices, setInvoices }) {
  const [form, setForm] = useState({ supplierId: "", date: today(), deliveryNum: "", items: [] });
  const [newItem, setNewItem] = useState({ productId: "", qty: "1", price: "" });
  const [showForm, setShowForm] = useState(false);
  const [selectedSup, setSelectedSup] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState("");
  const [expandedDelivery, setExpandedDelivery] = useState(null);
  const [editDelivery, setEditDelivery] = useState(null);

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const supProducts = products.filter(p => p.supplierId === form.supplierId);

  const addItem = () => {
    if (!newItem.productId || !newItem.price || !newItem.qty) return;
    setForm(f => ({ ...f, items: [...f.items, { ...newItem, id: Date.now().toString() }] }));
    setNewItem({ productId: "", qty: "1", price: "" });
  };

  const saveDelivery = () => {
    if (!form.supplierId || !form.date || form.items.length === 0) return;
    const total = form.items.reduce((a, i) => a + parseFloat(i.price) * parseFloat(i.qty), 0);
    setDeliveries(p => [...p, { ...form, id: Date.now().toString(), total }]);
    setForm({ supplierId: "", date: today(), deliveryNum: "", items: [] });
    setShowForm(false);
  };

  // Group deliveries by supplier for summary
  const supplierSummary = suppliers.map(sup => {
    const supDeliveries = deliveries.filter(d => d.supplierId === sup.id && d.date?.startsWith(monthKey));
    const total = supDeliveries.reduce((a, d) => a + parseFloat(d.total || 0), 0);
    const supInvoiceTotal = invoices
      .filter(i => i.supplierId === sup.id && i.date?.startsWith(monthKey))
      .reduce((a, i) => a + parseFloat(i.total || 0), 0);
    return { ...sup, deliveryCount: supDeliveries.length, deliveryTotal: total, invoiceTotal: supInvoiceTotal };
  }).filter(s => s.deliveryCount > 0);

  const filteredDeliveries = selectedSup
    ? deliveries.filter(d => d.supplierId === selectedSup)
    : deliveries;

  const scanDelivery = async (file) => {
    setScanning(true); setScanResult(null); setScanError("");
    try {
      const isPdf = file.type === "application/pdf";
      let base64, mediaType;
      if (isPdf) {
        base64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result.split(",")[1]); r.onerror = rej; r.readAsDataURL(file); });
        mediaType = "application/pdf";
      } else {
        const compressed = await compressImage(file);
        base64 = compressed.base64;
        mediaType = compressed.mediaType;
      }
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          messages: [{ role: "user", content: [
            { type: isPdf ? "document" : "image", source: { type: "base64", media_type: mediaType, data: base64 } },
            { type: "text", text: `אתה מומחה בקריאת תעודות משלוח בעברית. קרא את כל הטקסט בתמונה בקפידה.

חלץ את המידע הבא והחזר JSON בלבד (ללא טקסט נוסף, ללא \`\`\`):
{
  "supplierName": "שם הספק/ספק המוצר כפי שמופיע בתעודה",
  "date": "YYYY-MM-DD",
  "deliveryNum": "מספר התעודה",
  "items": [
    {"name": "שם המוצר המדויק", "unit": "יחידת מידה (ק\"ג/יחידה/ליטר/קרטון)", "qty": 0.0, "price": 0.0}
  ],
  "total": 0.0
}

הנחיות:
- שם הספק: חפש בראש התעודה — שם חברה, לוגו, או "מוכר"/"ספק"
- תאריך: המר לפורמט YYYY-MM-DD
- פריטים: כל שורת מוצר עם כמות ומחיר
- מחיר: מחיר ליחידה (לא סה"כ שורה)
- אם לא בטוח — כתוב את מה שרואים ישירות` }
          ]}]
        })
      });
      const rawText = await response.text();
      const data = JSON.parse(rawText);
      const text = data.content?.find(b => b.type === "text")?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      setScanResult(JSON.parse(clean));
    } catch (e) { setScanError("שגיאה: " + e.message); }
    setScanning(false);
  };

  const applyScan = () => {
    if (!scanResult) return;
    let currentSuppliers = [...suppliers];
    let currentProducts = [...products];
    let sup = currentSuppliers.find(s => s.name.trim() === scanResult.supplierName?.trim());
    if (!sup) {
      sup = { id: Date.now().toString(), name: scanResult.supplierName };
      currentSuppliers = [...currentSuppliers, sup];
      setSuppliers(currentSuppliers);
    }
    const items = [];
    for (const item of scanResult.items || []) {
      let prod = currentProducts.find(p => p.supplierId === sup.id && p.name.trim() === item.name?.trim());
      if (!prod) {
        prod = { id: (Date.now() + Math.random() * 1000).toString(), supplierId: sup.id, name: item.name, unit: item.unit || "יחידה", basePrice: parseFloat(item.price) || 0 };
        currentProducts = [...currentProducts, prod];
      }
      items.push({ id: (Date.now() + Math.random() * 1000).toString(), productId: prod.id, price: String(item.price), qty: String(item.qty) });
    }
    setProducts(currentProducts);
    const total = items.reduce((a, i) => a + parseFloat(i.price) * parseFloat(i.qty), 0);
    setDeliveries(p => [...p, { id: Date.now().toString(), supplierId: sup.id, date: scanResult.date || today(), deliveryNum: scanResult.deliveryNum || "", items, total }]);
    setScanResult(null);
    alert("✅ תעודת משלוח נשמרה! " + sup.name + " | ₪" + fmt(total));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ color: "#888", fontSize: 13 }}>{deliveries.length} תעודות משלוח במערכת</div>
        <div style={{ display: "flex", gap: 8 }}>
          <label style={{ background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13, opacity: scanning ? 0.6 : 1 }}>
            {scanning ? "⏳ סורק..." : "📸 סרוק תעודה"}
            <input type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={e => e.target.files[0] && scanDelivery(e.target.files[0])} disabled={scanning} />
          </label>
          <Btn onClick={() => setShowForm(!showForm)} style={showForm ? { background: "#666" } : {}}>{showForm ? "✕ סגור" : "+ הכנסה ידנית"}</Btn>
        </div>
      </div>

      {scanError && <div style={{ background: "#fff5f5", border: "1px solid #ef4444", borderRadius: 8, padding: "10px 14px", color: "#f87171", fontSize: 13 }}>❌ {scanError}</div>}

      {showForm && (
        <Card title="📋 הכנסת תעודת משלוח ידנית">
          <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <select value={form.supplierId} onChange={e => setForm(f => ({ ...f, supplierId: e.target.value, items: [] }))} style={{ ...inputStyle, flex: 2 }}>
              <option value="">— בחר ספק —</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
            <input value={form.deliveryNum} onChange={e => setForm(f => ({ ...f, deliveryNum: e.target.value }))} placeholder="מס׳ תעודה" style={{ ...inputStyle, flex: 1 }} />
          </div>

          {form.supplierId && (
            <>
              <div style={{ background: "#f8fafc", borderRadius: 8, padding: "12px 14px", marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8, fontWeight: 600 }}>הוספת פריט:</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <select value={newItem.productId} onChange={e => {
                    const prod = products.find(p => p.id === e.target.value);
                    setNewItem(p => ({ ...p, productId: e.target.value, price: prod ? String(prod.basePrice) : "" }));
                  }} style={{ ...inputStyle, flex: 3 }}>
                    <option value="">— בחר פריט —</option>
                    {supProducts.map(p => <option key={p.id} value={p.id}>{p.name} | בסיס: ₪{fmt(p.basePrice)}/{p.unit}</option>)}
                  </select>
                  <input value={newItem.qty} onChange={e => setNewItem(p => ({ ...p, qty: e.target.value }))} placeholder="כמות" type="number" style={{ ...inputStyle, flex: 1, minWidth: 70 }} />
                  <input value={newItem.price} onChange={e => setNewItem(p => ({ ...p, price: e.target.value }))} placeholder="מחיר ₪" type="number" style={{ ...inputStyle, flex: 1, minWidth: 90 }} />
                  <Btn onClick={addItem}>הוסף</Btn>
                </div>
              </div>

              {form.items.length > 0 && (
                <>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 14 }}>
                    <thead><tr style={{ color: "#64748b", borderBottom: "1px solid #cbd5e1" }}><Th>פריט</Th><Th>כמות</Th><Th>מחיר</Th><Th>סה״כ</Th><Th></Th></tr></thead>
                    <tbody>
                      {form.items.map(item => {
                        const prod = products.find(p => p.id === item.productId);
                        return (
                          <tr key={item.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                            <Td>{prod?.name}</Td>
                            <Td>{item.qty} {prod?.unit}</Td>
                            <Td style={{ color: "#1e293b" }}>₪{fmt(item.price)}</Td>
                            <Td style={{ color: "#22c55e", fontWeight: 700 }}>₪{fmt(parseFloat(item.price) * parseFloat(item.qty))}</Td>
                            <Td><button onClick={() => setForm(f => ({ ...f, items: f.items.filter(x => x.id !== item.id) }))} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 15 }}>×</button></Td>
                          </tr>
                        );
                      })}
                      <tr style={{ borderTop: "2px solid #cbd5e1", fontWeight: 700 }}>
                        <Td colSpan={3} style={{ color: "#64748b" }}>סה״כ</Td>
                        <Td style={{ color: "#22c55e" }}>₪{fmt(form.items.reduce((a, i) => a + parseFloat(i.price) * parseFloat(i.qty), 0))}</Td>
                        <Td></Td>
                      </tr>
                    </tbody>
                  </table>
                  <Btn onClick={saveDelivery} style={{ background: "#22c55e" }}>✅ שמור תעודה</Btn>
                </>
              )}
            </>
          )}
        </Card>
      )}


      {scanResult && (
        <Card title="📋 תעודת משלוח — בדוק ואשר">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>ספק</div>
              <input value={scanResult.supplierName || ""} onChange={e => setScanResult(p => ({ ...p, supplierName: e.target.value }))} style={{ ...inputStyle, color: "#1e293b", fontWeight: 700 }} />
              <select
                value={suppliers.find(s => s.name.trim() === scanResult.supplierName?.trim())?.id || ""}
                onChange={e => { const s = suppliers.find(x => x.id === e.target.value); if (s) setScanResult(p => ({ ...p, supplierName: s.name })); }}
                style={{ ...inputStyle, marginTop: 4, fontSize: 12, color: "#64748b" }}
              >
                <option value="">— בחר מהרשימה —</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div><div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>תאריך</div><input type="date" value={scanResult.date || ""} onChange={e => setScanResult(p => ({ ...p, date: e.target.value }))} style={inputStyle} /></div>
            <div><div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>מס׳ תעודה</div><input value={scanResult.deliveryNum || ""} onChange={e => setScanResult(p => ({ ...p, deliveryNum: e.target.value }))} style={inputStyle} /></div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 14 }}>
            <thead><tr style={{ color: "#64748b", borderBottom: "1px solid #cbd5e1" }}><Th>פריט</Th><Th>כמות</Th><Th>יחידה</Th><Th>מחיר</Th><Th>סה״כ</Th><Th></Th></tr></thead>
            <tbody>
              {(scanResult.items || []).map((item, i) => {
                const sup = suppliers.find(s => s.name.trim() === scanResult.supplierName?.trim());
                const supProds = sup ? products.filter(p => p.supplierId === sup.id) : [];
                return (
                <tr key={i} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <Td>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <input value={item.name || ""} onChange={e => setScanResult(p => ({ ...p, items: p.items.map((it, idx) => idx === i ? { ...it, name: e.target.value } : it) }))} style={{ ...inputStyle, width: "100%" }} placeholder="שם פריט" />
                      {supProds.length > 0 && (
                        <select
                          onChange={e => {
                            if (!e.target.value) return;
                            const prod = supProds.find(p => p.id === e.target.value);
                            if (prod) setScanResult(p => ({ ...p, items: p.items.map((it, idx) => idx === i ? { ...it, name: prod.name, unit: prod.unit, price: String(prod.basePrice) } : it) }));
                            e.target.value = "";
                          }}
                          style={{ ...inputStyle, fontSize: 11, color: "#64748b" }}
                        >
                          <option value="">🔗 החלף לפריט מהמערכת...</option>
                          {supProds.map(p => <option key={p.id} value={p.id}>{p.name} | {p.unit} | ₪{fmt(p.basePrice)}</option>)}
                        </select>
                      )}
                    </div>
                  </Td>
                  <Td><input type="number" value={item.qty || ""} onChange={e => setScanResult(p => ({ ...p, items: p.items.map((it, idx) => idx === i ? { ...it, qty: e.target.value } : it) }))} style={{ ...inputStyle, width: 70 }} /></Td>
                  <Td><select value={item.unit || "יחידה"} onChange={e => setScanResult(p => ({ ...p, items: p.items.map((it, idx) => idx === i ? { ...it, unit: e.target.value } : it) }))} style={inputStyle}>{['ק"ג', "יחידה", "ליטר", "קרטון", "שק", "קופסה", "100 גרם"].map(u => <option key={u}>{u}</option>)}</select></Td>
                  <Td><input type="number" value={item.price || ""} onChange={e => setScanResult(p => ({ ...p, items: p.items.map((it, idx) => idx === i ? { ...it, price: e.target.value } : it) }))} style={{ ...inputStyle, width: 90, color: "#1e293b" }} /></Td>
                  <Td style={{ color: "#1e293b", fontWeight: 700 }}>₪{fmt(parseFloat(item.price || 0) * parseFloat(item.qty || 0))}</Td>
                  <Td><button onClick={() => setScanResult(p => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }))} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16 }}>×</button></Td>
                </tr>
                );
              })}
              <tr style={{ borderTop: "2px solid #cbd5e1", fontWeight: 700 }}>
                <Td colSpan={4} style={{ color: "#64748b" }}>סה״כ</Td>
                <Td style={{ color: "#22c55e" }}>₪{fmt((scanResult.items || []).reduce((a, i) => a + parseFloat(i.price || 0) * parseFloat(i.qty || 0), 0))}</Td>
                <Td></Td>
              </tr>
            </tbody>
          </table>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={applyScan} style={{ background: "#22c55e" }}>✅ שמור תעודה</Btn>
            <Btn onClick={() => setScanResult(null)} style={{ background: "#94a3b8" }}>✕ בטל</Btn>
          </div>
        </Card>
      )}

      {/* Monthly summary per supplier */}
      {supplierSummary.length > 0 && (
        <Card title={`📊 השוואה חודשית — ${monthKey}`}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr style={{ color: "#64748b", borderBottom: "1px solid #cbd5e1" }}><Th>ספק</Th><Th>תעודות</Th><Th>סה״כ תעודות</Th><Th>חשבונית שהתקבלה</Th><Th>הפרש</Th></tr></thead>
            <tbody>
              {supplierSummary.map(s => {
                const diff = s.invoiceTotal - s.deliveryTotal;
                const diffColor = Math.abs(diff) < 1 ? "#22c55e" : Math.abs(diff) < 50 ? "#f59e0b" : "#ef4444";
                return (
                  <tr key={s.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <Td style={{ fontWeight: 700 }}>{s.name}</Td>
                    <Td style={{ color: "#64748b" }}>{s.deliveryCount}</Td>
                    <Td style={{ color: "#1e293b", fontWeight: 700 }}>₪{fmt(s.deliveryTotal)}</Td>
                    <Td style={{ color: s.invoiceTotal > 0 ? "#475569" : "#94a3b8" }}>{s.invoiceTotal > 0 ? `₪${fmt(s.invoiceTotal)}` : "טרם התקבלה"}</Td>
                    <Td style={{ color: diffColor, fontWeight: 700 }}>{s.invoiceTotal > 0 ? (diff > 0 ? `+₪${fmt(diff)}` : diff < -0.5 ? `-₪${fmt(Math.abs(diff))}` : "✓ תואם") : "—"}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* Filter + list */}
      <Card title="כל תעודות המשלוח">
        <div style={{ marginBottom: 12 }}>
          <select value={selectedSup} onChange={e => setSelectedSup(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 200 }}>
            <option value="">כל הספקים</option>
            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        {filteredDeliveries.length === 0 && <div style={{ color: "#aaa", fontSize: 13 }}>אין תעודות משלוח עדיין</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[...filteredDeliveries].reverse().map(d => {
            const sup = suppliers.find(s => s.id === d.supplierId);
            const isOpen = expandedDelivery === d.id;
            const isEditing = editDelivery?.id === d.id;
            return (
              <div key={d.id} style={{ border: `1px solid ${isOpen ? "#cc0000" : "#e2e8f0"}`, borderRadius: 10, overflow: "hidden" }}>
                {/* Header row */}
                <div onClick={() => { setExpandedDelivery(isOpen ? null : d.id); setEditDelivery(null); }}
                  style={{ background: isOpen ? "#fff8f8" : "#ffffff", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{sup?.name || "ספק לא ידוע"}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{d.date} | תעודה {d.deliveryNum || "—"} | {(d.items || []).length} פריטים</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ color: "#cc0000", fontWeight: 800, fontSize: 15 }}>₪{fmt(d.total)}</span>
                    <span style={{ color: "#64748b", fontSize: 13 }}>{isOpen ? "▲" : "▼"}</span>
                  </div>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div style={{ borderTop: "1px solid #e2e8f0", padding: 16 }}>
                    {isEditing ? (
                      // Edit mode
                      <>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
                          <div>
                            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>ספק</div>
                            <select value={editDelivery.supplierId} onChange={e => setEditDelivery(p => ({ ...p, supplierId: e.target.value }))} style={inputStyle}>
                              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>תאריך</div>
                            <input type="date" value={editDelivery.date} onChange={e => setEditDelivery(p => ({ ...p, date: e.target.value }))} style={inputStyle} />
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 4 }}>מס׳ תעודה</div>
                            <input value={editDelivery.deliveryNum || ""} onChange={e => setEditDelivery(p => ({ ...p, deliveryNum: e.target.value }))} style={inputStyle} />
                          </div>
                        </div>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 12 }}>
                          <thead><tr style={{ color: "#64748b", borderBottom: "1px solid #e2e8f0" }}><Th>פריט</Th><Th>כמות</Th><Th>יחידה</Th><Th>מחיר</Th><Th>סה״כ</Th><Th></Th></tr></thead>
                          <tbody>
                            {(editDelivery.items || []).map((item, i) => {
                              const prod = products.find(p => p.id === item.productId);
                              const supProds = products.filter(p => p.supplierId === editDelivery.supplierId);
                              return (
                                <tr key={i} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                  <Td>
                                    <select value={item.productId || ""} onChange={e => {
                                      const p = products.find(x => x.id === e.target.value);
                                      setEditDelivery(prev => ({ ...prev, items: prev.items.map((it, idx) => idx === i ? { ...it, productId: e.target.value, price: p ? String(p.basePrice) : it.price } : it) }));
                                    }} style={{ ...inputStyle, fontSize: 12 }}>
                                      <option value="">— בחר פריט —</option>
                                      {supProds.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                  </Td>
                                  <Td><input type="number" value={item.qty} onChange={e => setEditDelivery(prev => ({ ...prev, items: prev.items.map((it, idx) => idx === i ? { ...it, qty: e.target.value } : it) }))} style={{ ...inputStyle, width: 70 }} /></Td>
                                  <Td style={{ color: "#64748b" }}>{prod?.unit || "—"}</Td>
                                  <Td><input type="number" value={item.price} onChange={e => setEditDelivery(prev => ({ ...prev, items: prev.items.map((it, idx) => idx === i ? { ...it, price: e.target.value } : it) }))} style={{ ...inputStyle, width: 90 }} /></Td>
                                  <Td style={{ fontWeight: 700 }}>₪{fmt(parseFloat(item.price || 0) * parseFloat(item.qty || 0))}</Td>
                                  <Td><button onClick={() => setEditDelivery(prev => ({ ...prev, items: prev.items.filter((_, idx) => idx !== i) }))} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 15 }}>×</button></Td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        <div style={{ display: "flex", gap: 8 }}>
                          <Btn onClick={() => {
                            const total = (editDelivery.items || []).reduce((a, i) => a + parseFloat(i.price || 0) * parseFloat(i.qty || 0), 0);
                            setDeliveries(p => p.map(x => x.id === d.id ? { ...editDelivery, total } : x));
                            setEditDelivery(null);
                          }} style={{ background: "#22c55e" }}>💾 שמור שינויים</Btn>
                          <Btn onClick={() => setEditDelivery(null)} style={{ background: "#94a3b8" }}>✕ בטל</Btn>
                        </div>
                      </>
                    ) : (
                      // View mode
                      <>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 12 }}>
                          <thead><tr style={{ color: "#64748b", borderBottom: "1px solid #e2e8f0" }}><Th>פריט</Th><Th>כמות</Th><Th>יחידה</Th><Th>מחיר</Th><Th>סה״כ</Th></tr></thead>
                          <tbody>
                            {(d.items || []).map((item, i) => {
                              const prod = products.find(p => p.id === item.productId);
                              return (
                                <tr key={i} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                  <Td style={{ fontWeight: 600 }}>{prod?.name || "—"}</Td>
                                  <Td>{item.qty}</Td>
                                  <Td style={{ color: "#64748b" }}>{prod?.unit || "—"}</Td>
                                  <Td>₪{fmt(item.price)}</Td>
                                  <Td style={{ fontWeight: 700, color: "#cc0000" }}>₪{fmt(parseFloat(item.price || 0) * parseFloat(item.qty || 0))}</Td>
                                </tr>
                              );
                            })}
                            <tr style={{ borderTop: "2px solid #e2e8f0", fontWeight: 700 }}>
                              <Td colSpan={4} style={{ color: "#64748b" }}>סה״כ</Td>
                              <Td style={{ color: "#cc0000", fontSize: 15 }}>₪{fmt(d.total)}</Td>
                            </tr>
                          </tbody>
                        </table>
                        <div style={{ display: "flex", gap: 8 }}>
                          <Btn onClick={() => setEditDelivery({ ...d, items: d.items.map(i => ({ ...i })) })} style={{ background: "#64748b" }}>✏️ ערוך</Btn>
                          <Btn onClick={() => { if (window.confirm("למחוק תעודה זו?")) { setDeliveries(p => p.filter(x => x.id !== d.id)); setExpandedDelivery(null); } }} style={{ background: "#ef4444" }}>🗑 מחק</Btn>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}


const EXPENSE_CATEGORIES = ["שכירות", "חשמל", "ארנונה", "מים", "גז", "טלפון/אינטרנט", "ביטוח", "תחזוקה", "שיווק/פרסום", "ציוד", "ניקיון", "אחר"];

function Expenses({ expenses, setExpenses }) {
  const [form, setForm] = useState({ date: today(), category: "שכירות", description: "", amount: "" });
  const [showForm, setShowForm] = useState(false);

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthExpenses = expenses.filter(e => e.date?.startsWith(monthKey));
  const totalMonth = monthExpenses.reduce((a, e) => a + parseFloat(e.amount || 0), 0);

  const byCategory = EXPENSE_CATEGORIES.map(cat => ({
    cat,
    total: monthExpenses.filter(e => e.category === cat).reduce((a, e) => a + parseFloat(e.amount || 0), 0)
  })).filter(x => x.total > 0);

  const addExpense = () => {
    if (!form.date || !form.amount) return;
    setExpenses(p => [...p, { ...form, id: Date.now().toString() }]);
    setForm({ date: today(), category: "שכירות", description: "", amount: "" });
    setShowForm(false);
  };

  const delExpense = (id) => { if (window.confirm("למחוק הוצאה זו?")) setExpenses(p => p.filter(e => e.id !== id)); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: "#888", fontSize: 13 }}>סה״כ הוצאות תפעול החודש: <span style={{ color: "#f87171", fontWeight: 700, fontSize: 16 }}>₪{fmt(totalMonth)}</span></div>
        <Btn onClick={() => setShowForm(!showForm)} style={showForm ? { background: "#666" } : {}}>{showForm ? "✕ סגור" : "+ הוצאה חדשה"}</Btn>
      </div>

      {showForm && (
        <Card title="הוספת הוצאה תפעולית">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ ...inputStyle, flex: 2 }}>
              {EXPENSE_CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="תיאור (אופציונלי)" style={{ ...inputStyle, flex: 2 }} />
            <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="סכום ₪" style={{ ...inputStyle, flex: 1, minWidth: 100 }} />
            <Btn onClick={addExpense} style={{ background: "#22c55e" }}>💾 שמור</Btn>
          </div>
        </Card>
      )}

      {byCategory.length > 0 && (
        <Card title="סיכום לפי קטגוריה — חודש נוכחי">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {byCategory.map(({ cat, total }) => (
              <div key={cat} style={{ background: "#f1f5f9", borderRadius: 8, padding: "10px 16px", minWidth: 140 }}>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>{cat}</div>
                <div style={{ fontWeight: 700, color: "#f87171", fontSize: 15 }}>₪{fmt(total)}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title="כל ההוצאות">
        {expenses.length === 0 && <div style={{ color: "#aaa", fontSize: 13 }}>אין הוצאות עדיין</div>}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[...expenses].reverse().map(e => (
            <div key={e.id} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700 }}>{e.category} {e.description ? `— ${e.description}` : ""}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{e.date}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ color: "#f87171", fontWeight: 800, fontSize: 15 }}>₪{fmt(e.amount)}</span>
                <button onClick={() => delExpense(e.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 18 }}>×</button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}


function Notifications({ pending, setPending, suppliers, products, invoices, setInvoices, setSuppliers, setProducts }) {
  const approve = (item) => {
    approvePendingItem(item, suppliers, products, setSuppliers, setProducts, setInvoices, setPending);
  };

  const reject = (id) => {
    if (window.confirm("לדחות את החשבונית הזו?")) {
      setPending(p => p.filter(x => x.id !== id));
    }
  };

  if (pending.length === 0) {
    return (
      <Card title="🔔 התראות ממתינות לאישור">
        <div style={{ textAlign: "center", color: "#64748b", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <div style={{ fontSize: 16 }}>אין התראות — הכל מאושר!</div>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "#fff5f5", border: "1px solid #ef4444", borderRadius: 10, padding: "12px 18px", color: "#f87171", fontWeight: 700, fontSize: 14 }}>
        🔔 {pending.length} חשבונית/ות ממתינות לאישורך
      </div>

      {pending.map((item) => {
        const newProds = item.itemsAnalysis?.filter(i => i.isNew) || [];
        const alertProds = item.itemsAnalysis?.filter(i => i.hasAlert) || [];
        const total = (item.itemsAnalysis || []).reduce((a, i) => a + parseFloat(i.price) * parseFloat(i.qty), 0);

        return (
          <Card key={item.id} title={`📋 חשבונית — ${item.supName} | ${item.scanResult?.date || ""}`}>
            {/* Flags */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
              {item.isNewSupplier && (
                <span style={{ background: "#fff1f1", color: "#1e293b", border: "1px solid #cc0000", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>
                  🆕 ספק חדש: {item.supName}
                </span>
              )}
              {newProds.map((p, i) => (
                <span key={i} style={{ background: "#f0fdf4", color: "#22c55e", border: "1px solid #16a34a", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>
                  🆕 מוצר חדש: {p.name}
                </span>
              ))}
              {alertProds.map((p, i) => (
                <span key={i} style={{ background: "#fff5f5", color: "#f87171", border: "1px solid #ef4444", borderRadius: 6, padding: "3px 10px", fontSize: 12, fontWeight: 700 }}>
                  ⚠️ חריגת מחיר: {p.name} (+{p.priceDiff?.toFixed(1)}%)
                </span>
              ))}
            </div>

            {/* Items table */}
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 14 }}>
              <thead>
                <tr style={{ color: "#64748b", borderBottom: "1px solid #cbd5e1" }}>
                  <Th>פריט</Th><Th>כמות</Th><Th>יחידה</Th><Th>מחיר</Th><Th>סה״כ</Th><Th>סטטוס</Th>
                </tr>
              </thead>
              <tbody>
                {(item.itemsAnalysis || []).map((p, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #e2e8f0", background: p.isNew ? "#f0fdf4" : p.hasAlert ? "#fff5f5" : "transparent" }}>
                    <Td style={{ fontWeight: p.isNew || p.hasAlert ? 700 : 400 }}>{p.name}</Td>
                    <Td>{p.qty}</Td>
                    <Td style={{ color: "#64748b" }}>{p.unit}</Td>
                    <Td style={{ color: p.hasAlert ? "#f87171" : "#0369a1" }}>₪{fmt(p.price)}</Td>
                    <Td style={{ color: "#1e293b" }}>₪{fmt(p.price * p.qty)}</Td>
                    <Td>
                      {p.isNew && <span style={{ color: "#22c55e", fontSize: 11, fontWeight: 700 }}>🆕 חדש</span>}
                      {p.hasAlert && <span style={{ color: "#ef4444", fontSize: 11, fontWeight: 700 }}>⚠️ +{p.priceDiff?.toFixed(1)}%</span>}
                      {!p.isNew && !p.hasAlert && <span style={{ color: "#64748b", fontSize: 11 }}>✓ תקין</span>}
                    </Td>
                  </tr>
                ))}
                <tr style={{ borderTop: "2px solid #cbd5e1", fontWeight: 700 }}>
                  <Td colSpan={4} style={{ color: "#64748b" }}>סה״כ חשבונית</Td>
                  <Td style={{ color: "#22c55e" }}>₪{fmt(total)}</Td>
                  <Td></Td>
                </tr>
              </tbody>
            </table>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10 }}>
              <Btn onClick={() => approve(item)} style={{ background: "#22c55e" }}>✅ אשר ושמור</Btn>
              <Btn onClick={() => reject(item.id)} style={{ background: "#ef4444" }}>❌ דחה</Btn>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function CashDeposits({ cashDeposits, setCashDeposits, sales }) {
  const [form, setForm] = useState({ date: today(), amount: "", bankAmount: "", note: "" });
  const [editId, setEditId] = useState(null);
  const [editVals, setEditVals] = useState({});

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const addDeposit = () => {
    if (!form.amount) return alert("נא להזין סכום");
    setCashDeposits(p => [...p, { id: Date.now().toString(), ...form }]);
    setForm({ date: today(), amount: "", bankAmount: "", note: "" });
  };

  const deleteDeposit = (id) => setCashDeposits(p => p.filter(d => d.id !== id));

  const saveEdit = (id) => {
    setCashDeposits(p => p.map(d => d.id === id ? { ...d, ...editVals } : d));
    setEditId(null);
  };

  // Monthly stats
  const monthDeposits = cashDeposits.filter(d => d.date?.startsWith(monthKey));
  const totalWithdrawn = monthDeposits.reduce((a, d) => a + parseFloat(d.amount || 0), 0);
  const totalDeposited = monthDeposits.reduce((a, d) => a + parseFloat(d.bankAmount || 0), 0);
  const pendingDeposit = monthDeposits.filter(d => !d.bankAmount).reduce((a, d) => a + parseFloat(d.amount || 0), 0);

  // הפרש: הופקד בבנק vs. הוצא מהקופה
  const gap = totalDeposited - totalWithdrawn;

  const sortedDeposits = [...cashDeposits].sort((a, b) => b.date?.localeCompare(a.date));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <KpiCard label="💵 סה״כ הוצא מהקופה החודש" value={`₪${fmt(totalWithdrawn)}`} accent="#cc0000" />
        <KpiCard label="🏦 סה״כ הופקד בבנק החודש" value={`₪${fmt(totalDeposited)}`} accent="#22c55e" />
        <KpiCard label="⏳ ממתין להפקדה" value={`₪${fmt(pendingDeposit)}`} accent={pendingDeposit > 0 ? "#f59e0b" : "#22c55e"} />
        <KpiCard
          label="📊 הפרש: הופקד vs. הוצא"
          accent={Math.abs(gap) < 5 ? "#22c55e" : gap < 0 ? "#ef4444" : "#f59e0b"}
          value={
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: Math.abs(gap) < 5 ? "#22c55e" : gap < 0 ? "#ef4444" : "#f59e0b" }}>
                {gap >= 0 ? "+" : ""}₪{fmt(gap)}
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>
                {Math.abs(gap) < 5 ? "✓ כל הכסף הגיע לבנק" : gap < 0 ? "⚠ חסר בבנק" : "⚠ הופקד יותר מהוצא"}
              </div>
            </div>
          }
          raw
        />
      </div>

      {/* Add form */}
      <Card title="💵 רישום הוצאת מזומן מהקופה">
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 130 }}>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>תאריך</div>
            <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} />
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>💵 סכום שהוצא מהקופה ₪ *</div>
            <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" style={inputStyle} />
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>🏦 סכום שהגיע לבנק ₪</div>
            <input type="number" value={form.bankAmount} onChange={e => setForm(f => ({ ...f, bankAmount: e.target.value }))} placeholder="אם כבר הופקד" style={inputStyle} />
          </div>
          <div style={{ flex: 2, minWidth: 160 }}>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>הערה</div>
            <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} placeholder="לדוגמה: עילי הפקיד" style={inputStyle} />
          </div>
          <Btn onClick={addDeposit} style={{ background: "#cc0000", marginBottom: 1 }}>+ הוסף</Btn>
        </div>
      </Card>

      {/* Deposits list */}
      <Card title="📋 רשימת הוצאות והפקדות">
        {sortedDeposits.length === 0 && (
          <div style={{ color: "#64748b", fontSize: 13, padding: 20, textAlign: "center" }}>אין רשומות עדיין</div>
        )}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          {sortedDeposits.length > 0 && (
            <thead>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <Th>תאריך</Th>
                <Th>הוצא מהקופה</Th>
                <Th>הגיע לבנק</Th>
                <Th>הפרש</Th>
                <Th>סטטוס</Th>
                <Th>הערה</Th>
                <Th></Th>
              </tr>
            </thead>
          )}
          <tbody>
            {sortedDeposits.map(d => {
              const withdrawn = parseFloat(d.amount || 0);
              const banked = parseFloat(d.bankAmount || 0);
              const diff = banked > 0 ? banked - withdrawn : null;
              const isOk = diff !== null && Math.abs(diff) < 5;
              const isEdit = editId === d.id;

              return (
                <tr key={d.id} style={{ borderBottom: "1px solid #e2e8f0", background: isEdit ? "#fff8f8" : "transparent" }}>
                  {isEdit ? (
                    <>
                      <Td><input type="date" value={editVals.date} onChange={e => setEditVals(p => ({ ...p, date: e.target.value }))} style={{ ...inputStyle, width: 130 }} /></Td>
                      <Td><input type="number" value={editVals.amount} onChange={e => setEditVals(p => ({ ...p, amount: e.target.value }))} style={{ ...inputStyle, width: 100 }} /></Td>
                      <Td><input type="number" value={editVals.bankAmount} onChange={e => setEditVals(p => ({ ...p, bankAmount: e.target.value }))} style={{ ...inputStyle, width: 100 }} /></Td>
                      <Td></Td>
                      <Td></Td>
                      <Td><input value={editVals.note} onChange={e => setEditVals(p => ({ ...p, note: e.target.value }))} style={{ ...inputStyle, width: 160 }} /></Td>
                      <Td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => saveEdit(d.id)} style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 5, padding: "3px 8px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>✓</button>
                          <button onClick={() => setEditId(null)} style={{ background: "#e2e8f0", color: "#64748b", border: "none", borderRadius: 5, padding: "3px 8px", cursor: "pointer", fontSize: 12 }}>✕</button>
                        </div>
                      </Td>
                    </>
                  ) : (
                    <>
                      <Td style={{ color: "#64748b" }}>{d.date}</Td>
                      <Td style={{ fontWeight: 700, color: "#cc0000" }}>₪{fmt(withdrawn)}</Td>
                      <Td style={{ fontWeight: 700, color: banked > 0 ? "#22c55e" : "#94a3b8" }}>
                        {banked > 0 ? `₪${fmt(banked)}` : "—"}
                      </Td>
                      <Td style={{ color: diff === null ? "#94a3b8" : isOk ? "#22c55e" : "#ef4444", fontWeight: diff !== null ? 700 : 400 }}>
                        {diff === null ? "—" : `${diff >= 0 ? "+" : ""}₪${fmt(diff)}`}
                      </Td>
                      <Td>
                        {!d.bankAmount
                          ? <span style={{ background: "#fffbeb", color: "#f59e0b", border: "1px solid #f59e0b", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>⏳ ממתין</span>
                          : isOk
                            ? <span style={{ background: "#f0fdf4", color: "#22c55e", border: "1px solid #22c55e", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>✓ תקין</span>
                            : <span style={{ background: "#fff5f5", color: "#ef4444", border: "1px solid #ef4444", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>⚠ פער</span>
                        }
                      </Td>
                      <Td style={{ color: "#64748b" }}>{d.note || "—"}</Td>
                      <Td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => { setEditId(d.id); setEditVals({ date: d.date, amount: d.amount, bankAmount: d.bankAmount || "", note: d.note || "" }); }} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 13 }}>✏️</button>
                          <button onClick={() => deleteDeposit(d.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 15 }}>×</button>
                        </div>
                      </Td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Settings({ settings, setSettings, inventoryCategories, setInventoryCategories, suppliers, setSuppliers }) {
  const [form, setForm] = useState(settings);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 700 }}>
      <Card title="🍔 סף פוד קוסט">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ color: "#64748b", fontSize: 13, display: "block", marginBottom: 4 }}>🟢 ירוק — עד (%)</label>
            <input type="number" value={form.greenMax} onChange={(e) => setForm((f) => ({ ...f, greenMax: parseFloat(e.target.value) }))} style={inputStyle} />
          </div>
          <div>
            <label style={{ color: "#64748b", fontSize: 13, display: "block", marginBottom: 4 }}>🟡 צהוב — עד (%)</label>
            <input type="number" value={form.yellowMax} onChange={(e) => setForm((f) => ({ ...f, yellowMax: parseFloat(e.target.value) }))} style={inputStyle} />
          </div>
          <div style={{ color: "#64748b", fontSize: 12, background: "#ffffff", borderRadius: 8, padding: 10, border: "1px solid #e2e8f0" }}>
            🔴 אדום — מעל {form.yellowMax || "—"}%
          </div>
        </div>
      </Card>
      <Card title="👷 סף לייבור קוסט">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ color: "#64748b", fontSize: 13, display: "block", marginBottom: 4 }}>🟢 ירוק — עד (%)</label>
            <input type="number" value={form.laborGreenMax} onChange={(e) => setForm((f) => ({ ...f, laborGreenMax: parseFloat(e.target.value) }))} style={inputStyle} />
          </div>
          <div>
            <label style={{ color: "#64748b", fontSize: 13, display: "block", marginBottom: 4 }}>🟡 צהוב — עד (%)</label>
            <input type="number" value={form.laborYellowMax} onChange={(e) => setForm((f) => ({ ...f, laborYellowMax: parseFloat(e.target.value) }))} style={inputStyle} />
          </div>
          <div style={{ color: "#64748b", fontSize: 12, background: "#ffffff", borderRadius: 8, padding: 10, border: "1px solid #e2e8f0" }}>
            🔴 אדום — מעל {form.laborYellowMax || "—"}%
          </div>
        </div>
      </Card>
      <Card title="🏢 סף הוצאות הנהלה וכלליות">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ color: "#64748b", fontSize: 13, display: "block", marginBottom: 4 }}>🟢 ירוק — עד (%)</label>
            <input type="number" value={form.expenseGreenMax ?? 20} onChange={(e) => setForm((f) => ({ ...f, expenseGreenMax: parseFloat(e.target.value) }))} style={inputStyle} />
          </div>
          <div>
            <label style={{ color: "#64748b", fontSize: 13, display: "block", marginBottom: 4 }}>🟡 צהוב — עד (%)</label>
            <input type="number" value={form.expenseYellowMax ?? 28} onChange={(e) => setForm((f) => ({ ...f, expenseYellowMax: parseFloat(e.target.value) }))} style={inputStyle} />
          </div>
          <div style={{ color: "#64748b", fontSize: 12, background: "#ffffff", borderRadius: 8, padding: 10, border: "1px solid #e2e8f0" }}>
            🔴 אדום — מעל {form.expenseYellowMax ?? 28}%
          </div>
        </div>
      </Card>
      <div style={{ gridColumn: "1 / -1" }}>
        <Btn onClick={() => setSettings(form)} style={{ background: "#22c55e" }}>💾 שמור הגדרות</Btn>
      </div>
      </div>
      <InvSettings inventoryCategories={inventoryCategories} setInventoryCategories={setInventoryCategories} suppliers={suppliers} setSuppliers={setSuppliers} />
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #e2e8f0" }}>{title}</div>
      {children}
    </div>
  );
}

function KpiCard({ label, value, sub, accent, raw }) {
  return (
    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 16, borderTop: `3px solid ${accent}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: "#64748b" }}>{label}</span>
      </div>
      {raw ? value : <div style={{ fontSize: 22, fontWeight: 800, color: accent }}>{value}</div>}
      {sub && <div style={{ fontSize: 11, color: "#1e293b", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Btn({ onClick, children, style = {} }) {
  return (
    <button onClick={onClick} style={{
      background: "#cc0000", color: "#fff", border: "none", borderRadius: 8,
      padding: "8px 16px", cursor: "pointer", fontWeight: 700, fontSize: 13,
      transition: "opacity 0.15s", whiteSpace: "nowrap", ...style
    }}
      onMouseEnter={(e) => e.currentTarget.style.opacity = "0.8"}
      onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}>
      {children}
    </button>
  );
}

function Th({ children, style = {} }) {
  return <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 600, fontSize: 12, color: "#64748b", borderBottom: "1px solid #cbd5e1", ...style }}>{children}</th>;
}

function Td({ children, style = {}, colSpan }) {
  return <td colSpan={colSpan} style={{ padding: "8px", fontSize: 13, ...style }}>{children}</td>;
}

const inputStyle = {
  background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: 8,
  color: "#1e293b", padding: "8px 12px", fontSize: 13, outline: "none",
  width: "100%", boxSizing: "border-box"
};

function today() {
  return new Date().toISOString().split("T")[0];
}
