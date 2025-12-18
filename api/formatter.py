"""
Response formatter - cleans and formats agent responses
"""
import re

def format_response(text: str) -> str:
    """
    Format the agent's response to be clean and professional
    
    - Removes emojis and special symbols
    - Adds proper indentation
    - Numbers lists automatically
    - Structures bullet points
    
    Args:
        text: Raw response from the agent
        
    Returns:
        Formatted response string
    """
    if not text:
        return ""
    
    # Remove emojis and special unicode symbols
    text = remove_emojis(text)
    
    # Clean up markdown formatting symbols
    text = clean_markdown(text)
    
    # Format lists and bullet points
    text = format_lists(text)
    
    # Clean up extra whitespace
    text = clean_whitespace(text)
    
    return text.strip()

def remove_emojis(text: str) -> str:
    """Remove emoji characters from text"""
    # Emoji pattern
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"  # emoticons
        "\U0001F300-\U0001F5FF"  # symbols & pictographs
        "\U0001F680-\U0001F6FF"  # transport & map symbols
        "\U0001F1E0-\U0001F1FF"  # flags
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "\U0001F900-\U0001F9FF"  # supplemental symbols
        "\U0001FA70-\U0001FAFF"  # symbols and pictographs extended-a
        "]+",
        flags=re.UNICODE
    )
    return emoji_pattern.sub('', text)

def clean_markdown(text: str) -> str:
    """Remove or clean markdown formatting"""
    # Remove bold/italic markers but keep the text
    text = re.sub(r'\*\*\*(.+?)\*\*\*', r'\1', text)  # bold+italic
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)      # bold
    text = re.sub(r'\*(.+?)\*', r'\1', text)          # italic
    text = re.sub(r'__(.+?)__', r'\1', text)          # bold alt
    text = re.sub(r'_(.+?)_', r'\1', text)            # italic alt
    
    # Clean up code blocks
    text = re.sub(r'```[\w]*\n', '', text)
    text = re.sub(r'```', '', text)
    text = re.sub(r'`(.+?)`', r'\1', text)
    
    return text

def format_lists(text: str) -> str:
    """Format bullet points and numbered lists"""
    lines = text.split('\n')
    formatted_lines = []
    list_counter = 0
    in_list = False
    
    for line in lines:
        stripped = line.strip()
        
        # Check if line is a bullet point
        if stripped.startswith('*') or stripped.startswith('-') or stripped.startswith('•'):
            # Remove the bullet and add proper formatting
            content = re.sub(r'^[\*\-•]\s*', '', stripped)
            if content:
                list_counter += 1
                formatted_lines.append(f"{list_counter}. {content}")
                in_list = True
        elif stripped and in_list and not stripped[0].isdigit():
            # Continuation of previous point
            formatted_lines.append(f"   {stripped}")
        else:
            # Regular line
            if stripped:
                formatted_lines.append(stripped)
                in_list = False
                list_counter = 0
            else:
                formatted_lines.append('')
    
    return '\n'.join(formatted_lines)

def clean_whitespace(text: str) -> str:
    """Clean up excessive whitespace"""
    # Remove multiple consecutive blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Remove trailing whitespace from each line
    lines = [line.rstrip() for line in text.split('\n')]
    
    return '\n'.join(lines)
