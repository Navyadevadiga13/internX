import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2 } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm InternX AI Assistant. I can help you with information about internships, applications, and platform features. How can I assist you today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Internship related queries
    if (message.includes('internship') || message.includes('job')) {
      if (message.includes('apply') || message.includes('application')) {
        return "To apply for internships: 1) Complete your profile with resume upload, 2) Browse internships on our platform, 3) Click 'Apply Now' on any internship, 4) Submit your application with a cover letter. You can track all applications in your dashboard!";
      }
      if (message.includes('find') || message.includes('search')) {
        return "You can find internships by: 1) Using the search bar on homepage, 2) Browsing by domain (Technology, Design, Marketing, etc.), 3) Using filters like location, salary, and type. We have 500+ active internships waiting for you!";
      }
      if (message.includes('requirement') || message.includes('eligibility')) {
        return "Most internships require: 1) Completed profile with resume, 2) Relevant educational background, 3) Basic skills in the domain. Each internship has specific requirements listed in the job description.";
      }
      return "We offer internships in Technology, Design, Marketing, Finance, Healthcare, and Engineering. You can browse by domain, location, or use our smart search feature!";
    }

    // Resume related
    if (message.includes('resume') || message.includes('cv')) {
      return "Your resume is crucial! Upload it in your dashboard under profile settings. Accepted format: PDF only, max 10MB. A good resume increases your chances of getting selected by 80%!";
    }

    // Profile related
    if (message.includes('profile') || message.includes('account')) {
      return "Complete your profile for better opportunities: 1) Personal information, 2) Educational background, 3) Skills and keywords, 4) Resume upload, 5) Profile picture. A complete profile gets 3x more responses!";
    }

    // Application status
    if (message.includes('status') || message.includes('track')) {
      return "Track your applications in the Dashboard. Status types: Pending (under review), Reviewed (being evaluated), Accepted (congratulations!), Rejected (keep trying!). You can apply to up to 3 internships.";
    }

    // Platform features
    if (message.includes('feature') || message.includes('how to')) {
      return "Key features: 1) Smart job matching, 2) One-click applications, 3) Real-time status tracking, 4) Profile optimization tips, 5) Direct company connections. Explore the platform to discover more!";
    }

    // Salary/stipend
    if (message.includes('salary') || message.includes('stipend') || message.includes('pay')) {
      return "Internship stipends range from ₹5,000 to ₹50,000+ per month depending on company, role, and your skills. Premium companies offer higher stipends. Filter by salary range to find suitable opportunities!";
    }

    // Duration
    if (message.includes('duration') || message.includes('time') || message.includes('long')) {
      return "Internship durations typically range from 1-6 months. Most popular are 3-month internships. Duration is mentioned in each job posting. Some companies offer full-time conversion opportunities!";
    }

    // Success tips
    if (message.includes('tip') || message.includes('advice') || message.includes('help')) {
      return "Success tips: 1) Complete your profile 100%, 2) Apply early to new postings, 3) Customize cover letters, 4) Showcase relevant projects, 5) Follow up professionally. Our successful interns get 95% placement rate!";
    }

    // Greetings
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! Welcome to InternX! I'm here to help you navigate your internship journey. Ask me about finding internships, application process, or any platform features!";
    }

    // Thank you
    if (message.includes('thank') || message.includes('thanks')) {
      return "You're welcome! I'm always here to help. Feel free to ask anything about internships or our platform. Good luck with your applications! 🚀";
    }

    // Default responses
    const defaultResponses = [
      "I can help you with internship applications, profile setup, job search, and platform features. What would you like to know?",
      "That's an interesting question! I can assist with internship-related queries, application guidance, and platform navigation. How can I help?",
      "I'm here to make your internship journey smooth! Ask me about finding jobs, application tips, or any platform features.",
      "Great question! I specialize in helping with internships, applications, and career guidance. What specific information do you need?"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getBotResponse(inputText),
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 z-50 group"
      >
        <MessageCircle className="h-6 w-6" />
        
        
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
    }`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="bg-white/20 p-2 rounded-full">
              <Bot className="h-5 w-5" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-green-400 h-3 w-3 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h3 className="font-semibold">InternX AI</h3>
            <p className="text-xs text-green-100">Always here to help</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white/80 hover:text-white transition-colors"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`flex items-start space-x-2 max-w-[80%] ${
                  message.isBot ? 'flex-row' : 'flex-row-reverse space-x-reverse'
                }`}>
                  <div className={`p-2 rounded-full ${
                    message.isBot ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    {message.isBot ? (
                      <Bot className="h-4 w-4 text-green-600" />
                    ) : (
                      <User className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                  <div className={`p-3 rounded-2xl ${
                    message.isBot 
                      ? 'bg-gray-100 text-gray-800' 
                      : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.isBot ? 'text-gray-500' : 'text-green-100'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <div className="p-2 rounded-full bg-green-100">
                    <Bot className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="bg-gray-100 p-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about internships..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIChat;