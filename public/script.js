class MohtawaBriefBuilder {
    constructor() {
        this.currentScreen = 'briefForm';
        this.briefData = null;
        this.campaignData = null;
        this.creativesData = null;
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Form submission
        const briefForm = document.getElementById('briefBuilderForm');
        briefForm.addEventListener('submit', (e) => this.handleBriefSubmission(e));

        // Navigation buttons
        document.getElementById('backToForm').addEventListener('click', () => this.showScreen('briefForm'));
        document.getElementById('backToCampaign').addEventListener('click', () => this.showScreen('campaignResults'));
        document.getElementById('findCreatives').addEventListener('click', () => this.findCreatives());
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;
    }

    showLoading(message = 'Processing...') {
        const overlay = document.getElementById('loadingOverlay');
        const messageEl = overlay.querySelector('p');
        messageEl.textContent = message;
        overlay.classList.add('active');
    }

    hideLoading() {
        document.getElementById('loadingOverlay').classList.remove('active');
    }

    async handleBriefSubmission(e) {
        e.preventDefault();
        
        try {
            this.showLoading('Generating your campaign strategy...');
            
            // Collect form data
            const formData = new FormData(e.target);
            this.briefData = this.processFormData(formData);
            
            // Validate required fields
            if (!this.briefData.objective || !this.briefData.category || !this.briefData.audience) {
                throw new Error('Please fill in all required fields');
            }

            // Generate campaign
            const response = await fetch('/api/brief/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.briefData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to generate campaign');
            }

            const result = await response.json();
            this.campaignData = result.campaign_draft;
            
            this.displayCampaignResults();
            this.showScreen('campaignResults');
            
        } catch (error) {
            console.error('Error generating campaign:', error);
            alert('Error generating campaign: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    processFormData(formData) {
        const data = {};
        
        // Simple fields
        data.objective = formData.get('objective');
        data.category = formData.get('category');
        data.audience = formData.get('audience');
        data.region = formData.get('region');
        data.tone = formData.get('tone');
        data.budget = formData.get('budget');
        data.timeline = formData.get('timeline');
        data.assets = formData.get('assets');

        // Array fields (checkboxes)
        data.channels = formData.getAll('channels');
        data.formats = formData.getAll('formats');

        return data;
    }

    displayCampaignResults() {
        const container = document.getElementById('campaignContent');
        
        const html = `
            <div class="concept-grid">
                ${this.campaignData.content_concepts.map(concept => `
                    <div class="concept-card">
                        <h4>${concept.title}</h4>
                        <p>${concept.description}</p>
                    </div>
                `).join('')}
            </div>

            <div class="content-plan">
                <h3>Content Plan</h3>
                ${this.campaignData.content_plan.channels.map(channel => `
                    <div class="channel-item">
                        <div class="channel-name">${channel.name}</div>
                        <div class="format-list">
                            ${channel.formats.map(format => `
                                <div class="format-item">
                                    ${format.count}× ${format.format} (${format.purpose})
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="copy-examples">
                <div class="copy-section">
                    <h4>Call-to-Actions</h4>
                    <ul>
                        ${this.campaignData.copy_examples.ctas.map(cta => `<li>"${cta}"</li>`).join('')}
                    </ul>
                </div>
                
                <div class="copy-section">
                    <h4>Headlines</h4>
                    <ul>
                        ${this.campaignData.copy_examples.headlines.map(headline => `<li>"${headline}"</li>`).join('')}
                    </ul>
                </div>
                
                <div class="copy-section">
                    <h4>Body Copy Examples</h4>
                    <ul>
                        ${this.campaignData.copy_examples.body_copy.map(copy => `<li>"${copy}"</li>`).join('')}
                    </ul>
                </div>
            </div>

            <div class="copy-section">
                <h4>Keywords & Tags</h4>
                <div style="margin-bottom: 1rem;">
                    <strong>Primary Tags:</strong>
                    <div class="tag-list" style="margin-top: 0.5rem;">
                        ${this.campaignData.tags_keywords.primary_tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
                <div style="margin-bottom: 1rem;">
                    <strong>Keywords:</strong>
                    <div class="tag-list" style="margin-top: 0.5rem;">
                        ${this.campaignData.tags_keywords.secondary_keywords.map(keyword => `<span class="tag">${keyword}</span>`).join('')}
                    </div>
                </div>
                <div>
                    <strong>Hashtags:</strong>
                    <div class="tag-list" style="margin-top: 0.5rem;">
                        ${this.campaignData.tags_keywords.hashtags.map(hashtag => `<span class="tag">${hashtag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
    }

    async findCreatives() {
        try {
            this.showLoading('Finding matching creatives...');

            const response = await fetch('/api/match', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.briefData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to find creatives');
            }

            this.creativesData = await response.json();
            this.displayCreativeMatches();
            this.showScreen('creativeMatches');

        } catch (error) {
            console.error('Error finding creatives:', error);
            alert('Error finding creatives: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    displayCreativeMatches() {
        const container = document.getElementById('matchesContent');
        
        const html = `
            <div class="match-summary">
                <h3>Found ${this.creativesData.filtered_candidates} matching creatives</h3>
                <p>Filtered from ${this.creativesData.total_candidates} total candidates for ${this.creativesData.brief_summary.category} in ${this.creativesData.brief_summary.region}</p>
            </div>

            <div class="creative-grid">
                ${this.creativesData.top_matches.map(match => `
                    <div class="creative-card">
                        <div class="creative-header">
                            <div class="creative-info">
                                <h4>${match.name}</h4>
                                <div class="creative-location">${match.location}</div>
                            </div>
                            <div class="match-score">${Math.round(match.total_score * 100)}% Match</div>
                        </div>

                        <div class="creative-details">
                            <div class="detail-group">
                                <h5>Skills</h5>
                                <div class="tag-list">
                                    ${match.skills.slice(0, 3).map(skill => `<span class="tag">${skill}</span>`).join('')}
                                </div>
                            </div>
                            
                            <div class="detail-group">
                                <h5>Mediums</h5>
                                <div class="tag-list">
                                    ${match.mediums.map(medium => `<span class="tag">${medium}</span>`).join('')}
                                </div>
                            </div>
                            
                            <div class="detail-group">
                                <h5>Themes</h5>
                                <div class="tag-list">
                                    ${match.themes.slice(0, 3).map(theme => `<span class="tag">${theme}</span>`).join('')}
                                </div>
                            </div>
                            
                            <div class="detail-group">
                                <h5>Rate & Availability</h5>
                                <div>
                                    <span class="tag">${match.day_rate_band} rate</span>
                                    <span class="availability ${match.availability}">${match.availability}</span>
                                </div>
                            </div>
                        </div>

                        <div class="creative-stats">
                            <div class="stat-item">
                                <div class="stat-value">${match.rating}</div>
                                <div class="stat-label">Rating</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${match.completed_projects}</div>
                                <div class="stat-label">Projects</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${Math.round(match.score_breakdown.skills_similarity * 100)}%</div>
                                <div class="stat-label">Skills Match</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-value">${Math.round(match.score_breakdown.budget_fit * 100)}%</div>
                                <div class="stat-label">Budget Fit</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        container.innerHTML = html;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MohtawaBriefBuilder();
});
