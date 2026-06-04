import express from "express";
import nodemailer from "nodemailer";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { emailText } from "./mailText.js";
dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.options("*", cors());

app.get("/api-docs", (req, res) => {
  const swaggerSpec = {
    openapi: "3.0.0",
    info: {
      title: "Mail API",
      version: "1.0.0",
      description: "API for sending emails with resume attachment",
    },
    servers: [
      {
        url: "https://send-resume-ashy.vercel.app",
      },
    ],
    paths: {
      "/send-mail": {
        post: {
          summary: "Send emails with resume attachment",
          tags: ["Mail"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    emails: {
                      type: "array",
                      items: { type: "string" },
                      example: ["hr@gmail.com", "jobs@company.com"],
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Email sent successfully" },
            500: { description: "Error sending email" },
          },
        },
      },
    },
  };

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Mail API Docs</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
        <script>
          SwaggerUIBundle({
            spec: ${JSON.stringify(swaggerSpec)},
            dom_id: '#swagger-ui',
            presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
            layout: "BaseLayout"
          })
        </script>
      </body>
    </html>
  `);
});

app.get("/", (req, res) => {
  res.send("Server is working 🚀");
});

app.post("/send-mail", async (req, res) => {
  try {
    const { emails } = req.body;

    if (!emails || !Array.isArray(emails)) {
      return res.status(400).json({ message: "emails array is required" });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
      tls: { rejectUnauthorized: false },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000,
    });

    for (const email of emails) {
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "Application for Backend Developer Role - Bhanu Pratap Singh Shekhawat",
        html: emailText,
        attachments: [
          {
             filename: "Bhanu_Pratap_Resume.pdf",
            path: join(__dirname, "Bhanu_Pratap_Resume.pdf"), 
          },
        ],
      });
    }

    res.status(200).json({ success: true, message: "Emails sent successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Error sending email", error: error.message });
  }
});

export default app;
