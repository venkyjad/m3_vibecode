# Evaluation Plan: Mohtawa Marketing Brief & Freelancer Matching System

## Overview
This document outlines the evaluation strategy for both the AI-generated marketing briefs and the freelancer matching algorithm, including precision metrics, cold-start approaches, and human-in-the-loop curation.

## 1. Marketing Brief Generation Evaluation

### 1.1 AI Quality Metrics
- **Relevance Score**: Human evaluators rate brief relevance (1-5 scale) across:
  - Business objective alignment
  - Channel-format consistency
  - Audience targeting accuracy
  - Regional/cultural appropriateness
- **Completeness**: Percentage of required fields populated with actionable content
- **Brand Safety**: Automated screening for inappropriate content using keyword filters
- **Cultural Sensitivity**: Regional expert review for market-specific campaigns

### 1.2 Prompt Strategy & Guardrails

#### System Prompt Design
```
Role: Senior marketing strategist for Mohtawa AI platform
Constraints: 
- Cultural sensitivity for MENA region
- Brand safety compliance
- Budget-realistic recommendations
- Platform-specific content optimization
Output: Structured JSON only
```

#### User Prompt Template
- Dynamic field substitution from brief form
- Context-aware recommendations based on:
  - Business category → relevant themes
  - Target region → cultural considerations  
  - Budget band → realistic scope
  - Timeline → achievable milestones

#### Guardrails Implementation
1. **Content Filtering**: Pre/post-generation screening for:
   - Religious sensitivity
   - Political content
   - Inappropriate language
   - Competitive brand mentions

2. **Regional Adaptation**: 
   - Language tone adjustments (formal vs. casual by region)
   - Cultural holiday/event integration
   - Local platform preference weighting

3. **Budget Reality Checks**:
   - Content volume aligned with budget bands
   - Realistic timeline suggestions
   - Platform-specific cost considerations

## 2. Freelancer Matching Evaluation

### 2.1 Precision Metrics

#### Precision@K Evaluation
- **P@5**: Percentage of top-5 results marked as "relevant" by human evaluators
- **P@10**: Percentage of top-10 results marked as "relevant" by human evaluators
- **Target Benchmarks**: 
  - P@5 ≥ 80% (4/5 results should be viable)
  - P@10 ≥ 70% (7/10 results should be viable)

#### NDCG@K (Normalized Discounted Cumulative Gain)
- **NDCG@5**: Weighted relevance score considering ranking position
- **NDCG@10**: Extended ranking quality assessment
- **Target Benchmarks**:
  - NDCG@5 ≥ 0.85
  - NDCG@10 ≥ 0.80

### 2.2 Evaluation Dataset Creation

#### Synthetic Labeled Dataset (100 examples)
```json
{
  "brief_id": "brief_001",
  "brief": { /* brief data */ },
  "relevance_labels": {
    "cr001": 5, // Perfect match
    "cr002": 4, // Strong match  
    "cr003": 3, // Moderate match
    "cr004": 2, // Weak match
    "cr005": 1  // Not relevant
  },
  "ground_truth_ranking": ["cr001", "cr002", "cr003", ...],
  "evaluator_notes": "Layla Hassan perfect for luxury fashion in UAE..."
}
```

#### Expert Annotation Process
1. **3 Marketing Experts** evaluate each brief-creative pairing
2. **Inter-annotator Agreement**: Cohen's kappa ≥ 0.7 required
3. **Disagreement Resolution**: Senior evaluator makes final decision
4. **Quality Control**: 10% re-evaluation for consistency

### 2.3 Scoring Algorithm Components

#### Current Weighted Scoring
```
Total Score = (
  skills_similarity × 0.25 +
  theme_overlap × 0.20 + 
  portfolio_similarity × 0.15 +
  budget_fit × 0.15 +
  availability × 0.15 +
  performance × 0.10
) × language_bonus
```

#### Feature Ablation Testing
- Remove each component to measure impact on P@K
- Identify most/least important factors
- Optimize weights through grid search

### 2.4 A/B Testing Framework

#### Test Variations
- **Algorithm A**: Current semantic + rule-based hybrid
- **Algorithm B**: Pure machine learning embeddings  
- **Algorithm C**: Human expert rankings (gold standard)
- **Algorithm D**: Random baseline

#### Success Metrics
- **User Engagement**: Click-through rates on recommended creatives
- **Conversion Rate**: Percentage of brief → creative hire conversions
- **User Satisfaction**: Post-engagement survey ratings
- **Time to Match**: Average time to find suitable creative

## 3. Cold-Start Strategy

### 3.1 New Creative Onboarding

#### Profile Completeness Scoring
```javascript
const completenessScore = {
  basic_info: 0.2,        // Name, location, contact
  portfolio_samples: 0.3,  // 5+ work examples  
  skills_tags: 0.2,       // Comprehensive skill listing
  rate_availability: 0.1,  // Pricing and schedule
  past_work: 0.2          // Client testimonials/reviews
};
```

#### Bootstrap Recommendations
1. **Content-Based**: Match based on skills/themes only
2. **Collaborative Filtering**: "Creatives like this also work on..."
3. **Popularity Boost**: Surface new creatives for visibility
4. **Regional Preferences**: Prioritize local market expertise

### 3.2 New Brief Categories

#### Category Expansion Process
1. **Keyword Mapping**: Map new categories to existing themes
2. **Expert Curation**: Manual creative recommendations for first 10 briefs
3. **Feedback Loop**: Use initial matches to train category model
4. **Gradual Automation**: Increase algorithm confidence over time

#### Fallback Strategies
- **Generic Matches**: Broaden search criteria for edge cases
- **Human Override**: Manual curator can promote/demote creatives
- **User Feedback**: "Was this match helpful?" → improve future results

## 4. Human-in-the-Loop Curation

### 4.1 Curator Dashboard Features

#### Match Quality Monitoring
- **Real-time Metrics**: P@K scores, user satisfaction trends
- **Outlier Detection**: Flag unusually low-scoring matches
- **Performance Alerts**: Notification when metrics drop below thresholds

#### Manual Override Controls
- **Boost/Bury**: Adjust individual creative rankings
- **Block Combinations**: Prevent specific brief-creative matches
- **Quality Tags**: Mark creatives as "verified expert" or "new talent"

### 4.2 Continuous Learning Loop

#### Feedback Integration
```javascript
const feedbackLoop = {
  user_ratings: 0.4,      // Explicit thumbs up/down
  engagement_metrics: 0.3, // Time spent, clicks
  conversion_data: 0.2,    // Actual hires
  curator_overrides: 0.1   // Expert adjustments
};
```

#### Model Retraining Schedule
- **Weekly**: Incorporate new feedback data
- **Monthly**: Full model retraining with expanded dataset  
- **Quarterly**: Algorithm architecture review and optimization

## 5. Success Metrics & KPIs

### 5.1 System-Level Metrics
- **Match Accuracy**: P@5 ≥ 80%, NDCG@5 ≥ 0.85
- **User Satisfaction**: Average rating ≥ 4.2/5.0
- **Time to Match**: Average ≤ 2 minutes end-to-end
- **Conversion Rate**: Brief → hire ≥ 15%

### 5.2 Business Impact
- **Platform Adoption**: Monthly active users growth
- **Creative Utilization**: Distribution of work across creative pool
- **Revenue Impact**: Commission from successful matches
- **Market Expansion**: Geographic/vertical growth metrics

### 5.3 Quality Assurance
- **Brand Safety**: Zero tolerance for inappropriate content
- **Cultural Sensitivity**: Expert review for regional campaigns
- **Algorithm Bias**: Fairness across creative demographics
- **Performance Equity**: Equal opportunity for new vs. established creatives

## 6. Implementation Roadmap

### Phase 1: Baseline (Weeks 1-2)
- Deploy current algorithm with basic evaluation
- Collect initial user feedback and conversion data
- Establish curator workflow for manual overrides

### Phase 2: Optimization (Weeks 3-4) 
- Implement A/B testing framework
- Fine-tune scoring weights based on early results
- Expand synthetic evaluation dataset

### Phase 3: Scale (Weeks 5-8)
- Full precision@K evaluation with human annotators
- Cold-start strategy implementation  
- Automated quality monitoring dashboard

### Phase 4: Intelligence (Weeks 9-12)
- Machine learning model integration
- Advanced embedding-based similarity
- Predictive availability and success scoring
