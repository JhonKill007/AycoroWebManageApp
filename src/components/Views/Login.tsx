import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Icon from "../assets/icon.png";
import { useUserContext } from "../context/UserContext";
import authService from "../Services/Auth/AuthService";

// ─── Emails "en la BD" del proyecto ────────────────────────────────────
// En producción esto se verifica contra tu backend después del token de aycoro.
const REGISTERED_ADMINS = [
  "admin@aycoro.app",
  "carlos@aycoro.app",
  "lucia@aycoro.app",
  "ana@aycoro.app",
];

// ─── Simula la respuesta de aycoro OAuth ──────────────────────────────
function mockaycoroLogin(): Promise<{
  email: string;
  name: string;
  picture: string;
}> {
  // Simula red + respuesta de aycoro
  return new Promise((resolve) => {
    setTimeout(() => {
      // Para probar el estado "no registrado", cambia a cualquier otro email:
      resolve({
        email: "intruso@gmail.com",
        name: "Usuario aycoro",
        picture: "",
      });
      // Para probar un login exitoso, usa:
      // resolve({ email: "admin@aycoro.app", name: "Admin Principal", picture: "" });
    }, 1800);
  });
}

// ─── Estados ──────────────────────────────────────────────────────────
type State = "idle" | "loading" | "not_registered" | "success";

// ─── Partículas de fondo ───────────────────────────────────────────────
const DOTS = Array.from({ length: 28 }, (_, i) => ({
  x: (i * 37 + 11) % 100,
  y: (i * 53 + 7) % 100,
  s: 1 + (i % 3),
  o: 0.06 + (i % 4) * 0.04,
  d: 3 + (i % 6),
}));

export default function Login() {
  const [searchParams] = useSearchParams();

  const code = searchParams.get("code");
  const responseState = searchParams.get("state");

  const navigate = useNavigate();
  const { saveUser, setToken } = useUserContext();
  const [state, setState] = useState<State>("idle");
  const [account, setAccount] = useState<{
    email: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (code && responseState) {
      handleAuth(code);
    }
  }, []);

  const handleAuth = async (code: string) => {
    if (state === "loading") return;
    setState("loading");
    setAccount(null);

    try {
      const result = await authService.Authenticate(code);
      console.log("log result:", result);

      if (result.data.verify) {
        setToken(
          result.data.accessToken,
          result.data.refreshToken,
          result.data.aycoroAuthToken,
        );
        setState("success");
        navigate("/");
      } else {
        setState("not_registered");
      }
    } catch {
      setState("idle");
    }
  };

  const handleAycoroLogin = async () => {
    if (state === "loading") return;
    setState("loading");
    setAccount(null);

    const url = `https://auth.aycoro.com?client_id=mi_app_web&redirect_uri=https://manage.aycoro.com/login&response_type=code&state=${crypto.randomUUID()}`;

    window.location.href = url;

    // try {

    // } catch {
    //   setState("idle");
    // }
  };

  const reset = () => {
    setState("idle");
    setAccount(null);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.aycoroapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #050508; }

        .login-root {
          min-height: 100vh;
          background: #050508;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* ── Grid de fondo ── */
        .bg-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(107,115,240,0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(107,115,240,0.055) 1px, transparent 1px);
          background-size: 52px 52px;
          mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 30%, transparent 100%);
        }

        /* ── Glow central ── */
        .bg-glow {
          position: absolute;
          width: 700px; height: 700px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(107,115,240,0.13) 0%, transparent 70%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          animation: glow-pulse 6s ease-in-out infinite;
        }

        /* ── Orbes decorativos ── */
        .orb {
          position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none;
        }
        .orb-1 { width:360px; height:360px; background:rgba(107,115,240,0.12); top:-80px; left:-80px; }
        .orb-2 { width:300px; height:300px; background:rgba(167,139,250,0.08); bottom:-60px; right:-40px; }
        .orb-3 { width:200px; height:200px; background:rgba(52,211,153,0.06); bottom:20%; left:10%; }

        /* ── Card ── */
        .login-card {
          position: relative; z-index: 10;
          width: 100%; max-width: 420px;
          background: rgba(255,255,255,0.028);
          border: 1.5px solid rgba(255,255,255,0.08);
          border-radius: 28px;
          padding: 44px 44px 40px;
          backdrop-filter: blur(28px);
          box-shadow:
            0 0 0 1px rgba(107,115,240,0.08),
            0 32px 80px rgba(0,0,0,0.55),
            inset 0 1px 0 rgba(255,255,255,0.06);
          animation: card-in 0.55s cubic-bezier(0.22,1,0.36,1);
        }

        /* ── Botón Aycoro ── */
        .btn-aycoro {
          width: 100%; padding: 14px 20px;
          border-radius: 16px;
          border: 1.5px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: #fff;
          font-size: 14px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 12px;
          transition: all 0.2s;
          position: relative; overflow: hidden;
        }
        .btn-aycoro::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(107,115,240,0.15), rgba(167,139,250,0.1));
          opacity: 0;
          transition: opacity 0.2s;
        }
        .btn-aycoro:hover::before { opacity: 1; }
        .btn-aycoro:hover {
          border-color: rgba(107,115,240,0.45);
          box-shadow: 0 0 0 4px rgba(107,115,240,0.1);
          transform: translateY(-1px);
        }
        .btn-aycoro:active { transform: translateY(0); }
        .btn-aycoro:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        /* ── Botón retry ── */
        .btn-retry {
          width: 100%; padding: 12px;
          border-radius: 14px;
          border: 1.5px solid rgba(248,113,113,0.25);
          background: rgba(248,113,113,0.08);
          color: #f87171;
          font-size: 12px; font-weight: 700;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-retry:hover {
          background: rgba(248,113,113,0.14);
          border-color: rgba(248,113,113,0.4);
          transform: translateY(-1px);
        }

        /* ── Divider ── */
        .divider {
          display: flex; align-items: center; gap: 12px; margin: 24px 0;
        }
        .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        .divider-text { font-size: 11px; color: rgba(255,255,255,0.25); font-weight: 600; letter-spacing: 0.08em; }

        /* ── Spinner ── */
        .spinner {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2.5px solid rgba(255,255,255,0.15);
          border-top-color: #6b73f0;
          animation: spin 0.75s linear infinite;
          flex-shrink: 0;
        }

        /* ── Pulse dot ── */
        .pulse-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: #34d399;
          animation: pulse-dot 1.5s ease-in-out infinite;
        }

        @keyframes glow-pulse {
          0%, 100% { opacity: 1; transform: translate(-50%,-50%) scale(1); }
          50%       { opacity: 0.7; transform: translate(-50%,-50%) scale(1.08); }
        }
        @keyframes card-in {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse-dot {
          0%, 100% { box-shadow: 0 0 0 0 rgba(52,211,153,0.5); }
          50%       { box-shadow: 0 0 0 8px rgba(52,211,153,0);  }
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%     { transform: translateX(-6px); }
          40%     { transform: translateX(6px); }
          60%     { transform: translateX(-4px); }
          80%     { transform: translateX(4px); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        .shake { animation: shake 0.4s ease; }
        .fade-in { animation: fade-in 0.35s ease; }
      `}</style>

      <div className="login-root">
        {/* Fondo */}
        <div className="bg-grid" />
        <div className="bg-glow" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* Puntos flotantes */}
        {DOTS.map((d, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: d.s * 2,
              height: d.s * 2,
              borderRadius: "50%",
              background: `rgba(107,115,240,${d.o})`,
              pointerEvents: "none",
            }}
          />
        ))}

        {/* Card */}
        <div
          className="login-card"
          style={{
            animation:
              state === "not_registered"
                ? "shake 0.4s ease"
                : "card-in 0.55s cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: 36,
            }}
          >
            <div style={{ position: "relative", marginBottom: 16 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  background: "rgba(107,115,240,0.12)",
                  border: "1.5px solid rgba(107,115,240,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 32px rgba(107,115,240,0.2)",
                }}
              >
                <img
                  src={Icon}
                  alt="Aycoro"
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    objectFit: "cover",
                  }}
                />
              </div>
              {/* Corner accents */}
              <div
                style={{
                  position: "absolute",
                  top: -4,
                  left: -4,
                  width: 10,
                  height: 10,
                  borderTop: "2px solid rgba(107,115,240,0.5)",
                  borderLeft: "2px solid rgba(107,115,240,0.5)",
                  borderRadius: "2px 0 0 0",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  width: 10,
                  height: 10,
                  borderTop: "2px solid rgba(107,115,240,0.5)",
                  borderRight: "2px solid rgba(107,115,240,0.5)",
                  borderRadius: "0 2px 0 0",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: -4,
                  left: -4,
                  width: 10,
                  height: 10,
                  borderBottom: "2px solid rgba(107,115,240,0.5)",
                  borderLeft: "2px solid rgba(107,115,240,0.5)",
                  borderRadius: "0 0 0 2px",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: -4,
                  right: -4,
                  width: 10,
                  height: 10,
                  borderBottom: "2px solid rgba(107,115,240,0.5)",
                  borderRight: "2px solid rgba(107,115,240,0.5)",
                  borderRadius: "0 0 2px 0",
                }}
              />
            </div>

            <div
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-0.03em",
                marginBottom: 4,
              }}
            >
              Aycoro
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontFamily: "'DM Mono', monospace",
              }}
            >
              ADDash
            </div>
          </div>

          {/* Título dinámico */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            {state === "not_registered" ? (
              <div className="fade-in">
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#f87171",
                    marginBottom: 6,
                  }}
                >
                  ⛔ Usuario no registrado
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.4)",
                    lineHeight: 1.6,
                  }}
                >
                  Tu cuenta no tiene acceso al panel.
                </div>
              </div>
            ) : state === "success" ? (
              <div className="fade-in">
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#34d399",
                    marginBottom: 6,
                  }}
                >
                  ✅ Acceso concedido
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                  Redirigiendo al panel…
                </div>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#fff",
                    marginBottom: 6,
                  }}
                >
                  Iniciar sesión
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.35)",
                    lineHeight: 1.6,
                  }}
                >
                  Solo los usuarios registrados
                  <br />
                  pueden acceder a este panel.
                </div>
              </div>
            )}
          </div>

          {/* Contenido según estado */}
          {state === "not_registered" && (
            <div className="fade-in" style={{ marginBottom: 18 }}>
              {/* Info box */}
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: 14,
                  background: "rgba(248,113,113,0.07)",
                  border: "1.5px solid rgba(248,113,113,0.18)",
                  marginBottom: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "rgba(248,113,113,0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    🔒
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#f87171",
                        marginBottom: 2,
                      }}
                    >
                      Acceso denegado
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.35)",
                        lineHeight: 1.5,
                      }}
                    >
                      Contacta a un Super Admin para solicitar acceso al panel.
                    </div>
                  </div>
                </div>
              </div>

              <button className="btn-retry" onClick={reset}>
                ← Intentar con otra cuenta
              </button>
            </div>
          )}

          {state === "success" && (
            <div
              className="fade-in"
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 20px",
                  borderRadius: 14,
                  background: "rgba(52,211,153,0.08)",
                  border: "1.5px solid rgba(52,211,153,0.2)",
                }}
              >
                <div className="pulse-dot" />
                <span
                  style={{ fontSize: 12, fontWeight: 700, color: "#34d399" }}
                >
                  Bienvenido, {account?.name}
                </span>
              </div>
            </div>
          )}

          {(state === "idle" || state === "loading") && (
            <>
              <div className="divider">
                <div className="divider-line" />
                <span className="divider-text">CONTINÚA CON</span>
                <div className="divider-line" />
              </div>

              {/* Botón aycoro */}
              <button
                className="btn-aycoro"
                onClick={handleAycoroLogin}
                disabled={state === "loading"}
              >
                {state === "loading" ? (
                  <>
                    <div className="spinner" />
                    <span style={{ color: "rgba(255,255,255,0.6)" }}>
                      Verificando cuenta…
                    </span>
                  </>
                ) : (
                  <>
                    {/* Icono aycoro real */}
                    <img
                      src={
                        "https://www.aycoro.com/static/media/icon.cfd26cb5281c0823d4b6.png"
                      }
                      alt="Aycoro"
                      style={{
                        width: 20,
                        height: 20,
                        // borderRadius: 12,
                        objectFit: "cover",
                      }}
                    />
                    <span>Continuar con Aycoro</span>
                  </>
                )}
              </button>
            </>
          )}

          {/* Footer */}
          <div
            style={{
              marginTop: 32,
              paddingTop: 20,
              borderTop: "1px solid rgba(255,255,255,0.055)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.18)",
                fontFamily: "'DM Mono',monospace",
                letterSpacing: "0.05em",
              }}
            >
              ACCESO RESTRINGIDO · SOLO ADMINISTRADORES
            </div>
            <div
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.12)",
                marginTop: 6,
              }}
            >
              Aycoro © {new Date().getFullYear()} · Panel v2.0
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
