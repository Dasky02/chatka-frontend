import { useState } from "react";
import SeasonsPage from "./admin/SeasonsPage";

export default function AdminPanel() {
    const [view, setView] = useState("calendar"); // 'calendar' | 'seasons'

    return (
        <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setView("calendar")}>Kalendář</button>
                <button onClick={() => setView("seasons")}>Ceník / Sezóny</button>
            </div>

            {view === "calendar" && (
                <div>{/* tady máš svůj stávající admin obsah (blokace/rezervace) */}</div>
            )}

            {view === "seasons" && <SeasonsPage propertyId={1} />}
        </div>
    );
}