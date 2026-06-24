import { NextResponse } from "next/server";

export async function POST(request) {
  // Parse the form data submitted by the user
  const formData = await request.formData();

  // We need to save the order data to a file. We'll use the Node.js fs module for this.
  const fs = require("fs");
  const path = require("path");

  // Create a directory for data if it doesn't exist.
  const destDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Append every submission to one file
  const filePath = path.join(destDir, "data.txt");

  // Prepare the data block that will be appended to the file
  let data = "Data Details:\n";
  for (const [key, value] of formData.entries()) {
    data += `${key}: ${value}\n`;
  }
  data += "---\n";

  // Append the data instead of overwriting or creating a new file per request.
  fs.appendFileSync(filePath, data);

  // Return a response indicating that the data has been saved.
  return NextResponse.json({
    message: "Data saved successfully",
    filePath,
  });
}

export async function GET() {
  // Return the form for saving data to a file
  const html = `
    <!doctype html>
    <html lang="en">
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Save Data to File</title>
        </head>
        <body>
            <h1>Save Data to File</h1>
            <form id="dataForm">
                <label for="data">Data:</label><br />
                <textarea id="data" name="data" rows="10" cols="50"></textarea><br />
                <input type="submit" value="Save Data" />
            </form>
        </body>
        <script>
            // Make the request to save the data and handle the response
            document.getElementById("dataForm").addEventListener("submit", async (event) => {
                event.preventDefault();
                const formData = new FormData(event.target);
                let parsedData = {};
                try{
                    parsedData = JSON.parse(formData.get("data"));
                } catch (error) {
                    parsedData = formData.get("data");
                }
                const response = await fetch("/writeToFile", {
                    method: "POST",
                    body: new URLSearchParams(parsedData),
                });
                const result = await response.json();
                alert(result.message + "\\nFile saved at: " + result.filePath);
            });
        </script>
    </html>
  `;
  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}
