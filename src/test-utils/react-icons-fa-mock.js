const React = require("react");

function createIcon(displayName) {
  const Icon = ({ children, ...rest }) => React.createElement("svg", { "data-icon": displayName, ...rest }, children);
  Icon.displayName = displayName;
  return Icon;
}

module.exports = {
  FaChevronRight: createIcon("FaChevronRight"),
  FaWhatsapp: createIcon("FaWhatsapp"),
};
