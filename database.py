"""
Database operations for storing datasets, predictions, and model versions
"""

import sqlite3
import pandas as pd
import json
from datetime import datetime
from pathlib import Path
import os

class SentimentDatabase:
    """Manages database operations for sentiment analysis system"""
    
    def __init__(self, db_path='sentiment_analysis.db'):
        self.db_path = db_path
        self.init_database()
    
    def get_connection(self):
        """Get database connection"""
        return sqlite3.connect(self.db_path)
    
    def init_database(self):
        """Initialize database tables"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Table for storing uploaded datasets
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS datasets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                file_path TEXT,
                upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                row_count INTEGER,
                columns TEXT,
                file_type TEXT,
                description TEXT
            )
        ''')
        
        # Table for storing predictions
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                dataset_id INTEGER,
                text TEXT NOT NULL,
                sentiment TEXT NOT NULL,
                confidence REAL,
                prediction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (dataset_id) REFERENCES datasets(id)
            )
        ''')
        
        # Table for storing model versions
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS model_versions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                version INTEGER UNIQUE NOT NULL,
                accuracy REAL,
                training_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                total_samples INTEGER,
                train_samples INTEGER,
                test_samples INTEGER,
                model_path TEXT,
                notes TEXT
            )
        ''')
        
        # Table for storing evaluation results
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS evaluations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                dataset_id INTEGER,
                model_version INTEGER,
                total_predictions INTEGER,
                positive_count INTEGER,
                neutral_count INTEGER,
                negative_count INTEGER,
                evaluation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (dataset_id) REFERENCES datasets(id),
                FOREIGN KEY (model_version) REFERENCES model_versions(version)
            )
        ''')
        
        conn.commit()
        conn.close()
        print("Database initialized successfully")
    
    def save_dataset(self, filename, file_path, row_count, columns, file_type, description=None):
        """Save uploaded dataset metadata"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO datasets (filename, file_path, row_count, columns, file_type, description)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (filename, file_path, row_count, json.dumps(columns), file_type, description))
        
        dataset_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return dataset_id
    
    def save_predictions(self, dataset_id, predictions):
        """Save prediction results"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        for pred in predictions:
            cursor.execute('''
                INSERT INTO predictions (dataset_id, text, sentiment, confidence)
                VALUES (?, ?, ?, ?)
            ''', (dataset_id, pred['text'], pred['sentiment'], pred['confidence']))
        
        conn.commit()
        conn.close()
    
    def save_model_version(self, version, accuracy, total_samples, train_samples, test_samples, model_path, notes=None):
        """Save model version information"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO model_versions 
            (version, accuracy, total_samples, train_samples, test_samples, model_path, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (version, accuracy, total_samples, train_samples, test_samples, model_path, notes))
        
        conn.commit()
        conn.close()
    
    def save_evaluation(self, dataset_id, model_version, total_predictions, positive_count, neutral_count, negative_count):
        """Save evaluation results"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO evaluations 
            (dataset_id, model_version, total_predictions, positive_count, neutral_count, negative_count)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (dataset_id, model_version, total_predictions, positive_count, neutral_count, negative_count))
        
        eval_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return eval_id
    
    def get_all_datasets(self):
        """Get all uploaded datasets"""
        conn = self.get_connection()
        df = pd.read_sql_query('''
            SELECT * FROM datasets ORDER BY upload_date DESC
        ''', conn)
        conn.close()
        return df.to_dict('records')
    
    def get_predictions_by_dataset(self, dataset_id):
        """Get predictions for a specific dataset"""
        conn = self.get_connection()
        df = pd.read_sql_query('''
            SELECT * FROM predictions WHERE dataset_id = ? ORDER BY id
        ''', conn, params=(dataset_id,))
        conn.close()
        return df.to_dict('records')
    
    def get_latest_model_version(self):
        """Get the latest model version"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM model_versions ORDER BY version DESC LIMIT 1
        ''')
        
        result = cursor.fetchone()
        conn.close()
        
        if result:
            return {
                'id': result[0],
                'version': result[1],
                'accuracy': result[2],
                'training_date': result[3],
                'total_samples': result[4],
                'train_samples': result[5],
                'test_samples': result[6],
                'model_path': result[7],
                'notes': result[8]
            }
        return None
    
    def get_evaluation_stats(self, dataset_id=None):
        """Get evaluation statistics"""
        conn = self.get_connection()
        
        if dataset_id:
            df = pd.read_sql_query('''
                SELECT * FROM evaluations WHERE dataset_id = ? ORDER BY evaluation_date DESC
            ''', conn, params=(dataset_id,))
        else:
            df = pd.read_sql_query('''
                SELECT * FROM evaluations ORDER BY evaluation_date DESC
            ''', conn)
        
        conn.close()
        return df.to_dict('records')
    
    def get_sentiment_distribution(self, dataset_id=None):
        """Get sentiment distribution for charts"""
        conn = self.get_connection()
        
        if dataset_id:
            df = pd.read_sql_query('''
                SELECT sentiment, COUNT(*) as count 
                FROM predictions 
                WHERE dataset_id = ?
                GROUP BY sentiment
            ''', conn, params=(dataset_id,))
        else:
            df = pd.read_sql_query('''
                SELECT sentiment, COUNT(*) as count 
                FROM predictions 
                GROUP BY sentiment
            ''', conn)
        
        conn.close()
        return df.to_dict('records')

