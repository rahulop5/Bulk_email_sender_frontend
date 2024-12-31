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

const app=express();
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
});

env.config();
app.use(cors({
    //static link
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.urlencoded({ extended: true })); // To parse form data
app.use(express.json()); // To parse JSON data

app.use(session({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000*60*60
    }
}));

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser((user, done)=>{
    return done(null, user);
});
passport.deserializeUser((user, done)=>{
    return done(null, user);
});

passport.use("google", new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
    passReqToCallback   : true,
    accessType: "offline",
    prompt: 'consent'
}, (request, accessToken, refreshToken, profile, done)=>{
    profile.token = accessToken;
    profile.refreshToken = refreshToken;
    // console.log(profile);
    return done(null, profile);
}));

async function sendmail(req, res, data, template, subjectTemplate) {
    const { token, refreshToken } = req.user;
    let emailCount = 0;  // Add this to count the number of emails sent

    try {
        // Create OAuth2 client
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

        // Map over each person and send personalized email
        for (let person of data) {
            let personalizedMessage = template;
            let personalizedSubject = subjectTemplate;

            // Replace each header field with the corresponding value in the CSV row for body
            for (let [key, value] of Object.entries(person)) {
                const regex = new RegExp(`{{${key}}}`, 'g'); // Create a regex to match {{field}} format
                personalizedMessage = personalizedMessage.replace(regex, value);
                personalizedSubject = personalizedSubject.replace(regex, value);
            }

            // If there are any placeholders left unreplaced (i.e., user entered wrong field)
            if (personalizedMessage.match(/{{.*?}}/g) || personalizedSubject.match(/{{.*?}}/g)) {
                return res.status(400).send("Invalid fields in template or subject.");
            }

            const email = [
                "Content-Type: text/plain; charset=utf-8",
                "MIME-Version: 1.0",
                "Content-Transfer-Encoding: 7bit",
                `to: ${person.email}`,  // Assuming the 'email' field exists in CSV
                `subject: ${personalizedSubject}`,  // Personalized subject
                "",
                personalizedMessage,
            ].join("\n");

            // Base64 encode the email
            const encodedMessage = Buffer.from(email)
                .toString("base64")
                .replace(/\+/g, "-")
                .replace(/\//g, "_")
                .replace(/=+$/, "");

            // Send the email using Gmail API
            await gmail.users.messages.send({
                userId: "me",
                requestBody: {
                    raw: encodedMessage,
                },
            });
            emailCount++;  // Increment count after each successful send
            console.log(`Mail sent to ${person.email}`);
        }

        return emailCount;  // Return the total number of emails sent

    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Error sending email." });
    }
}
//csv file handling

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, "csvfile.csv");
    }
});
const upload = multer({ storage });

// CSV File Processing
function readfile() {
    return new Promise((resolve, reject) => {
        const results = [];
        let headers = [];
        fs.createReadStream('./uploads/csvfile.csv')
        .pipe(csv())
        .on('headers', (headerList) => {
            headers = headerList; // Store headers
        })
        .on('data', (data) => results.push(data))
        .on('end', () => resolve({ headers, results }))
        .on('error', (err) => reject(err));
    });
}

app.post("/sendmail", upload.single('file'), async (req, res) => { 
    if(req.isAuthenticated()){
        const { headers, results } = await readfile(); // Get the CSV headers and content
        console.log(headers);
        res.json({
            headers: headers // Send headers to the frontend as JSON
        });
    } else {
        res.redirect("/");
    }
});


app.get('/get-csv-fields', async (req, res) => {
    const { fields } = await readfile();
    res.json(fields); // Send fields to frontend for mapping
});

app.post("/sendmailtemplate", async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const { headers, results } = await readfile();  // Assuming you return headers + data from readfile()
            const template = req.body.template;
            const subject = req.body.subject;

            // Validate if all fields in the subject and template exist in CSV headers
            const templateFields = template.match(/{{(.*?)}}/g) || [];
            const subjectFields = subject.match(/{{(.*?)}}/g) || [];
            const allFields = [...templateFields, ...subjectFields];
            const invalidFields = allFields.filter(field => !headers.includes(field.replace(/{{|}}/g, '')));

            if (invalidFields.length > 0) {
                return res.status(400).send(`Invalid fields: ${invalidFields.join(', ')}`);
            }

            // Send mail with personalized subject and content
            const emailsSent = await sendmail(req, res, results, template, subject);
            res.status(200).json({ message: "Emails sent successfully!", emailsSent });

        } catch (error) {
            console.error("Error processing template:", error);
            res.status(500).send("Error processing template.");
        }
    } else {
        res.redirect("/");
    }
});

//auth
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email", "https://www.googleapis.com/auth/gmail.send"], accessType: "offline" , prompt: "consent"}));

app.get("/auth/google/callback", passport.authenticate("google", {
    failureRedirect: "/",
    session: true
}), (req, res) => {
    // On successful authentication, redirect to frontend with user details
    const userName = req.user.displayName;
    const userEmail = req.user.emails[0].value;
    res.redirect(`http://localhost:5173/upload-csv?name=${encodeURIComponent(userName)}&email=${encodeURIComponent(userEmail)}`);
});


app.get("/afterlogin", (req, res)=>{
    if (req.isAuthenticated()) {
       res.render("loggedin.ejs", {
        name: req.user.displayName
       });
    } else {
        res.redirect('/');
    }
});

app.get("/auth/google/logout", (req, res)=>{
    req.logout(function (err) {
        if (err) {
          return next(err);
        }
        res.redirect("/");
    });
});

// Route to get the logged-in user's info
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
app.get("/", (req, res)=>{
    res.send("hehehehehaww");
});


app.listen(3000);