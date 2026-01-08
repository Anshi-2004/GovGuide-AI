# 🏛️ GovGuide AI - Government Systems & Public Services Assistant

An AI-powered application that helps citizens understand Indian government systems, processes, and public services.

## 🎯 Problem Statement

People fear government offices because:
- Systems are confusing
- Processes are not taught in schools
- Applications get rejected without clear reasons
- No guidance on document verification and corrections

## ✨ Solution

GovGuide AI provides clear explanations about:
- Why applications get rejected
- Required documents and their purpose
- Verification processes step-by-step
- How to correct mistakes in records
- RTI filing and grievance procedures
- Government portal workflows

## 🚀 Features

- **RAG-based AI**: Uses Retrieval Augmented Generation for accurate answers
- **Simple Language**: Explains complex processes in easy terms
- **Document-backed**: All answers based on official procedures
- **Interactive UI**: Clean Streamlit interface
- **Safe & Ethical**: Clear disclaimers, no legal advice

## 📋 Tech Stack

- **Frontend**: Streamlit
- **Backend**: Python, LangChain
- **LLM**: OpenAI GPT-3.5-turbo
- **Embeddings**: OpenAI text-embedding-ada-002
- **Vector DB**: FAISS
- **Libraries**: sentence-transformers, python-dotenv

## 📁 Project Structure
```
govguide-ai/
├── data/
│   ├── raw/                    # Government documents
│   └── processed/embeddings/   # Vector embeddings
├── src/
│   ├── config.py              # Configuration
│   ├── data_processor.py      # Document processing
│   ├── embeddings_generator.py # Embeddings creation
│   └── query_handler.py       # Query processing
├── app.py                     # Main Streamlit app
├── setup.py                   # Setup script
└── requirements.txt           # Dependencies
```

## 🛠️ Installation

### Step 1: Clone or Download
```bash
# Create project directory
mkdir govguide-ai
cd govguide-ai
```

### Step 2: Create Virtual Environment
```bash
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Setup Environment Variables
1. Create a `.env` file in the project root
2. Add your OpenAI API key:
```env
OPENAI_API_KEY=sk-your-actual-key-here
```

**Get API Key**: https://platform.openai.com/api-keys

### Step 5: Create Directory Structure
```bash
# Windows
mkdir data\raw data\processed\embeddings src

# Mac/Linux
mkdir -p data/raw data/processed/embeddings src
```

### Step 6: Add Document Files
Copy the 4 `.txt` files into `data/raw/`:
- scholarship_info.txt
- aadhaar_correction.txt
- income_certificate.txt
- rti_process.txt

### Step 7: Run Setup
```bash
python setup.py
```

This will create embeddings from your documents.

### Step 8: Launch Application
```bash
streamlit run app.py
```

## 📖 Usage

1. **Open the app** in your browser (usually http://localhost:8501)
2. **Type your question** in the text area
3. **Click "Get Answer"**
4. **Read the explanation** with step-by-step guidance
5. **Verify** information with official sources

## 💡 Example Questions

- "Why was my scholarship application rejected?"
- "How do I correct my name in Aadhaar?"
- "What documents are needed for income certificate?"
- "How to file an RTI application?"
- "What is the verification process for certificates?"

## ⚠️ Important Notes

### What This App DOES:
✅ Explains government processes  
✅ Guides on document requirements  
✅ Clarifies rejection reasons  
✅ Teaches how systems work  

### What This App DOES NOT Do:
❌ Provide legal advice  
❌ File applications for you  
❌ Access your personal data  
❌ Guarantee outcomes  
❌ Replace government officials  

## 🎓 For College Projects

### Project Report Tips:
1. **Title**: Government Systems Awareness AI using RAG
2. **Abstract**: Explain the problem and RAG solution
3. **Architecture**: Include diagrams (User → Frontend → RAG → LLM)
4. **Tech Stack**: Detail each technology choice
5. **Implementation**: Show code snippets
6. **Results**: Screenshots of Q&A examples
7. **Future Work**: Multi-language, more schemes, mobile app

### Presentation Tips:
- Demo live with real questions
- Show before/after (confusion → clarity)
- Explain RAG importance (accuracy)
- Discuss social impact
- Show architecture diagram

## 🔧 Customization

### Add More Documents:
1. Create new `.txt` file in `data/raw/`
2. Follow the same format as existing files
3. Run `python setup.py` again

### Change LLM Model:
Edit `src/config.py`:
```python
LLM_MODEL = "gpt-4"  # For better quality
```

### Adjust Response Style:
Edit `SYSTEM_PROMPT` in `src/config.py`

## 🐛 Troubleshooting

### "OpenAI API key not found"
→ Create `.env` file with your API key

### "Embeddings not found"
→ Run `python setup.py`

### "Module not found"
→ Install requirements: `pip install -r requirements.txt`

### Slow responses
→ Reduce `TOP_K_RESULTS` in `config.py` or use faster model

## 📊 Cost Estimation

- **Setup (one-time)**: ~$0.10-0.20
- **Per query**: ~$0.005-0.01
- **100 queries**: ~$0.50-1.00

Using GPT-4 increases cost by 10-20x.

## 🚀 Future Enhancements

1. **More Topics**: PAN, passport, voter ID, property registration
2. **Multi-language**: Hindi, regional languages
3. **Voice Interface**: Speech-to-text queries
4. **Document Upload**: Analyze rejection letters
5. **State-specific**: Separate info for each state
6. **Mobile App**: React Native version
7. **Offline Mode**: Local LLM (LLaMA)

## 📜 License

This is an educational project. Not for commercial use.

## 🤝 Contributing

This is a template project for students. Customize as needed for your college project.

## 📞 Support

For issues with the code, check:
1. Python version (3.8+)
2. All dependencies installed
3. API key is correct
4. Embeddings are created

## 👨‍💻 Author

Created as a template for college projects on AI and public service awareness.

---

**Remember**: This tool is for education only. Always verify government information with official sources.