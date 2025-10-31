const OpenAI = require('openai');
const Groq = require('groq-sdk');
const { createApi } = require('unsplash-js');
const fetch = require('node-fetch');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY,
  fetch: fetch
});

// Groq AI fallback for article generation
const callGroqGenerate = async (prompt) => {
  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: 'You are an award-winning journalist and content writer.' },
      { role: 'user', content: prompt }
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.8,
    max_tokens: 3000
  });

  return {
    text: completion.choices[0].message.content
  };
};

class AIService {
  // Research Agent - Gather sources and information
  async researchAgent(topic, keywords = []) {
    try {
      const prompt = `As a research journalist, provide comprehensive research about: "${topic}"
      ${keywords.length ? `Focus on these aspects: ${keywords.join(', ')}` : ''}
      
      Provide PLAIN TEXT research report with:
      
      KEY FACTS AND STATISTICS:
      - List important facts and data points
      
      DIFFERENT PERSPECTIVES:
      - Present various viewpoints on the topic
      
      IMPORTANT CONTEXT:
      - Background information and context
      
      SUGGESTED CREDIBLE SOURCES:
      - List reputable sources to investigate further
      
      Format as PLAIN TEXT ONLY (no JSON, no code blocks). Write it as a readable research report.`;

      let response;
      try {
        // Try OpenAI first
        response = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'You are an expert research journalist specializing in fact-finding and source verification.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        });

        return {
          success: true,
          data: response.choices[0].message.content,
          usage: response.usage
        };
      } catch (openaiError) {
        console.error('OpenAI research failed, trying Groq:', openaiError.message);
        
        // Fallback to Groq
        const groqResponse = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: 'You are an expert research journalist specializing in fact-finding and source verification.' },
            { role: 'user', content: prompt }
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.7,
          max_tokens: 2000
        });

        return {
          success: true,
          data: groqResponse.choices[0].message.content,
          usage: { provider: 'groq' }
        };
      }
    } catch (error) {
      console.error('Research agent error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Writing Agent - Generate article content
  async writingAgent(brief, sources = [], style = 'professional') {
    try {
      const sourcesContext = sources.length 
        ? `\n\nReference these sources:\n${sources.map((s, i) => `${i + 1}. ${s.title} - ${s.summary}`).join('\n')}`
        : '';

      const prompt = `Write a complete news article based on this brief: "${brief}"${sourcesContext}
      
      Style: ${style}
      
      Requirements:
      - Start with a clear, engaging headline on the first line
      - Write a strong lead paragraph
      - Include well-structured body with multiple paragraphs (at least 5-6 paragraphs)
      - Use **bold text** for section headings and subheadings
      - Add relevant quotes if sources are provided
      - Maintain journalistic objectivity and fact-based reporting
      - Make it comprehensive and detailed
      
      Format as PLAIN TEXT with markdown-style formatting:
      - First line: **Bold Headline**
      - Blank line
      - Lead paragraph (2-3 sentences)
      - Blank line
      - **Bold Subheading 1**
      - Body paragraphs (2-3 paragraphs)
      - Blank line
      - **Bold Subheading 2**
      - More body paragraphs (2-3 paragraphs)
      - Include quotes in "double quotes"
      - Separate all paragraphs with blank lines for readability
      
      Use **bold** for headings by wrapping text in double asterisks. Write a detailed, well-structured article with clear sections.`;

      let response;
      try {
        response = await openai.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: [
            { role: 'system', content: 'You are an award-winning journalist and content writer.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.8,
          max_tokens: 3000
        });

        const text = response.choices[0].message.content;

        // Try to extract JSON from the model output
        let parsed = null;
        try {
          const jsonStart = text.indexOf('{');
          if (jsonStart !== -1) {
            const jsonText = text.slice(jsonStart);
            parsed = JSON.parse(jsonText);
          }
        } catch (e) {
          // ignore JSON parse error
          parsed = null;
        }

        return {
          success: true,
          data: parsed ? JSON.stringify(parsed) : text,
          usage: response.usage
        };
      } catch (openaiError) {
        // Fallback: try Groq.ai if available
        try {
          const groqRes = await callGroqGenerate(prompt);
          // groqRes may contain 'text' or similar field
          const groqText = groqRes.text || JSON.stringify(groqRes);

          // attempt to parse JSON
          let parsedGroq = null;
          try {
            const s = groqText.indexOf('{') !== -1 ? groqText.slice(groqText.indexOf('{')) : groqText;
            parsedGroq = JSON.parse(s);
          } catch (e) {
            parsedGroq = null;
          }

          return {
            success: true,
            data: parsedGroq ? JSON.stringify(parsedGroq) : groqText,
            usage: { provider: 'groq' }
          };
        } catch (groqError) {
          return {
            success: false,
            error: openaiError.message + ' | Groq fallback error: ' + groqError.message
          };
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Fact-Checking Agent - Verify claims
  async factCheckAgent(claim, context = '') {
    try {
      // Limit claim length to avoid token limits
      const limitedClaim = claim.slice(0, 3000);
      
      const prompt = `Fact-check this claim: "${limitedClaim}"
      ${context ? `\nContext: ${context}` : ''}
      
      Provide:
      1. Verdict (true/false/partially-true/unverified)
      2. Explanation (detailed)
      3. Confidence level (0-1)
      4. Sources for verification
      5. Any caveats or nuances
      
      Format as JSON with fields: verdict, explanation, confidence, sources, caveats`;

      let response;
      try {
        // Try OpenAI first
        response = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: 'You are a fact-checker for a major news organization. Be thorough and cite sources. Always respond with valid JSON only, no markdown.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 1500,
          response_format: { type: "json_object" }
        });

        // Clean the response - remove any markdown code fences
        let content = response.choices[0].message.content;
        content = content.replace(/```json\n?/g, '')
                        .replace(/```\w*\n?/g, '')
                        .replace(/```/g, '')
                        .replace(/`/g, '')
                        .trim();

        // Extract JSON if wrapped in other text
        const jsonStart = content.indexOf('{');
        const jsonEnd = content.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          content = content.slice(jsonStart, jsonEnd + 1);
        }

        // Validate and fix JSON
        try {
          const parsed = JSON.parse(content);
          // Ensure sources is an array of strings
          if (parsed.sources && Array.isArray(parsed.sources)) {
            parsed.sources = parsed.sources.map(s => typeof s === 'string' ? s : String(s));
          }
          // Return clean stringified version
          content = JSON.stringify(parsed);
        } catch (parseError) {
          console.error('JSON parse error in fact-check, attempting fix:', parseError.message);
          // Try to fix common JSON issues
          content = content.replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
                          .replace(/\n/g, ' ')  // Remove newlines
                          .replace(/\r/g, '')   // Remove carriage returns
                          .replace(/\t/g, ' '); // Replace tabs with spaces
          
          // Try parsing again
          try {
            const parsed = JSON.parse(content);
            content = JSON.stringify(parsed);
          } catch (secondError) {
            console.error('Failed to fix JSON, returning error');
            throw new Error('Invalid JSON from AI: ' + secondError.message);
          }
        }

        return {
          success: true,
          data: content,
          usage: response.usage
        };
      } catch (openaiError) {
        console.error('OpenAI fact-check failed, trying Groq:', openaiError.message);
        
        // Fallback to Groq
        const groqResponse = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: 'You are a fact-checker for a major news organization. Be thorough and cite sources. Respond with valid JSON only.' },
            { role: 'user', content: prompt }
          ],
          model: 'llama-3.3-70b-versatile',
          temperature: 0.3,
          max_tokens: 1500
        });

        // Clean Groq response too
        let groqContent = groqResponse.choices[0].message.content;
        groqContent = groqContent.replace(/```json\n?/g, '')
                                 .replace(/```\w*\n?/g, '')
                                 .replace(/```/g, '')
                                 .replace(/`/g, '')
                                 .trim();

        // Extract JSON if wrapped
        const gStart = groqContent.indexOf('{');
        const gEnd = groqContent.lastIndexOf('}');
        if (gStart !== -1 && gEnd !== -1 && gEnd > gStart) {
          groqContent = groqContent.slice(gStart, gEnd + 1);
        }

        // Validate and fix JSON
        try {
          const parsed = JSON.parse(groqContent);
          if (parsed.sources && Array.isArray(parsed.sources)) {
            parsed.sources = parsed.sources.map(s => typeof s === 'string' ? s : String(s));
          }
          groqContent = JSON.stringify(parsed);
        } catch (parseError) {
          console.error('JSON parse error in Groq fact-check, attempting fix:', parseError.message);
          groqContent = groqContent.replace(/,(\s*[}\]])/g, '$1')
                                  .replace(/\n/g, ' ')
                                  .replace(/\r/g, '')
                                  .replace(/\t/g, ' ');
          try {
            const parsed = JSON.parse(groqContent);
            groqContent = JSON.stringify(parsed);
          } catch (secondError) {
            console.error('Failed to fix Groq JSON, returning error');
            throw new Error('Invalid JSON from Groq AI: ' + secondError.message);
          }
        }

        return {
          success: true,
          data: groqContent,
          usage: { provider: 'groq' }
        };
      }
    } catch (error) {
      console.error('Fact-check agent error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Editorial Agent - Review and improve content
  async editorialAgent(content, guidelines = {}) {
    try {
      const { tone = 'professional', targetAudience = 'general', maxLength = null } = guidelines;

      const prompt = `Review and improve this article content:

${content}

Guidelines:
- Tone: ${tone}
- Target Audience: ${targetAudience}
${maxLength ? `- Target Length: ~${maxLength} words` : ''}

Provide:
1. Overall quality score (0-10)
2. Specific improvements needed
3. Revised content (if applicable)
4. SEO suggestions
5. Readability score

Format as JSON.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are a senior editor at a prestigious news publication.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.5,
        max_tokens: 2500
      });

      return {
        success: true,
        data: response.choices[0].message.content,
        usage: response.usage
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Image Generation using Unsplash
  async generateImage(description, style = 'photorealistic') {
    try {
      // Extract keywords from description for better search
      const keywords = description.split(' ')
        .filter(word => word.length > 3)
        .slice(0, 5)
        .join(' ');

      const result = await unsplash.search.getPhotos({
        query: keywords || description,
        page: 1,
        perPage: 10,
        orientation: 'landscape'
      });

      if (result.errors) {
        throw new Error(result.errors[0]);
      }

      if (!result.response || result.response.results.length === 0) {
        return {
          success: false,
          error: 'No images found for this description'
        };
      }

      // Get the first image (best match)
      const photo = result.response.results[0];

      return {
        success: true,
        url: photo.urls.regular,
        thumbnail: photo.urls.small,
        fullSize: photo.urls.full,
        photographer: photo.user.name,
        photographerUrl: photo.user.links.html,
        downloadLocation: photo.links.download_location,
        description: photo.description || photo.alt_description,
        unsplashLink: photo.links.html
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Alternative: Use DALL-E for custom image generation
  async generateImageWithDallE(description, style = 'photorealistic') {
    try {
      const prompt = `${description}. Style: ${style}, news photography, high quality, professional`;

      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1792x1024',
        quality: 'standard'
      });

      return {
        success: true,
        url: response.data[0].url,
        revisedPrompt: response.data[0].revised_prompt
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Caption Generation
  async generateCaption(imageDescription, articleContext = '') {
    try {
      const prompt = `Generate a professional news photo caption for this image: "${imageDescription}"
      ${articleContext ? `\nArticle context: ${articleContext}` : ''}
      
      Keep it concise (1-2 sentences), informative, and journalistic.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are a photo editor writing captions for news images.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 200
      });

      return {
        success: true,
        caption: response.choices[0].message.content.trim(),
        usage: response.usage
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Search multiple images from Unsplash
  async searchImages(query, count = 5) {
    try {
      const result = await unsplash.search.getPhotos({
        query,
        page: 1,
        perPage: count,
        orientation: 'landscape'
      });

      if (result.errors) {
        throw new Error(result.errors[0]);
      }

      if (!result.response || result.response.results.length === 0) {
        return {
          success: false,
          error: 'No images found for this query'
        };
      }

      const images = result.response.results.map(photo => ({
        url: photo.urls.regular,
        thumbnail: photo.urls.small,
        fullSize: photo.urls.full,
        photographer: photo.user.name,
        photographerUrl: photo.user.links.html,
        description: photo.description || photo.alt_description,
        unsplashLink: photo.links.html,
        downloadLocation: photo.links.download_location
      }));

      return {
        success: true,
        images,
        total: result.response.total
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Source Credibility Assessment
  async assessSourceCredibility(sourceUrl, sourceContent) {
    try {
      const prompt = `Assess the credibility of this news source:
      URL: ${sourceUrl}
      Content Sample: ${sourceContent.substring(0, 500)}
      
      Evaluate:
      1. Publisher reputation
      2. Author expertise
      3. Citation quality
      4. Bias indicators
      5. Overall credibility score (0-1)
      
      Format as JSON.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are a media literacy expert assessing source credibility.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 800
      });

      return {
        success: true,
        data: response.choices[0].message.content
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new AIService();
