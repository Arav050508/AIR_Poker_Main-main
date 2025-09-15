const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Use your Gmail and App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'aravgandhi20@gmail.com', // <-- Replace with your Gmail address
    pass: 'gaaqpqfdaoiwkihp'      // <-- Replace with your Gmail App Password
  }
});

app.post('/send-email', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const info = await transporter.sendMail({
      from: 'aravgandhi20@gmail.com',
      to: 'aravgandhi20@gmail.com',
      subject: `Contact Us: Message from ${name} <${email}>`,
      text: `Message from: ${name} <${email}>\n\n${message}`,
      replyTo: email
    });

    console.log("Message sent:", info.messageId);
    res.json({ success: true, info });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.toString() });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 