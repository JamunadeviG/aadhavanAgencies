import { useState, useRef, useEffect } from 'react';
import './ChatWidget.css';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hello! I am the Aadhavan Agencies Intelligent Assistant. How can I help you today regarding wholesale grocery or agriculture logistics?' }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleOpen = () => setIsOpen(!isOpen);

  // Auto-scroll to latest bot/user messages globally
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputVal.trim() || isTyping) return;

    const userMsg = inputVal.trim();
    setInputVal('');
    
    // Add current msg to local chat container
    const newHistory = [...messages, { role: 'user', content: userMsg }];
    setMessages(newHistory);
    setIsTyping(true);

    try {
      // Connect to standalone Hugging Face Python Backend
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: messages.slice(1).map(msg => ({ 
             role: msg.role, 
             content: msg.content 
          })), // We chop the initial greeting
          new_message: userMsg
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data = await response.json();
      
      setMessages(prev => [
        ...prev, 
        { role: 'bot', content: data.response || "I didn't understand that. Could you clarify your B2B requirements?" }
      ]);
      
    } catch (error) {
       console.error("Chat backend unreachable:", error);
       setMessages(prev => [
         ...prev, 
         { role: 'bot', content: "Sorry, I am currently offline or experiencing heavy token load. Please ensure my AI engine is running on port 8000." }
       ]);
    } finally {
       setIsTyping(false);
    }
  };

  return (
    <>
      {isOpen ? (
        <div className="chat-widget-container">
          <div className="chat-header">
            <h4>Aadhavan AI Assistant</h4>
            <button className="chat-close" onClick={toggleOpen}>&times;</button>
          </div>
          
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-bubble-wrapper ${msg.role === 'user' ? 'user' : 'bot'}`}>
                <div className={`chat-bubble ${msg.role === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="chat-bubble-wrapper bot">
                <div className="chat-bubble bot-bubble typing-dots">
                  <span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={handleSend}>
            <input 
              type="text" 
              placeholder="Ask about bulk pricing, stock..." 
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              disabled={isTyping}
            />
            <button type="submit" disabled={isTyping || !inputVal.trim()}>
              Send
            </button>
          </form>
        </div>
      ) : (
        <button className="chat-fab" onClick={toggleOpen} aria-label="Open AI Assistant">
          💬
        </button>
      )}
    </>
  );
};

export default ChatWidget;
