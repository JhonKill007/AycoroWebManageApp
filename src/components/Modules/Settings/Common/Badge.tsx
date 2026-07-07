import { useEffect, useState } from "react";
import { RoleModel } from "../../../Models/Role/RoleModel";
import roleService from "../../../Services/Role/RoleService";

export const Badge = ({ idRole }: { idRole: string }) => {
  const [role, setRole] = useState<RoleModel | undefined>();

  useEffect(() => {
    if (idRole) {
      findRole(idRole);
    }
  }, [idRole]);

  const findRole = async (id: string) => {
    try {
      const { data } = await roleService.find(id);
      setRole(data.role);
    } catch (error) {
      console.error("Error loading role:", error);
      setRole(undefined);
    }
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 10,
        fontWeight: 700,
        padding: "3px 9px",
        borderRadius: 20,
        background: "#6b73f022",
        color: "#6b73f0",
        border: `1px solid #6b73f044`,
      }}
    >
      {role?.Name ?? "..."}
    </span>
  );
};
