import { useState, useEffect } from "react";
import { db } from "./firebase";
import { doc, setDoc, getDoc, collection, onSnapshot } from "firebase/firestore";

const STORAGE_KEYS = {
  employees: "nyh_employees",
  hours: "nyh_hours",
  suppliers: "nyh_suppliers",
  products: "nyh_products",
  invoices: "nyh_invoices",
  sales: "nyh_sales",
  settings: "nyh_settings",
};

const DEFAULT_SETTINGS = { greenMax: 28, yellowMax: 32, laborGreenMax: 25, laborYellowMax: 30 };

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
  } catch (e) { console.error("Save error:", e); }
}

const fmt = (n) => Number(n || 0).toFixed(2);
const pct = (a, b) => (b > 0 ? ((a / b) * 100).toFixed(1) : "0.0");

function StatusBadge({ value, settings }) {
  const v = parseFloat(value);
  const isGreen = v <= settings.greenMax;
  const isYellow = !isGreen && v <= settings.yellowMax;
  const color = isGreen ? "#22c55e" : isYellow ? "#f59e0b" : "#ef4444";
  const bg = isGreen ? "#052e16" : isYellow ? "#431407" : "#1f0505";
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
  { id: "sales", label: "💰 מכירות" },
  { id: "employees", label: "👷 עובדים" },
  { id: "hours", label: "⏱️ שעות" },
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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      setSuppliers((await load(STORAGE_KEYS.suppliers)) || []);
      setProducts((await load(STORAGE_KEYS.products)) || []);
      setInvoices((await load(STORAGE_KEYS.invoices)) || []);
      setSales((await load(STORAGE_KEYS.sales)) || []);
      setEmployees((await load(STORAGE_KEYS.employees)) || []);
      setHours((await load(STORAGE_KEYS.hours)) || []);
      setSettings((await load(STORAGE_KEYS.settings)) || DEFAULT_SETTINGS);
      setLoaded(true);
    })();
  }, []);

  useEffect(() => { if (loaded) save(STORAGE_KEYS.suppliers, suppliers); }, [suppliers, loaded]);
  useEffect(() => { if (loaded) save(STORAGE_KEYS.products, products); }, [products, loaded]);
  useEffect(() => { if (loaded) save(STORAGE_KEYS.invoices, invoices); }, [invoices, loaded]);
  useEffect(() => { if (loaded) save(STORAGE_KEYS.sales, sales); }, [sales, loaded]);
  useEffect(() => { if (loaded) save(STORAGE_KEYS.employees, employees); }, [employees, loaded]);
  useEffect(() => { if (loaded) save(STORAGE_KEYS.hours, hours); }, [hours, loaded]);
  useEffect(() => { if (loaded) save(STORAGE_KEYS.settings, settings); }, [settings, loaded]);

  if (!loaded) return <div style={{ background: "#0a0a0f", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>טוען...</div>;

  return (
    <div dir="rtl" style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'Segoe UI', Tahoma, sans-serif", color: "#e2e8f0" }}>
      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)", borderBottom: "1px solid #334155", padding: "16px 24px", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 28 }}>🌭</span>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#f1f5f9", letterSpacing: 0.5 }}>New York Hotdog — מערכת ניהול פוד קוסט</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>סניף אשדוד</div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display: "flex", gap: 4, padding: "12px 24px 0", borderBottom: "1px solid #1e293b", overflowX: "auto" }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: tab === t.id ? "#6366f1" : "transparent",
            color: tab === t.id ? "#fff" : "#94a3b8",
            border: "none", borderRadius: "8px 8px 0 0", padding: "8px 16px",
            cursor: "pointer", fontSize: 13, fontWeight: tab === t.id ? 700 : 400,
            whiteSpace: "nowrap", transition: "all 0.2s"
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding: 24 }}>
        {tab === "dashboard" && <Dashboard invoices={invoices} sales={sales} suppliers={suppliers} products={products} settings={settings} hours={hours} employees={employees} />}
        {tab === "suppliers" && <Suppliers suppliers={suppliers} setSuppliers={setSuppliers} products={products} setProducts={setProducts} />}
        {tab === "invoices" && <Invoices invoices={invoices} setInvoices={setInvoices} suppliers={suppliers} products={products} settings={settings} />}
        {tab === "sales" && <Sales sales={sales} setSales={setSales} />}
        {tab === "employees" && <Employees employees={employees} setEmployees={setEmployees} />}
        {tab === "hours" && <Hours hours={hours} setHours={setHours} employees={employees} sales={sales} settings={settings} />}
        {tab === "settings" && <Settings settings={settings} setSettings={setSettings} />}
      </div>
    </div>
  );
}

function Dashboard({ invoices, sales, suppliers, products, settings, hours, employees }) {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthlySales = sales.filter((s) => s.date?.startsWith(monthKey));
  const totalSales = monthlySales.reduce((a, s) => a + (parseFloat(s.kupa) || 0) + (parseFloat(s.wolt) || 0), 0);
  const totalKupa = monthlySales.reduce((a, s) => a + (parseFloat(s.kupa) || 0), 0);
  const totalWolt = monthlySales.reduce((a, s) => a + (parseFloat(s.wolt) || 0), 0);
  const monthlyInvoices = invoices.filter((i) => i.date?.startsWith(monthKey));
  const totalCost = monthlyInvoices.reduce((a, i) => a + (parseFloat(i.total) || 0), 0);
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
    const cost = supInvoices.reduce((a, i) => a + (parseFloat(i.total) || 0), 0);
    return { ...sup, cost, pct: parseFloat(pct(cost, totalSales)) };
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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Prime Cost banner */}
      {totalSales > 0 && (
        <div style={{ background: `linear-gradient(135deg, #1e1b4b, #0f172a)`, border: `2px solid ${pcColor}`, borderRadius: 12, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 4 }}>PRIME COST — פוד + לייבור</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: pcColor }}>{primeCostPct}%</div>
            <div style={{ fontSize: 12, color: pcColor, marginTop: 2 }}>
              {primeCostPct <= 55 ? "✓ מצוין" : primeCostPct <= 65 ? "⚠ גבולי" : "✗ גבוה — נדרשת פעולה"}
              {" | "}יעד: מתחת ל-55%
            </div>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>פוד קוסט</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: fcColor }}>{foodCostPct}%</div>
            </div>
            <div style={{ color: "#334155", fontSize: 24, alignSelf: "center" }}>+</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>לייבור קוסט</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: lcColor }}>{laborCostPct}%</div>
            </div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <KpiCard label="מכירות החודש" value={`₪${fmt(totalSales)}`} accent="#22d3ee" sub={`קופה ₪${fmt(totalKupa)} | וולט ₪${fmt(totalWolt)}`} />
        <KpiCard label="עלות ספקים" value={`₪${fmt(totalCost)}`} accent="#a78bfa" sub={`${monthlyInvoices.length} חשבוניות`} />
        <KpiCard label="פוד קוסט" value={<StatusBadge value={foodCostPct} settings={settings} />} accent="#f472b6" raw />
        <KpiCard label="עלות עבודה" value={`₪${fmt(totalLaborCost)}`} accent="#fb923c" sub={`${totalLaborHours.toFixed(1)} שעות`} />
        <KpiCard label="לייבור קוסט" value={<StatusBadge value={laborCostPct} settings={lcSettings} />} accent="#fb923c" raw />
        <KpiCard label="התראות מחיר" value={alerts.length} accent={alerts.length > 0 ? "#f59e0b" : "#22c55e"} sub={alerts.length > 0 ? "דרוש טיפול" : "הכל תקין"} />
      </div>

      {/* Food cost bar */}
      <Card title="פוד קוסט חודשי">
        <div style={{ marginBottom: 8, color: "#94a3b8", fontSize: 13 }}>
          יעד: עד {settings.greenMax}% | גבולי: {settings.greenMax}%–{settings.yellowMax}% | גבוה: מעל {settings.yellowMax}%
        </div>
        <div style={{ background: "#1e293b", borderRadius: 8, height: 28, overflow: "hidden" }}>
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
          <div style={{ marginBottom: 8, color: "#94a3b8", fontSize: 13 }}>
            יעד: עד {settings.laborGreenMax}% | גבולי: {settings.laborGreenMax}%–{settings.laborYellowMax}% | גבוה: מעל {settings.laborYellowMax}%
          </div>
          <div style={{ background: "#1e293b", borderRadius: 8, height: 28, overflow: "hidden" }}>
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
              <thead><tr style={{ color: "#94a3b8", borderBottom: "1px solid #334155" }}><Th>עובד</Th><Th>שעות</Th><Th>₪/שעה</Th><Th>עלות</Th><Th>% ממכירות</Th></tr></thead>
              <tbody>
                {empStats.map((e) => (
                  <tr key={e.id} style={{ borderBottom: "1px solid #1e293b" }}>
                    <Td>{e.name}</Td>
                    <Td>{e.hrs.toFixed(1)}</Td>
                    <Td style={{ color: "#94a3b8" }}>₪{fmt(e.hourlyRate)}</Td>
                    <Td style={{ color: "#fb923c" }}>₪{fmt(e.cost)}</Td>
                    <Td>{pct(e.cost, totalSales)}%</Td>
                  </tr>
                ))}
                <tr style={{ borderTop: "2px solid #334155", fontWeight: 700 }}>
                  <Td style={{ color: "#94a3b8" }}>סה״כ</Td>
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
            <thead><tr style={{ color: "#94a3b8", borderBottom: "1px solid #334155" }}><Th>ספק</Th><Th>עלות</Th><Th>% מהמכירות</Th><Th>סטטוס</Th></tr></thead>
            <tbody>
              {supplierStats.map((s) => (
                <tr key={s.id} style={{ borderBottom: "1px solid #1e293b" }}>
                  <Td>{s.name}</Td><Td>₪{fmt(s.cost)}</Td><Td>{s.pct}%</Td>
                  <Td><StatusBadge value={s.pct} settings={settings} /></Td>
                </tr>
              ))}
              <tr style={{ borderBottom: "1px solid #1e293b", fontWeight: 700 }}>
                <Td style={{ color: "#94a3b8" }}>סה״כ</Td><Td>₪{fmt(totalCost)}</Td><Td>{foodCostPct}%</Td>
                <Td><StatusBadge value={foodCostPct} settings={settings} /></Td>
              </tr>
            </tbody>
          </table>
        </Card>
      )}

      {alerts.length > 0 && (
        <Card title={`⚠️ התראות חריגת מחיר — דרוש זיכוי (${alerts.length})`}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr style={{ color: "#94a3b8", borderBottom: "1px solid #334155" }}><Th>תאריך</Th><Th>ספק</Th><Th>פריט</Th><Th>מחיר בסיס</Th><Th>מחיר בחשבונית</Th><Th>חריגה</Th></tr></thead>
            <tbody>
              {alerts.map((a, i) => {
                const sup = suppliers.find((s) => s.id === a.inv.supplierId);
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #1e293b", background: "#1a0505" }}>
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
        <div style={{ textAlign: "center", color: "#475569", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🌭</div>
          <div style={{ fontSize: 16 }}>התחל בהכנסת ספקים, מחירי בסיס, מכירות וחשבוניות</div>
        </div>
      )}
    </div>
  );
}

function Suppliers({ suppliers, setSuppliers, products, setProducts }) {
  const [newSupName, setNewSupName] = useState("");
  const [selSup, setSelSup] = useState(null);
  const [newProd, setNewProd] = useState({ name: "", unit: "ק\"ג", basePrice: "" });

  const addSupplier = () => {
    if (!newSupName.trim()) return;
    setSuppliers((p) => [...p, { id: Date.now().toString(), name: newSupName.trim() }]);
    setNewSupName("");
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
        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <input value={newSupName} onChange={(e) => setNewSupName(e.target.value)} placeholder="שם ספק חדש"
            onKeyDown={(e) => e.key === "Enter" && addSupplier()} style={inputStyle} />
          <Btn onClick={addSupplier}>+</Btn>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {suppliers.length === 0 && <div style={{ color: "#475569", fontSize: 13, padding: 8 }}>אין ספקים עדיין</div>}
          {suppliers.map((s) => (
            <div key={s.id} onClick={() => setSelSup(s.id)} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 12px", borderRadius: 8, cursor: "pointer",
              background: selSup === s.id ? "#1e1b4b" : "#0f172a",
              border: `1px solid ${selSup === s.id ? "#6366f1" : "#1e293b"}`, transition: "all 0.15s"
            }}>
              <span style={{ fontWeight: selSup === s.id ? 700 : 400 }}>{s.name}</span>
              <span style={{ display: "flex", gap: 8, fontSize: 12 }}>
                <span style={{ color: "#6366f1" }}>{products.filter((p) => p.supplierId === s.id).length} פריטים</span>
                <button onClick={(e) => { e.stopPropagation(); delSupplier(s.id); }} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16 }}>×</button>
              </span>
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
                  <thead><tr style={{ color: "#94a3b8", borderBottom: "1px solid #334155" }}><Th>פריט</Th><Th>יחידה</Th><Th>מחיר בסיס (₪)</Th><Th></Th></tr></thead>
                  <tbody>
                    {supProds.map((p) => (
                      <tr key={p.id} style={{ borderBottom: "1px solid #1e293b" }}>
                        <Td>{p.name}</Td>
                        <Td style={{ color: "#94a3b8" }}>{p.unit}</Td>
                        <Td>
                          <input type="number" defaultValue={p.basePrice} onBlur={(e) => updateBasePrice(p.id, e.target.value)}
                            style={{ ...inputStyle, width: 100, textAlign: "center" }} />
                        </Td>
                        <Td><button onClick={() => delProduct(p.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 15 }}>×</button></Td>
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

function Invoices({ invoices, setInvoices, suppliers, products, settings }) {
  const [form, setForm] = useState({ supplierId: "", date: today(), invoiceNum: "", items: [] });
  const [newItem, setNewItem] = useState({ productId: "", price: "", qty: "1" });
  const [showForm, setShowForm] = useState(false);

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: "#888", fontSize: 13 }}>{invoices.length} חשבוניות במערכת</div>
        <Btn onClick={() => setShowForm(!showForm)} style={showForm ? { background: "#666" } : {}}>{showForm ? "✕ סגור" : "+ חשבונית חדשה"}</Btn>
      </div>

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
              <div style={{ background: "#1e293b", borderRadius: 8, padding: "12px 14px", marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8, fontWeight: 600 }}>הוספת פריט:</div>
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
                <div style={{ background: "#1a0505", border: "1px solid #ef4444", borderRadius: 8, padding: "10px 14px", marginBottom: 12, color: "#f87171", fontSize: 13 }}>
                  ⚠️ <strong>שים לב!</strong> {formAlerts.length} פריט/ים חרגו ביותר מ-5% ממחיר הבסיס. בדוק לפני שמירה!
                </div>
              )}

              {form.items.length > 0 && (
                <>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 14 }}>
                    <thead><tr style={{ color: "#94a3b8", borderBottom: "1px solid #334155" }}><Th>פריט</Th><Th>כמות</Th><Th>מחיר בסיס</Th><Th>מחיר בחשבונית</Th><Th>סה״כ שורה</Th><Th>סטטוס</Th><Th></Th></tr></thead>
                    <tbody>
                      {form.items.map((item) => {
                        const prod = products.find((p) => p.id === item.productId);
                        const base = parseFloat(prod?.basePrice || 0);
                        const price = parseFloat(item.price);
                        const qty = parseFloat(item.qty);
                        const diff = base > 0 ? ((price - base) / base) * 100 : 0;
                        const alert = diff > 5;
                        return (
                          <tr key={item.id} style={{ borderBottom: "1px solid #1e293b", background: alert ? "#1a0505" : "transparent" }}>
                            <Td>{prod?.name}</Td>
                            <Td>{qty} {prod?.unit}</Td>
                            <Td style={{ color: "#94a3b8" }}>₪{fmt(base)}</Td>
                            <Td style={{ color: alert ? "#f87171" : "#e2e8f0", fontWeight: alert ? 700 : 400 }}>₪{fmt(price)}</Td>
                            <Td style={{ color: "#22d3ee" }}>₪{fmt(price * qty)}</Td>
                            <Td>{alert ? <span style={{ color: "#ef4444", fontWeight: 700, fontSize: 12 }}>+{diff.toFixed(1)}% ⚠️</span> : <span style={{ color: "#22c55e", fontSize: 12 }}>✓ תקין</span>}</Td>
                            <Td><button onClick={() => removeItem(item.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 16 }}>×</button></Td>
                          </tr>
                        );
                      })}
                      <tr style={{ borderTop: "2px solid #334155" }}>
                        <Td colSpan={4} style={{ color: "#94a3b8", fontWeight: 700 }}>סה״כ חשבונית:</Td>
                        <Td style={{ color: "#22d3ee", fontWeight: 700, fontSize: 15 }}>₪{fmt(formTotal)}</Td>
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
            return (
              <div key={inv.id} style={{
                background: "#0f172a", border: "1px solid #1e293b",
                borderRadius: 8, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{sup?.name || "ספק לא ידוע"}</div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>{inv.date} | חשבונית {inv.invoiceNum || "—"} | {(inv.items || []).length} פריטים</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {itemAlerts.length > 0 && <span style={{ background: "#1a0505", color: "#f87171", border: "1px solid #ef4444", borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>⚠️ {itemAlerts.length} חריגות</span>}
                  <span style={{ color: "#22d3ee", fontWeight: 800, fontSize: 15 }}>₪{fmt(inv.total)}</span>
                  <button onClick={() => setInvoices((p) => p.filter((i) => i.id !== inv.id))} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 18 }}>×</button>
                </div>
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

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthSales = sales.filter((s) => s.date?.startsWith(monthKey));
  const totalKupa = monthSales.reduce((a, s) => a + (parseFloat(s.kupa) || 0), 0);
  const totalWolt = monthSales.reduce((a, s) => a + (parseFloat(s.wolt) || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        <KpiCard label="קופה — חודש נוכחי" value={`₪${fmt(totalKupa)}`} sub="מכירות ישירות" accent="#22d3ee" />
        <KpiCard label="וולט — חודש נוכחי" value={`₪${fmt(totalWolt)}`} sub="הזמנות אונליין" accent="#a78bfa" />
        <KpiCard label="סה״כ מכירות" value={`₪${fmt(totalKupa + totalWolt)}`} sub={`${monthSales.length} ימים מוזנים`} accent="#22c55e" />
      </div>

      <Card title="הכנסת מכירות יומיות">
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 4 }}>תאריך</label>
            <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} style={{ ...inputStyle, minWidth: 160 }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 4 }}>🖥️ קופה (₪)</label>
            <input value={form.kupa} onChange={(e) => setForm((f) => ({ ...f, kupa: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && addSale()} placeholder="0" type="number" style={{ ...inputStyle, minWidth: 120 }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 4 }}>📱 וולט (₪)</label>
            <input value={form.wolt} onChange={(e) => setForm((f) => ({ ...f, wolt: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && addSale()} placeholder="0" type="number" style={{ ...inputStyle, minWidth: 120 }} />
          </div>
          <Btn onClick={addSale}>💾 שמור</Btn>
        </div>
      </Card>

      <Card title="מכירות חודש נוכחי">
        {monthSales.length === 0 && <div style={{ color: "#475569", fontSize: 13 }}>אין נתוני מכירות לחודש זה</div>}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr style={{ color: "#94a3b8", borderBottom: "1px solid #334155" }}><Th>תאריך</Th><Th>קופה</Th><Th>וולט</Th><Th>סה״כ יומי</Th><Th></Th></tr></thead>
          <tbody>
            {[...monthSales].sort((a, b) => b.date?.localeCompare(a.date)).map((s) => (
              <tr key={s.id} style={{ borderBottom: "1px solid #1e293b", background: editId === s.id ? "#1e1b4b" : "transparent" }}>
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
                    <Td style={{ color: "#22d3ee", fontWeight: 700 }}>
                      ₪{fmt((parseFloat(editVals.kupa) || 0) + (parseFloat(editVals.wolt) || 0))}
                    </Td>
                    <Td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => saveEdit(s.id)} style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 5, padding: "4px 10px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>שמור</button>
                        <button onClick={() => setEditId(null)} style={{ background: "#334155", color: "#94a3b8", border: "none", borderRadius: 5, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>ביטול</button>
                      </div>
                    </Td>
                  </>
                ) : (
                  <>
                    <Td style={{ color: "#22d3ee" }}>₪{fmt(s.kupa || 0)}</Td>
                    <Td style={{ color: "#a78bfa" }}>₪{fmt(s.wolt || 0)}</Td>
                    <Td style={{ fontWeight: 700 }}>₪{fmt((parseFloat(s.kupa) || 0) + (parseFloat(s.wolt) || 0))}</Td>
                    <Td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => startEdit(s)} style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: 14 }} title="עריכה">✏️</button>
                        <button onClick={() => setSales((p) => p.filter((i) => i.id !== s.id))} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 14 }} title="מחיקה">×</button>
                      </div>
                    </Td>
                  </>
                )}
              </tr>
            ))}
            {monthSales.length > 0 && (
              <tr style={{ borderTop: "2px solid #334155", fontWeight: 700 }}>
                <Td style={{ color: "#94a3b8" }}>סה״כ חודש</Td>
                <Td style={{ color: "#22d3ee" }}>₪{fmt(totalKupa)}</Td>
                <Td style={{ color: "#a78bfa" }}>₪{fmt(totalWolt)}</Td>
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
            <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 4 }}>שם עובד</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && addEmployee()}
              placeholder="שם מלא" style={inputStyle} />
          </div>
          <div style={{ flex: 2 }}>
            <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 4 }}>₪ לשעה</label>
            <input value={form.hourlyRate} onChange={(e) => setForm((f) => ({ ...f, hourlyRate: e.target.value }))}
              onKeyDown={(e) => e.key === "Enter" && addEmployee()}
              placeholder="45" type="number" style={inputStyle} />
          </div>
          <Btn onClick={addEmployee}>+ הוסף</Btn>
        </div>
      </Card>

      <Card title="רשימת עובדים">
        {employees.length === 0 && <div style={{ color: "#475569", fontSize: 13 }}>אין עובדים — הוסף עובדים כדי לעקוב אחר לייבור קוסט</div>}
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          {employees.length > 0 && <thead><tr style={{ color: "#94a3b8", borderBottom: "1px solid #334155" }}><Th>שם עובד</Th><Th>₪ לשעה</Th><Th></Th></tr></thead>}
          <tbody>
            {employees.map((e) => (
              <tr key={e.id} style={{ borderBottom: "1px solid #1e293b", background: editId === e.id ? "#1e1b4b" : "transparent" }}>
                {editId === e.id ? (
                  <>
                    <Td><input value={editVals.name} onChange={(ev) => setEditVals((v) => ({ ...v, name: ev.target.value }))} style={{ ...inputStyle, width: "100%" }} autoFocus /></Td>
                    <Td><input type="number" value={editVals.hourlyRate} onChange={(ev) => setEditVals((v) => ({ ...v, hourlyRate: ev.target.value }))} style={{ ...inputStyle, width: 100 }} /></Td>
                    <Td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => saveEdit(e.id)} style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 5, padding: "4px 10px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>שמור</button>
                        <button onClick={() => setEditId(null)} style={{ background: "#334155", color: "#94a3b8", border: "none", borderRadius: 5, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>ביטול</button>
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
                          style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: 14 }}>✏️</button>
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

  const addHours = () => {
    if (!form.date || !form.employeeId || !form.hours) return;
    // Check if same employee + date already exists → update
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
          ? <div style={{ color: "#475569", fontSize: 13 }}>יש להוסיף עובדים קודם בטאב 👷 עובדים</div>
          : (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div>
                <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 4 }}>תאריך</label>
                <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} style={{ ...inputStyle, minWidth: 155 }} />
              </div>
              <div style={{ flex: 2 }}>
                <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 4 }}>עובד</label>
                <select value={form.employeeId} onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))} style={{ ...inputStyle }}>
                  <option value="">— בחר עובד —</option>
                  {employees.map((e) => <option key={e.id} value={e.id}>{e.name} (₪{fmt(e.hourlyRate)}/שעה)</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 4 }}>שעות</label>
                <input type="number" value={form.hours} onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && addHours()}
                  placeholder="8" step="0.5" style={{ ...inputStyle, width: 90 }} />
              </div>
              <Btn onClick={addHours}>💾 שמור</Btn>
            </div>
          )}
      </Card>

      <Card title="שעות חודש נוכחי">
        {Object.keys(byDate).length === 0 && <div style={{ color: "#475569", fontSize: 13 }}>אין שעות מוזנות לחודש זה</div>}
        {Object.entries(byDate).map(([date, entries]) => {
          const dayTotal = entries.reduce((a, h) => a + (parseFloat(h.hours) || 0), 0);
          const dayCost = entries.reduce((a, h) => {
            const emp = employees.find((e) => e.id === h.employeeId);
            return a + (parseFloat(h.hours) || 0) * (parseFloat(emp?.hourlyRate) || 0);
          }, 0);
          return (
            <div key={date} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontWeight: 700, color: "#94a3b8", fontSize: 13 }}>{date}</span>
                <span style={{ fontSize: 12, color: "#475569" }}>{dayTotal.toFixed(1)} שעות | ₪{fmt(dayCost)}</span>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <tbody>
                  {entries.map((h) => {
                    const emp = employees.find((e) => e.id === h.employeeId);
                    const cost = (parseFloat(h.hours) || 0) * (parseFloat(emp?.hourlyRate) || 0);
                    return (
                      <tr key={h.id} style={{ borderBottom: "1px solid #1e293b", background: editId === h.id ? "#1e1b4b" : "transparent" }}>
                        <Td style={{ color: "#e2e8f0" }}>{emp?.name || "—"}</Td>
                        {editId === h.id ? (
                          <>
                            <Td><input type="number" value={editHours} onChange={(e) => setEditHours(e.target.value)} step="0.5" style={{ ...inputStyle, width: 80 }} autoFocus /></Td>
                            <Td><span style={{ color: "#fb923c" }}>₪{fmt((parseFloat(editHours) || 0) * (parseFloat(emp?.hourlyRate) || 0))}</span></Td>
                            <Td>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button onClick={() => saveEdit(h.id)} style={{ background: "#22c55e", color: "#fff", border: "none", borderRadius: 5, padding: "3px 8px", cursor: "pointer", fontWeight: 700, fontSize: 12 }}>✓</button>
                                <button onClick={() => setEditId(null)} style={{ background: "#334155", color: "#94a3b8", border: "none", borderRadius: 5, padding: "3px 8px", cursor: "pointer", fontSize: 12 }}>✕</button>
                              </div>
                            </Td>
                          </>
                        ) : (
                          <>
                            <Td><span style={{ color: "#fb923c", fontWeight: 600 }}>{parseFloat(h.hours).toFixed(1)} שעות</span></Td>
                            <Td style={{ color: "#94a3b8" }}>₪{fmt(cost)}</Td>
                            <Td>
                              <div style={{ display: "flex", gap: 8 }}>
                                <button onClick={() => { setEditId(h.id); setEditHours(h.hours); }} style={{ background: "none", border: "none", color: "#6366f1", cursor: "pointer", fontSize: 13 }}>✏️</button>
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
          <div style={{ borderTop: "2px solid #334155", paddingTop: 12, display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700 }}>
            <span style={{ color: "#94a3b8" }}>סה״כ חודש</span>
            <span style={{ color: "#fb923c" }}>{totalLaborHours.toFixed(1)} שעות | ₪{fmt(totalLaborCost)}</span>
            <StatusBadge value={laborPct} settings={lcSettings} />
          </div>
        )}
      </Card>
    </div>
  );
}

function Settings({ settings, setSettings }) {
  const [form, setForm] = useState(settings);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 700 }}>
      <Card title="🍔 סף פוד קוסט">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ color: "#94a3b8", fontSize: 13, display: "block", marginBottom: 4 }}>🟢 ירוק — עד (%)</label>
            <input type="number" value={form.greenMax} onChange={(e) => setForm((f) => ({ ...f, greenMax: parseFloat(e.target.value) }))} style={inputStyle} />
          </div>
          <div>
            <label style={{ color: "#94a3b8", fontSize: 13, display: "block", marginBottom: 4 }}>🟡 צהוב — עד (%)</label>
            <input type="number" value={form.yellowMax} onChange={(e) => setForm((f) => ({ ...f, yellowMax: parseFloat(e.target.value) }))} style={inputStyle} />
          </div>
          <div style={{ color: "#64748b", fontSize: 12, background: "#0f172a", borderRadius: 8, padding: 10, border: "1px solid #1e293b" }}>
            🔴 אדום — מעל {form.yellowMax || "—"}%
          </div>
        </div>
      </Card>
      <Card title="👷 סף לייבור קוסט">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ color: "#94a3b8", fontSize: 13, display: "block", marginBottom: 4 }}>🟢 ירוק — עד (%)</label>
            <input type="number" value={form.laborGreenMax} onChange={(e) => setForm((f) => ({ ...f, laborGreenMax: parseFloat(e.target.value) }))} style={inputStyle} />
          </div>
          <div>
            <label style={{ color: "#94a3b8", fontSize: 13, display: "block", marginBottom: 4 }}>🟡 צהוב — עד (%)</label>
            <input type="number" value={form.laborYellowMax} onChange={(e) => setForm((f) => ({ ...f, laborYellowMax: parseFloat(e.target.value) }))} style={inputStyle} />
          </div>
          <div style={{ color: "#64748b", fontSize: 12, background: "#0f172a", borderRadius: 8, padding: 10, border: "1px solid #1e293b" }}>
            🔴 אדום — מעל {form.laborYellowMax || "—"}%
          </div>
        </div>
      </Card>
      <div style={{ gridColumn: "1 / -1" }}>
        <Btn onClick={() => setSettings(form)} style={{ background: "#22c55e" }}>💾 שמור הגדרות</Btn>
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #1e293b" }}>{title}</div>
      {children}
    </div>
  );
}

function KpiCard({ label, value, sub, accent, raw }) {
  return (
    <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: 16, borderTop: `3px solid ${accent}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: "#64748b" }}>{label}</span>
      </div>
      {raw ? value : <div style={{ fontSize: 22, fontWeight: 800, color: accent }}>{value}</div>}
      {sub && <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Btn({ onClick, children, style = {} }) {
  return (
    <button onClick={onClick} style={{
      background: "#6366f1", color: "#fff", border: "none", borderRadius: 8,
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
  return <th style={{ textAlign: "right", padding: "6px 8px", fontWeight: 600, fontSize: 12, color: "#94a3b8", borderBottom: "1px solid #334155", ...style }}>{children}</th>;
}

function Td({ children, style = {}, colSpan }) {
  return <td colSpan={colSpan} style={{ padding: "8px", fontSize: 13, ...style }}>{children}</td>;
}

const inputStyle = {
  background: "#1e293b", border: "1px solid #334155", borderRadius: 8,
  color: "#e2e8f0", padding: "8px 12px", fontSize: 13, outline: "none",
  width: "100%", boxSizing: "border-box"
};

function today() {
  return new Date().toISOString().split("T")[0];
}
