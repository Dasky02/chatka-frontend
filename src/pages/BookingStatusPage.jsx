import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getPublicBooking, choosePaymentMethod } from "../api/booking";

// IBAN a jméno příjemce pro QR – nastavitelné přes Vite env (fallback na demo hodnoty)
const IBAN = import.meta.env.VITE_IBAN || "CZ5855000000001234567899";
const PAYEE_NAME = import.meta.env.VITE_PAYEE_NAME || "Tiny House";
const QR_SIZE = 220;

async function awaitErrorMessage(e) {
    try {
        // fetch Response?
        if (e?.response && typeof e.response.json === "function") {
            const j = await e.response.json();
            return j?.message || JSON.stringify(j);
        }
        if (e instanceof Response) {
            const text = await e.text();
            try {
                const j = JSON.parse(text);
                return j?.message || text;
            } catch {
                return text;
            }
        }
        return e?.message || String(e);
    } catch {
        return e?.message || String(e);
    }
}

export default function BookingStatusPage() {
    const { publicUid } = useParams();
    const [bk, setBk] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [showQr, setShowQr] = useState(false);
    const [qrSrc, setQrSrc] = useState("");
    const total = useMemo(() => bk?.amountTotalCzk ?? 0, [bk]);
    const paid  = useMemo(() => bk?.amountPaidCzk ?? 0, [bk]);
    const stillOwed = useMemo(() => total > paid, [total, paid]);
    const amountLeft = useMemo(() => Math.max(0, (bk?.amountTotalCzk ?? 0) - (bk?.amountPaidCzk ?? 0)), [bk]);
    const isPaid = useMemo(() => (bk?.paymentStatus === 'PAID'), [bk]);
    const statusStr = useMemo(() => (bk?.status || "").toString().toUpperCase(), [bk]);
    const payStr = useMemo(() => (bk?.paymentStatus || "").toString().toUpperCase(), [bk]);
    const isCanceled = useMemo(() => statusStr === "CANCELED" || statusStr === "CANCELLED", [statusStr]);
    const isPending  = useMemo(() => statusStr === "PENDING", [statusStr]);
    const isApproved = useMemo(() => statusStr === "APPROVED", [statusStr]);
    const isConfirmed = useMemo(() => statusStr === "CONFIRMED", [statusStr]);

    async function refresh() {
        setErr("");
        setLoading(true);
        try {
            const data = await getPublicBooking(publicUid);
            setBk(data);
        } catch (e) {
            setErr(String(e));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { refresh(); }, [publicUid]);

    // Pollujeme jen při čekání na schválení (PENDING). Po schválení už neobnovujeme automaticky.
    useEffect(() => {
        if (!bk) return;
        const status = (bk.status || "").toString().toUpperCase();
        const pay    = (bk.paymentStatus || "").toString().toUpperCase();
        const shouldPoll = status === "PENDING" && pay === "UNPAID";
        if (!shouldPoll) return;
        const id = setInterval(refresh, 10000);
        return () => clearInterval(id);
    }, [bk]);

    // Po návratu do karty/okna načti jednorázově znovu (uživatelsky příjemné, ale neobtěžuje).
    useEffect(() => {
        const onVisible = () => {
            if (document.visibilityState === "visible") refresh();
        };
        document.addEventListener("visibilitychange", onVisible);
        return () => document.removeEventListener("visibilitychange", onVisible);
    }, []);

    const canPay = useMemo(() => {
        if (!bk) return false;
        const amountPositive = (bk.amountTotalCzk ?? 0) > 0;
        const status = (bk.status || "").toString().toUpperCase();
        const pay    = (bk.paymentStatus || "").toString().toUpperCase();
        const approvedOrConfirmed = status === "APPROVED" || status === "CONFIRMED";
        return amountPositive && approvedOrConfirmed && pay === "UNPAID";
    }, [bk]);

    async function setMethod(method) {
        try {
            setErr("");
            // při změně metody schovej případný QR
            setShowQr(false);
            setQrSrc("");
            await choosePaymentMethod(publicUid, method);
            await refresh();
        } catch (e) {
            const msg = await awaitErrorMessage(e);
            setErr(msg);
        }
    }

    if (loading) return <div>Načítám…</div>;
    if (err) return <div style={{color:"crimson"}}>Chyba: {err}</div>;
    if (!bk) return <div>Nenalezeno.</div>;

    const term =
        bk.start && bk.end
            ? `${bk.start} → ${bk.end} (Check-in 16:00 · Check-out 10:00)`
            : `— → — (Check-in 16:00 · Check-out 10:00)`;

    return (
        <div style={{ marginTop: 24 }}>
            <div style={{
                border: "1px solid #e5e5e5",
                borderRadius: 8,
                padding: 16,
                background: "#fff",
                maxWidth: 680,
                marginBottom: 12
            }}>
                <h3 style={{marginTop:0}}>Detail rezervace</h3>
                <div style={{display:"flex", justifyContent:"flex-end"}}>
                    <button onClick={refresh} aria-label="Aktualizovat stav">Aktualizovat</button>
                </div>
                <Row label="Stav" value={`${statusStr} · ${payStr}`} />
                <Row label="Termín" value={term} />
                <Row label="Celkem" value={fmtKc(total)} />
                <Row label="Zaplaceno" value={fmtKc(paid)} />
                <Row label="Doplatit" value={fmtKc(amountLeft)} />
            </div>
            {isPending && (
                <div style={{
                    border: "1px solid #e5e5e5",
                    borderRadius: 8,
                    padding: 16,
                    background: "#fff8e6",
                    maxWidth: 680,
                    marginBottom: 12
                }}>
                    <strong>⏳ Rezervace čeká na schválení.</strong>
                    <div>Jakmile rezervaci schválíme, zde se automaticky (jen v režimu čekající rezervace) zobrazí možnosti platby. Po schválení ti také přijde e‑mail s odkazem zpět na tuto stránku.</div>
                </div>
            )}
            {canPay && (
                <div style={{
                    border: "1px solid #e5e5e5",
                    borderRadius: 8,
                    padding: 16,
                    background: "#fff",
                    maxWidth: 680
                }}>
                    <h3 style={{ marginTop: 0 }}>Platba</h3>

                    {/* 1) Bankovní převod */}
                    <div style={{ marginBottom: 12 }}>
                        <strong>Bankovní převod</strong>
                        <p style={{ margin: "6px 0 10px" }}>
                            Uhraďte <strong>{fmtKc(amountLeft)}</strong> na účet <strong>{IBAN}</strong>,
                            VS: <strong>{bk.publicUid?.slice(0, 8)}</strong>. Po připsání částky označíme jako zaplaceno.
                        </p>

                        {/* QR zobraz až po kliknutí – šetříme volání externí služby a nenačítáme nic zbytečně */}
                        <div style={{ margin:"8px 0 12px" }}>
                            {!showQr ? (
                                <button type="button" onClick={() => {
                                    const vs = bk.publicUid?.slice(0, 8) || "";
                                    const spd = buildSpdPayload({
                                        iban: IBAN,
                                        amountKc: amountLeft,
                                        vs,
                                        message: `Rezervace ${vs}`,
                                        payee: PAYEE_NAME
                                    });
                                    const primary = qrImgFromSpd(spd, QR_SIZE);
                                    setQrSrc(primary);
                                    setShowQr(true);
                                }}>
                                    Zobrazit QR platbu
                                </button>
                            ) : (
                                <div style={{display:"flex", alignItems:"center", gap:16}}>
                                    <img
                                        src={qrSrc}
                                        alt="QR platba"
                                        width={QR_SIZE}
                                        height={QR_SIZE}
                                        style={{border:"1px solid #eee", borderRadius:6}}
                                        onError={(e) => {
                                            // Fallback na Google Charts, pokud api.qrserver.com neodpoví / je blokováno
                                            const vs = bk.publicUid?.slice(0, 8) || "";
                                            const spd = buildSpdPayload({
                                                iban: IBAN,
                                                amountKc: amountLeft,
                                                vs,
                                                message: `Rezervace ${vs}`,
                                                payee: PAYEE_NAME
                                            });
                                            e.currentTarget.src = googleQrFromSpd(spd, QR_SIZE);
                                        }}
                                    />
                                    <div style={{fontSize:14, lineHeight:1.5, opacity:.85}}>
                                        <div><strong>QR platba</strong> – naskenujte ve své bankovní aplikaci.</div>
                                        <div><small>IBAN: {IBAN}</small></div>
                                        <div><small>VS: {bk.publicUid?.slice(0, 8) || ""}</small></div>
                                        <div><small>Částka: {fmtKc(amountLeft)}</small></div>
                                        <div style={{marginTop:6, display:"flex", gap:8, flexWrap:"wrap"}}>
                                            <a href={qrSrc} download={`qr-${bk.publicUid?.slice(0,8) || "vs"}.png`}>Stáhnout QR</a>
                                            <button type="button" onClick={() => {
                                                const vs = bk.publicUid?.slice(0,8) || "";
                                                navigator.clipboard?.writeText(vs).catch(()=>{});
                                            }}>Kopírovat VS</button>
                                            <button type="button" onClick={() => setShowQr(false)}>Skrýt QR</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={async () => {
                                await setMethod('BANK_TRANSFER');
                                alert('Zvolen bankovní převod. Údaje k platbě jsou výše.');
                            }}
                        >
                            Zvolit bankovní převod
                        </button>
                    </div>

                    {/* 2) Online karta (mock) */}
                    <div>
                        <strong>Online kartou</strong>
                        <p style={{ margin: "6px 0 10px" }}>
                            Okamžitá platba kartou. Budete přesměrován(a) na bránu (demo).
                        </p>
                        <button
                            onClick={async () => {
                                try {
                                    await setMethod('CARD');
                                    const res = await fetch(`/api/payments/mock/create?publicUid=${bk.publicUid}`, { method: 'POST' });
                                    if (res.ok) {
                                        const { redirectUrl } = await res.json();
                                        if (redirectUrl) {
                                            window.location.href = redirectUrl;
                                            return;
                                        }
                                    }
                                    await refresh();
                                } catch (e) {
                                    setErr((await awaitErrorMessage(e)) || 'Nepodařilo se vytvořit platbu.');
                                }
                            }}
                        >
                            Zaplatit kartou
                        </button>
                    </div>
                </div>
            )}

            {/* Po zaplacení / nebo když nic nedluží */}
            {(isPaid || !stillOwed) && (
                <div style={{
                    border: "1px solid #e5e5e5",
                    borderRadius: 8,
                    padding: 16,
                    background: "#f6fff6",
                    maxWidth: 680,
                    marginTop: 8
                }}>
                    <strong>✅ Platba vyřízena.</strong>
                    <div>Celkem: {fmtKc(total)} · Zaplaceno: {fmtKc(paid)}</div>
                </div>
            )}
        </div>
    );
}

function Row({label, value, mono}) {
    return (
        <div style={{display:"grid", gridTemplateColumns:"140px 1fr", gap:12, padding:"6px 0"}}>
            <div style={{opacity:.7}}>{label}</div>
            <div style={{fontFamily: mono ? "ui-monospace, Menlo, monospace" : "inherit"}}>{value}</div>
        </div>
    );
}

const fmt = (n) => new Intl.NumberFormat("cs-CZ").format(n);
const fmtKc = (n) => `${fmt(n)} Kč`;

function buildSpdPayload({ iban, amountKc, vs, message, payee }) {
    // SPD 1.0 – částka v desítkách s tečkou, měna CZK, X-VS pro variabilní symbol (české rozšíření)
    const am = (Math.max(0, Number(amountKc)) || 0).toFixed(2);
    const parts = [
        "SPD*1.0",
        `ACC:${iban}`,
        `AM:${am}`,
        "CC:CZK",
        message ? `MSG:${sanitizeSpd(message)}` : null,
        vs ? `X-VS:${sanitizeSpd(vs)}` : null,
        payee ? `RN:${sanitizeSpd(payee)}` : null
    ].filter(Boolean);
    return parts.join("*");
}
function sanitizeSpd(s) {
    // SPD dovoluje omezenou sadu znaků – vynecháme odřádkování a hvězdičky
    return String(s).replace(/[*\r\n]/g, " ").slice(0, 60);
}
// Použijeme veřejný QR server pro dev/test. Do produkce zvaž local QR renderer (např. qrcode).
function qrImgFromSpd(spd, size = QR_SIZE) {
    const data = encodeURIComponent(spd);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${data}`;
}
function googleQrFromSpd(spd, size = QR_SIZE) {
    const data = encodeURIComponent(spd);
    return `https://chart.googleapis.com/chart?chs=${size}x${size}&cht=qr&choe=UTF-8&chl=${data}`;
}