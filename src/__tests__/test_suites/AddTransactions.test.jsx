import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../components/App";

describe("Add Transactions", () => {
  it("adds a new transaction to the frontend and calls POST", async () => {
    // 1st fetch: GET seed list
    // 2nd fetch: POST new transaction
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
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
          ]),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () =>
          Promise.resolve({
            id: 2,
            date: "2025-08-03",
            description: "Coffee",
            category: "Food",
            amount: 5.25,
          }),
      });

    render(<App />);

    // Seed renders
    expect(await screen.findByText("Groceries")).toBeInTheDocument();

    // Use specific queries to avoid ambiguity
    const dateInput = document.querySelector('input[name="date"]'); // type="date" has no label/placeholder
    const descriptionInput = screen.getByPlaceholderText(/description/i);
    const categoryInput = screen.getByPlaceholderText(/category/i);
    const amountInput = screen.getByPlaceholderText(/amount/i);

    await userEvent.type(dateInput, "2025-08-03");
    await userEvent.type(descriptionInput, "Coffee");
    await userEvent.type(categoryInput, "Food");
    await userEvent.type(amountInput, "5.25");

    await userEvent.click(screen.getByRole("button", { name: /add transaction/i }));

    // Assert POST call and payload
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch.mock.calls[1][0]).toBe("http://localhost:6001/transactions");

    const postOptions = global.fetch.mock.calls[1][1];
    expect(postOptions.method).toBe("POST");

    const sentBody = JSON.parse(postOptions.body);
    expect(sentBody).toEqual({
      date: "2025-08-03",
      description: "Coffee",
      category: "Food",
      amount: "5.25", // string from <input type="number">
    });

    // New row appears
    expect(await screen.findByText("Coffee")).toBeInTheDocument();
    const row = screen.getByText("Coffee").closest("tr");
    expect(within(row).getByText("Food")).toBeInTheDocument();
    expect(within(row).getByText("5.25")).toBeInTheDocument();
  });
});

