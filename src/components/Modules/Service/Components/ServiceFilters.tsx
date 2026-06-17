import React, { useEffect, useState } from "react";
import { Colors } from "../../../constants/Colors";
import { useThemeContext } from "../../../context/ThemeContext";
import useLanguage from "../../../hooks/useLanguage";
import { ServiceModel } from "../../../Models/Service/ServiceModel";
import {
  ServiceActivitiesTypeModel,
  ServiceCategoriesTypeModel,
  ServiceTypeModel,
} from "../../../Models/Service/ServiceTypeModel";
import serviceService from "../../../Services/Service/ServiceService";

interface ServiceFiltersProps {
  searchValue: string;
  setSearchServices: (services: ServiceModel[]) => void;
}

const ServiceFilters: React.FC<ServiceFiltersProps> = ({ searchValue, setSearchServices }) => {
  const { theme } = useThemeContext();
  const { getLabel } = useLanguage();

  const [selectedType, setSelectedType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("");

  const [serviceTypes, setServiceTypes] = useState<ServiceTypeModel[]>([]);
  const [categories, setCategories] = useState<ServiceCategoriesTypeModel[]>(
    []
  );
  const [activities, setActivities] = useState<ServiceActivitiesTypeModel[]>(
    []
  );

  const isProduct = selectedType === "product";

  // ---------- Fetch inicial ----------
  useEffect(() => {
    (async () => {
      const types = await serviceService.GetServiceTypes();
      setServiceTypes(types.data || []);
    })();
  }, []);

  useEffect(() => {
    const searchService = async () => {
      // Filtro por búsqueda
      if (searchValue) {
        const search = await serviceService.Search(
          searchValue,
          1,
          {
            type:selectedType,
            category:selectedCategory,
            activity: selectedActivity,
            // minScore:,
          }
        );
        setSearchServices(search.data || []);
      }
    };

    searchService();
  }, [searchValue, selectedType, selectedCategory, selectedActivity]);

  // ---------- Helpers ----------
  const selectStyle = (disabled: boolean = false) => ({
    width: "100%",
    padding: "8px",
    borderRadius: "4px",
    fontSize: "14px",
    border: `1px solid ${
      disabled && isProduct
        ? "#c62d2dff"
        : theme === "light"
        ? Colors.light.colors.inputBorder
        : Colors.dark.colors.inputBorder
    }`,
    backgroundColor:
      theme === "light"
        ? Colors.light.colors.inputBackground
        : Colors.dark.colors.inputBackground,
    color: disabled
      ? isProduct
        ? "#c62d2dff"
        : "#999"
      : theme === "light"
      ? Colors.light.colors.inputColor
      : Colors.dark.colors.inputColor,
  });

  // const handleFilterChange = (key: keyof FilterOptions, value: any) => {
  //   onFiltersChange({ ...filters, [key]: value });
  // };

  // ---------- Render ----------
  return (
    <div
      style={{
        marginBottom: "20px",
        padding: "20px",
        backgroundColor:
          theme === "light"
            ? Colors.light.colors.background
            : Colors.dark.colors.background,
        borderRadius: "8px",
      }}
    >
      <h3
        style={{
          color:
            theme === "light"
              ? Colors.light.colors.text
              : Colors.dark.colors.text,
          marginTop: 0,
          marginBottom: "20px",
          fontSize: "18px",
          fontWeight: 600,
        }}
      >
        {getLabel("filtros")}
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          alignItems: "start",
        }}
      >
        {/* -------- TIPO -------- */}
        <div>
          <label
            style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}
          >
            {getLabel("tipo")}
          </label>

          <select
            value={selectedType}
            onChange={(e) => {
              const key = e.target.value;
              setSelectedType(key);

              const type = serviceTypes.find((t) => t.key === key);
              setCategories(type?.categories ?? []);
              setActivities([]);

              setSelectedCategory("");
              setSelectedActivity("");
            }}
            style={selectStyle()}
          >
            <option value="">{getLabel("todos_tipos")}</option>

            {serviceTypes.map((type) => (
              <option key={type.key} value={type.key}>
                {getLabel(type.name as any)}
              </option>
            ))}
          </select>
        </div>

        {/* -------- CATEGORÍA -------- */}
        <div>
          <label
            style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}
          >
            {getLabel("categoria")}
          </label>

          <select
            disabled={isProduct || categories.length === 0}
            value={selectedCategory}
            onChange={(e) => {
              const key = e.target.value;
              setSelectedCategory(key);

              const category = categories.find((c) => c.key === key);
              setActivities(category?.activities ?? []);
              setSelectedActivity("");
            }}
            style={selectStyle(isProduct || categories.length === 0)}
          >
            {isProduct ? (
              <option>{getLabel("no_aplica")}</option>
            ) : (
              <option value="">{getLabel("todas_categorias")}</option>
            )}

            {categories?.map((c) => (
              <option key={c.key} value={c.key}>
                {getLabel(c.name as any)}
              </option>
            ))}
          </select>
        </div>

        {/* -------- ACTIVIDAD -------- */}
        <div>
          <label
            style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}
          >
            {getLabel("actividad")}
          </label>

          <select
            disabled={
              isProduct || categories.length === 0 || activities.length === 0
            }
            value={selectedActivity}
            onChange={(e) => {
              const key = e.target.value;
              setSelectedActivity(key);
            }}
            style={selectStyle(
              isProduct || categories.length === 0 || activities.length === 0
            )}
          >
            {isProduct ? (
              <option>{getLabel("no_aplica")}</option>
            ) : (
              <option value="">{getLabel("todas_actividades")}</option>
            )}

            {activities?.map((a) => (
              <option key={a.key} value={a.key}>
                {getLabel(a.name as any)}
              </option>
            ))}
          </select>
        </div>

        {/* -------- RATING -------- */}
        {/* <div>
          <label
            style={{ display: "block", marginBottom: 5, fontWeight: "bold" }}
          >
            {getLabel("ranting_minimo")}
          </label>

          <select
            value={filters.minRating}
            onChange={(e) =>
              handleFilterChange("minRating", Number(e.target.value))
            }
            style={selectStyle()}
          >
            <option value={0}>{getLabel("todos")}</option>
            <option value={4}>{getLabel("mas_4_estrellas")}</option>
            <option value={4.5}>{getLabel("mas_4.5_estrellas")}</option>
            <option value={5}>{getLabel("5_estrellas")}</option>
          </select>
        </div> */}
      </div>

      <button
        onClick={() => {
          setSelectedType("");
          setSelectedCategory("");
          setSelectedActivity("");
          setCategories([]);
          setActivities([]);
        }}
        style={{
          marginTop: 15,
          padding: "8px 16px",
          backgroundColor: "#a42735ff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        {getLabel("limpiar_filtros")}
      </button>
    </div>
  );
};

export default ServiceFilters;
