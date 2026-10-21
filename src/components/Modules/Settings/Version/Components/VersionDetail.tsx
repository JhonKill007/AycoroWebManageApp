import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { Colors } from "../../../../constants/Colors";
import { useToast } from "../../../../context/ToastContext";
import { useUploadFile } from "../../../../hooks/useUploadFile";
import versionService from "../../../../Services/Version/VersionService";
import { formatDate } from "../../Common/Utils";

const STATUS_LABEL: Record<number, string> = {
  0: "Pendiente",
  1: "Publicada",
};

const readVideoMeta = (file: File) =>
  new Promise<{ duration?: number; width?: number; height?: number }>(
    (resolve) => {
      const url = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        resolve({
          duration: Number.isFinite(video.duration) ? video.duration : undefined,
          width: video.videoWidth || undefined,
          height: video.videoHeight || undefined,
        });
        URL.revokeObjectURL(url);
      };
      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({});
      };
      video.src = url;
    },
  );

const captureVideoThumbnail = (file: File) =>
  new Promise<Blob | undefined>((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    const cleanup = () => URL.revokeObjectURL(url);
    video.onloadeddata = () => {
      const seekTo = Number.isFinite(video.duration)
        ? Math.min(1, Math.max(0.1, video.duration * 0.1))
        : 0.1;
      video.currentTime = seekTo;
    };
    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 720;
        canvas.height = video.videoHeight || 1280;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          cleanup();
          resolve(undefined);
          return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            cleanup();
            resolve(blob ?? undefined);
          },
          "image/jpeg",
          0.82,
        );
      } catch {
        cleanup();
        resolve(undefined);
      }
    };
    video.onerror = () => {
      cleanup();
      resolve(undefined);
    };
    video.src = url;
  });

const VersionDetail = ({
  id,
  c,
  onBack,
}: {
  id: string;
  c: any;
  onBack: () => void;
}) => {
  const { showToast } = useToast();
  const { uploadMedia } = useUploadFile();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [version, setVersion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const loadVersion = useCallback(async () => {
    const response = await versionService.getById(id);
    setVersion(response.data);
  }, [id]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    loadVersion()
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
  }, [loadVersion]);

  const handleAddStories = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (files.length === 0) return;

    setIsUploading(true);
    const uploaded: NonNullable<
      Parameters<typeof versionService.addStories>[1]
    > = [];

    try {
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        const isVideo = file.type.startsWith("video/");
        const isImage = file.type.startsWith("image/");
        if (!isVideo && !isImage) continue;

        setUploadProgress(`Subiendo ${index + 1}/${files.length}: ${file.name}`);

        const meta = isVideo ? await readVideoMeta(file) : {};
        if (isVideo && meta.duration && meta.duration > 60) {
          showToast({
            type: "warning",
            title: "Video omitido",
            description: `"${file.name}" supera 60s.`,
            duration: 4000,
          });
          continue;
        }

        const media = await uploadMedia(file, isVideo ? "video" : "image", {
          duration: meta.duration,
          width: meta.width,
          height: meta.height,
        });

        let thumbnail:
          | {
              url?: string;
              key?: string;
              mimeType?: string;
              size?: number;
              width?: number;
              height?: number;
            }
          | undefined;
        if (isVideo) {
          const thumbBlob = await captureVideoThumbnail(file);
          if (thumbBlob) {
            thumbnail = await uploadMedia(thumbBlob, "image", {
              width: meta.width,
              height: meta.height,
            });
          }
        }

        uploaded.push({
          Url: media.url || "",
          Key: media.key || "",
          Type: media.type || (isVideo ? "video" : "image"),
          MimeType: media.mimeType || file.type,
          Size: media.size || file.size,
          Duration: media.duration,
          Width: media.width,
          Height: media.height,
          ThumbnailUrl: thumbnail?.url,
          ThumbnailKey: thumbnail?.key,
          ThumbnailMimeType: thumbnail?.mimeType,
          ThumbnailSize: thumbnail?.size,
          ThumbnailWidth: thumbnail?.width,
          ThumbnailHeight: thumbnail?.height,
        });
      }

      if (uploaded.length === 0) {
        showToast({
          type: "error",
          title: "Sin archivos",
          description: "No se pudo preparar ninguna historia para agregar.",
          duration: 4000,
        });
        return;
      }

      const response = await versionService.addStories(id, uploaded);
      await loadVersion();
      const live = Boolean(response?.data?.live);
      showToast({
        type: "success",
        title: live ? "Historias publicadas" : "Historias agregadas",
        description: live
          ? "Los usuarios de esta versión que aún no las hayan visto las verán al entrar."
          : "Quedarán listas. Se mostrarán a los usuarios cuando publiques la versión.",
        duration: 4000,
      });
    } catch (err) {
      console.error("Error adding version stories:", err);
      showToast({
        type: "error",
        title: "Error",
        description: "No se pudieron agregar las historias.",
        duration: 4000,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress("");
    }
  };

  const media = Array.isArray(version?.ReleaseMedia) ? version.ReleaseMedia : [];
  const histories = Array.isArray(version?.histories) ? version.histories : [];
  const compatible = Array.isArray(version?.compatibleVersions)
    ? version.compatibleVersions
    : [];
  const published = Number(version?.Status) === 1;

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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 8,
                flexWrap: "wrap",
              }}
            >
              <div style={{ fontWeight: 800, color: c.text }}>Historias de la versión</div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                style={{ display: "none" }}
                onChange={handleAddStories}
              />
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: "8px 14px",
                  borderRadius: 12,
                  border: "none",
                  background: Colors.detailAppColor,
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: isUploading ? "wait" : "pointer",
                  opacity: isUploading ? 0.7 : 1,
                }}
              >
                {isUploading ? uploadProgress || "Subiendo..." : "+ Agregar historias"}
              </button>
            </div>
            <div style={{ color: c.textMuted, fontSize: 12, marginBottom: 12, lineHeight: 1.45 }}>
              {published
                ? "Los usuarios de esta versión que aún no las hayan visto las verán al entrar a la app."
                : "Quedan guardadas aquí. Cuando publiques la versión, aparecerán a quienes aún no las hayan visto."}
            </div>
            {histories.length === 0 && media.length === 0 ? (
              <div style={{ color: c.textMuted, fontSize: 13 }}>Esta versión no tiene historias.</div>
            ) : published && histories.length > 0 ? (
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
                        {item.missing ? "Historia no encontrada" : item.text || "Historia de actualización"}
                      </div>
                      <div style={{ color: c.textMuted, fontSize: 12 }}>
                        {item.createDate ? formatDate(String(item.createDate)) : item.id}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {media.map((item: any, index: number) => (
                  <div key={`${item.Key || item.Url || index}`} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    {item.ThumbnailUrl || item.Url ? (
                      <img src={item.ThumbnailUrl || item.Url} alt="" style={{ width: 54, height: 72, objectFit: "cover", borderRadius: 8 }} />
                    ) : (
                      <div style={{ width: 54, height: 72, borderRadius: 8, background: c.accentSoft }} />
                    )}
                    <div style={{ color: c.text, fontSize: 13 }}>
                      Historia {index + 1}
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
