import React from "react";

const Spinner = ({ size = 24, label = "Loading" }) => {
  const style = {
    width: size,
    height: size,
    borderWidth: Math.max(2, Math.floor(size / 8)),
  };

  return (
    <div className="spinner" role="status" aria-live="polite" aria-label={label}>
      <div className="spinner-ring" style={style}></div>
    </div>
  );
};

export default Spinner;
