import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import { useArticleStore } from '../store/articleStore';
import toast from 'react-hot-toast';
import { 
  Save, 
  Sparkles, 
  Search, 
  CheckCircle, 
  Image as ImageIcon,
  FileText,
  Loader
} from 'lucide-react';
import api from '../utils/api';

export default function ArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentArticle, fetchArticle, createArticle, updateArticle } = useArticleStore();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [researchResult, setResearchResult] = useState(null);
  const [featuredImage, setFeaturedImage] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  
  const quillRef = useRef(null);

  useEffect(() => {
    if (id) {
      fetchArticle(id).then(article => {
        if (article) {
          setTitle(article.title);
          setContent(article.content);
          setTags(article.tags || []);
          setFeaturedImage(article.featuredImage || '');
        }
      });
    }
  }, [id]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setSaving(true);
    
    const articleData = { title, content, tags };
    
    const result = id 
      ? await updateArticle(id, articleData)
      : await createArticle(articleData);

    setSaving(false);

    if (result.success) {
      toast.success(id ? 'Article updated!' : 'Article created!');
      if (!id) {
        navigate(`/articles/${result.data.id}/edit`);
      }
    } else {
      toast.error(result.error || 'Failed to save article');
    }
  };

  const handleGenerateArticle = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title or brief');
      return;
    }

    setAiLoading(true);
    toast.loading('Generating article...', { id: 'generate' });
    
    try {
      const { data } = await api.post('/ai/generate-article', {
        brief: title,
        style: 'professional'
      });

      toast.dismiss('generate');

      if (data.success) {
        // We want plain-text article content (no HTML). The AI may return JSON or plain text.
        let generatedTitle = title;
        let generatedContent = '';
        let generatedTags = [];

        const raw = (data.data || '').toString();
        // Remove ALL markdown fences
        let clean = raw.replace(/```json\n?/g, '')
                       .replace(/```javascript\n?/g, '')
                       .replace(/```\w*\n?/g, '')
                       .replace(/```/g, '')
                       .trim();

        // Try to extract JSON object if present
        let parsed = null;
        const jsonStart = clean.indexOf('{');
        const jsonEnd = clean.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          try {
            const jsonStr = clean.slice(jsonStart, jsonEnd + 1);
            parsed = JSON.parse(jsonStr);
          } catch (e) {
            console.error('Parse error:', e);
            parsed = null;
          }
        }

        if (parsed) {
          generatedTitle = parsed.title || title;
          // Get plain text content (no HTML)
          generatedContent = (parsed.content && typeof parsed.content === 'string') ? parsed.content.trim() : '';
          generatedTags = parsed.suggestedTags || parsed.tags || [];
        } else {
          // Treat whole cleaned response as plain text
          generatedContent = clean;
        }

        // Convert markdown-style formatting to HTML for React Quill
        generatedContent = generatedContent
          // Convert **bold text** to <strong>
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          // Convert line breaks to paragraphs
          .split('\n\n')
          .map(para => para.trim())
          .filter(para => para.length > 0)
          .map(para => `<p>${para}</p>`)
          .join('');

        setTitle(generatedTitle);
        setContent(generatedContent);
        setTags(generatedTags);
        
        // Auto-save the article
        const articleData = { 
          title: generatedTitle, 
          content: generatedContent, 
          tags: generatedTags,
          featuredImage
        };
        
        const result = id 
          ? await updateArticle(id, articleData)
          : await createArticle(articleData);

        if (result.success) {
          toast.success('✓ Article generated and saved!');
          if (!id) {
            navigate(`/articles/${result.data.id}/edit`);
          }
        } else {
          toast.success('✓ Article generated!');
        }
      }
    } catch (error) {
      toast.dismiss('generate');
      toast.error('Failed to generate article');
      console.error(error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!id) {
      toast.error('Save the article first before submitting for review');
      return;
    }

    try {
      const { data } = await api.post(`/articles/${id}/submit`);
      if (data) {
        toast.success('Article submitted for review');
      }
    } catch (error) {
      toast.error('Failed to submit for review');
    }
  };

  const handleResearch = async () => {
    if (!title.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    setAiLoading(true);
    toast.loading('Researching topic...', { id: 'research' });
    
    try {
      const { data } = await api.post('/ai/research', {
        topic: title,
        articleId: id
      });

      toast.dismiss('research');

      if (data.success) {
        let researchText = '';
        if (typeof data.data === 'string') researchText = data.data;
        else researchText = JSON.stringify(data.data, null, 2);

        // Remove markdown code fences
        researchText = researchText.replace(/```json\n?/g, '')
                                   .replace(/```\w*\n?/g, '')
                                   .replace(/```/g, '')
                                   .trim();
        
        setResearchResult(researchText);
        toast.success('✓ Research complete! Results shown below article.');
      } else {
        toast.error(data.error || 'Research failed');
      }
    } catch (error) {
      toast.dismiss('research');
      console.error('Research error:', error);
      toast.error(error.response?.data?.error || 'Failed to perform research');
    } finally {
      setAiLoading(false);
    }
  };

  const handleFactCheck = async () => {
    if (!content.trim()) {
      toast.error('Please write or generate article content first');
      return;
    }

    // Extract plain text from content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || content;
    
    if (!textContent.trim()) {
      toast.error('No content to fact-check');
      return;
    }

    setAiLoading(true);
    toast.loading('Fact-checking article...', { id: 'factcheck' });
    
    try {
      const { data } = await api.post('/ai/fact-check', {
        claim: textContent.slice(0, 4000),
        context: title,
        articleId: id
      });

      toast.dismiss('factcheck');

      if (data.success) {
        let resp = (data.data || '').toString();
        
        // Remove ALL markdown code fences aggressively
        resp = resp.replace(/```json\n?/g, '')
                   .replace(/```javascript\n?/g, '')
                   .replace(/```\w*\n?/g, '')
                   .replace(/```/g, '')
                   .replace(/`/g, '')
                   .trim();

        let parsed = null;
        const jStart = resp.indexOf('{');
        const jEnd = resp.lastIndexOf('}');
        
        if (jStart !== -1 && jEnd !== -1 && jEnd > jStart) {
          try {
            const jsonStr = resp.slice(jStart, jEnd + 1);
            parsed = JSON.parse(jsonStr);
          } catch (e) {
            console.error('Fact-check parse error:', e);
            console.log('Attempted JSON:', resp.slice(jStart, jEnd + 1));
            parsed = null;
          }
        }

        if (parsed) {
          const verdict = (parsed.verdict || 'unverified').toString().toLowerCase();
          const confidence = Number(parsed.confidence || parsed.confidence_score || 0);
          const explanation = parsed.explanation || parsed.details || parsed.reasoning || 'No explanation provided';
          
          // Calculate percentage
          const percentage = Math.round(confidence * 100);

          // Verdict styles
          const verdictStyles = {
            'true': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', icon: '✓' },
            'false': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', icon: '✗' },
            'partially true': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', icon: '⚠' },
            'partially-true': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', icon: '⚠' },
            'unverified': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300', icon: '?' }
          };

          const style = verdictStyles[verdict] || verdictStyles['unverified'];

          toast.success(
            <div className="max-w-md">
              <p className="font-bold text-lg mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Fact Check Results
              </p>
              
              <div className={`px-4 py-3 rounded-lg border-2 ${style.bg} ${style.border} mb-3`}>
                <p className={`font-semibold text-lg ${style.text} mb-2`}>
                  {style.icon} {verdict.toUpperCase().replace('-', ' ')}
                </p>
                
                {/* Confidence Bar */}
                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className={style.text}>Confidence:</span>
                    <span className={`font-bold ${style.text}`}>{percentage}%</span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${style.text.replace('text', 'bg')}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-2">
                {explanation.slice(0, 300)}...
              </p>
            </div>,
            { duration: 20000 }
          );
        } else {
          // If parsing fails, show raw response
          toast.success(
            <div className="max-w-md">
              <p className="font-bold text-lg mb-2">Fact Check Complete</p>
              <div className="text-sm bg-gray-50 p-3 rounded max-h-48 overflow-y-auto">
                <pre className="whitespace-pre-wrap">{resp.slice(0, 1000)}</pre>
              </div>
            </div>,
            { duration: 20000 }
          );
        }
      } else {
        toast.error(data.error || 'Fact check failed');
      }
    } catch (error) {
      toast.dismiss('factcheck');
      console.error('Fact check error:', error);
      toast.error(error.response?.data?.error || 'Failed to fact-check article');
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    // Use article title and first part of content to generate relevant image
    let imageDescription = title;
    
    if (!imageDescription.trim()) {
      toast.error('Please add a title first to generate related images');
      return;
    }
    
    // Extract text from HTML content for better context
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    const contentSnippet = textContent.slice(0, 200).trim();
    
    // Combine title and content snippet for better image relevance
    if (contentSnippet) {
      imageDescription = `${title} - ${contentSnippet}`;
    }

    setAiLoading(true);
    try {
      const { data } = await api.post('/ai/generate-image', {
        description: imageDescription,
        style: 'photorealistic'
      });

      if (data.success) {
        // Create image HTML with photographer credit
        let imageHtml = `<img src="${data.url}" alt="${title}" style="width: 100%; max-width: 800px; height: auto; border-radius: 8px; margin-bottom: 20px;" />`;
        
        if (data.photographer) {
          imageHtml += `<p style="font-size: 12px; color: #666; font-style: italic; margin-top: -15px; margin-bottom: 20px;">Photo by <a href="${data.photographerUrl}" target="_blank" rel="noopener noreferrer">${data.photographer}</a> on <a href="${data.unsplashLink}" target="_blank" rel="noopener noreferrer">Unsplash</a></p>`;
        }
        
        // Add image at the top of content
        const newContent = imageHtml + content;
        setContent(newContent);
        
        // Auto-save with the new image
        if (id) {
          await updateArticle(id, { content: newContent });
        }
        
        toast.success('Image generated and added to article!');
      } else {
        toast.error(data.error || 'Failed to generate image');
      }
    } catch (error) {
      toast.error('Failed to generate image');
      console.error(error);
    } finally {
      setAiLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link', 'image', 'video'],
      ['blockquote', 'code-block'],
      [{ 'align': [] }],
      ['clean']
    ]
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {id ? 'Edit Article' : 'New Article'}
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-3 space-y-6">
          <div className="card">
            <input
              type="text"
              placeholder="Article Title..."
              className="w-full text-3xl font-bold border-none outline-none mb-4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              placeholder="Start writing your article..."
            />
          </div>

          {/* Tags - Auto-generated by AI, hidden from UI but saved */}
          {tags.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">Suggested Tags (Auto-generated)</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Research Results Section */}
          {researchResult && (
            <div className="card border-2 border-blue-200 bg-blue-50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Search className="w-5 h-5 mr-2 text-blue-600" />
                  Research Generated
                </h3>
                <button
                  onClick={() => setResearchResult(null)}
                  className="text-gray-500 hover:text-gray-700"
                  title="Clear research"
                >
                  ✕
                </button>
              </div>
              
              <div className="bg-white rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {researchResult}
                </pre>
              </div>
              
              <p className="text-xs text-gray-600 mt-3 italic">
                💡 Note: This research is for reference only and not saved with the article.
              </p>
            </div>
          )}
        </div>

        {/* AI Assistance Panel */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-primary-600" />
              AI Assistance
            </h3>

            {aiLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader className="w-6 h-6 animate-spin text-primary-600" />
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleGenerateArticle}
                disabled={aiLoading}
                className="w-full btn-outline flex items-center justify-center space-x-2 text-sm"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Article</span>
              </button>

              <button
                onClick={handleResearch}
                disabled={aiLoading}
                className="w-full btn-outline flex items-center justify-center space-x-2 text-sm"
                title="Get AI-powered research and sources for your topic"
              >
                <Search className="w-4 h-4" />
                <span>Research Topic</span>
              </button>

              <button
                onClick={handleFactCheck}
                disabled={aiLoading}
                className="w-full btn-outline flex items-center justify-center space-x-2 text-sm"
                title="Verify facts in your entire article"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Fact Check Article</span>
              </button>

              <button
                onClick={handleGenerateImage}
                disabled={aiLoading}
                className="w-full btn-outline flex items-center justify-center space-x-2 text-sm"
                title="Generate relevant image from article content"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Add Related Image</span>
              </button>
            </div>

            <div className="mt-6 p-3 bg-blue-50 rounded-lg text-xs text-gray-700">
              <p className="font-medium mb-1">💡 AI Features:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Research:</strong> Get sources, facts, and context for your topic</li>
                <li><strong>Generate:</strong> AI writes the full article based on your title</li>
                <li><strong>Fact Check:</strong> Verify accuracy of the entire article</li>
                <li><strong>Images:</strong> Auto-generate relevant images from content</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
