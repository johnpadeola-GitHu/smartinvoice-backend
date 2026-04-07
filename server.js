const express = require("express");
const crypto = require("crypto");

const app = express();
app.use(express.json());

app.post("/webhook/paystack", (req, res) => {
  const secret = process.env.PAYSTACK_SECRET;

  const hash = crypto
    .createHmac("sha512", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    return res.status(401).send("Invalid signature");
  }

  const event = req.body;

  if (event.event === "charge.success") {
    console.log("Payment received:", event.data);
  }

  res.sendStatus(200);
});

app.get("/", (req, res) => {
  res.send("Backend is running");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
