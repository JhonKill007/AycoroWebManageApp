import { useNavigate } from "react-router-dom";

export default function Unauthorized() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#08080d", color: "white" }}>
      <div style={{ textAlign: "center", fontFamily: "sans-serif" }}>
        <div style={{ fontSize: 48, fontWeight: 800 }}>403</div>
        <h2>Acceso restringido</h2>
        <p style={{ opacity: 0.6, margin: "12px 0 20px" }}>Tu rol no tiene permiso para acceder a esta sección.</p>
        <button onClick={() => navigate("/")} style={{ padding: "10px 18px", cursor: "pointer" }}>Volver al panel</button>
      </div>
    </div>
  );
}
