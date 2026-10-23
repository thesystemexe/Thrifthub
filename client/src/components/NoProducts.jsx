import React from "react";

const NoProducts = ({ keyword }) => {
  return (
    <div className="no-products-content">
      <div className="no-products-icon"></div>
      <div className="no-products-title">No product found</div>
      <p className="no-products-message">
        {keyword
          ? `We couldn't find any products matching ${keyword} try using different keyword or browse through our complete catalog`
          : "No product available. please check back later"}
      </p>
    </div>
  );
};

export default NoProducts;
