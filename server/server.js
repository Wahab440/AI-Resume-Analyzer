const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { exec } = require("child_process");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/resume-analyzer')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Report schema
const reportSchema = new mongoose.Schema({
  filename: String,
  score: Number,
  skills: [String],
  experience_years: Number,
  has_education: Boolean,
  suggestions: [String],
  createdAt: { type: Date, default: Date.now }
});

const Report = mongoose.model('Report', reportSchema);

const storage = multer.diskStorage({
  destination: (req,file,cb)=>{
    cb(null,"uploads/");
  },
  filename:(req,file,cb)=>{
    cb(null,Date.now()+"-"+file.originalname);
  }
});

const upload = multer({storage});

app.get("/",(req,res)=>{
  res.send("Resume Analyzer API Running");
});

app.post("/upload", upload.single("resume"), (req,res)=>{

  const filepath = req.file.path;
  const filename = req.file.originalname;

  exec(`"E:/University Material/Projects/AI-Resume-Analyzer/.venv/Scripts/python.exe" ../ai-model/resume_parser.py "${filepath}"`, (error, stdout, stderr)=>{

      if(error){
        console.log('Error:', error);
        console.log('Stderr:', stderr);
        return res.status(500).json({error:"AI processing failed"});
      }

      const result = JSON.parse(stdout);

      // Save to database
      const report = new Report({
        filename,
        score: result.score,
        skills: result.skills,
        experience_years: result.experience_years,
        has_education: result.has_education,
        suggestions: result.suggestions
      });

      report.save().then(() => {
        res.json(result);
      }).catch(err => {
        console.error('Error saving report:', err);
        res.json(result); // Still return result even if save fails
      });

  });

});

app.get("/reports", async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error('Error fetching reports:', err);
    if (err && err.stack) console.error('Stack:', err.stack);
    res.status(500).json({ error: 'Failed to fetch reports', details: err && err.message ? err.message : String(err) });
  }
});

app.listen(5000,()=>{
  console.log("Server running on port 5000");
});