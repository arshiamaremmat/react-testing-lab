import { render, screen } from "@testing-library/react";
import App from "../../components/App";

describe("Display Transactions", () => {
  beforeEach(() => {
    // First GET response with seed data
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () =>
        Promise.resolve([
          {
            id: 1,
            date: "2025-08-01",
            description: "Groceries",
            category: "Food",
            amount: 42.13,
          },
          {
            id: 2,
            date: "2025-08-02",
            description: "Gas",
            category: "Transportation",
            amount: 65.0,
          },
        ]),
    });
  });

  it("renders transactions on startup", async () => {
    render(<App />);
    // Wait for items to appear
    expect(await screen.findByText("Groceries")).toBeInTheDocument();
    expect(await screen.findByText("Gas")).toBeInTheDocument();
  });
});
