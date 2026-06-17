import "../chargerColor.css";
import "./HistoryCharger.css";

export const HistoryCharger = () => {
  return (
    <div>
      <div style={{ width: "67px", marginLeft: 20 }}>
        <div
          style={{
            width: "65px",
            height: "65px",
            borderRadius: "50%",
          }}
          className="color-changing"
        ></div>
        <div
          style={{
            width: 50,
            height: "5px",
            margin: "auto",
            marginTop: "8px",
          }}
          className="color-changing"
        ></div>
      </div>
    </div>
  );
};
