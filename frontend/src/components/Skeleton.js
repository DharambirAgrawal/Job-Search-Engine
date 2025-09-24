import React from "react";

const Skeleton = ({
  width = "100%",
  height = 16,
  style = {},
  className = "",
}) => {
  const s = {
    width,
    height,
    borderRadius: 4,
    background:
      "linear-gradient(90deg, rgba(0,0,0,0.06) 25%, rgba(0,0,0,0.04) 37%, rgba(0,0,0,0.06) 63%)",
    backgroundSize: "400% 100%",
    animation: "skeleton-loading 1.2s ease-in-out infinite",
    display: "inline-block",
    ...style,
  };

  return (
    <div className={`skeleton ${className}`} style={s} aria-hidden="true"></div>
  );
};

export default Skeleton;
