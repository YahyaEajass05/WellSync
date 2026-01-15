/**
 * AI Service Integration
 * Communicates with FastAPI service for predictions
 */

const axios = require('axios');
const logger = require('./logger');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_TIMEOUT = parseInt(process.env.AI_SERVICE_TIMEOUT) || 30000;

// Create axios instance with default config
const aiClient = axios.create({
    baseURL: AI_SERVICE_URL,
    timeout: AI_TIMEOUT,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
aiClient.interceptors.request.use(
    (config) => {
        logger.info(`AI Service Request: ${config.method.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        logger.error(`AI Service Request Error: ${error.message}`);
        return Promise.reject(error);
    }
);

// Response interceptor
aiClient.interceptors.response.use(
    (response) => {
        logger.info(`AI Service Response: ${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        if (error.response) {
            logger.error(`AI Service Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        } else if (error.request) {
            logger.error(`AI Service No Response: ${error.message}`);
        } else {
            logger.error(`AI Service Error: ${error.message}`);
        }
        return Promise.reject(error);
    }
);

/**
 * Check if AI service is healthy
 */
exports.checkAIServiceHealth = async () => {
    try {
        const response = await aiClient.get('/health');
        return {
            status: 'healthy',
            data: response.data
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            error: error.message
        };
    }
};

/**
 * Get mental wellness prediction from AI service
 */
exports.predictMentalWellness = async (inputData) => {
    try {
        const startTime = Date.now();
        
        const response = await aiClient.post('/predict/mental-wellness', inputData);
        
        const processingTime = Date.now() - startTime;
        
        return {
            success: true,
            data: response.data,
            processingTime
        };
    } catch (error) {
        logger.error(`Mental Wellness Prediction Error: ${error.message}`);
        
        if (error.response) {
            throw new Error(`AI Service Error: ${error.response.data.detail || error.response.statusText}`);
        } else if (error.code === 'ECONNREFUSED') {
            throw new Error('AI Service is not available. Please try again later.');
        } else {
            throw new Error(`Prediction failed: ${error.message}`);
        }
    }
};

/**
 * Get academic impact prediction from AI service
 */
exports.predictAcademicImpact = async (inputData) => {
    try {
        const startTime = Date.now();
        
        const response = await aiClient.post('/predict/academic-impact', inputData);
        
        const processingTime = Date.now() - startTime;
        
        return {
            success: true,
            data: response.data,
            processingTime
        };
    } catch (error) {
        logger.error(`Academic Impact Prediction Error: ${error.message}`);
        
        if (error.response) {
            throw new Error(`AI Service Error: ${error.response.data.detail || error.response.statusText}`);
        } else if (error.code === 'ECONNREFUSED') {
            throw new Error('AI Service is not available. Please try again later.');
        } else {
            throw new Error(`Prediction failed: ${error.message}`);
        }
    }
};

/**
 * Get model information from AI service
 */
exports.getModelsInfo = async () => {
    try {
        const response = await aiClient.get('/models/info');
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        logger.error(`Get Models Info Error: ${error.message}`);
        throw new Error(`Failed to get models info: ${error.message}`);
    }
};

/**
 * Get available models from AI service
 */
exports.getAvailableModels = async () => {
    try {
        const response = await aiClient.get('/models/available');
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        logger.error(`Get Available Models Error: ${error.message}`);
        throw new Error(`Failed to get available models: ${error.message}`);
    }
};

/**
 * Get stress level prediction from AI service
 */
exports.predictStressLevel = async (inputData) => {
    try {
        const startTime = Date.now();
        
        const response = await aiClient.post('/predict/stress', inputData);
        
        const processingTime = Date.now() - startTime;
        
        return {
            success: true,
            data: response.data,
            processingTime
        };
    } catch (error) {
        logger.error(`Stress Level Prediction Error: ${error.message}`);
        
        if (error.response) {
            throw new Error(`AI Service Error: ${error.response.data.detail || error.response.statusText}`);
        } else if (error.code === 'ECONNREFUSED') {
            throw new Error('AI Service is not available. Please try again later.');
        } else {
            throw new Error(`Prediction failed: ${error.message}`);
        }
    }
};

/**
 * Get example input data
 */
exports.getExampleData = async (predictionType) => {
    try {
        let endpoint;
        if (predictionType === 'mental_wellness') {
            endpoint = '/examples/mental-wellness';
        } else if (predictionType === 'academic_impact') {
            endpoint = '/examples/academic-impact';
        } else if (predictionType === 'stress_level') {
            endpoint = '/examples/stress';
        } else {
            throw new Error('Invalid prediction type');
        }
            
        const response = await aiClient.get(endpoint);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        logger.error(`Get Example Data Error: ${error.message}`);
        throw new Error(`Failed to get example data: ${error.message}`);
    }
};

module.exports.aiClient = aiClient;
