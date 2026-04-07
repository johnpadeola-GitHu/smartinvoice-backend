const express = require("express");
const crypto = require("crypto");

const app = express();
app.use(express.json());

/**
 * Generate secure license key
 */
function generateLicenseKey() {
  return crypto.randomBytes(16).toString("hex").toUpperCase();
}

/**
 * Webhook endpoint (Paystack)
 */
app.post("/webhook/paystack", (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET;

    // Verify signature
    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(401).send("Invalid signature");
    }

    const event = req.body;

    // Only handle successful payments
    if (event.event === "charge.success") {
      const data = event.data;

      const reference = data.reference;
      const amount = data.amount / 100;

      // Generate license
      const licenseKey = generateLicenseKey();

      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);

      const license = {
        licenseKey,
        reference,
        amount,
        expiryDate: expiryDate.toISOString()
      };

      console.log("LICENSE GENERATED:", license);

      // For now, we just log it (no database required)
      // You can later store or send via WhatsApp

      return res.json({
        status: "success",
        license
      });
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook error:", error);
    res.sendStatus(500);
  }
});

/**
 * Health check route
 */
app.get("/", (req, res) => {
  res.send("Backend is running");
});

/**
 * Start server
 */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
