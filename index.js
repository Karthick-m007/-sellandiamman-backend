const express = require('express');
const cors = require('cors');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

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

    ],
    credentials: true
}));

app.post('/quote', upload.single('image'), async (req, res) => {
    try {
        const { name, email, mobilenumber, message } = req.body;
        const image = req.file;

        if (!name || !email || !mobilenumber || !message) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "madhanbgmi8@gmail.com",
                pass: "ytdt jzsl nwpt xgjd", // Use your Gmail App Password
            },
        });

        let mailOptions = {
            from: `"${name}" <${email}>`,
            to: "madhanbgmi8@gmail.com", // Replace with admin email
            subject: "New Quote Request",
            text: `Name: ${name}\nEmail: ${email}\nmobilenumber: ${mobilenumber}\nMessage: ${message}`,
            attachments: [],
        };

        // ✅ Add attachment if image is present
        if (image) {
            mailOptions.attachments.push({
                filename: image.originalname,
                path: image.path, // since we're using diskStorage
            });
        }

        await transporter.sendMail(mailOptions);

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
