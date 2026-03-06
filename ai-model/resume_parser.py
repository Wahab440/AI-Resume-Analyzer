import sys
import json
from pdfminer.high_level import extract_text
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re
import os
import pandas as pd
from collections import Counter

# Load spaCy model
nlp = spacy.load('en_core_web_sm')

skills_list = [
"python",
"java",
"react",
"node",
"mongodb",
"sql",
"machine learning",
"javascript",
"html",
"css",
"data science",
"artificial intelligence",
"nlp",
"deep learning",
"c++",
"c#",
"php",
"ruby",
"aws",
"docker",
"kubernetes",
"git",
"agile",
"scrum"
]

recommended_skills = [
"python", "machine learning", "data science", "javascript", "react", "node", "sql", "aws"
]

# Load dataset if available and expand skills
# avoid parsing entire concatenated text at once (spaCy max_length limit)
nlp.max_length = 2000000  # increase limit to handle moderately large strings

dataset_path = os.path.join(os.path.dirname(__file__), '..', 'dataset', 'Resume.csv')
cache_path = os.path.join(os.path.dirname(__file__), '..', 'dataset', 'skills_cache.json')

if os.path.exists(cache_path):
    with open(cache_path, 'r') as f:
        cached_skills = json.load(f)
    skills_list.extend(cached_skills)
    skills_list = list(set(skills_list))
else:
    if os.path.exists(dataset_path):
        df = pd.read_csv(dataset_path)
        tech_terms = []
        # process a sample of resumes to speed up initial processing
        sample_size = min(100, len(df))  # process up to 100 resumes
        for text in df['Resume_str'].dropna().sample(sample_size):
            try:
                for token in nlp(text.lower()):
                    if token.pos_ in ['NOUN', 'PROPN'] and len(token.text) > 2:
                        tech_terms.append(token.text)
            except Exception:
                # skip texts that are too large
                continue
        common_terms = [word for word, count in Counter(tech_terms).most_common(100) if word not in ['experience', 'work', 'project', 'company', 'team', 'development', 'management', 'system', 'application', 'service']]
        skills_list.extend(common_terms)
        skills_list = list(set(skills_list))  # Remove duplicates
        # Save to cache
        with open(cache_path, 'w') as f:
            json.dump(common_terms, f)

def extract_text_from_pdf(file_path):
    return extract_text(file_path)

def extract_skills(text):
    doc = nlp(text.lower())
    found = []
    for skill in skills_list:
        if skill in text.lower():
            found.append(skill)
    # Also extract potential skills using POS tagging
    for token in doc:
        if token.pos_ in ['NOUN', 'PROPN'] and len(token.text) > 2:
            if token.text in skills_list and token.text not in found:
                found.append(token.text)
    return list(set(found))  # Remove duplicates

def calculate_score(skills):
    base_score = len(skills) * 10
    # Bonus for high-demand skills
    high_demand = ["python", "machine learning", "javascript", "react", "aws"]
    bonus = sum(1 for skill in skills if skill in high_demand) * 5
    score = min(base_score + bonus, 100)
    return score

def extract_experience(text):
    # Simple regex for experience years
    exp_pattern = r'(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?experience'
    matches = re.findall(exp_pattern, text, re.IGNORECASE)
    if matches:
        return max(int(m) for m in matches)
    return 0

def extract_education(text):
    education_keywords = ['bachelor', 'master', 'phd', 'degree', 'university', 'college']
    return any(keyword in text.lower() for keyword in education_keywords)

def generate_suggestions(text, skills, score, experience, has_education):
    suggestions = []
    if score < 50:
        suggestions.append("Consider adding more technical skills to your resume.")
    missing_recommended = [s for s in recommended_skills if s not in skills]
    if missing_recommended:
        suggestions.append(f"Add skills like {', '.join(missing_recommended[:3])} to improve your profile.")
    if experience < 2:
        suggestions.append("Highlight any relevant experience or projects.")
    if not has_education:
        suggestions.append("Include your educational background.")
    if len(skills) < 5:
        suggestions.append("Expand your skills section with more technologies.")
    if not any(word in text.lower() for word in ['project', 'achievement']):
        suggestions.append("Add a projects or achievements section.")
    return suggestions

# Main processing
file_path = sys.argv[1]
text = extract_text_from_pdf(file_path)
skills = extract_skills(text)
score = calculate_score(skills)
experience = extract_experience(text)
has_education = extract_education(text)
suggestions = generate_suggestions(text, skills, score, experience, has_education)

result = {
    "score": score,
    "skills": skills,
    "experience_years": experience,
    "has_education": has_education,
    "suggestions": suggestions
}

print(json.dumps(result))