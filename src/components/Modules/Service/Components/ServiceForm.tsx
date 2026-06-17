// components/ServiceFormEnhanced.tsx
import { faCamera, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import { Colors } from "../../../constants/Colors";
import { useThemeContext } from "../../../context/ThemeContext";
import { useUserContext } from "../../../context/UserContext";
import useLanguage from "../../../hooks/useLanguage";
import { useLocationHook } from "../../../hooks/useLocationHook";
import { ServiceParams } from "../../../Models/Service/ServiceParams";
import {
  ServiceActivitiesTypeModel,
  ServiceCategoriesTypeModel,
  ServiceTypeModel,
} from "../../../Models/Service/ServiceTypeModel";
import serviceService from "../../../Services/Service/ServiceService";
import { MapSelector } from "../../Common/Components/MapSelector";

// Fix para iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

interface ServiceFormProps {
  onclose: () => void;
}

const ServiceForm: React.FC<ServiceFormProps> = ({ onclose }) => {
  // Estado principal del formulario
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    photo: "",
    keywords: [] as string[],
    type: "",
    category: "",
    activity: "",
    provider: "",
    legalIdentity: "",
    location: null as any,
    manager: {
      name: "",
      lastName: "",
      legalid: "",
      email: "",
      phone: "",
    },
  });

  const { userData } = useUserContext();
  const { theme } = useThemeContext();
  const { getLabel } = useLanguage();
  const { location } = useLocationHook();

  // Estados del UI
  const [currentKeyword, setCurrentKeyword] = useState<string>("");
  const [selectBusinessType, setSelectBusinessType] =
    useState<string>("emprendedor");
  const [ownService, setOwnService] = useState<boolean>(false);
  const [isHoveringImage, setIsHoveringImage] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [coordinates, setCoordinates] = useState<{
    lat: number | null;
    lng: number | null;
  }>({
    lat: null,
    lng: null,
  });

  const [ubication, setUbication] = useState<any>(null);

  const [aceptTerms, setAceptTerms] = useState<boolean>(false);

  const ImageRef = React.createRef<HTMLInputElement>();

  const [serviceTypes, setServiceTypes] = useState<ServiceTypeModel[]>([]);
  const [categories, setCategories] = useState<ServiceCategoriesTypeModel[]>(
    [],
  );
  const [activities, setActivities] = useState<ServiceActivitiesTypeModel[]>(
    [],
  );

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Estado para recorte de imagen
  const [aspectRatio, setAspectRatio] = useState<number>(0);
  const [imageToCrop, setImageToCrop] = useState<any>(null);

  const isProduct = formData.type === "product";
  const isBusiness = formData.type === "business";

  // Cargar datos iniciales
  useEffect(() => {
    loadServiceTypes();
  }, []);

  const RecenterMap = ({ lat, lng }: any) => {
    const map = useMap();

    useEffect(() => {
      map.setView([lat, lng]);
    }, [lat, lng, map]);

    return null;
  };

  // Cargar tipos de servicio
  const loadServiceTypes = async () => {
    try {
      const types = await serviceService.GetServiceTypes();
      setServiceTypes(types.data || []);
    } catch (error) {
      console.error("Error loading service types:", error);
    }
  };

  // Validación del formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "El título es requerido";
    if (!formData.description.trim())
      newErrors.description = "La descripción es requerida";
    if (formData.description.length < 50)
      newErrors.description =
        "La descripción debe tener al menos 50 caracteres";
    if (!formData.type) newErrors.type = "El tipo de servicio es requerido";
    if (!isProduct && !formData.category)
      newErrors.category = "La categoría es requerida";
    if (!isProduct && !isBusiness && !formData.activity)
      newErrors.activity = "La actividad es requerida";

    if (formData.type === "service" && ownService) {
      if (!formData.manager.name.trim())
        newErrors.name = "El nombre es requerido";
      if (!formData.manager.lastName.trim())
        newErrors.lastName = "El apellido es requerido";
      if (!formData.manager.legalid.trim())
        newErrors.legalid = "El número de identificación es requerido";
      if (!formData.manager.email.trim())
        newErrors.email = "El correo electrónico es requerido";
      if (!/\S+@\S+\.\S+/.test(formData.manager.email))
        newErrors.email = "Correo electrónico inválido";
      if (!formData.manager.phone.trim())
        newErrors.phone = "El número telefonico es requerido";
    }

    if (
      formData.type === "service" &&
      ownService &&
      selectBusinessType === "empresa"
    ) {
      if (!formData.legalIdentity.trim())
        newErrors.legalidBusiness = "El número de identificación es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejo de envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const model: ServiceParams = {
        idUser: userData?.user?.id,
        title: formData.title,
        description: formData.description,
        photo: formData.photo,
        keywords: formData.keywords,
        type: formData.type,
        category: formData.category,
        activity: formData.activity,
        provider:
          selectBusinessType === "emprendedor" ? "no-registered" : "registered",
        legalIdentity: formData.legalIdentity
          ? formData.legalIdentity
          : formData.manager.legalid,
        location: ubication,

        isServiceOwner: ownService,
        name: formData.manager.name,
        lastName: formData.manager.lastName,
        managerLegalIdentity: formData.manager.legalid,
        email: formData.manager.email,
        phone: formData.manager.phone,
      };

      await serviceService.Create(model);
      onclose();
    }
  };

  const onCancel = async () => {
    setFormData({
      title: "",
      description: "",
      photo: "",
      keywords: [] as string[],
      type: "",
      category: "",
      activity: "",
      provider: "",
      legalIdentity: "",
      location: null as any,
      manager: {
        name: "",
        lastName: "",
        legalid: "",
        email: "",
        phone: "",
      },
    });
    onclose();
  };

  // Manejo de palabras clave
  const handleAddKeywords = () => {
    if (currentKeyword && !formData.keywords.includes(currentKeyword)) {
      setFormData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, currentKeyword],
      }));
      setCurrentKeyword("");
    }
  };

  const handleRemoveKeywords = (keywordToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((keyword) => keyword !== keywordToRemove),
    }));
  };

  // Manejo de imágenes
  const handleImageUpload = (file: File) => {
    setAspectRatio(1);
    setImageToCrop(URL.createObjectURL(file));
  };

  // Componente para eventos del mapa
  const setLocation = (lat: number, lng: number) => {
    setCoordinates({ lat, lng });
    setUbication({
      latitude: lat,
      longitude: lng,
    });
  };

  // Estilos dinámicos
  const getRadioStyle = (isSelected: boolean) => ({
    display: "flex",
    alignItems: "center",
    padding: "10px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    backgroundColor: isSelected
      ? theme === "light"
        ? "#E3F2FD"
        : "#282b2eff"
      : "transparent",
    border: isSelected
      ? "1px solid #2196F3"
      : `1px solid ${
          theme === "light"
            ? Colors.light.colors.inputBorder
            : Colors.dark.colors.inputBorder
        }`,
    color:
      theme === "light"
        ? Colors.light.colors.inputColor
        : Colors.dark.colors.inputColor,
  });

  const inputStyle = (hasError = false) => ({
    width: "100%",
    padding: "10px",
    borderRadius: "4px",
    border: `1px solid ${
      hasError
        ? "#dc3545"
        : theme === "light"
          ? Colors.light.colors.inputBorder
          : Colors.dark.colors.inputBorder
    }`,
    backgroundColor:
      theme === "light"
        ? Colors.light.colors.inputBackground
        : Colors.dark.colors.inputBackground,
    color:
      theme === "light"
        ? Colors.light.colors.inputColor
        : Colors.dark.colors.inputColor,
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s",
  });

  // Renderizar paso actual
  const renderStep = () => {
    return renderStep1();
  };

  // Paso 1: Información básica
  const renderStep1 = () => (
    <>
      <div style={{ marginBottom: "30px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              width: "200px",
              height: "200px",
              border: `2px dashed ${
                theme === "light"
                  ? Colors.light.colors.border
                  : Colors.dark.colors.border
              }`,
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              backgroundColor:
                theme === "light"
                  ? Colors.light.colors.background
                  : Colors.dark.colors.background,
              transition: "all 0.3s ease",
              overflow: "hidden",
              position: "relative",
            }}
            onClick={() => {
              setAspectRatio(16 / 9);
              ImageRef.current?.click();
            }}
            onMouseEnter={() => formData.photo && setIsHoveringImage(true)}
            onMouseLeave={() => setIsHoveringImage(false)}
          >
            {formData.photo ? (
              <>
                <img
                  src={formData.photo}
                  alt="Preview"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "10px",
                  }}
                />
                {isHoveringImage && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "10px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData((prev) => ({ ...prev, photo: "" }));
                      }}
                      style={{
                        background: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "50px",
                        height: "50px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "24px",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div
                style={{
                  fontSize: "48px",
                  color: "#666",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <FontAwesomeIcon
                  icon={faCamera}
                  size="lg"
                  color={
                    theme === "light"
                      ? Colors.light.colors.primary
                      : Colors.dark.colors.primary
                  }
                />
                <span
                  style={{
                    fontSize: "14px",
                    color: "#666",
                    textAlign: "center",
                  }}
                >
                  {getLabel("agregar_imagen")}
                </span>
              </div>
            )}
          </div>
        </div>
        <input
          ref={ImageRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) =>
            e.target.files && handleImageUpload(e.target.files[0])
          }
        />

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
              color:
                theme === "light"
                  ? Colors.light.colors.text
                  : Colors.dark.colors.text,
            }}
          >
            {getLabel("titulo")} *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder={getLabel("titulo_ejemplo")}
            required
            style={inputStyle(!!errors.title)}
          />
          {errors.title && (
            <span style={{ color: "#dc3545", fontSize: "12px" }}>
              {errors.title}
            </span>
          )}
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
              color:
                theme === "light"
                  ? Colors.light.colors.text
                  : Colors.dark.colors.text,
            }}
          >
            {getLabel("descripcion")} *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder={getLabel("describe_tu_servicio")}
            rows={4}
            required
            style={inputStyle(!!errors.description)}
          />
          {errors.description && (
            <span style={{ color: "#dc3545", fontSize: "12px" }}>
              {errors.description}
            </span>
          )}
          <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
            {formData.description.length}/500
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
            alignItems: "start",
          }}
        >
          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              {getLabel("tipo")} *
            </label>
            <select
              value={formData.type}
              onChange={(e) => {
                const key = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  type: key,
                  category: "",
                  activity: "",
                }));
                const type = serviceTypes.find((t) => t.key === key);
                setCategories(type?.categories ?? []);
                setActivities([]);
              }}
              style={inputStyle(!!errors.type)}
              required
            >
              <option value="">{getLabel("selecciona_tipo")}</option>
              {serviceTypes.map((type) => (
                <option key={type.key} value={type.key}>
                  {getLabel(type.name as any)}
                </option>
              ))}
            </select>
            {errors.type && (
              <span style={{ color: "#dc3545", fontSize: "12px" }}>
                {errors.type}
              </span>
            )}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              {getLabel("categoria")} *
            </label>
            <select
              disabled={isProduct || categories.length === 0}
              value={formData.category}
              onChange={(e) => {
                const key = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  category: key,
                  activity: "",
                }));
                const category = categories.find((c) => c.key === key);
                setActivities(category?.activities ?? []);
              }}
              style={inputStyle(!!errors.category)}
            >
              {isProduct ? (
                <option>{getLabel("no_aplica")}</option>
              ) : (
                <option value="">{getLabel("selecciona_categoria")}</option>
              )}
              {categories?.map((c) => (
                <option key={c.key} value={c.key}>
                  {getLabel(c.name as any)}
                </option>
              ))}
            </select>
            {errors.category && (
              <span style={{ color: "#dc3545", fontSize: "12px" }}>
                {errors.category}
              </span>
            )}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              {getLabel("actividad")} *
            </label>
            <select
              disabled={
                isProduct ||
                isBusiness ||
                categories.length === 0 ||
                activities.length === 0
              }
              value={formData.activity}
              onChange={(e) => {
                const key = e.target.value;
                setFormData((prev) => ({
                  ...prev,
                  activity: key,
                }));
              }}
              style={inputStyle(!!errors.activity)}
            >
              {isProduct || isBusiness ? (
                <option>{getLabel("no_aplica")}</option>
              ) : (
                <option value="">{getLabel("selecciona_actividad")}</option>
              )}
              {activities?.map((a) => (
                <option key={a.key} value={a.key}>
                  {getLabel(a.name as any)}
                </option>
              ))}
            </select>
            {errors.activity && (
              <span style={{ color: "#dc3545", fontSize: "12px" }}>
                {errors.activity}
              </span>
            )}
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "12px",
              fontWeight: "500",
            }}
          >
            {getLabel("etiquetas")}
          </label>
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <input
              type="text"
              value={currentKeyword}
              onChange={(e) => setCurrentKeyword(e.target.value)}
              placeholder={getLabel("agregar_etiquetas")}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), handleAddKeywords())
              }
              style={{
                width: "100%",
                padding: "10px",
                borderRadius: "4px",
                border: `1px solid ${
                  theme === "light"
                    ? Colors.light.colors.inputBorder
                    : Colors.dark.colors.inputBorder
                }`,
                backgroundColor:
                  theme === "light"
                    ? Colors.light.colors.inputBackground
                    : Colors.dark.colors.inputBackground,
                color:
                  theme === "light"
                    ? Colors.light.colors.inputColor
                    : Colors.dark.colors.inputColor,
                fontSize: "14px",
                outline: "none",
                transition: "border-color 0.2s",
              }}
            />
            <button
              type="button"
              onClick={handleAddKeywords}
              style={{
                background: "#28a745",
                color: "white",
                border: "none",
                padding: "8px 15px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              {getLabel("agregar")}
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {formData.keywords.map((keyword) => (
              <span
                key={keyword}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  background: "#e9ecef",
                  padding: "5px 10px",
                  borderRadius: "20px",
                  fontSize: "12px",
                }}
              >
                {keyword}
                <button
                  type="button"
                  onClick={() => handleRemoveKeywords(keyword)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#6c757d",
                    fontSize: "14px",
                  }}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>

        <h5
          style={{
            marginBottom: "20px",
            color: Colors.detailAppColor,
            cursor: "pointer",
          }}
          onClick={() => setIsModalOpen(true)}
        >
          <FontAwesomeIcon icon={faMapMarkerAlt} />{" "}
          {getLabel("agregar_ubicacion")}
        </h5>

        <MapSelector
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onLocationSelect={({ lat, lng }: any) => {
            setLocation(lat, lng);
          }}
          initialLocation={location || coordinates}
        />

        <div style={{ marginBottom: "20px" }}>
          {coordinates.lat && coordinates.lng && (
            <div>
              <div
                style={{
                  height: "300px",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <MapContainer
                  center={[coordinates.lat, coordinates.lng]}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                  dragging={false}
                  scrollWheelZoom={false}
                  doubleClickZoom={false}
                  zoomControl={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                  <Marker
                    position={[coordinates.lat, coordinates.lng]}
                    interactive={false}
                    draggable={false}
                  />

                  <RecenterMap lat={coordinates.lat} lng={coordinates.lng} />
                </MapContainer>
              </div>
              <label
                style={{
                  display: "block",
                  marginBottom: "10px",
                  fontWeight: "500",
                  color: "red",
                  cursor: "pointer",
                }}
                onClick={() => setCoordinates({ lat: null, lng: null })}
              >
                Eliminar ubicacion
              </label>
            </div>
          )}
        </div>

        {formData.type === "service" && (
          <div style={{ padding: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "12px",
                fontWeight: "500",
                color:
                  theme === "light"
                    ? Colors.light.colors.text
                    : Colors.dark.colors.text,
              }}
            >
              {getLabel("eres_quien_brinda_servicio")}
            </label>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div
                style={getRadioStyle(!ownService)}
                onClick={() => setOwnService(false)}
              >
                <input
                  type="radio"
                  id="representante"
                  name="service_type"
                  checked={!ownService}
                  onChange={() => setOwnService(false)}
                  style={{
                    marginRight: "10px",
                    accentColor: "#2196F3",
                  }}
                />
                <label
                  htmlFor="representante"
                  style={{ cursor: "pointer", fontSize: "14px" }}
                >
                  {getLabel("no")}
                </label>
              </div>
              <div
                style={getRadioStyle(ownService)}
                onClick={() => setOwnService(true)}
              >
                <input
                  type="radio"
                  id="brindador"
                  name="service_type"
                  checked={ownService}
                  onChange={() => setOwnService(true)}
                  style={{
                    marginRight: "10px",
                    accentColor: "#2196F3",
                  }}
                />
                <label
                  htmlFor="brindador"
                  style={{ cursor: "pointer", fontSize: "14px" }}
                >
                  {getLabel("si")}
                </label>
              </div>
            </div>
          </div>
        )}

        {formData.type === "service" && ownService && (
          <div style={{ padding: "15px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "12px",
                fontWeight: "500",
                color:
                  theme === "light"
                    ? Colors.light.colors.text
                    : Colors.dark.colors.text,
              }}
            >
              {getLabel("eres_empresa")}
            </label>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div
                style={getRadioStyle(selectBusinessType === "emprendedor")}
                onClick={(e) => setSelectBusinessType("emprendedor")}
              >
                <input
                  type="radio"
                  id="emprendedor"
                  name="user_type"
                  value="emprendedor"
                  checked={selectBusinessType === "emprendedor"}
                  onChange={(e) => setSelectBusinessType(e.target.value)}
                  style={{
                    marginRight: "10px",
                    accentColor: "#2196F3",
                  }}
                />
                <label
                  htmlFor="emprendedor"
                  style={{ cursor: "pointer", fontSize: "14px" }}
                >
                  {getLabel("emprendedor")}
                </label>
              </div>
              <div
                style={getRadioStyle(selectBusinessType === "empresa")}
                onClick={(e) => setSelectBusinessType("empresa")}
              >
                <input
                  type="radio"
                  id="empresa"
                  name="user_type"
                  value="empresa"
                  checked={selectBusinessType === "empresa"}
                  onChange={(e) => setSelectBusinessType(e.target.value)}
                  style={{
                    marginRight: "10px",
                    accentColor: "#2196F3",
                  }}
                />
                <label
                  htmlFor="empresa"
                  style={{ cursor: "pointer", fontSize: "14px" }}
                >
                  {getLabel("empresa")}
                </label>
              </div>
            </div>
          </div>
        )}

        {formData.type === "service" &&
          selectBusinessType === "empresa" &&
          ownService && (
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                  color:
                    theme === "light"
                      ? Colors.light.colors.text
                      : Colors.dark.colors.text,
                }}
              >
                {getLabel("identificador_empresa")} *
              </label>
              <input
                type="text"
                value={formData.legalIdentity}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    legalIdentity: e.target.value,
                  }))
                }
                placeholder={getLabel("ejemplo_identificador_empresa")}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: `1px solid ${
                    errors.legalidBusiness
                      ? "red"
                      : theme === "light"
                        ? Colors.light.colors.inputBorder
                        : Colors.dark.colors.inputBorder
                  }`,
                  backgroundColor:
                    theme === "light"
                      ? Colors.light.colors.inputBackground
                      : Colors.dark.colors.inputBackground,
                  color:
                    theme === "light"
                      ? Colors.light.colors.inputColor
                      : Colors.dark.colors.inputColor,

                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = Colors.detailAppColor;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor =
                    theme === "light"
                      ? Colors.light.colors.inputBorder
                      : Colors.dark.colors.inputBorder;
                }}
              />
              {errors.legalidBusiness && (
                <span style={{ color: "#dc3545", fontSize: "12px" }}>
                  {errors.legalidBusiness}
                </span>
              )}
            </div>
          )}

        {formData.type === "service" && ownService && (
          <div
            style={{
              marginBottom: "30px",
              padding: "20px",
              border: `1px solid ${
                theme === "light"
                  ? Colors.light.colors.border
                  : Colors.dark.colors.border
              }`,
              borderRadius: "8px",
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: "20px",
                color:
                  theme === "light"
                    ? Colors.light.colors.text
                    : Colors.dark.colors.text,
                borderBottom: "2px solid #007bff",
                paddingBottom: "10px",
              }}
            >
              {getLabel("infomacion_representante")}
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "15px",
                alignItems: "start",
              }}
            >
              <div style={{ marginBottom: "15px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "bold",
                    color:
                      theme === "light"
                        ? Colors.light.colors.text
                        : Colors.dark.colors.text,
                  }}
                >
                  {getLabel("nombre")} *
                </label>
                <input
                  type="text"
                  value={formData.manager.name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      manager: {
                        ...prev.manager,
                        name: e.target.value,
                      },
                    }))
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "4px",
                    border: `1px solid ${
                      errors.name
                        ? "red"
                        : theme === "light"
                          ? Colors.light.colors.inputBorder
                          : Colors.dark.colors.inputBorder
                    }`,
                    backgroundColor:
                      theme === "light"
                        ? Colors.light.colors.inputBackground
                        : Colors.dark.colors.inputBackground,
                    color:
                      theme === "light"
                        ? Colors.light.colors.inputColor
                        : Colors.dark.colors.inputColor,

                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = Colors.detailAppColor;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor =
                      theme === "light"
                        ? Colors.light.colors.inputBorder
                        : Colors.dark.colors.inputBorder;
                  }}
                />
                {errors.name && (
                  <span style={{ color: "#dc3545", fontSize: "12px" }}>
                    {errors.name}
                  </span>
                )}
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "bold",
                    color:
                      theme === "light"
                        ? Colors.light.colors.text
                        : Colors.dark.colors.text,
                  }}
                >
                  {getLabel("apellido")}
                </label>
                <input
                  type="text"
                  value={formData.manager.lastName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      manager: {
                        ...prev.manager,
                        lastName: e.target.value,
                      },
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "4px",
                    border: `1px solid ${
                      errors.lastName
                        ? "red"
                        : theme === "light"
                          ? Colors.light.colors.inputBorder
                          : Colors.dark.colors.inputBorder
                    }`,
                    backgroundColor:
                      theme === "light"
                        ? Colors.light.colors.inputBackground
                        : Colors.dark.colors.inputBackground,
                    color:
                      theme === "light"
                        ? Colors.light.colors.inputColor
                        : Colors.dark.colors.inputColor,

                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = Colors.detailAppColor;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor =
                      theme === "light"
                        ? Colors.light.colors.inputBorder
                        : Colors.dark.colors.inputBorder;
                  }}
                />
                {errors.lastName && (
                  <span style={{ color: "#dc3545", fontSize: "12px" }}>
                    {errors.lastName}
                  </span>
                )}
              </div>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                  color:
                    theme === "light"
                      ? Colors.light.colors.text
                      : Colors.dark.colors.text,
                }}
              >
                {getLabel("numero_identificacion")} *
              </label>
              <input
                type="text"
                value={formData.manager.legalid}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    manager: {
                      ...prev.manager,
                      legalid: e.target.value,
                    },
                  }))
                }
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: `1px solid ${
                    errors.legalid
                      ? "red"
                      : theme === "light"
                        ? Colors.light.colors.inputBorder
                        : Colors.dark.colors.inputBorder
                  }`,
                  backgroundColor:
                    theme === "light"
                      ? Colors.light.colors.inputBackground
                      : Colors.dark.colors.inputBackground,
                  color:
                    theme === "light"
                      ? Colors.light.colors.inputColor
                      : Colors.dark.colors.inputColor,

                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = Colors.detailAppColor;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor =
                    theme === "light"
                      ? Colors.light.colors.inputBorder
                      : Colors.dark.colors.inputBorder;
                }}
              />
              {errors.legalid && (
                <span style={{ color: "#dc3545", fontSize: "12px" }}>
                  {errors.legalid}
                </span>
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "15px",
                alignItems: "start",
              }}
            >
              <div style={{ marginBottom: "15px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "bold",
                    color:
                      theme === "light"
                        ? Colors.light.colors.text
                        : Colors.dark.colors.text,
                  }}
                >
                  {getLabel("correo_electronico")} *
                </label>
                <input
                  type="email"
                  value={formData.manager.email}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      manager: {
                        ...prev.manager,
                        email: e.target.value,
                      },
                    }))
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "4px",
                    border: `1px solid ${
                      errors.email
                        ? "red"
                        : theme === "light"
                          ? Colors.light.colors.inputBorder
                          : Colors.dark.colors.inputBorder
                    }`,
                    backgroundColor:
                      theme === "light"
                        ? Colors.light.colors.inputBackground
                        : Colors.dark.colors.inputBackground,
                    color:
                      theme === "light"
                        ? Colors.light.colors.inputColor
                        : Colors.dark.colors.inputColor,

                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = Colors.detailAppColor;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor =
                      theme === "light"
                        ? Colors.light.colors.inputBorder
                        : Colors.dark.colors.inputBorder;
                  }}
                />
                {errors.email && (
                  <span style={{ color: "#dc3545", fontSize: "12px" }}>
                    {errors.email}
                  </span>
                )}
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "bold",
                    color:
                      theme === "light"
                        ? Colors.light.colors.text
                        : Colors.dark.colors.text,
                  }}
                >
                  {getLabel("numero_telefono")}
                </label>
                <input
                  type="tel"
                  value={formData.manager.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      manager: {
                        ...prev.manager,
                        phone: e.target.value,
                      },
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "4px",
                    border: `1px solid ${
                      errors.phone
                        ? "red"
                        : theme === "light"
                          ? Colors.light.colors.inputBorder
                          : Colors.dark.colors.inputBorder
                    }`,
                    backgroundColor:
                      theme === "light"
                        ? Colors.light.colors.inputBackground
                        : Colors.dark.colors.inputBackground,
                    color:
                      theme === "light"
                        ? Colors.light.colors.inputColor
                        : Colors.dark.colors.inputColor,

                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = Colors.detailAppColor;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor =
                      theme === "light"
                        ? Colors.light.colors.inputBorder
                        : Colors.dark.colors.inputBorder;
                  }}
                />
                {errors.phone && (
                  <span style={{ color: "#dc3545", fontSize: "12px" }}>
                    {errors.phone}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="checkbox"
              checked={aceptTerms}
              required
              onChange={(e) => setAceptTerms(e.target.checked)}
              style={{
                accentColor: Colors.detailAppColor,
                width: 18,
                height: 18,
                cursor: "pointer",
              }}
            />
            Acepto los términos y condiciones de publicación
          </label>
        </div>
      </div>
    </>
  );

  return (
    <>
      <style>
        {`
          @keyframes modalFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes modalSlideUp {
            from { 
              opacity: 0;
              transform: translateY(20px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes spinnerSpin {
            to { transform: rotate(360deg); }
          }
          .formclass::-webkit-scrollbar {
            width: 6px;
          }
          .formclass::-webkit-scrollbar-track {
            background: ${
              theme === "light"
                ? Colors.light.colors.background
                : Colors.dark.colors.background
            };
            border-radius: 3px;
          }
          .formclass::-webkit-scrollbar-thumb {
            background: ${Colors.detailAppColor};
            border-radius: 3px;
          }
          .formclass::-webkit-scrollbar-thumb:hover {
            background: ${Colors.detailAppColor};
          }
          .step-indicator {
            display: flex;
            align-items: center;
            transition: all 0.3s ease;
          }
          .step-indicator.active {
            color: ${Colors.detailAppColor};
            font-weight: bold;
          }
          .step-connector {
            flex: 1;
            height: 2px;
            background: #ddd;
            margin: 0 10px;
          }
        `}
      </style>

      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.83)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          padding: "20px",
          animation: "modalFadeIn 0.2s ease-out",
        }}
      >
        <div
          style={{
            maxWidth: "900px",
            maxHeight: "95vh",
            height: "800px",
            position: "relative",
            width: "90%",
            background:
              theme === "light"
                ? Colors.light.colors.background
                : Colors.dark.colors.background,
            border: `1px solid ${
              theme === "light"
                ? Colors.light.colors.border
                : Colors.dark.colors.border
            }`,
            borderRadius: "12px",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            overflow: "hidden",
            animation: "modalSlideUp 0.2s ease-out",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "20px",
              borderBottom: `1px solid ${
                theme === "light"
                  ? Colors.light.colors.border
                  : Colors.dark.colors.border
              }`,
            }}
          >
            <div style={{ flex: 1 }}>
              <h2
                style={{
                  margin: 0,
                  color:
                    theme === "light"
                      ? Colors.light.colors.text
                      : Colors.dark.colors.text,
                }}
              >
                {getLabel("crear_servicio")}
              </h2>
              {/* <div style={{ marginTop: "10px" }}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  {[1, 2, 3, 4].map((step) => (
                    <React.Fragment key={step}>
                      <div
                        className={`step-indicator ${
                          currentStep >= step ? "active" : ""
                        }`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background:
                              currentStep >= step
                                ? Colors.detailAppColor
                                : "#ccc",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                          }}
                        >
                          {step}
                        </div>
                        <span style={{ fontSize: "12px" }}>
                          {step === 1 && "Básico"}
                          {step === 2 && "Precio"}
                          {step === 3 && "Detalles"}
                          {step === 4 && "Revisión"}
                        </span>
                      </div>
                      {step < 4 && (
                        <div
                          style={{
                            width: "30px",
                            height: "2px",
                            background:
                              currentStep > step
                                ? Colors.detailAppColor
                                : "#ddd",
                          }}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div> */}
            </div>
            <button
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color:
                  theme === "light"
                    ? Colors.light.colors.text
                    : Colors.dark.colors.text,
              }}
              onClick={onCancel}
            >
              ×
            </button>
          </div>

          <div
            className="formclass"
            style={{ height: "100%", maxHeight: "90vh", overflowY: "auto" }}
          >
            <div style={{ padding: "20px", marginBottom: "50px" }}>
              {renderStep()}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: "15px",
                  padding: "20px",
                  borderTop: `1px solid ${
                    theme === "light"
                      ? Colors.light.colors.border
                      : Colors.dark.colors.border
                  }`,
                  marginTop: "20px",
                }}
              >
                <div style={{ display: "flex", gap: "10px" }}>
                  <div>
                    <button
                      type="button"
                      onClick={onCancel}
                      style={{
                        background: "#6c757d",
                        color:
                          theme === "light"
                            ? Colors.light.colors.text
                            : Colors.dark.colors.text,
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "5px",
                        cursor: "pointer",
                        opacity: 1,
                        marginRight: "10px",
                      }}
                    >
                      {getLabel("cancelar")}
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={
                        loading === false && aceptTerms === false ? true : false
                      }
                      style={{
                        background: !aceptTerms
                          ? `${Colors.detailAppColor}30`
                          : Colors.detailAppColor,
                        color: !aceptTerms ? "#666" : "white",
                        border: "none",
                        padding: "10px 30px",
                        borderRadius: "5px",
                        cursor:
                          loading === false && aceptTerms === false
                            ? "not-allowed"
                            : "pointer",
                        opacity:
                          loading === false && aceptTerms === false ? 0.7 : 1,
                      }}
                    >
                      {loading ? (
                        <>
                          <div
                            style={{
                              display: "inline-block",
                              width: "16px",
                              height: "16px",
                              border: "2px solid #fff",
                              borderTopColor: "transparent",
                              borderRadius: "50%",
                              animation: "spinnerSpin 1s linear infinite",
                              marginRight: "8px",
                            }}
                          />
                          Publicando...
                        </>
                      ) : (
                        "Publicar Servicio"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServiceForm;
