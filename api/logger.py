import logging
import sys

def setup_logger(name: str = "ai_hiring_manager"):
    """
    Setup a logger with a standard format that outputs to stdout.
    
    Args:
        name: The name of the logger
        
    Returns:
        logging.Logger: The configured logger
    """
    logger = logging.getLogger(name)
    
    # Check if handler already exists to avoid duplicate logs
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        
        # Create console handler with a higher log level
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(logging.INFO)
        
        # Create formatter and add it to the handlers
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        
        # Add the handlers to the logger
        logger.addHandler(handler)
        
    return logger

# Create a default logger instance for easy import
logger = setup_logger()
