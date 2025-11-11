// Using const for values that won't change (Gemini API endpoint and key)
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
const API_KEY = 'AIzaSyB3BjOQ1cVK59ZpKM6pcdEFXZZ6_aT0XN8';

// ============ DOM ELEMENT SELECTION ============
// Using const for DOM references that won't be reassigned
const domElements = {
    // Tab Navigation
    tabButtons: document.querySelectorAll('.tab-btn'),
    featureContents: document.querySelectorAll('.feature-content'),

    // Ask Me Anything Feature
    questionInput: document.getElementById('questionInput'),
    askBtn: document.getElementById('askBtn'),
    answerOutput: document.getElementById('answerOutput'),
    answerContent: document.getElementById('answerContent'),

    // Quick Summarizer Feature
    textToSummarize: document.getElementById('textToSummarize'),
    summarizeBtn: document.getElementById('summarizeBtn'),
    summaryOutput: document.getElementById('summaryOutput'),
    summaryContent: document.getElementById('summaryContent'),

    // Idea Spark Feature
    ideaPrompt: document.getElementById('ideaPrompt'),
    ideaCount: document.getElementById('ideaCount'),
    generateIdeasBtn: document.getElementById('generateIdeasBtn'),
    ideasOutput: document.getElementById('ideasOutput'),
    ideasContent: document.getElementById('ideasContent'),

    // Definition Finder Feature
    termInput: document.getElementById('termInput'),
    defineBtn: document.getElementById('defineBtn'),
    definitionOutput: document.getElementById('definitionOutput'),
    definitionContent: document.getElementById('definitionContent'),

    // Loading & Error
    loadingSpinner: document.getElementById('loadingSpinner'),
    errorMessage: document.getElementById('errorMessage')
};

// ============ EVENT LISTENERS SETUP ============

// Tab Navigation with Arrow Functions (ES6)
domElements.tabButtons.forEach((button) => {
    button.addEventListener('click', (event) => {
        const feature = event.target.dataset.feature;
        switchFeature(feature);
        // console.log(event);    
    });
});

// Ask Me Anything Feature
domElements.askBtn.addEventListener('click', () => handleAskAnything());
domElements.questionInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        handleAskAnything();
    }
});

// Quick Summarizer Feature
domElements.summarizeBtn.addEventListener('click', () => handleSummarize());

// Idea Spark Feature
domElements.generateIdeasBtn.addEventListener('click', () => handleIdeaSpark());
domElements.ideaPrompt.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        handleIdeaSpark();
    }
});

// Definition Finder Feature
domElements.defineBtn.addEventListener('click', () => handleDefinition());
domElements.termInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        handleDefinition();
    }
});

// ============ FEATURE: ASK ME ANYTHING ============

/**
 * Handle "Ask Me Anything" feature
 * Demonstrates: Template literals, async/await, error handling
 */
const handleAskAnything = async () => {
    const question = domElements.questionInput.value.trim();

    if (!question) {
        showError('Please enter a question');
        return;
    }

    try {
        showLoading(true);
        
        // ES6 Template literal for constructing the prompt
        const prompt = `Answer this question clearly and concisely: ${question}`;
        const response = await callGeminiAPI(prompt);

        // Display the response
        displayOutput(domElements.answerContent, domElements.answerOutput, response);
        domElements.questionInput.value = '';
    } catch (error) {
        showError('Failed to get answer. Please try again.');
        console.error('Ask anything error:', error);
    } finally {
        showLoading(false);
    }
};

// ============ FEATURE: QUICK SUMMARIZER ============

/**
 * Handle "Quick Summarizer" feature
 * Demonstrates: Template literals, async/await, string processing
 */
const handleSummarize = async () => {
    const text = domElements.textToSummarize.value.trim();

    if (!text) {
        showError('Please paste text to summarize');
        return;
    }

    try {
        showLoading(true);

        // ES6 Template literal with multi-line string
        const prompt = `Please provide a concise summary of the following text in 2-3 sentences:

${text}

Summary:`;

        const response = await callGeminiAPI(prompt);
        displayOutput(domElements.summaryContent, domElements.summaryOutput, response);
        domElements.textToSummarize.value = '';
    } catch (error) {
        showError('Failed to summarize. Please try again.');
        console.error('Summarize error:', error);
    } finally {
        showLoading(false);
    }
};

// ============ FEATURE: IDEA SPARK ============

/**
 * Handle "Idea Spark" feature
 * Demonstrates: Template literals, async/await, numeric variables, destructuring concepts
 */
const handleIdeaSpark = async () => {
    const prompt = domElements.ideaPrompt.value.trim();
    const count = domElements.ideaCount.value;

    if (!prompt) {
        showError('Please enter a topic for ideas');
        return;
    }

    try {
        showLoading(true);

        // ES6 Template literal with dynamic count
        const geminiPrompt = `Generate exactly ${count} creative ideas about: "${prompt}"
        
Please format each idea as a numbered list with a brief description.`;

        const response = await callGeminiAPI(geminiPrompt);
        
        // Using array methods to process the response
        const formattedResponse = formatIdeasResponse(response);
        displayOutput(domElements.ideasContent, domElements.ideasOutput, formattedResponse);
        domElements.ideaPrompt.value = '';
    } catch (error) {
        showError('Failed to generate ideas. Please try again.');
        console.error('Idea spark error:', error);
    } finally {
        showLoading(false);
    }
};

// ============ FEATURE: DEFINITION FINDER ============

/**
 * Handle "Definition Finder" feature
 * Demonstrates: Template literals, async/await, API response handling
 */
const handleDefinition = async () => {
    const term = domElements.termInput.value.trim();

    if (!term) {
        showError('Please enter a term to define');
        return;
    }

    try {
        showLoading(true);

        // ES6 Template literal for detailed definition request
        const prompt = `Provide a clear and comprehensive definition of the term "${term}". 
        
Include:
1. Main definition
2. Etymology or origin (if applicable)
3. Common usage examples
4. Related concepts`;

        const response = await callGeminiAPI(prompt);
        displayOutput(domElements.definitionContent, domElements.definitionOutput, response);
        domElements.termInput.value = '';
    } catch (error) {
        showError('Failed to find definition. Please try again.');
        console.error('Definition error:', error);
    } finally {
        showLoading(false);
    }
};

// ============ GEMINI API INTEGRATION ============

/**
 * Call Gemini API with fetch()
 * Demonstrates: fetch() API, Promises, async/await, destructuring, error handling
 * 
 * @param {string} prompt - The prompt to send to Gemini
 * @returns {Promise<string>} - The AI-generated response
 */
const callGeminiAPI = async (prompt) => {
    // ES6 Template literal for building the API endpoint
    const url = `${GEMINI_API_ENDPOINT}?key=${API_KEY}`;

    // Creating the request payload
    const payload = {
        contents: [
            {
                parts: [
                    {
                        text: prompt
                    }
                ]
            }
        ]
    };

    try {
        // Using fetch() API (returns a Promise)
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        // Check if response is OK
        if (!response.ok) {
            // Try to read response body for debugging information
            let errorText = '[no body]';
            try {
                errorText = await response.text();
            } catch (e) {
                // ignore
            }

            // Log full details to console to aid debugging (status, statusText, headers, body)
            console.error('API Response status:', response.status, response.statusText);
            try {
                const contentType = response.headers.get('content-type') || 'unknown';
                console.error('API Response content-type:', contentType);
            } catch (e) {
                // ignore
            }
            console.error('API Response body:', errorText);

            // Throw an error with the status and server message included
            throw new Error(`API Error: ${response.status} - ${response.statusText} - ${errorText}`);
        }

        // Parse JSON response
        const data = await response.json();

        // ES6 Destructuring to extract the content from nested object
        const { candidates } = data;
        
        if (!candidates || candidates.length === 0) {
            throw new Error('No response from AI');
        }

        // Using destructuring and optional chaining to safely extract text
        const { content } = candidates[0];
        const { parts } = content;
        
        if (!parts || parts.length === 0) {
            throw new Error('No content in response');
        }

        const { text } = parts[0];
        return text;

    } catch (error) {
        console.error('Gemini API Error:', error);
        throw error;
    }
};

// ============ UI HELPER FUNCTIONS ============

/**
 * Switch between feature tabs
 * Demonstrates: Arrow functions, DOM manipulation, classList API
 */
const switchFeature = (featureName) => {
    // Remove active class from all tabs and content
    domElements.tabButtons.forEach((btn) => btn.classList.remove('active'));
    domElements.featureContents.forEach((content) => content.classList.remove('active'));

    // Add active class to clicked tab and corresponding content
    const activeTab = document.querySelector(`[data-feature="${featureName}"]`);
    const activeContent = document.getElementById(featureName);

    if (activeTab) activeTab.classList.add('active');
    if (activeContent) activeContent.classList.add('active');
};

/**
 * Display output in a specific section
 * Demonstrates: DOM manipulation, class management
 */
const displayOutput = (contentElement, outputSection, content) => {
    contentElement.textContent = content;
    outputSection.classList.remove('hidden');
};

/**
 * Show/hide loading spinner
 * Demonstrates: Conditional class manipulation
 */
const showLoading = (show) => {
    if (show) {
        domElements.loadingSpinner.classList.remove('hidden');
    } else {
        domElements.loadingSpinner.classList.add('hidden');
    }
};

/**
 * Show error message
 * Demonstrates: Template literals, DOM manipulation
 */
const showError = (message) => {
    domElements.errorMessage.textContent = message;
    domElements.errorMessage.classList.remove('hidden');

    // Auto-hide error after 5 seconds
    setTimeout(() => {
        domElements.errorMessage.classList.add('hidden');
    }, 5000);
};

/**
 * Show API status message
 * Demonstrates: Arrow functions, conditional styling
 */
const showApiStatus = (message, type) => {
    domElements.apiStatus.textContent = message;
    domElements.apiStatus.className = `api-status ${type}`;
};

/**
 * Format ideas response from Gemini
 * Demonstrates: Array methods (split, map), string manipulation
 */
const formatIdeasResponse = (response) => {
    // Using split to separate lines and filter empty ones
    const lines = response.split('\n').filter((line) => line.trim());

    // Using map to add formatting to each idea
    // ES6 Arrow function in array method
    const formatted = lines
        .map((line, index) => {
            // If line doesn't start with a number, add one
            if (!/^\d+\./.test(line)) {
                return `${index + 1}. ${line}`;
            }
            return line;
        })
        .join('\n');

    return formatted;
};

// ============ INITIALIZATION ============

/**
 * Initialize the application on page load
 * Demonstrates: DOMContentLoaded event, initialization pattern
 */
const initializeApp = () => {
    console.log('🚀 AI Content Generator initialized');
    console.log('✓ API Key configured automatically');
    
    // Set first feature as active
    switchFeature('ask-anything');
};

// Run initialization when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

// ============ EXPORT FOR DEBUGGING ============
// Make important functions accessible in console for debugging
window.ContentGeneratorApp = {
    callGeminiAPI,
    formatIdeasResponse
};