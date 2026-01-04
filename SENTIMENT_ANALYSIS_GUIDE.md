# Sentiment Analysis System - Complete Guide

## Table of Contents
1. [Do You Need to Retrain?](#do-you-need-to-retrain)
2. [How Training Works](#how-training-works)
3. [System Architecture](#system-architecture)
4. [Step-by-Step Implementation](#step-by-step-implementation)

---

## Do You Need to Retrain?

### Short Answer: **It Depends, But Usually YES for Better Performance**

### When You DON'T Need to Retrain:
- **Just making predictions** on new data with existing model
- New data is very similar to training data (same domain, language, style)
- You only need quick results without accuracy improvements

### When You SHOULD Retrain:
- ✅ **New data has different patterns** (e.g., new product categories, different customer language)
- ✅ **Model performance is declining** over time (concept drift)
- ✅ **You want to improve accuracy** with more training examples
- ✅ **New data contains important features** not seen before
- ✅ **Regular updates** (monthly/quarterly) to keep model current

### Best Practice Recommendation:
**Retrain periodically** (e.g., monthly) with accumulated new data to maintain and improve model performance. This is called **incremental learning** or **online learning**.

---

## How Training Works

### 1. **Initial Training Process**

```
Raw Data → Preprocessing → Feature Extraction → Model Training → Model Evaluation → Save Model
```

**Steps:**
1. **Load Data**: Read CSV/TSV files from dataset folder
2. **Preprocessing**: 
   - Clean text (remove special characters, normalize)
   - Tokenize (split into words)
   - Remove stopwords (optional)
   - Convert to lowercase
3. **Feature Extraction**: 
   - Convert text to numbers (TF-IDF, Word Embeddings, or BERT)
   - Create feature vectors
4. **Split Data**: 
   - Training set (70-80%)
   - Validation set (10-15%)
   - Test set (10-15%)
5. **Train Model**: 
   - Use algorithms like Naive Bayes, SVM, or Neural Networks
   - Model learns patterns: "great product" → Positive, "terrible service" → Negative
6. **Evaluate**: Check accuracy, precision, recall
7. **Save Model**: Store as JSON (for simple models) or pickle file

### 2. **Retraining with New Data**

**Option A: Full Retraining (Recommended for Beginners)**
```
Old Training Data + New Data → Combine → Retrain Entire Model → New Model
```
- **Pros**: Simple, ensures model sees all data
- **Cons**: Slower, requires storing all historical data

**Option B: Incremental Learning (Advanced)**
```
Existing Model + New Data → Update Model Weights → Improved Model
```
- **Pros**: Faster, memory efficient
- **Cons**: More complex, may forget old patterns

**For this project, we'll use Option A (Full Retraining)** as it's simpler and more reliable.

### 3. **Model Storage Format**

- **JSON format**: Good for simple models (Naive Bayes coefficients, vocabulary)
- **Pickle format**: Better for complex models (preserves Python objects exactly)
- **H5/Keras format**: For neural network models

---

## System Architecture

```
┌─────────────────┐
│   React.js UI   │  ← User uploads CSV/Excel files
│   (Frontend)    │  ← Displays results & charts
└────────┬────────┘
         │ HTTP Requests
         ▼
┌─────────────────┐
│  Backend API    │  ← Flask/FastAPI server
│  (Python)       │  ← Handles file uploads
└────────┬────────┘  ← Processes data
         │           ← Runs predictions
         ▼
┌─────────────────┐
│  ML Model       │  ← Loads .json model
│  (Python)       │  ← Makes predictions
└────────┬────────┘  ← Retrains when needed
         │
         ▼
┌─────────────────┐
│   Database      │  ← Stores uploaded data
│  (SQLite/PostgreSQL)│  ← Stores predictions
└─────────────────┘  ← Stores model versions
```

---

## Step-by-Step Implementation

### Phase 1: Backend Setup (Python)

1. **Install Dependencies**
   ```bash
   pip install flask pandas scikit-learn numpy nltk
   ```

2. **Train Initial Model**
   - Run `train_model.py` to create first model
   - Model saved as `sentiment_model.json`

3. **Start API Server**
   - Run `app.py` to start Flask server
   - API endpoints:
     - `POST /upload` - Upload new dataset
     - `POST /predict` - Get sentiment predictions
     - `POST /retrain` - Retrain model with new data
     - `GET /results` - Get evaluation results

### Phase 2: Database Setup

1. **Create Database Schema**
   - Tables: `datasets`, `predictions`, `model_versions`
   - Stores all uploaded files and results

2. **Auto-save Feature**
   - Every uploaded file automatically saved to database
   - Tagged with timestamp and source

### Phase 3: Frontend Setup (React.js)

1. **File Upload Component**
   - Drag-and-drop or file picker
   - Accepts CSV, XLSX, TSV files
   - Shows upload progress

2. **Results Display**
   - Sentiment distribution chart (pie/bar chart)
   - Sales trends over time
   - Detailed results table

3. **Model Management**
   - Button to trigger retraining
   - Shows model version and accuracy

### Phase 4: Integration Flow

```
1. User uploads sales_data.csv via React UI
   ↓
2. React sends file to Flask API (/upload)
   ↓
3. Flask saves file to database
   ↓
4. Flask processes file and runs predictions
   ↓
5. Flask returns results (JSON) to React
   ↓
6. React displays charts and tables
   ↓
7. User clicks "Retrain Model" button
   ↓
8. Flask combines old + new data and retrains
   ↓
9. New model saved, old model archived
   ↓
10. React shows updated accuracy metrics
```

---

## Key Concepts Explained Simply

### What is Sentiment Analysis?
Classifying text into emotions: **Positive** 😊, **Neutral** 😐, **Negative** 😞

### Why Retrain?
- Language changes over time
- New products = new vocabulary
- Customer writing style evolves
- Model "forgets" if not updated

### What Happens During Retraining?
1. Model "reads" all old data + new data
2. Finds patterns: "amazing" usually = positive
3. Adjusts its "rules" to be more accurate
4. Saves improved version

### Database Integration Benefits
- **Track History**: See all uploaded files
- **Compare Models**: Which version performed best?
- **Audit Trail**: When was data added?
- **Future Learning**: Use stored data for next retraining

---

## Best Practices

1. **Regular Retraining**: Monthly or quarterly
2. **Data Validation**: Check file format before processing
3. **Model Versioning**: Keep old models for rollback
4. **Error Handling**: Graceful failures with user-friendly messages
5. **Performance**: Cache predictions for repeated queries
6. **Security**: Validate file uploads, prevent malicious files

---

## Next Steps

See the implementation files:
- `train_model.py` - Model training script
- `app.py` - Flask API server
- `database.py` - Database operations
- `frontend/` - React.js components

