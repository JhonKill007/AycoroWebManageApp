import React from "react";
import { Colors } from "../../../constants/Colors";
import { useThemeContext } from "../../../context/ThemeContext";
import useLanguage from "../../../hooks/useLanguage";
import { ServiceModel } from "../../../Models/Service/ServiceModel";
import ServiceItemCard from "../Card/ServiceItemCard";

interface ServiceGridProps {
  items: ServiceModel[];
}

const ServiceGrid: React.FC<ServiceGridProps> = ({ items }) => {
  const { theme } = useThemeContext();
  const { getLabel } = useLanguage();
  if (items.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 20px",
          textAlign: "center",
          backgroundColor:
            theme === "light"
              ? Colors.light.colors.background
              : Colors.dark.colors.background,
          borderRadius: "8px",
          margin: "20px 0",
        }}
      >
        <h3
          style={{
            margin: "0 0 10px 0",
            fontSize: "20px",
            fontWeight: "600",
            color: "#666",
          }}
        >
          {getLabel("resultados_no_encontrados")}
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: "16px",
            color: "#666",
            lineHeight: "1.5",
          }}
        >
          {getLabel("ajusta_filtros")}
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "20px",
        padding: "20px 0",
      }}
    >
      {items.map((item, index) => (
        <ServiceItemCard key={index} item={item} />
      ))}
    </div>
  );
};

export default ServiceGrid;
