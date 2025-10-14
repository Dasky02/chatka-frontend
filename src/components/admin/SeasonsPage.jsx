import { useEffect, useMemo, useState } from "react";
import { listSeasons, createSeason, updateSeason, deleteSeason } from "../../api/seasons";

// jednoduchý formatter čísel (Kč)
const fmt = (n) => new Intl.NumberFormat("cs-CZ").format(n);

const EMPTY = {
    propertyId: 1,
    name: "",
    dateFrom: "",
    dateTo: "",
    basePriceCzk: 2500,
    minNights: 1,
    weekendMult: 1.0,
    discountPct: 0.0
};

export default function SeasonsPage({ propertyId = 1 }) {
    const [rows, setRows] = useState([]);
    const [form, setForm] = useState({ ...EMPTY, propertyId });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState("");

    const title = useMemo(() => (editingId ? "Upravit sezónu" : "Nová sezóna"), [editingId]);

    async function refresh() {
        setLoading(true);
        setErr("");
        try {
            const data = await listSeasons(propertyId);
            setRows(data);
        } catch (e) {
            setErr(String(e));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { refresh(); }, [propertyId]);

    function onEdit(row) {
        setEditingId(row.id);
        setForm({
            propertyId: row.propertyId,
            name: row.name,
            dateFrom: row.dateFrom,
            dateTo: row.dateTo,
            basePriceCzk: row.basePriceCzk,
            minNights: row.minNights,
            weekendMult: row.weekendMult,
            discountPct: row.discountPct
        });
    }

    function onCancel() {
        setEditingId(null);
        setForm({ ...EMPTY, propertyId });
        setErr("");
    }

    async function onDelete(id) {
        if (!confirm("Smazat sezónu?")) return;
        setErr("");
        try {
            await deleteSeason(id);
            await refresh();
            if (editingId === id) onCancel();
        } catch (e) {
            setErr(String(e));
        }
    }

    async function onSubmit(e) {
        e.preventDefault();
        setErr("");
        try {
            // lehké ověření rozsahu (dateFrom < dateTo)
            if (!form.dateFrom || !form.dateTo || form.dateFrom >= form.dateTo) {
                setErr("Datum od musí být před datem do.");
                return;
            }
            const payload = {
                propertyId: Number(form.propertyId),
                name: form.name.trim(),
                dateFrom: form.dateFrom,
                dateTo: form.dateTo,
                basePriceCzk: Number(form.basePriceCzk),
                minNights: Number(form.minNights),
                weekendMult: Number(form.weekendMult),
                discountPct: Number(form.discountPct)
            };
            if (editingId) {
                await updateSeason(editingId, payload);
            } else {
                await createSeason(payload);
            }
            await refresh();
            onCancel();
        } catch (e) {
            setErr(String(e));
        }
    }

    return (
        <div style={{ display: "grid", gap: 16 }}>
            <h2>Ceník / Sezóny</h2>

            {err && <div style={{ color: "crimson" }}>Chyba: {err}</div>}

            <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                    <tr>
                        <th style={th}>Název</th>
                        <th style={th}>Od</th>
                        <th style={th}>Do</th>
                        <th style={{ ...th, textAlign: "right" }}>Základ (Kč)</th>
                        <th style={{ ...th, textAlign: "right" }}>Min nocí</th>
                        <th style={{ ...th, textAlign: "right" }}>Víkend ×</th>
                        <th style={{ ...th, textAlign: "right" }}>Sleva %</th>
                        <th style={th}>Akce</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows.map(r => (
                        <tr key={r.id}>
                            <td style={td}>{r.name}</td>
                            <td style={td}>{r.dateFrom}</td>
                            <td style={td}>{r.dateTo}</td>
                            <td style={{...td, textAlign:"right"}}>{fmt(r.basePriceCzk)}</td>
                            <td style={{...td, textAlign:"right"}}>{r.minNights}</td>
                            <td style={{...td, textAlign:"right"}}>{r.weekendMult}</td>
                            <td style={{...td, textAlign:"right"}}>{r.discountPct}</td>
                            <td style={td}>
                                <button onClick={() => onEdit(r)}>Upravit</button>{" "}
                                <button onClick={() => onDelete(r.id)} style={{ color: "crimson" }}>
                                    Smazat
                                </button>
                            </td>
                        </tr>
                    ))}
                    {rows.length === 0 && !loading && (
                        <tr><td style={td} colSpan={8}>Žádné sezóny.</td></tr>
                    )}
                    </tbody>
                </table>
            </div>

            <form onSubmit={onSubmit} style={formBox}>
                <h3>{title}</h3>
                <div style={grid2}>
                    <label> Název
                        <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
                    </label>
                    <label> Základ (Kč)
                        <input type="number" min="0" step="1"
                               value={form.basePriceCzk}
                               onChange={e=>setForm({...form, basePriceCzk:e.target.value})} required />
                    </label>
                    <label> Datum od
                        <input type="date" value={form.dateFrom}
                               onChange={e=>setForm({...form, dateFrom:e.target.value})} required />
                    </label>
                    <label> Datum do
                        <input type="date" value={form.dateTo}
                               onChange={e=>setForm({...form, dateTo:e.target.value})} required />
                    </label>
                    <label> Min. nocí
                        <input type="number" min="1" step="1"
                               value={form.minNights}
                               onChange={e=>setForm({...form, minNights:e.target.value})} required />
                    </label>
                    <label> Víkendový násobič
                        <input type="number" min="0" step="0.01"
                               value={form.weekendMult}
                               onChange={e=>setForm({...form, weekendMult:e.target.value})} required />
                    </label>
                    <label> Sleva (%)
                        <input type="number" min="0" max="100" step="0.1"
                               value={form.discountPct}
                               onChange={e=>setForm({...form, discountPct:e.target.value})} required />
                    </label>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button type="submit">{editingId ? "Uložit" : "Přidat"}</button>
                    {editingId && <button type="button" onClick={onCancel}>Zrušit</button>}
                </div>
            </form>
        </div>
    );
}

const th = { borderBottom: "1px solid #ddd", padding: "8px", textAlign: "left", background: "#fafafa" };
const td = { borderBottom: "1px solid #eee", padding: "8px" };
const formBox = { border: "1px solid #e5e5e5", borderRadius: 8, padding: 12, background: "#fff" };
const grid2 = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 };