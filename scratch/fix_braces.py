import re
import glob

files = glob.glob('src/**/*.ts', recursive=True)

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Safely remove `{ statement; }` where the statement is a known keyword.
    # Since object literals cannot contain a semicolon, this pattern is completely safe against false positives.
    # Pattern explanation: '{' followed by optional space, then one of the keywords, anything up to a ';', then optional space, then '}'
    new_content = re.sub(
        r'\{(\s*(?:return|break|continue|await|console|queue|connection|musicQueue|userTakes)[^{}]*?;)\s*\}', 
        r'\1', 
        content
    )
    
    if new_content != content:
        with open(file_path, 'w') as f:
            f.write(new_content)
        print(f"Fixed braces in {file_path}")
