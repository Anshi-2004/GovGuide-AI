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
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
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