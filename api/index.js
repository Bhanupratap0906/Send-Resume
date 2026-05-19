import express from "express";
import nodemailer from "nodemailer";
import path from "path";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import cors from "cors";
import dotenv from "dotenv";
import { emailText } from "./mailText.js";
import serverless from "serverless-http";
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.options("*", cors());

/* =========================
   Swagger Configuration
========================= */

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Mail API",
      version: "1.0.0",
      description: "API for sending emails with resume attachment",
    },
    servers: [
    {
      url: process.env.RENDER_EXTERNAL_URL
        ? process.env.RENDER_EXTERNAL_URL
        : "http://localhost:9060",
    },
  ],
  },
  apis: ["./api/index.js"],
};

const swaggerSpec = swaggerJsdoc(options);

app.use("/api-docs", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
}, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
/* =========================
   Routes
========================= */

app.get("/", (req, res) => {
  res.send("Server is working 🚀");
});

/**
 * @swagger
 * /send-mail:
 *   post:
 *     summary: Send emails with resume attachment
 *     tags:
 *       - Mail
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               emails:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example:
 *                   - "hr@gmail.com"
 *                   - "jobs@company.com"
 *     responses:
 *       200:
 *         description: Email sent successfully
 *       500:
 *         description: Error sending email
 */

app.post("/send-mail", async (req, res) => {
  try {
    const { emails } = req.body;

    if (!emails || !Array.isArray(emails)) {
      return res.status(400).json({
        message: "emails array is required",
      });
    }

    /* =========================
       Nodemailer Transporter
    ========================= */

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    /* =========================
       Send Emails
    ========================= */

    for (const email of emails) {
      const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject:
          "Application for Backend Developer Role - Bhanu Pratap Singh Shekhawat",

        html: emailText,

        attachments: [
          {
            filename: "Bhanu_Pratap_Resume.pdf",
            path: path.resolve("api/Bhanu_Pratap_Resume.pdf"),
          },
        ],
      };

      await transporter.sendMail(mailOptions);
    }

    res.status(200).json({
      success: true,
      message: "Emails sent successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Error sending email",
      error: error.message,
    });
  }
});

export { app };
export default serverless(app);