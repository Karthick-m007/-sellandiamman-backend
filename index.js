const express = require('express');
const cors = require('cors');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY); // put your key in .env



const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/upload', express.static(path.join(__dirname, "upload")));

const uploadDir = "upload";
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'upload');
    },
    filename: (req, file, cb) => {
        const name = Date.now() + "-" + file.originalname;
        cb(null, name);
    }
});

const upload = multer({ storage });

app.use(cors({
    origin: ['http://localhost:3000', "https://sellandiammn-traders.vercel.app",
        "sellandiammn-traders.vercel.app" ],
    credentials: true
}));

app.post('/quote', upload.single('image'), async (req, res) => {
    try {
        const { name, email, mobilenumber, message } = req.body;
        const image = req.file;

        if (!name || !email || !mobilenumber || !message) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const emailHtml = `
            <h2>New Quote Request</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Mobile Number:</strong> ${mobilenumber}</p>
            <p><strong>Message:</strong><br>${message}</p>
        `;

        let attachments = [];
        if (image) {
            const base64 = fs.readFileSync(image.path, { encoding: 'base64' });
            attachments.push({
                filename: image.originalname,
                content: base64,
            });
        }

        const emailResponse = await resend.emails.send({
            from: 'Sellandiamman Traders <onboarding@resend.dev>', // or your domain if verified
            to: 'madhanbgmi8@gmail.com',
            subject: 'New Quote Request',
            html: emailHtml,
            attachments
        });

        console.log("Email sent:", emailResponse);
        res.status(200).json({ success: true, message: "Quote sent successfully" });

    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ success: false, message: "Failed to send email" });
    }
});


// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
