import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // We pull all these from the 'body' of your fetch request in script.js
    const { type, name, email, message, items, total, orderID, address, city, phone, payment } = req.body;

    // --- CONTACT FORM ---
    if (type === "contact") {
      await resend.emails.send({
        from: "sarah najam studio <onboarding@resend.dev>",
        to: ["shopsarahnajamstudio@outlook.com"],
        subject: "New Contact Message",
        html: `<h2>New Message</h2><p><strong>From:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p>${message}</p>`
      });
    }

    // --- ORDER CONFIRMATIONS ---
    if (type === "order") {
      // 1. Send to YOU (Admin)
      await resend.emails.send({
        from: "sarah najam studio Orders <onboarding@resend.dev>",
        to: ["shopsarahnajamstudio@outlook.com"],
        subject: `New Order #${orderID}`,
        html: `
          <h2>🛒 New Order Received</h2>
          <p><strong>Order ID:</strong> #${orderID}</p>
          <p><strong>Customer:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email || 'N/A'}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Address:</strong> ${address}</p>
          <p><strong>City:</strong> ${city}</p>
          <hr>
          <h3>Products:</h3>
          ${items}
          <hr>
          <h3>Total: Rs ${total}</h3>
          <p><strong>Payment:</strong> ${payment}</p>
        `
      });

      // 2. Send to CUSTOMER
      await resend.emails.send({
        from: "sarah najam studio <onboarding@resend.dev>",
        to: [email],
        subject: `Order Confirmed: #${orderID}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
            <h2 style="text-align: center;">Thank You for Your Order!</h2>
            <p>Hi ${name.split(' ')[0]}, your order <strong>#${orderID}</strong> is confirmed and will be processed shortly.</p>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
              <p><strong>Order Number:</strong> #${orderID}</p>
              <p><strong>Payment Method:</strong> ${payment}</p>
            </div>
            <h3 style="margin-top: 20px;">Order Summary</h3>
            ${items}
            <h3 style="margin-top: 20px;">Total Amount: Rs ${total}</h3>
            <p>If you have any questions, just reply to this email!</p>
          </div>
        `
      });
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Resend Error:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
}