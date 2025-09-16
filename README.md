# Dream Partner 💕

A sophisticated dating and personality matching application that combines advanced emotional analysis with beautiful 3D visuals to help users find their perfect match through psychological compatibility.

## ✨ Features

- **PAD Emotion Analysis**: Advanced Pleasure-Arousal-Dominance psychological profiling
- **Interactive 3D Experience**: Immersive planetary-themed visual interface
- **Smart Questionnaires**: Likert scale and scenario-based personality assessment
- **Real-time Compatibility**: Instant emotional compatibility scoring
- **Beautiful UI**: Modern, responsive design with smooth animations
- **Comprehensive Profiling**: Detailed personality insights and recommendations

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - Modern React with latest features
- **Three.js** - 3D graphics and planetary models
- **@react-three/fiber** - React Three.js renderer
- **@react-three/drei** - Three.js helpers and components
- **Framer Motion** - Smooth animations and transitions
- **Tailwind CSS 4** - Utility-first CSS framework
- **TypeScript** - Type-safe development

### Backend
- **FastAPI** - High-performance Python web framework
- **Pydantic** - Data validation and serialization
- **Uvicorn** - ASGI server for production

### Development Tools
- **ESLint** - Code linting and quality
- **PostCSS** - CSS processing
- **TypeScript** - Static type checking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Python 3.8+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kruhela777/DreamPartner.git
   cd DreamPartner
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   uvicorn app:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start the frontend development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
DreamPartner/
├── src/                     # Frontend source code
│   ├── app/                 # Next.js App Router pages
│   │   ├── questions/       # Questionnaire interface
│   │   ├── results/         # Analysis results display
│   │   ├── profile/         # User profile pages
│   │   └── ...              # Planet-themed pages
│   └── components/          # Reusable React components
│       ├── QuestionCard.tsx # Question display component
│       ├── PADResults.tsx   # Results visualization
│       └── ...
├── backend/                 # Python FastAPI backend
│   ├── app.py              # Main API application
│   ├── core.py             # PAD analysis engine
│   ├── question_*.json     # Question databases
│   └── requirements.txt    # Python dependencies
├── public/                 # Static assets
│   ├── models/             # 3D model files
│   ├── game/               # Game assets
│   └── ...
└── package.json           # Node.js dependencies
```

## 🧠 PAD Analysis System

The core of Dream Partner is the **PAD (Pleasure-Arousal-Dominance)** emotional analysis system:

- **Pleasure**: How positive/negative an emotional state is
- **Arousal**: How active/calm an emotional state is  
- **Dominance**: How controlling/submissive an emotional state is

### Question Types

1. **Likert Scale Questions**: 1-7 scale responses with emotion mapping
2. **Scenario Questions**: Multiple choice situational responses

### Analysis Pipeline

1. User responses are collected from questionnaires
2. Each answer maps to PAD delta values
3. Deltas are aggregated and normalized
4. Primary and secondary emotions are calculated
5. Compatibility scores are generated

## 🌍 API Documentation

### Base URL
```
http://localhost:8000
```

### Endpoints

#### Get Questions
```http
GET /questions
```
Returns a randomized set of up to 10 questions for the questionnaire.

**Response:**
```json
[
  {
    "id": 1,
    "type": "likert",
    "text": "How do you feel about...",
    "options": [
      {"id": 1, "text": "1 — Very Negative"},
      {"id": 7, "text": "7 — Very Positive"}
    ]
  }
]
```

#### Analyze Responses
```http
POST /analyze
```
Analyzes user responses and returns PAD profile and emotional compatibility.

**Request Body:**
```json
{
  "answers": [
    {"question_id": 1, "answer": 5},
    {"question_id": 2, "answer": "option_a"}
  ]
}
```

**Response:**
```json
{
  "primary_emotion": "Joy",
  "secondary_emotion": "Excitement",
  "core_triad": {
    "pleasure": 0.8,
    "arousal": 0.6,
    "dominance": 0.4
  },
  "top_emotions": [
    {"name": "Joy", "score": 0.85},
    {"name": "Excitement", "score": 0.72}
  ],
  "metadata": {...}
}
```

## 🎨 3D Models and Assets

The application features beautiful 3D planetary models:
- **Solar System Planets**: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune
- **Special Models**: Sun, Moon, Heart/Cupid animations
- **Interactive Elements**: Orbital controls, dynamic lighting

## 🧪 Development

### Available Scripts

```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Backend
uvicorn app:app --reload  # Start development server
```

### Code Quality

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting with Next.js config
- **Prettier**: Code formatting (configured via ESLint)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Maintain consistent code style with ESLint
- Write descriptive commit messages
- Test your changes thoroughly
- Update documentation as needed

## 🔧 Configuration

### Environment Variables

Create `.env.local` for frontend configuration:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Backend Configuration

The backend uses FastAPI's built-in configuration. Modify `app.py` for custom settings:
- CORS settings
- API rate limiting
- Database connections
- Logging levels

## 📊 Data Files

The application includes pre-configured question databases:
- `question_likert.json`: Likert scale questions with PAD mappings
- `question_scene.json`: Scenario-based questions with emotional outcomes

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy the .next folder
```

### Backend (Railway/Heroku)
```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port $PORT
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎯 Roadmap

- [ ] User authentication and profiles
- [ ] Match recommendation algorithm
- [ ] Real-time chat system
- [ ] Mobile app development
- [ ] Advanced compatibility metrics
- [ ] Social features and community

## 💡 Support

For support and questions:
- Create an issue on GitHub
- Check existing documentation
- Review the API endpoints

---

**Made with ❤️ for finding true connections**