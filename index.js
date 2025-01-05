import express from "express";
import session from "express-session";
import env from "dotenv";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { google } from "googleapis";
import multer from "multer";
import fs from "fs";
import csv from "csv-parser";
import cors from "cors";
import path from "path";

const app = express();
env.config();

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
});

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.urlencoded({ extended: true })); 
app.use(express.json()); 

app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

passport.use("google", new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
    passReqToCallback: true,
    accessType: "offline",
    prompt: "consent"
}, (request, accessToken, refreshToken, profile, done) => {
    profile.token = accessToken;
    profile.refreshToken = refreshToken;
    return done(null, profile);
}));

function clearAttachmentsFolder() {
    const directory = './attachments/';

    fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (const file of files) {
            fs.unlink(path.join(directory, file), err => {
                if (err) throw err;
            });
        }
    });
}

async function sendmail(req, res, data, template, subjectTemplate, emailField, attachments) {
    const { token, refreshToken } = req.user;
    let emailCount = 0;

    try {
        const oAuth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            "http://localhost:3000/auth/google/callback"
        );
        oAuth2Client.setCredentials({
            access_token: token,
            refresh_token: refreshToken,
        });

        const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

        for (let person of data) {
            let personalizedMessage = template;
            let personalizedSubject = subjectTemplate;

            // Replace fields in the template
            for (let [key, value] of Object.entries(person)) {
                const regex = new RegExp(`{{${key}}}`, 'g');
                personalizedMessage = personalizedMessage.replace(regex, value);
                personalizedSubject = personalizedSubject.replace(regex, value);
            }

            if (personalizedMessage.match(/{{.*?}}/g) || personalizedSubject.match(/{{.*?}}/g)) {
                return res.status(400).send("Invalid fields in template or subject.");
            }

            const recipientEmail = person[emailField];
            if (!recipientEmail) {
                return res.status(400).send(`Missing email in row for ${emailField}`);
            }

            // Base64 encode attachments
            const encodedAttachments = await Promise.all(attachments.map(async (file) => {
                const fileContent = await fs.promises.readFile(file.path);
                return {
                    filename: file.filename,
                    content: fileContent.toString('base64'),
                    mimeType: file.mimetype
                };
            }));

            // Create the MIME message with attachments
            const boundary = `boundary-${Date.now()}`;
            let emailBody = [
                `Content-Type: multipart/mixed; boundary=${boundary}`,
                `MIME-Version: 1.0`,
                `to: ${recipientEmail}`,
                `subject: ${personalizedSubject}`,
                ``,
                `--${boundary}`,
                `Content-Type: text/plain; charset=utf-8`,
                ``,
                personalizedMessage,
                ``
            ];

            // Add attachments as MIME parts
            encodedAttachments.forEach(attachment => {
                emailBody.push(
                    `--${boundary}`,
                    `Content-Type: ${attachment.mimeType}; name="${attachment.filename}"`,
                    `Content-Disposition: attachment; filename="${attachment.filename}"`,
                    `Content-Transfer-Encoding: base64`,
                    ``,
                    attachment.content,
                    ``
                );
            });

            emailBody.push(`--${boundary}--`);

            const encodedMessage = Buffer.from(emailBody.join("\n"))
                .toString("base64")
                .replace(/\+/g, "-")
                .replace(/\//g, "_")
                .replace(/=+$/, "");

            let gmailRequest = {
                userId: "me",
                requestBody: {
                    raw: encodedMessage
                }
            };

            // Send email using Gmail API
            await gmail.users.messages.send(gmailRequest);

            emailCount++;
            console.log(`Mail sent to ${recipientEmail}`);
        }

        clearAttachmentsFolder();

        return emailCount;

    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Error sending email." });
    }
}


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, "csvfile.csv");
    }
});
const upload = multer({ storage });

const attachmentStorage = multer.diskStorage({
    destination: './attachments/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const attachmentUpload = multer({ storage: attachmentStorage });

function readfile() {
    return new Promise((resolve, reject) => {
        const results = [];
        let headers = [];
        fs.createReadStream('./uploads/csvfile.csv')
            .pipe(csv())
            .on('headers', (headerList) => {
                headers = headerList;
            })
            .on('data', (data) => results.push(data))
            .on('end', () => resolve({ headers, results }))
            .on('error', (err) => reject(err));
    });
}

app.post("/sendmail", upload.single('file'), async (req, res) => {
    if (req.isAuthenticated()) {
        const { headers, results } = await readfile();
        res.json({ headers });
    } else {
        res.redirect("/");
    }
});

app.get('/get-csv-fields', async (req, res) => {
    const { fields } = await readfile();
    res.json(fields);
});

app.post("/sendmailtemplate", attachmentUpload.array('attachments'), async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const { headers, results } = await readfile();
            const template = req.body.template;
            const subject = req.body.subject;
            const emailField = req.body.emailField;

            if (!headers.includes(emailField)) {
                return res.status(400).send("Selected email field does not exist in the CSV.");
            }

            const templateFields = template.match(/{{(.*?)}}/g) || [];
            const subjectFields = subject.match(/{{(.*?)}}/g) || [];
            const allFields = [...templateFields, ...subjectFields];
            const invalidFields = allFields.filter(field => !headers.includes(field.replace(/{{|}}/g, '')));

            if (invalidFields.length > 0) {
                return res.status(400).send(`Invalid fields: ${invalidFields.join(', ')}`);
            }

            const attachments = req.files.map(file => ({
                filename: file.originalname,
                path: file.path,
                mimetype: file.mimetype,
            }));

            const emailsSent = await sendmail(req, res, results, template, subject, emailField, attachments);
            res.status(200).json({ message: "Emails sent successfully!", emailsSent });

        } catch (error) {
            console.error("Error processing template:", error);
            res.status(500).send("Error processing template.");
        }
    } else {
        res.redirect("/");
    }
});

app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email", "https://www.googleapis.com/auth/gmail.send"], accessType: "offline", prompt: "consent" }));

app.get("/auth/google/callback", passport.authenticate("google", {
    failureRedirect: "/",
    session: true
}), (req, res) => {
    const userName = req.user.displayName;
    const userEmail = req.user.emails[0].value;
    res.redirect(`http://localhost:5173/upload-csv?name=${encodeURIComponent(userName)}&email=${encodeURIComponent(userEmail)}`);
});

app.get("/afterlogin", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("loggedin.ejs", { name: req.user.displayName });
    } else {
        res.redirect('/');
    }
});

app.get("/auth/google/logout", (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});

app.get("/user-info", (req, res) => {
    if (req.isAuthenticated()) {
        const userInfo = {
            name: req.user.displayName,
            email: req.user.emails[0].value,
        };
        res.json(userInfo);
    } else {
        res.status(401).send("Unauthorized");
    }
});

app.use(express.static("public"));

app.get("/", (req, res) => {
    res.send("hehehehehaww");
});

app.listen(3000);
