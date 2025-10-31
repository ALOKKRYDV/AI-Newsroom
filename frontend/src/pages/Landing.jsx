import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Sparkles, 
  Users, 
  Shield, 
  Zap, 
  TrendingUp,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">AI Newsroom</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-primary-600 font-medium">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-32 bg-gradient-to-br from-primary-50 via-white to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
              The Future of
              <span className="text-primary-600"> Collaborative Journalism</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Harness the power of AI to research, write, fact-check, and publish 
              professional articles with your team in real-time.
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/register" className="btn-primary text-lg px-8 py-4 flex items-center space-x-2">
                <span>Start Writing for Free</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="btn-outline text-lg px-8 py-4">
                Sign In
              </Link>
            </div>
            
            <div className="mt-16">
              <div className="relative rounded-xl shadow-2xl overflow-hidden border-4 border-primary-200">
                <img 
                  src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=600&fit=crop" 
                  alt="AI Newsroom Dashboard"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Create Amazing Content
            </h2>
            <p className="text-xl text-gray-600">
              Powered by cutting-edge AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI-Powered Writing</h3>
              <p className="text-gray-600">
                Generate high-quality articles with AI assistance. Get suggestions, 
                research topics, and improve your writing instantly.
              </p>
            </div>

            <div className="card hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real-time Fact Checking</h3>
              <p className="text-gray-600">
                Verify claims instantly with AI-powered fact-checking. 
                Ensure accuracy and credibility in every article.
              </p>
            </div>

            <div className="card hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Team Collaboration</h3>
              <p className="text-gray-600">
                Work together seamlessly with real-time updates, 
                comments, and editorial workflows.
              </p>
            </div>

            <div className="card hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Research</h3>
              <p className="text-gray-600">
                Let AI gather sources, statistics, and perspectives 
                on any topic in seconds.
              </p>
            </div>

            <div className="card hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Rich Text Editor</h3>
              <p className="text-gray-600">
                Professional editing tools with media embedding, 
                formatting, and version control.
              </p>
            </div>

            <div className="card hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Editorial Workflow</h3>
              <p className="text-gray-600">
                Manage drafts, reviews, and publishing with role-based 
                permissions and approval flows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              From idea to published article in minutes
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Create Topic</h3>
              <p className="text-gray-600">Enter your article topic or brief</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">AI Research</h3>
              <p className="text-gray-600">Let AI gather sources and information</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Write & Edit</h3>
              <p className="text-gray-600">Generate and refine your content</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Publish</h3>
              <p className="text-gray-600">Review and publish your article</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Writing?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of journalists using AI to create better content, faster.
          </p>
          <Link 
            to="/register" 
            className="inline-flex items-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            <span>Get Started for Free</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <FileText className="w-6 h-6 text-primary-400" />
              <span className="text-xl font-bold text-white">AI Newsroom</span>
            </div>
            <p className="text-sm">
              © 2025 AI Newsroom. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
