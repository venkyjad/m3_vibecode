# Mohtawa Marketing Brief Builder & Freelancer Matching System

A thin-but-real vertical slice that transforms marketing briefs into campaign strategies and matches them with relevant creatives across the MENA region.

## 🎯 Features

### 📝 Brief Builder
- **Progressive Form**: 2-3 screen flow capturing business objectives, audience, channels, and brand requirements
- **AI Campaign Generation**: OpenAI-powered strategy creation with content concepts, channel plans, and copy examples  
- **Cultural Sensitivity**: Region-aware recommendations with brand safety guardrails
- **Structured Output**: JSON brief + campaign draft for systematic processing

### 🎨 Freelancer Matching  
- **Smart Ranking**: Hybrid scoring algorithm combining skills, themes, budget, availability, and performance
- **Rich Dataset**: 40+ diverse creatives across MENA with comprehensive profiles
- **Detailed Scoring**: Transparent score breakdown showing match reasoning
- **Real-time Filtering**: Hard filters for location, medium, and skill requirements

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- OpenAI API key

### Installation
```bash
# Clone and install
git clone <repository>
cd VJ_mohatwa
npm install

# Set up environment
cp .env.example .env
# Add your OPENAI_API_KEY to .env

# Start the server
npm start
```

Visit `http://localhost:3000` to use the application.

## 🏗️ Architecture

### Backend Structure
```
server.js                 # Express server setup
routes/
  ├── brief.js            # POST /api/brief/generate
  └── match.js            # POST /api/match
data/
  └── creatives.json      # Synthetic creative database
```

### Frontend Flow
1. **Brief Form** → Collect campaign requirements
2. **Campaign Results** → Display AI-generated strategy  
3. **Creative Matches** → Show ranked freelancer recommendations

## 🤖 AI Implementation

### Prompt Strategy
- **System Prompt**: Senior marketing strategist persona with cultural awareness
- **User Prompt**: Template-based with dynamic field substitution
- **Output**: Structured JSON with concepts, content plan, copy examples, and keywords

### Guardrails
- **Cultural Sensitivity**: Regional context and local preferences
- **Brand Safety**: Content filtering and appropriateness checks
- **Budget Reality**: Realistic scope based on budget constraints
- **Platform Optimization**: Channel-specific recommendations

## 🎯 Matching Algorithm

### Scoring Components
```javascript
Total Score = (
  skills_similarity × 0.25 +      // Skill overlap with brief
  theme_overlap × 0.20 +          // Category/industry match  
  portfolio_similarity × 0.15 +   // Semantic content similarity
  budget_fit × 0.15 +             // Rate band alignment
  availability × 0.15 +           // Current availability status
  performance × 0.10              // Rating + project history
) × language_bonus                // Arabic/English proficiency
```

### Hard Filters
- **Region Match**: Location preference filtering
- **Medium Support**: Photo/video/design capability requirements
- **Availability**: Active status filtering

## 📊 Evaluation Framework

### Quality Metrics
- **Precision@5**: ≥80% top-5 results should be relevant
- **Precision@10**: ≥70% top-10 results should be relevant  
- **NDCG@5**: ≥0.85 ranking quality score
- **User Satisfaction**: ≥4.2/5.0 average rating

### Testing Strategy
- **Synthetic Dataset**: 100 labeled brief-creative pairs
- **A/B Testing**: Algorithm variations with conversion tracking
- **Expert Annotation**: Marketing professionals provide ground truth
- **Continuous Learning**: Feedback loop for model improvement

### Cold-Start Solutions
- **New Creatives**: Content-based matching + popularity boost
- **New Categories**: Expert curation → gradual automation
- **Fallback Strategies**: Broadened criteria + human override

## 🛠️ API Endpoints

### Generate Campaign Brief
```http
POST /api/brief/generate
Content-Type: application/json

{
  "objective": "Launch new sustainable fashion line",
  "category": "fashion", 
  "audience": "Eco-conscious millennials in UAE",
  "region": "UAE",
  "channels": ["instagram", "tiktok"],
  "formats": ["photo", "video"],
  "tone": "Inspirational",
  "timeline": "4 weeks",
  "budget": "medium",
  "assets": "Logo, brand guidelines, product photos"
}
```

**Response**: Brief JSON + Campaign Draft with concepts, content plan, copy examples

### Match Freelancers
```http
POST /api/match
Content-Type: application/json

{
  "category": "fashion",
  "objective": "Launch new sustainable fashion line", 
  "region": "UAE",
  "formats": ["photo", "video"],
  "budget": "medium"
}
```

**Response**: Ranked list of top-10 creatives with detailed scoring

## 🎨 Brand Implementation

### Mohtawa Design System
- **Primary Green**: `#A4D932` - CTAs and active states
- **Dark Background**: `#1A1A1A` - Main interface  
- **Secondary Gray**: `#404040` - Form elements and cards
- **Typography**: Clean sans-serif with strategic color usage
- **UI Pattern**: Dark theme with high contrast and rounded elements

### Responsive Design
- Mobile-first approach with grid layouts
- Progressive disclosure for complex forms
- Touch-friendly interactions and spacing

## 🔄 Future Enhancements

### Short-term (Next 4 weeks)
- **Machine Learning**: Replace rule-based matching with learned embeddings
- **Advanced Filtering**: Skills-based search and availability calendar
- **Portfolio Integration**: Image similarity matching for visual style

### Medium-term (Next Quarter)  
- **Real-time Availability**: Calendar integration and booking system
- **Performance Analytics**: Campaign success tracking and optimization
- **Multi-language Support**: Arabic interface and content generation

### Long-term (Next Year)
- **Computer Vision**: Automatic portfolio analysis and style matching  
- **Predictive Modeling**: Success probability scoring and demand forecasting
- **Marketplace Features**: Bidding, contracts, and payment processing

## 📈 Business Impact

### Platform Value
- **Time to Market**: Reduce campaign planning from days to minutes
- **Match Quality**: Improve creative-brief fit through systematic scoring  
- **Market Access**: Connect MENA creatives with global opportunities
- **Scale Benefits**: Efficient matching across growing creative pool

### Success Metrics
- **Monthly Active Users**: Track platform adoption
- **Conversion Rate**: Brief → hire percentage  
- **Creative Utilization**: Work distribution fairness
- **Revenue Growth**: Commission from successful matches

---

## 📝 Trade-offs & Technical Decisions

### AI Approach
- **Chose GPT-4** over local models for quality and reliability
- **Structured prompts** over fine-tuning for faster iteration
- **Hybrid scoring** over pure ML for transparency and control

### Architecture  
- **Node.js + Express** for rapid development and JSON handling
- **Client-side rendering** for responsive interactions
- **File-based storage** for dataset (vs. database) for simplicity

### Scope Decisions
- **Progressive forms** over single-page for better UX
- **Semantic similarity** over exact matching for flexibility  
- **Regional focus** (MENA) over global for cultural accuracy
- **Synthetic data** over real profiles for privacy and speed

This implementation demonstrates product thinking through user-centered design, technical architecture through clean separation of concerns, and AI approach through systematic prompt engineering and evaluation planning.
