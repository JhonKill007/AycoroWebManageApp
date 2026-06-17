import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Redirec = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/", { replace: true });
  }, [navigate]);

  return <></>;
};

export default Redirec;
