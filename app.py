"""
Flask API Server for Sentiment Analysis System
Handles file uploads, predictions, and model retraining
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import os
import json
from datetime import datetime
from werkzeug.utils import secure_filename
from pathlib import Path
import traceback

from train_model import SentimentModelTrainer
from database import SentimentDatabase

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'csv', 'tsv', 'xlsx', 'xls'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

# Initialize components
db = SentimentDatabase()
trainer = SentimentModelTrainer()

# Create necessary directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs('models', exist_ok=True)

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_dataframe(file_path, file_type):
    """Load dataframe from various file formats"""
    if file_type == 'csv':
        return pd.read_csv(file_path)
    elif file_type == 'tsv':
        return pd.read_csv(file_path, sep='\t')
    elif file_type in ['xlsx', 'xls']:
        return pd.read_excel(file_path)
    else:
        raise ValueError(f"Unsupported file type: {file_type}")

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Sentiment Analysis API is running'
    })

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Handle file upload and process predictions"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({
                'error': f'Invalid file type. Allowed: {", ".join(ALLOWED_EXTENSIONS)}'
            }), 400
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        safe_filename = f"{timestamp}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], safe_filename)
        file.save(file_path)
        
        # Determine file type
        file_type = filename.rsplit('.', 1)[1].lower()
        
        # Load data
        try:
            df = load_dataframe(file_path, file_type)
        except Exception as e:
            return jsonify({'error': f'Error reading file: {str(e)}'}), 400
        
        # Find text column
        text_column = None
        for col in df.columns:
            col_lower = col.lower()
            if 'text' in col_lower or 'review' in col_lower or 'comment' in col_lower or 'content' in col_lower:
                text_column = col
                break
        
        if text_column is None:
            # Use first column if no text column found
            text_column = df.columns[0]
        
        # Extract texts
        texts = df[text_column].astype(str).tolist()
        
        # Load model and predict
        try:
            trainer.load_model()
        except FileNotFoundError:
            return jsonify({
                'error': 'Model not found. Please train a model first.',
                'action': 'train_model_required'
            }), 404
        
        predictions = trainer.predict(texts)
        
        # Save to database
        dataset_id = db.save_dataset(
            filename=filename,
            file_path=file_path,
            row_count=len(df),
            columns=list(df.columns),
            file_type=file_type,
            description=request.form.get('description', '')
        )
        
        db.save_predictions(dataset_id, predictions)
        
        # Calculate statistics
        sentiment_counts = {}
        for pred in predictions:
            sentiment = pred['sentiment']
            sentiment_counts[sentiment] = sentiment_counts.get(sentiment, 0) + 1
        
        # Get model version
        model_info = db.get_latest_model_version()
        model_version = model_info['version'] if model_info else 1
        
        # Save evaluation
        db.save_evaluation(
            dataset_id=dataset_id,
            model_version=model_version,
            total_predictions=len(predictions),
            positive_count=sentiment_counts.get('positive', 0),
            neutral_count=sentiment_counts.get('neutral', 0),
            negative_count=sentiment_counts.get('negative', 0)
        )
        
        return jsonify({
            'success': True,
            'dataset_id': dataset_id,
            'filename': filename,
            'total_rows': len(df),
            'predictions': predictions[:100],  # Return first 100 for preview
            'statistics': {
                'total': len(predictions),
                'positive': sentiment_counts.get('positive', 0),
                'neutral': sentiment_counts.get('neutral', 0),
                'negative': sentiment_counts.get('negative', 0)
            },
            'model_version': model_version
        })
    
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/predict', methods=['POST'])
def predict_text():
    """Predict sentiment for a single text or array of texts"""
    try:
        data = request.get_json()
        
        if 'text' in data:
            texts = [data['text']]
        elif 'texts' in data:
            texts = data['texts']
        else:
            return jsonify({'error': 'No text provided'}), 400
        
        # Load model
        try:
            trainer.load_model()
        except FileNotFoundError:
            return jsonify({'error': 'Model not found'}), 404
        
        # Predict
        predictions = trainer.predict(texts)
        
        return jsonify({
            'success': True,
            'predictions': predictions
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/retrain', methods=['POST'])
def retrain_model():
    """Retrain model with all available data including new uploads"""
    try:
        data = request.get_json() or {}
        include_new_data = data.get('include_new_data', True)
        
        # Load all datasets
        texts, labels = trainer.load_datasets()
        
        # If including new data, also load from uploads folder
        if include_new_data:
            uploads_path = Path(app.config['UPLOAD_FOLDER'])
            for file_path in uploads_path.glob('*.csv'):
                try:
                    df = pd.read_csv(file_path)
                    # Try to find text and sentiment columns
                    text_col = None
                    sentiment_col = None
                    
                    for col in df.columns:
                        col_lower = col.lower()
                        if 'text' in col_lower:
                            text_col = col
                        if 'sentiment' in col_lower or 'label' in col_lower:
                            sentiment_col = col
                    
                    if text_col:
                        new_texts = df[text_col].astype(str).apply(trainer.preprocess_text).tolist()
                        texts.extend(new_texts)
                        
                        if sentiment_col:
                            new_labels = df[sentiment_col].astype(str).str.strip().str.lower().tolist()
                            labels.extend(new_labels)
                        else:
                            # If no labels, skip this file for training
                            continue
                except Exception as e:
                    print(f"Error loading {file_path}: {e}")
        
        if len(texts) == 0:
            return jsonify({'error': 'No training data available'}), 400
        
        # Train model
        results = trainer.train(texts, labels, retrain=True)
        
        # Save model version to database
        model_path = f"models/sentiment_model.pkl"
        db.save_model_version(
            version=results['version'],
            accuracy=results['accuracy'],
            total_samples=results['total_samples'],
            train_samples=results['train_samples'],
            test_samples=results['test_samples'],
            model_path=model_path,
            notes=f"Retrained with {len(texts)} samples"
        )
        
        return jsonify({
            'success': True,
            'message': 'Model retrained successfully',
            'results': results
        })
    
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/datasets', methods=['GET'])
def get_datasets():
    """Get all uploaded datasets"""
    try:
        datasets = db.get_all_datasets()
        return jsonify({
            'success': True,
            'datasets': datasets
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dataset/<int:dataset_id>', methods=['GET'])
def get_dataset_details(dataset_id):
    """Get details and predictions for a specific dataset"""
    try:
        predictions = db.get_predictions_by_dataset(dataset_id)
        stats = db.get_sentiment_distribution(dataset_id)
        
        return jsonify({
            'success': True,
            'dataset_id': dataset_id,
            'predictions': predictions,
            'statistics': stats
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/model/info', methods=['GET'])
def get_model_info():
    """Get current model information"""
    try:
        model_info = db.get_latest_model_version()
        
        if model_info is None:
            return jsonify({
                'success': False,
                'message': 'No model found. Please train a model first.'
            }), 404
        
        return jsonify({
            'success': True,
            'model': model_info
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    """Get overall statistics"""
    try:
        dataset_id = request.args.get('dataset_id', type=int)
        
        # Get sentiment distribution
        distribution = db.get_sentiment_distribution(dataset_id)
        
        # Get evaluation stats
        eval_stats = db.get_evaluation_stats(dataset_id)
        
        # Get model info
        model_info = db.get_latest_model_version()
        
        return jsonify({
            'success': True,
            'sentiment_distribution': distribution,
            'evaluations': eval_stats,
            'model': model_info
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("Starting Sentiment Analysis API Server...")
    print("API will be available at http://localhost:5000")
    print("\nAvailable endpoints:")
    print("  POST /api/upload - Upload and process file")
    print("  POST /api/predict - Predict sentiment for text")
    print("  POST /api/retrain - Retrain model")
    print("  GET  /api/datasets - Get all datasets")
    print("  GET  /api/model/info - Get model information")
    print("  GET  /api/statistics - Get statistics")
    
    app.run(debug=True, host='0.0.0.0', port=5000)

