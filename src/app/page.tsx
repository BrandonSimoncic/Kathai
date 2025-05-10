'use client';

import { useState, useRef, useEffect } from 'react';
import Image from "next/image";
import dotenv from 'dotenv';
import Exa from 'exa-js';

dotenv.config();

const exa = new Exa(process.env.EXA_API_KEY);

export default function Home() {
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([]);
  const [input, setInput] = useState('');
  const [isTalking, setIsTalking] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const [isFirstMessage, setIsFirstMessage] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    // Add user message
    const newMessages = [...messages, { text: input, isUser: true }];
    setMessages(newMessages);
    setInput('');

    // Start talking animation
    setIsTalking(true);

    try {
      console.log('Making API call with query:', input);

      let responseText;

      if (isFirstMessage) {
        // Use Exa search for first message
        console.log('Using Exa search for first message');
        const result = await exa.searchAndContents(
          input,
          {
            text: true,
            numResults: 10,
            includeDomains: ["en.wikipedia.org"]
          }
        );
        
        // Format the Exa results
        responseText = result.results
          .map(r => r.text)
          .filter(Boolean)
          .join('\n\n') || 'No relevant information found.';
        
        setIsFirstMessage(false);
      } else {
        // Use regular API for subsequent messages
        const response = await fetch('https://bubbly-computer.midio.dev:3001/ask', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: input })
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response data:', data);
        responseText = data.answer?.content || 'Sorry, I could not process your request.';
      }

      console.log('Processed response text:', responseText);

      // Add AI response
      setMessages([...newMessages, { 
        text: responseText,
        isUser: false 
      }]);

      // Stop talking after 10 seconds
      setTimeout(() => {
        setIsTalking(false);
      }, 10000);
    } catch (error) {
      console.error('Error details:', error);
      setMessages([...newMessages, { 
        text: 'Sorry, there was an error processing your request. Please try again.', 
        isUser: false 
      }]);
      setTimeout(() => {
        setIsTalking(false);
      }, 10000);
    }
  };

  // Calculate rotation based on mouse position
  const calculateRotation = () => {
    if (!ballRef.current) return { x: 0, y: 0 };
    
    const ballRect = ballRef.current.getBoundingClientRect();
    const ballCenterX = ballRect.left + ballRect.width / 2;
    const ballCenterY = ballRect.top + ballRect.height / 2;
    
    const deltaX = mousePosition.x - ballCenterX;
    const deltaY = mousePosition.y - ballCenterY;
    
    // Calculate rotation angles (limited to 15 degrees)
    const rotateX = Math.min(Math.max(deltaY / 20, -15), 15);
    const rotateY = Math.min(Math.max(-deltaX / 20, -15), 15);
    
    return { x: rotateX, y: rotateY };
  };

  const rotation = calculateRotation();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 relative">
        {/* Floating Ball */}
        <div className="absolute left-[40%] top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div 
              ref={ballRef}
              className="w-[600px] h-[600px] rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-float shadow-2xl opacity-80"
            >
              {/* Eyes */}
              <div 
                className="absolute top-[30%] left-[25%] w-24 h-24 rounded-full bg-black transform animate-blink origin-center transition-transform duration-200"
                style={{
                  transform: `translate(-${rotation.y *0.5}px, ${rotation.x *0.5}px)`
                }}
              ></div>
              <div 
                className="absolute top-[30%] right-[25%] w-24 h-24 rounded-full bg-black transform animate-blink origin-center transition-transform duration-200"
                style={{
                  transform: `translate(-${rotation.y *0.5}px, ${rotation.x *0.5}px)`
                }}
              ></div>
              {/* Nose */}
              <div 
                className="absolute top-[32%] left-[53%] -translate-x-1/2 w-12 h-32 bg-black rounded-md transform -rotate-12 origin-bottom transition-transform duration-200"
                style={{
                  transform: `translate(-50%, 0) rotate(-12deg) translate(-${rotation.y *0.5}px, ${rotation.x *0.5}px)`
                }}
              ></div>
              {/* Mouth */}
              <div 
                className={`absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-b-full bg-black transition-all duration-300 ${isTalking ? 'animate-talk' : ''}`}
              ></div>
            </div>
          </div>
        </div>

        {/* Chat Box */}
        <div className="absolute left-[60%] top-1/2 -translate-y-1/2 w-[min(420px,90vw)] max-w-[420px]">
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-xl p-4 sm:p-6 transition-all duration-500">
            {/* Chat Messages */}
            <div className={`overflow-hidden transition-all duration-500 ${messages.length > 0 ? 'h-[min(300px,60vh)] mb-4' : 'h-0'}`}>
              <div className="h-full overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg max-w-[85%] ${
                      message.isUser
                        ? 'bg-gray-700 ml-auto'
                        : 'bg-gray-600'
                    }`}
                  >
                    {message.text}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
            <textarea 
              className="w-full h-24 sm:h-32 p-3 sm:p-4 bg-gray-700/50 text-gray-100 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none placeholder-gray-400 text-sm sm:text-base"
              placeholder="Type your questions here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <button 
              className="mt-4 w-full bg-gray-700 hover:bg-gray-600 text-gray-100 font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors text-sm sm:text-base"
              onClick={handleSubmit}
            >
              Ask Away!
            </button>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-5xl font-bold mb-6">Kathai</h1>
          <p className="text-xl text-gray-600 max-w-2xl">
            Welcome to Kathy AI, your personal conversational AI educator. Ask me anything, and we'll figure it out together!
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-gray-600 border-t">
        <p>© {new Date().getFullYear()} All rights reserved.</p>
      </footer>
    </div>
  );
}
