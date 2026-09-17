import { useCallback, useEffect, useState } from "react";
import { Colors } from "../constants/Colors";
import { useThemeContext } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import auditService from "../Services/Audit/AuditService";

const Audit = () => {
  const { theme } = useThemeContext();
  const { showToast } = useToast();
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const c = colors.colors;
  const [items, setItems] = useState<any[]>([]);
  const [resources, setResources] = useState<string[]>([]);
  const [resource, setResource] = useState("todos");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await auditService.getLogs(page, search, resource);
      const payload = response.data || response;
      setItems(payload.data || []);
      setResources(payload.resources || []);
      setTotalPages(payload.pagination?.totalPages || 1);
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudo cargar la auditoría.",
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, resource, search, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <main style={{ flex: 1, overflow: "auto", padding: 26, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div
        className="responsive-page-banner"
        style={{
          background:
            theme === "dark"
              ? "linear-gradient(135deg, #1a1a30, #0f0f22)"
              : "linear-gradient(135deg, #ededff, #f5f0ff)",
          border: `1.5px solid ${c.accentMedium}`,
          borderRadius: 20,
          padding: "22px 28px",
          marginBottom: 22,
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 800, color: c.text }}>📝 Auditoría de administradores</div>
        <div style={{ fontSize: 13, color: c.textMuted, marginTop: 4 }}>
          Acciones de managers en el panel: bans, eliminaciones, cambios de estado y más.
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
          placeholder="Buscar email, acción, id..."
          style={{
            background: c.inputBackground,
            border: `1.5px solid ${c.inputBorder}`,
            borderRadius: 10,
            padding: "8px 12px",
            color: c.text,
            minWidth: 260,
          }}
        />
        <select
          value={resource}
          onChange={(e) => {
            setPage(1);
            setResource(e.target.value);
          }}
          style={{
            background: c.inputBackground,
            border: `1.5px solid ${c.inputBorder}`,
            borderRadius: 10,
            padding: "8px 12px",
            color: c.text,
          }}
        >
          <option value="todos">Todos los recursos</option>
          {resources.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <div
        style={{
          background: c.card,
          border: `1.5px solid ${c.border}`,
          borderRadius: 18,
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div style={{ padding: 24, color: c.textMuted }}>Cargando auditoría...</div>
        ) : items.length === 0 ? (
          <div style={{ padding: 24, color: c.textMuted }}>
            Aún no hay acciones registradas. Aparecerán al guardar cambios en el panel.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item._id}
              style={{
                padding: "14px 18px",
                borderBottom: `1px solid ${c.border}`,
                display: "grid",
                gridTemplateColumns: "180px 1fr 140px",
                gap: 12,
              }}
            >
              <div style={{ fontSize: 11, color: c.textMuted }}>
                {item.CreateDate ? new Date(item.CreateDate).toLocaleString("es-DO") : "—"}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{item.Action}</div>
                <div style={{ fontSize: 11, color: c.textMuted }}>
                  {item.ManagerEmail || item.ManagerId} · {item.Path}
                </div>
              </div>
              <div style={{ fontSize: 11, color: c.textMuted, textAlign: "right" }}>
                {item.StatusCode} · {item.Ip || "sin IP"}
              </div>
            </div>
          ))
        )}
      </div>
      <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
        <button
          disabled={page <= 1}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: `1.5px solid ${c.border}`,
            background: c.card,
            color: c.text,
            cursor: page <= 1 ? "not-allowed" : "pointer",
          }}
        >
          Anterior
        </button>
        <span style={{ alignSelf: "center", fontSize: 12, color: c.textMuted }}>
          Página {page} de {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((current) => current + 1)}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: `1.5px solid ${c.border}`,
            background: c.card,
            color: c.text,
            cursor: page >= totalPages ? "not-allowed" : "pointer",
          }}
        >
          Siguiente
        </button>
      </div>
    </main>
  );
};

export default Audit;
