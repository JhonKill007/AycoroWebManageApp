import { useEffect, useState } from "react";
import versionService from "../../../../Services/Version/VersionService";
import { formatDate } from "../../Common/Utils";

const STATUS_LABEL: Record<number, string> = {
  0: "Pendiente",
  1: "Publicada",
};

const VersionDetail = ({
  id,
  c,
  onBack,
}: {
  id: string;
  c: any;
  onBack: () => void;
}) => {
  const [version, setVersion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    versionService
      .getById(id)
      .then((response) => {
        if (active) setVersion(response.data);
      })
      .catch(() => {
        if (!active) return;
        setVersion(null);
        setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const media = Array.isArray(version?.ReleaseMedia) ? version.ReleaseMedia : [];
  const histories = Array.isArray(version?.histories) ? version.histories : [];
  const compatible = Array.isArray(version?.compatibleVersions)
    ? version.compatibleVersions
    : [];

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 16,
          padding: "8px 14px",
          borderRadius: 12,
          border: `1px solid ${c.border}`,
          background: "transparent",
          color: c.text,
          fontWeight: 700,
          fontSize: 13,
          cursor: "pointer",
        }}
      >
        ← Volver
      </button>

      {loading && <div style={{ color: c.textMuted }}>Cargando versión...</div>}
      {error && <div style={{ color: c.textMuted }}>No se pudo cargar la versión.</div>}

      {!loading && !error && version && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: c.text, fontFamily: "monospace" }}>
              {version.Value}
            </div>
            <div style={{ marginTop: 6, color: c.textMuted, fontSize: 13 }}>
              {version.Type} · {STATUS_LABEL[Number(version.Status)] || "Sin estado"} · {version.Severity}
            </div>
            <div style={{ marginTop: 10, color: c.text, fontSize: 14, lineHeight: 1.5 }}>
              {version.Description || "Sin descripción"}
            </div>
            <div style={{ marginTop: 8, color: c.textMuted, fontSize: 12 }}>
              Creada {version.CreateDate ? formatDate(String(version.CreateDate)) : ""} por {version.CreateByName || "—"}
            </div>
            {version.Link ? (
              <a href={version.Link} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 8, color: c.accent, fontSize: 13, fontWeight: 700 }}>
                Abrir release
              </a>
            ) : null}
          </div>

          <section style={{ border: `1px solid ${c.border}`, borderRadius: 14, padding: 14 }}>
            <div style={{ fontWeight: 800, color: c.text, marginBottom: 8 }}>Versiones que dejó activas</div>
            {compatible.length === 0 ? (
              <div style={{ color: c.textMuted, fontSize: 13 }}>Esta versión no dejó otras versiones activas.</div>
            ) : (
              compatible.map((item: any) => (
                <div key={item.value} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderBottom: `1px solid ${c.border}`, color: c.text, fontSize: 13 }}>
                  <strong>{item.value}</strong>
                  <span style={{ color: c.textMuted }}>
                    {!item.found ? "No encontrada" : STATUS_LABEL[Number(item.status)] || "Sin estado"}
                  </span>
                </div>
              ))
            )}
          </section>

          <section style={{ border: `1px solid ${c.border}`, borderRadius: 14, padding: 14 }}>
            <div style={{ fontWeight: 800, color: c.text, marginBottom: 8 }}>Historias de la versión</div>
            {histories.length === 0 && media.length === 0 ? (
              <div style={{ color: c.textMuted, fontSize: 13 }}>Esta versión no tiene historias.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {histories.map((item: any) => (
                  <div key={item.id} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    {item.mediaUrl ? (
                      <img src={item.mediaUrl} alt="" style={{ width: 54, height: 72, objectFit: "cover", borderRadius: 8 }} />
                    ) : (
                      <div style={{ width: 54, height: 72, borderRadius: 8, background: c.accentSoft }} />
                    )}
                    <div>
                      <div style={{ color: c.text, fontWeight: 700, fontSize: 13 }}>
                        {item.missing ? "Historia no encontrada" : item.text || "Historia sin texto"}
                      </div>
                      <div style={{ color: c.textMuted, fontSize: 12 }}>
                        {item.createDate ? formatDate(String(item.createDate)) : item.id}
                      </div>
                    </div>
                  </div>
                ))}
                {media.map((item: any, index: number) => (
                  <div key={`${item.Key || item.Url || index}`} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    {item.ThumbnailUrl || item.Url ? (
                      <img src={item.ThumbnailUrl || item.Url} alt="" style={{ width: 54, height: 72, objectFit: "cover", borderRadius: 8 }} />
                    ) : (
                      <div style={{ width: 54, height: 72, borderRadius: 8, background: c.accentSoft }} />
                    )}
                    <div style={{ color: c.text, fontSize: 13 }}>
                      Medio de actualización {index + 1}
                      <div style={{ color: c.textMuted, fontSize: 12 }}>{item.Type || item.MimeType || ""}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default VersionDetail;
