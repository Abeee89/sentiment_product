# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Backend Dependencies

```bash
pip install -r requirements.txt
```

### Step 2: Train Initial Model

```bash
python train_model.py
```

This will:
- Load data from `dataset/` folder
- Train a sentiment analysis model
- Save model to `models/` folder

**Expected output:**
```
Training with X samples
Model Accuracy: 0.XXXX
Model saved to models/sentiment_model.pkl
```

### Step 3: Start Backend Server

```bash
python app.py
```

**Expected output:**
```
Starting Sentiment Analysis API Server...
API will be available at http://localhost:5000
```

### Step 4: Start Frontend (New Terminal)

```bash
cd frontend
npm install
npm start
```

**Expected output:**
```
Compiled successfully!
You can now view the app in the browser.
Local: http://localhost:3000
```

### Step 5: Use the System!

1. Open browser to `http://localhost:3000`
2. Upload a CSV/XLSX file with text data
3. View sentiment analysis results
4. Click "Retrain Model" to improve accuracy

## 📝 Example Workflow

### First Time Setup
```
1. python train_model.py          # Train initial model
2. python app.py                  # Start backend (Terminal 1)
3. cd frontend && npm start       # Start frontend (Terminal 2)
```

### Daily Usage
```
1. python app.py                  # Start backend
2. cd frontend && npm start       # Start frontend
3. Upload files via web interface
4. Click "Retrain Model" periodically
```

## 🔧 Troubleshooting

### "Model not found" error?
→ Run `python train_model.py` first

### Frontend can't connect?
→ Make sure backend is running on port 5000

### Port already in use?
→ Change port in `app.py` (line: `app.run(..., port=5001)`)

## 📊 Testing with Sample Data

Create a test file `test_data.csv`:
```csv
Text
"This product is amazing!"
"Not satisfied with quality"
"Average product, nothing special"
```

Upload it through the web interface to test!

---

**That's it! You're ready to analyze sentiment! 🎉**

