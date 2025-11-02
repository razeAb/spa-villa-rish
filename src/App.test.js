import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

jest.mock("framer-motion", () => {
  const React = require("react");
  return {
    motion: {
      div: ({ children, ...rest }) => React.createElement("div", rest, children),
    },
  };
});

test("renders primary navigation link", () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByRole("link", { name: /rituals \+/i })).toBeInTheDocument();
});
