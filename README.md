# Product Sentiment Analysis System

A complete machine learning system for analyzing product sales sentiment with React.js frontend and Flask backend.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Installation](#installation)
- [Usage](#usage)
- [How It Works](#how-it-works)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)

## 🎯 Overview

This system allows you to:
- Upload sales data files (CSV, XLSX, TSV)
- Automatically analyze sentiment (Positive, Neutral, Negative)
- View results with interactive charts
- Retrain the model with new data for improved accuracy
- Store all data in a database for future learning

## ✨ Features

- **File Upload**: Drag-and-drop or click to upload CSV/XLSX/TSV files
- **Sentiment Analysis**: Automatic classification into Positive, Neutral, Negative
- **Visual Analytics**: Interactive pie charts and bar charts
- **Model Retraining**: Improve model accuracy by retraining with new data
- **Database Storage**: All uploads and predictions are automatically saved
- **Model Versioning**: Track different model versions and their performance

## 🏗️ System Architecture

```
┌─────────────────┐
│   React.js UI   │  ← User Interface
└────────┬────────┘
         │ HTTP
         ▼
┌─────────────────┐
│  Flask API     │  ← Backend Server
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌────────┐  ┌──────────┐
│  Model │  │Database │  ← ML Model & SQLite DB
└────────┘  └──────────┘
```

## 📦 Installation

### Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

### Step 1: Backend Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Download NLTK data (if needed):**
   ```python
   python -c "import nltk; nltk.download('punkt')"
   ```

3. **Train initial model:**
   ```bash
   python train_model.py
   ```
   This will create a model in the `models/` directory.

### Step 2: Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

## 🚀 Usage

### Starting the Backend

1. **Start Flask server:**
   ```bash
   python app.py
   ```
   Server will run at `http://localhost:5000`

### Starting the Frontend

1. **In a new terminal, start React app:**
   ```bash
   cd frontend
   npm start
   ```
   App will open at `http://localhost:3000`

### Using the System

1. **Upload a file:**
   - Drag and drop a CSV/XLSX/TSV file or click to browse
   - File should have a column with text/reviews/comments
   - System automatically detects text column

2. **View results:**
   - See sentiment distribution in charts
   - View statistics (counts and percentages)
   - Check model version and accuracy

3. **Retrain model:**
   - Click "Retrain Model with New Data" button
   - System combines old training data + new uploads
   - New model version is created with improved accuracy

## 🔧 How It Works

### 1. Initial Training

When you run `train_model.py`:
- Loads all datasets from `dataset/` folder
- Preprocesses text (cleaning, normalization)
- Extracts features using TF-IDF
- Trains a Naive Bayes classifier
- Saves model to `models/sentiment_model.pkl`

### 2. File Upload & Prediction

When you upload a file:
- File is saved to `uploads/` folder
- Text column is automatically detected
- Model predicts sentiment for each row
- Results are saved to database
- Statistics are calculated and displayed

### 3. Model Retraining

When you click "Retrain Model":
- System loads original training data from `dataset/`
- Adds new data from `uploads/` folder
- Retrains model with combined dataset
- New model version is saved
- Old model is kept for rollback

### 4. Database Storage

All data is stored in SQLite database (`sentiment_analysis.db`):
- **datasets**: Uploaded file metadata
- **predictions**: All sentiment predictions
- **model_versions**: Model training history
- **evaluations**: Evaluation statistics

## 📡 API Endpoints

### File Operations

- `POST /api/upload` - Upload and process file
  ```json
  {
    "file": <file>,
    "description": "optional description"
  }
  ```

- `POST /api/predict` - Predict sentiment for text
  ```json
  {
    "text": "This product is amazing!"
  }
  ```

### Model Operations

- `POST /api/retrain` - Retrain model
  ```json
  {
    "include_new_data": true
  }
  ```

- `GET /api/model/info` - Get model information

### Data Operations

- `GET /api/datasets` - Get all uploaded datasets
- `GET /api/dataset/<id>` - Get dataset details
- `GET /api/statistics` - Get statistics (optionally filtered by dataset_id)

## 📁 Project Structure

```
.
├── app.py                 # Flask API server
├── train_model.py         # Model training script
├── database.py            # Database operations
├── requirements.txt       # Python dependencies
├── models/                # Saved models (created after training)
│   ├── sentiment_model.pkl
│   ├── vectorizer.pkl
│   └── model_info.json
├── uploads/               # Uploaded files (created automatically)
├── dataset/               # Training datasets
│   ├── sentimentdataset.csv
│   ├── train_preprocess_ori.tsv
│   └── valid_preprocess.tsv
├── sentiment_analysis.db  # SQLite database (created automatically)
├── frontend/              # React.js frontend
│   ├── src/
│   │   ├── App.js
│   │   ├── components/
│   │   │   ├── FileUpload.js
│   │   │   └── ResultsDisplay.js
│   │   └── services/
│   │       └── api.js
│   └── package.json
└── README.md
```

## 📊 Data Format

### Input File Format

Your CSV/XLSX/TSV file should have:
- At least one column with text data (reviews, comments, etc.)
- Column names like: `Text`, `Review`, `Comment`, `Content` (case-insensitive)
- Optional: `Sentiment` column (if you want to include labels for retraining)

Example CSV:
```csv
Text,Sentiment
"This product is amazing!",positive
"Not satisfied with the quality",negative
"Average product",neutral
```

## 🔄 Retraining Explained

### When to Retrain?

**You should retrain when:**
- ✅ New data has different patterns
- ✅ Model accuracy is declining
- ✅ New product categories are introduced
- ✅ Regular maintenance (monthly/quarterly)

**You don't need to retrain when:**
- Just making predictions on similar data
- Model is performing well
- Data is very similar to training data

### Retraining Process

1. **Collect Data**: All files in `dataset/` + `uploads/` folders
2. **Combine**: Merge old training data with new uploads
3. **Preprocess**: Clean and normalize all text
4. **Train**: Train new model on combined dataset
5. **Evaluate**: Check accuracy on test set
6. **Save**: Store new model version in database

## 🛠️ Troubleshooting

### Model Not Found Error

**Problem**: "Model not found" error when uploading

**Solution**: Run `python train_model.py` first to create the initial model

### File Upload Fails

**Problem**: File upload returns error

**Solution**: 
- Check file format (CSV, XLSX, TSV only)
- Ensure file size < 50MB
- Verify file has readable text column

### Frontend Can't Connect to Backend

**Problem**: React app shows connection errors

**Solution**:
- Ensure Flask server is running on port 5000
- Check CORS is enabled in `app.py`
- Verify API URL in `frontend/src/services/api.js`

## 📝 Notes

- Model uses **TF-IDF** for feature extraction
- Classification uses **Naive Bayes** algorithm
- Database is **SQLite** (easy to migrate to PostgreSQL if needed)
- All uploaded files are stored in `uploads/` folder
- Model versions are tracked in database

## 🔐 Security Considerations

- File uploads are validated for type and size
- Filenames are sanitized before saving
- SQL injection prevented by using parameterized queries
- CORS enabled for development (restrict in production)

## 🚀 Future Enhancements

- [ ] Support for more file formats
- [ ] Real-time prediction API
- [ ] Model comparison dashboard
- [ ] Export results to CSV/PDF
- [ ] User authentication
- [ ] Multi-language support
- [ ] Advanced model types (BERT, transformers)

## 📄 License

This project is for educational purposes.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Happy Analyzing! 📊✨**

