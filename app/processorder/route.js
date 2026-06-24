import { NextResponse } from "next/server";

const ITEMS = [
    { label: "Struts", field: "strutsqty" },
    { label: "Oil", field: "oilqty" },
    { label: "Air Filters", field: "airfilterqty" },
];

function parseQuantity(value) {
    const trimmed = String(value ?? "").trim();

    if (trimmed === "") {
        return 0;
    }

    // Treat invalid or negative input as zero
    const quantity = Number.parseInt(trimmed, 10);
    return Number.isNaN(quantity) || quantity < 0 ? 0 : quantity;
}

function escapeHtml(value) {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

export async function POST(request) {
    // Parse the form data submitted by the user
    const formData = await request.formData();

    // Keep the displayed item list driven by the same field names the form submits.
    const items = ITEMS.map(({ label, field }) => ({
        label,
        quantity: parseQuantity(formData.get(field)),
    }));

    // Calculate the total quantity of all items
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    // Generate the HTML table rows for each item
    const rows = items
        .map(
            (item) => `
        <tr>
          <td>${escapeHtml(item.label)}</td>
          <td>${item.quantity}</td>
        </tr>
      `,
        )
        .join("");

    const currentTime = new Date().toLocaleString();

    // The route returns a complete HTML document instead of redirecting to another page.
    const html = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Andrew's AutoParts - Order Results</title>
        <link rel="stylesheet" href="/processorder.css" />
      </head>
      <body>
        <main>
          <h1>Order Processed</h1>
          <p>Your request was submitted to the Next.js route handler at <code>/processorder</code>.</p>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
              <tr class="total">
                <td>Total Items</td>
                <td>${totalItems}</td>
              </tr>
            </tbody>
          </table>
          <p>Order processed at: ${currentTime}</p>
          <a href="/">Place another order</a>
        </main>
      </body>
    </html>
  `;

    return new NextResponse(html, {
        headers: {
            "content-type": "text/html; charset=utf-8",
        },
    });
}
