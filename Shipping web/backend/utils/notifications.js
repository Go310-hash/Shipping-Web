const nodemailer = require('nodemailer');

// Create transporter for sending emails
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send email notification
const sendEmailNotification = async (to, subject, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Send shipment created notification
const sendShipmentCreatedNotification = async (shipment) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Shipment Created Successfully</h2>
      <p><strong>Cargo ID:</strong> ${shipment.cargo_id}</p>
      <p><strong>Receiver:</strong> ${shipment.receiver.name}</p>
      <p><strong>Destination:</strong> ${shipment.destination}</p>
      <p><strong>Status:</strong> ${shipment.status}</p>
      <p>You can track your shipment using the Cargo ID.</p>
      <p>Thank you for using our shipping service!</p>
    </div>
  `;

  await sendEmailNotification(
    shipment.receiver.email,
    'Your Shipment Has Been Created',
    html
  );
};

// Send status change notification
const sendStatusChangeNotification = async (shipment) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Shipment Status Updated</h2>
      <p><strong>Cargo ID:</strong> ${shipment.cargo_id}</p>
      <p><strong>New Status:</strong> ${shipment.status}</p>
      <p><strong>Current Location:</strong> ${shipment.current_location}</p>
      <p>Your shipment status has been updated. You can track the full history on our website.</p>
    </div>
  `;

  await sendEmailNotification(
    shipment.receiver.email,
    `Shipment Status Changed to ${shipment.status}`,
    html
  );
};

// Send delivery notification
const sendDeliveryNotification = async (shipment) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Shipment Delivered</h2>
      <p><strong>Cargo ID:</strong> ${shipment.cargo_id}</p>
      <p><strong>Delivery Location:</strong> ${shipment.destination}</p>
      <p><strong>Delivery Time:</strong> ${new Date().toLocaleString()}</p>
      <p>Your shipment has been successfully delivered! Thank you for choosing our service.</p>
    </div>
  `;

  await sendEmailNotification(
    shipment.receiver.email,
    'Your Shipment Has Been Delivered',
    html
  );
};

module.exports = {
  sendEmailNotification,
  sendShipmentCreatedNotification,
  sendStatusChangeNotification,
  sendDeliveryNotification,
};