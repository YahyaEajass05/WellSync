"""
Academic Impact Analyzer Module
Predicts social media addiction impact on academic performance
"""

from .preprocess import preprocess_data
from .train import train_model
from .evaluate import evaluate_model

__all__ = ['preprocess_data', 'train_model', 'evaluate_model']
