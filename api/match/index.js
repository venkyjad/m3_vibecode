const fs = require('fs').promises;
const path = require('path');

// Helper function to load creatives data
async function loadCreatives() {
    const creativesPath = path.join(process.cwd(), 'data/creatives.json');
    const data = await fs.readFile(creativesPath, 'utf8');
    return JSON.parse(data);
}

// Calculate semantic similarity score (simplified)
function calculateSemanticSimilarity(briefTags, portfolioTags) {
    if (!briefTags.length || !portfolioTags.length) return 0;
    
    const briefSet = new Set(briefTags.map(tag => tag.toLowerCase()));
    const portfolioSet = new Set(portfolioTags.map(tag => tag.toLowerCase()));
    
    const intersection = [...briefSet].filter(tag => portfolioSet.has(tag));
    const union = new Set([...briefSet, ...portfolioSet]);
    
    return intersection.length / union.size; // Jaccard similarity
}

// Calculate theme/category overlap
function calculateThemeOverlap(briefCategory, creativeThemes) {
    const categoryMap = {
        'fashion': ['fashion', 'luxury', 'beauty', 'lifestyle'],
        'food': ['food', 'restaurant', 'hospitality', 'lifestyle'],
        'technology': ['technology', 'startup', 'innovation', 'corporate'],
        'real_estate': ['real_estate', 'architecture', 'luxury', 'interior'],
        'travel': ['travel', 'tourism', 'adventure', 'landscape', 'culture'],
        'automotive': ['automotive', 'luxury', 'commercial'],
        'healthcare': ['healthcare', 'education', 'social_impact'],
        'finance': ['finance', 'corporate', 'technology']
    };
    
    const relatedThemes = categoryMap[briefCategory.toLowerCase()] || [briefCategory.toLowerCase()];
    const overlap = creativeThemes.filter(theme => 
        relatedThemes.includes(theme.toLowerCase())
    ).length;
    
    return Math.min(overlap / relatedThemes.length, 1);
}

// Calculate budget fit score
function calculateBudgetFit(briefBudget, creativeRate) {
    const budgetMap = {
        'low': { min: 0, max: 2, ideal: 1 },
        'medium': { min: 1, max: 3, ideal: 2 },
        'high': { min: 2, max: 4, ideal: 3 }
    };
    
    const rateMap = {
        'low': 1,
        'medium': 2,
        'high': 3
    };
    
    const budget = budgetMap[briefBudget.toLowerCase()] || budgetMap['medium'];
    const rate = rateMap[creativeRate.toLowerCase()] || 2;
    
    if (rate >= budget.min && rate <= budget.max) {
        return 1 - Math.abs(rate - budget.ideal) / (budget.max - budget.min);
    }
    
    return Math.max(0, 1 - Math.abs(rate - budget.ideal) / 4);
}

// Calculate availability score
function calculateAvailabilityScore(availability) {
    const availabilityMap = {
        'available': 1.0,
        'busy': 0.3,
        'unavailable': 0.0
    };
    
    return availabilityMap[availability.toLowerCase()] || 0.5;
}

// Calculate performance score
function calculatePerformanceScore(rating, completedProjects) {
    const ratingScore = Math.min(rating / 5, 1);
    const experienceScore = Math.min(completedProjects / 200, 1);
    
    return (ratingScore * 0.7) + (experienceScore * 0.3);
}

// Main matching function
function calculateCreativeScore(brief, creative) {
    const scores = {};
    
    // 1. Hard filters
    if (brief.region && brief.region !== 'Global') {
        const regionMatch = creative.country.toLowerCase().includes(brief.region.toLowerCase()) ||
                          creative.city.toLowerCase().includes(brief.region.toLowerCase());
        if (!regionMatch) {
            scores.region_filter = 0;
            return { ...scores, total: 0, filtered_out: 'region' };
        }
    }
    scores.region_filter = 1;
    
    // 2. Medium/format match
    const requiredMediums = Array.isArray(brief.formats) ? brief.formats : [brief.formats];
    const mediumMatch = requiredMediums.some(format => 
        creative.mediums.includes(format.toLowerCase())
    );
    
    if (!mediumMatch) {
        scores.medium_filter = 0;
        return { ...scores, total: 0, filtered_out: 'medium' };
    }
    scores.medium_filter = 1;
    
    // 3. Relevance scores (0-1)
    
    // Skills overlap
    const briefSkills = [
        ...requiredMediums,
        brief.category,
        ...(brief.objective ? brief.objective.split(' ').slice(0, 3) : [])
    ];
    scores.skills_similarity = calculateSemanticSimilarity(briefSkills, creative.skills);
    
    // Theme/category overlap
    scores.theme_overlap = calculateThemeOverlap(brief.category, creative.themes);
    
    // Portfolio semantic similarity
    const briefTags = [
        brief.category,
        brief.objective,
        ...(Array.isArray(brief.channels) ? brief.channels : [brief.channels])
    ].filter(Boolean);
    scores.portfolio_similarity = calculateSemanticSimilarity(briefTags, creative.portfolio_tags);
    
    // Budget fit
    scores.budget_fit = calculateBudgetFit(brief.budget || 'medium', creative.day_rate_band);
    
    // Availability
    scores.availability = calculateAvailabilityScore(creative.availability);
    
    // Performance/reputation
    scores.performance = calculatePerformanceScore(creative.rating, creative.completed_projects_count);
    
    // Language match (bonus)
    const hasEnglish = creative.languages.some(lang => lang.toLowerCase() === 'english');
    const hasArabic = creative.languages.some(lang => lang.toLowerCase() === 'arabic');
    scores.language_bonus = (hasEnglish && hasArabic) ? 1.1 : (hasEnglish || hasArabic) ? 1.0 : 0.8;
    
    // Calculate weighted total score
    const weights = {
        skills_similarity: 0.25,
        theme_overlap: 0.20,
        portfolio_similarity: 0.15,
        budget_fit: 0.15,
        availability: 0.15,
        performance: 0.10
    };
    
    scores.total = Object.entries(weights).reduce((total, [key, weight]) => {
        return total + (scores[key] * weight);
    }, 0) * scores.language_bonus;
    
    return scores;
}

module.exports = async (req, res) => {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const brief = req.body;
        
        // Validation
        if (!brief || !brief.category || !brief.objective) {
            return res.status(400).json({
                error: 'Invalid brief format. Required: category, objective'
            });
        }
        
        // Load creatives
        const creatives = await loadCreatives();
        
        // Calculate scores for each creative
        const scoredCreatives = creatives.map(creative => {
            const scores = calculateCreativeScore(brief, creative);
            return {
                creative,
                scores,
                total_score: scores.total
            };
        });
        
        // Filter out hard-filtered creatives and sort by score
        const rankedCreatives = scoredCreatives
            .filter(item => item.scores.total > 0)
            .sort((a, b) => b.total_score - a.total_score)
            .slice(0, 10); // Top 10
        
        // Format response
        const results = rankedCreatives.map((item, index) => ({
            rank: index + 1,
            creative_id: item.creative.id,
            name: item.creative.name,
            location: `${item.creative.city}, ${item.creative.country}`,
            skills: item.creative.skills,
            mediums: item.creative.mediums,
            themes: item.creative.themes,
            day_rate_band: item.creative.day_rate_band,
            rating: item.creative.rating,
            completed_projects: item.creative.completed_projects_count,
            availability: item.creative.availability,
            total_score: Math.round(item.total_score * 100) / 100,
            score_breakdown: {
                skills_similarity: Math.round(item.scores.skills_similarity * 100) / 100,
                theme_overlap: Math.round(item.scores.theme_overlap * 100) / 100,
                portfolio_similarity: Math.round(item.scores.portfolio_similarity * 100) / 100,
                budget_fit: Math.round(item.scores.budget_fit * 100) / 100,
                availability: Math.round(item.scores.availability * 100) / 100,
                performance: Math.round(item.scores.performance * 100) / 100,
                language_bonus: Math.round(item.scores.language_bonus * 100) / 100
            }
        }));
        
        res.json({
            brief_summary: {
                category: brief.category,
                region: brief.region || 'Global',
                formats: brief.formats,
                budget: brief.budget || 'medium'
            },
            total_candidates: creatives.length,
            filtered_candidates: rankedCreatives.length,
            top_matches: results
        });
        
    } catch (error) {
        console.error('Matching error:', error);
        res.status(500).json({
            error: 'Failed to match creatives'
        });
    }
};
