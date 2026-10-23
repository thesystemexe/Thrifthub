import { Truck, MapPinHouse, IndianRupee } from "lucide-react";
import React from "react";
import "./checkoutPath.css";

const CheckoutPath = ({ activePath }) => {
  const path = [
    {
      label: "Shipping Details",
      icon: <Truck size={18} />,
    },
    {
      label: "Confirm Order",
      icon: <MapPinHouse size={18} />,
    },
    {
      label: "Payment",
      icon: <IndianRupee size={18} />,
    },
  ];

  return (
    <div className="th-checkout-path">
      {path.map((item, index) => {
        const isActive = activePath === index;
        const isCompleted = activePath > index;

        return (
          <div
            className={`th-checkout-step ${
              isActive ? "active" : ""
            } ${isCompleted ? "completed" : ""}`}
            key={index}
          >
            <div className="th-checkout-step-content">
              <div className="th-checkout-icon">{item.icon}</div>

              <span className="th-checkout-label">{item.label}</span>
            </div>

            {index !== path.length - 1 && <div className="th-checkout-line" />}
          </div>
        );
      })}
    </div>
  );
};

export default CheckoutPath;
