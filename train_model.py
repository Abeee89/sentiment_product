"""
Sentiment Analysis Model Training Script
Supports initial training and retraining with new data
"""

import pandas as pd
import numpy as np
import json
import pickle
import os
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import re
from pathlib import Path

class SentimentModelTrainer:
    """Handles training and retraining of sentiment analysis models"""
    
    def __init__(self, model_dir='models'):
        self.model_dir = model_dir
        self.vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
        self.model = None
        self.model_version = 1
        
        # Create models directory if it doesn't exist
        os.makedirs(model_dir, exist_ok=True)
    
    def preprocess_text(self, text):
        """Clean and preprocess text data"""
        if pd.isna(text):
            return ""
        
        # Convert to string and lowercase
        text = str(text).lower()
        
        # Remove special characters but keep spaces
        text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        return text
    
    def load_datasets(self, dataset_folder='dataset'):
        """Load all training datasets from the dataset folder"""
        all_texts = []
        all_labels = []
        
        dataset_path = Path(dataset_folder)
        
        # Load CSV files
        csv_files = list(dataset_path.glob('*.csv'))
        for csv_file in csv_files:
            try:
                df = pd.read_csv(csv_file)
                # Try common column names for text and sentiment
                text_col = None
                sentiment_col = None
                
                for col in df.columns:
                    col_lower = col.lower()
                    if 'text' in col_lower or 'review' in col_lower or 'comment' in col_lower:
                        text_col = col
                    if 'sentiment' in col_lower or 'label' in col_lower:
                        sentiment_col = col
                
                if text_col and sentiment_col:
                    texts = df[text_col].apply(self.preprocess_text)
                    sentiments = df[sentiment_col].str.strip().str.lower()
                    
                    # Map sentiment labels to standard format
                    sentiment_map = {
                        'positive': 'positive',
                        'pos': 'positive',
                        '1': 'positive',
                        'negative': 'negative',
                        'neg': 'negative',
                        '-1': 'negative',
                        'neutral': 'neutral',
                        'neu': 'neutral',
                        '0': 'neutral'
                    }
                    
                    sentiments = sentiments.map(sentiment_map).fillna(sentiments)
                    
                    all_texts.extend(texts.tolist())
                    all_labels.extend(sentiments.tolist())
                    
                    print(f"Loaded {len(df)} samples from {csv_file.name}")
            except Exception as e:
                print(f"Error loading {csv_file}: {e}")
        
        # Load TSV files
        tsv_files = list(dataset_path.glob('*.tsv'))
        for tsv_file in tsv_files:
            try:
                df = pd.read_csv(tsv_file, sep='\t')
                if 'text' in df.columns and 'sentiment' in df.columns:
                    texts = df['text'].apply(self.preprocess_text)
                    sentiments = df['sentiment'].str.strip().str.lower()
                    
                    sentiment_map = {
                        'positive': 'positive',
                        'negative': 'negative',
                        'neutral': 'neutral'
                    }
                    sentiments = sentiments.map(sentiment_map).fillna(sentiments)
                    
                    all_texts.extend(texts.tolist())
                    all_labels.extend(sentiments.tolist())
                    
                    print(f"Loaded {len(df)} samples from {tsv_file.name}")
            except Exception as e:
                print(f"Error loading {tsv_file}: {e}")
        
        return all_texts, all_labels
    
    def train(self, texts, labels, test_size=0.2, retrain=False):
        """Train the sentiment analysis model"""
        
        # Filter out empty texts
        valid_indices = [i for i, text in enumerate(texts) if text.strip()]
        texts = [texts[i] for i in valid_indices]
        labels = [labels[i] for i in valid_indices]
        
        if len(texts) == 0:
            raise ValueError("No valid text data found!")
        
        # Filter out classes with fewer than 2 samples (required for stratified split)
        label_counts = pd.Series(labels).value_counts()
        valid_labels = set(label_counts[label_counts >= 2].index)
        filtered_indices = [i for i, label in enumerate(labels) if label in valid_labels]
        
        removed_count = len(texts) - len(filtered_indices)
        if removed_count > 0:
            print(f"\nRemoved {removed_count} samples from classes with < 2 members")
        
        texts = [texts[i] for i in filtered_indices]
        labels = [labels[i] for i in filtered_indices]
        
        print(f"\nTraining with {len(texts)} samples")
        print(f"Label distribution: {pd.Series(labels).value_counts().to_dict()}")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            texts, labels, test_size=test_size, random_state=42, stratify=labels
        )
        
        # Feature extraction
        print("Extracting features...")
        X_train_vectors = self.vectorizer.fit_transform(X_train)
        X_test_vectors = self.vectorizer.transform(X_test)
        
        # Train model (using Naive Bayes - simple and effective)
        print("Training model...")
        self.model = MultinomialNB(alpha=1.0)
        self.model.fit(X_train_vectors, y_train)
        
        # Evaluate
        y_pred = self.model.predict(X_test_vectors)
        accuracy = accuracy_score(y_test, y_pred)
        
        print(f"\nModel Accuracy: {accuracy:.4f}")
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred))
        
        # Save model
        if retrain:
            # Load existing version to increment
            try:
                with open(f'{self.model_dir}/model_info.json', 'r') as f:
                    info = json.load(f)
                    self.model_version = info.get('version', 1) + 1
            except:
                self.model_version = 1
        
        self.save_model()
        
        return {
            'accuracy': float(accuracy),
            'total_samples': len(texts),
            'train_samples': len(X_train),
            'test_samples': len(X_test),
            'version': self.model_version
        }
    
    def save_model(self):
        """Save model and vectorizer to files"""
        # Save model as pickle (better for sklearn models)
        model_path = f'{self.model_dir}/sentiment_model.pkl'
        vectorizer_path = f'{self.model_dir}/vectorizer.pkl'
        
        with open(model_path, 'wb') as f:
            pickle.dump(self.model, f)
        
        with open(vectorizer_path, 'wb') as f:
            pickle.dump(self.vectorizer, f)
        
        # Save model info as JSON (for easy reading)
        model_info = {
            'version': self.model_version,
            'model_type': 'MultinomialNB',
            'vectorizer_type': 'TfidfVectorizer',
            'max_features': 5000
        }
        
        with open(f'{self.model_dir}/model_info.json', 'w') as f:
            json.dump(model_info, f, indent=2)
        
        print(f"\nModel saved to {model_path}")
        print(f"Model version: {self.model_version}")
    
    def load_model(self):
        """Load existing model and vectorizer"""
        model_path = f'{self.model_dir}/sentiment_model.pkl'
        vectorizer_path = f'{self.model_dir}/vectorizer.pkl'
        
        if not os.path.exists(model_path):
            raise FileNotFoundError("Model not found! Please train a model first.")
        
        with open(model_path, 'rb') as f:
            self.model = pickle.load(f)
        
        with open(vectorizer_path, 'rb') as f:
            self.vectorizer = pickle.load(f)
        
        # Load model info
        try:
            with open(f'{self.model_dir}/model_info.json', 'r') as f:
                info = json.load(f)
                self.model_version = info.get('version', 1)
        except:
            self.model_version = 1
        
        print(f"Model loaded (version {self.model_version})")
    
    def predict(self, texts):
        """Predict sentiment for given texts"""
        if self.model is None:
            self.load_model()
        
        # Preprocess
        processed_texts = [self.preprocess_text(text) for text in texts]
        
        # Vectorize
        vectors = self.vectorizer.transform(processed_texts)
        
        # Predict
        predictions = self.model.predict(vectors)
        probabilities = self.model.predict_proba(vectors)
        
        results = []
        for i, (pred, prob) in enumerate(zip(predictions, probabilities)):
            results.append({
                'text': texts[i],
                'sentiment': pred,
                'confidence': float(max(prob))
            })
        
        return results


def main():
    """Main training function"""
    print("=" * 50)
    print("Sentiment Analysis Model Training")
    print("=" * 50)
    
    trainer = SentimentModelTrainer()
    
    # Load datasets
    texts, labels = trainer.load_datasets()
    
    if len(texts) == 0:
        print("ERROR: No data found in dataset folder!")
        return
    
    # Train model
    results = trainer.train(texts, labels, retrain=False)
    
    print("\n" + "=" * 50)
    print("Training Complete!")
    print("=" * 50)
    print(f"Model Version: {results['version']}")
    print(f"Accuracy: {results['accuracy']:.2%}")
    print(f"Total Samples: {results['total_samples']}")


if __name__ == "__main__":
    main()

