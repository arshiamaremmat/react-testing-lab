import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../components/App";

describe("Search & Sort", () => {
  beforeEach(() => {
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
          {
            id: 3,
            date: "2025-08-03",
            description: "Apple Store",
            category: "Electronics",
            amount: 199.99,
          },
        ]),
    });
  });

  it("filters transactions when typing in search input", async () => {
    render(<App />);
    // Ensure initial items load
    expect(await screen.findByText("Groceries")).toBeInTheDocument();
    expect(screen.getByText("Gas")).toBeInTheDocument();
    expect(screen.getByText("Apple Store")).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/search your recent transactions/i);
    await userEvent.type(searchInput, "food");

    // Should keep only items whose description or category contains "food"
    // "Groceries" category is "Food", so it matches; "Gas" and "Apple Store" should hide
    expect(screen.getByText("Groceries")).toBeInTheDocument();
    expect(screen.queryByText("Gas")).not.toBeInTheDocument();
    expect(screen.queryByText("Apple Store")).not.toBeInTheDocument();
  });

  it("sorts transactions by selected field", async () => {
    render(<App />);
    // Wait for seed
    await screen.findByText("Groceries");

    const select = screen.getByRole("combobox");
    // Default order (by fetch list): Groceries, Gas, Apple Store
    // Sort by Category alphabetically: Electronics, Food, Transportation
    await userEvent.selectOptions(select, "category");

    // After sort, the first row (below headers) should be "Apple Store" (Electronics)
    // We’ll assert order by checking the first 3 rendered descriptions in row order.
    const rows = Array.from(document.querySelectorAll("tbody tr")).slice(1); // skip header row
    const descriptionsInOrder = rows.map((r) => r.children[1]?.textContent);

    expect(descriptionsInOrder).toEqual(["Apple Store", "Groceries", "Gas"]);
  });
});
