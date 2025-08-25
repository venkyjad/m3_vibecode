const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for campaign generation
const SYSTEM_PROMPT = `You are a senior marketing strategist for Mohtawa, an AI-powered creative platform. 
Your role is to transform client briefs into actionable campaign strategies that are:
- Culturally sensitive and region-appropriate
- Brand-safe and professional
- Realistic and budget-conscious
- Channel-specific and format-optimized

Always consider:
- Regional cultural nuances and local preferences
- Platform-specific content requirements
- Budget constraints and realistic timelines
- Brand voice consistency
- Measurable objectives

Output structured JSON only, no additional text.`;

const USER_PROMPT_TEMPLATE = `Create a comprehensive campaign strategy for this brief:

BUSINESS OBJECTIVE: {objective}
BRAND CATEGORY: {category}  
TARGET AUDIENCE: {audience}
REGION: {region}
PRIMARY CHANNELS: {channels}
FORMATS: {formats}
TONE OF VOICE: {tone}
TIMELINE: {timeline}
BUDGET BAND: {budget}
BRAND ASSETS: {assets}

Generate exactly this JSON structure:
{
  "content_concepts": [
    {"title": "Concept 1", "description": "1-2 line description"},
    {"title": "Concept 2", "description": "1-2 line description"}, 
    {"title": "Concept 3", "description": "1-2 line description"}
  ],
  "content_plan": {
    "channels": [
      {
        "name": "channel_name",
        "formats": [
          {"format": "photo", "count": 5, "purpose": "purpose"},
          {"format": "video", "count": 3, "purpose": "purpose"}
        ]
      }
    ]
  },
  "copy_examples": {
    "ctas": ["CTA 1", "CTA 2", "CTA 3"],
    "headlines": ["Headline 1", "Headline 2"],
    "body_copy": ["Short copy example 1", "Short copy example 2"]
  },
  "tags_keywords": {
    "primary_tags": ["tag1", "tag2", "tag3"],
    "secondary_keywords": ["keyword1", "keyword2", "keyword3"],
    "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"]
  }
}`;

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
        const {
            objective,
            category,
            audience,
            region,
            channels,
            formats,
            tone,
            timeline,
            budget,
            assets
        } = req.body;

        // Validation
        if (!objective || !category || !audience) {
            return res.status(400).json({
                error: 'Missing required fields: objective, category, audience'
            });
        }

        // Create structured brief
        const brief = {
            id: require('uuid').v4(),
            timestamp: new Date().toISOString(),
            objective,
            category,
            audience,
            region: region || 'Global',
            channels: Array.isArray(channels) ? channels : [channels],
            formats: Array.isArray(formats) ? formats : [formats],
            tone: tone || 'Professional',
            timeline: timeline || '4 weeks',
            budget: budget || 'Medium',
            assets: assets || 'Logo and brand colors available'
        };

        // Generate campaign using OpenAI
        const userPrompt = USER_PROMPT_TEMPLATE
            .replace('{objective}', objective)
            .replace('{category}', category)
            .replace('{audience}', audience)
            .replace('{region}', region || 'Global')
            .replace('{channels}', Array.isArray(channels) ? channels.join(', ') : channels)
            .replace('{formats}', Array.isArray(formats) ? formats.join(', ') : formats)
            .replace('{tone}', tone || 'Professional')
            .replace('{timeline}', timeline || '4 weeks')
            .replace('{budget}', budget || 'Medium')
            .replace('{assets}', assets || 'Logo and brand colors available');

        // Validate OpenAI API key
        if (!process.env.OPENAI_API_KEY) {
            console.error('OpenAI API key not found');
            return res.status(500).json({
                error: 'OpenAI API key not configured'
            });
        }

        let completion;
        try {
            completion = await openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.7,
                max_tokens: 1500
            });
        } catch (openaiError) {
            console.error('OpenAI API error:', openaiError);
            return res.status(500).json({
                error: 'Failed to call OpenAI API',
                details: openaiError.message
            });
        }

        // Validate OpenAI response
        if (!completion || !completion.choices || !completion.choices[0] || !completion.choices[0].message) {
            console.error('Invalid OpenAI response structure:', completion);
            return res.status(500).json({
                error: 'Invalid response from OpenAI'
            });
        }

        const rawContent = completion.choices[0].message.content;
        console.log('Raw OpenAI response:', rawContent.substring(0, 200) + '...');

        let campaignDraft;
        try {
            campaignDraft = JSON.parse(rawContent);
        } catch (parseError) {
            console.error('Failed to parse OpenAI response:', parseError);
            console.error('Raw content that failed to parse:', rawContent);
            return res.status(500).json({
                error: 'Failed to generate structured campaign',
                details: 'OpenAI response was not valid JSON',
                raw_response: rawContent.substring(0, 500)
            });
        }

        res.json({
            brief,
            campaign_draft: campaignDraft
        });

    } catch (error) {
        console.error('Brief generation error:', error);
        res.status(500).json({
            error: 'Failed to generate campaign brief'
        });
    }
};
