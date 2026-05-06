import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendAgentMessage, addUserMessage, clearConversation } from '../store/agentSlice';

const QUICK_PROMPTS = [
  { icon: '📝', text: 'Log a visit interaction', prompt: 'I want to log a visit interaction with this HCP.' },
  { icon: '📊', text: 'Analyze engagement', prompt: 'Analyze the engagement trends for this HCP.' },
  { icon: '📅', text: 'Schedule follow-up', prompt: 'Help me schedule a follow-up for this HCP.' },
  { icon: '📋', text: 'Get HCP profile', prompt: 'Show me the full profile for this HCP.' },
];

const TOOL_COLORS = {
  log_interaction: '#22c55e',
  edit_interaction: '#3b82f6',
  get_hcp_profile: '#8b5cf6',
  schedule_followup: '#f59e0b',
  analyze_engagement: '#ef4444',
};

const TOOL_ICONS = {
  log_interaction: '📝',
  edit_interaction: '✏️',
  get_hcp_profile: '👤',
  schedule_followup: '📅',
  analyze_engagement: '📊',
};

export default function ChatLogger({ hcpId, hcps }) {
  const dispatch = useDispatch();
  const { messages, loading, toolsUsed } = useSelector(s => s.agent);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const hcp = hcps.find(h => h.id === hcpId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    
    dispatch(addUserMessage(msg));
    
    const history = messages.map(m => ({ role: m.role, content: m.content }));
    
    await dispatch(sendAgentMessage({
      message: msg,
      hcp_id: hcpId || null,
      conversation_history: history,
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-logger">
      {/* Tools sidebar */}
      <div className="tools-panel">
        <div className="tools-title">🛠 Agent Tools</div>
        {Object.entries(TOOL_ICONS).map(([tool, icon]) => (
          <div
            key={tool}
            className={`tool-item ${toolsUsed.includes(tool) ? 'used' : ''}`}
            style={{ borderLeftColor: toolsUsed.includes(tool) ? TOOL_COLORS[tool] : 'transparent' }}
          >
            <span className="tool-icon">{icon}</span>
            <span className="tool-name">{tool.replace(/_/g, ' ')}</span>
            {toolsUsed.includes(tool) && <span className="tool-badge">✓</span>}
          </div>
        ))}

        {hcp && (
          <div className="chat-hcp-info">
            <div className="chat-hcp-label">Active HCP</div>
            <div className="chat-hcp-name">{hcp.name}</div>
            <div className="chat-hcp-spec">{hcp.specialty}</div>
          </div>
        )}
      </div>

      {/* Chat area */}
      <div className="chat-main">
        {/* Messages */}
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-welcome">
              <div className="welcome-icon">🤖</div>
              <h3>AI CRM Assistant</h3>
              <p>I can help you log interactions, analyze engagement, schedule follow-ups, and more using LangGraph-powered tools.</p>
              <div className="quick-prompts">
                {QUICK_PROMPTS.map(qp => (
                  <button
                    key={qp.text}
                    className="quick-prompt"
                    onClick={() => handleSend(hcpId ? `${qp.prompt} HCP ID: ${hcpId}` : qp.prompt)}
                  >
                    <span>{qp.icon}</span> {qp.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-body">
                <div className="message-content">{msg.content}</div>
                {msg.toolsUsed?.length > 0 && (
                  <div className="tools-used-tags">
                    {msg.toolsUsed.map(t => (
                      <span
                        key={t}
                        className="tool-tag"
                        style={{ backgroundColor: TOOL_COLORS[t] + '20', color: TOOL_COLORS[t] }}
                      >
                        {TOOL_ICONS[t]} {t.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
                <div className="message-time">
                  {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-message assistant">
              <div className="message-avatar">🤖</div>
              <div className="message-body">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <button className="clear-btn" onClick={() => dispatch(clearConversation())} title="Clear chat">
            🗑
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hcpId ? `Message the AI agent about ${hcp?.name || 'this HCP'}...` : 'Select an HCP first, then chat with the AI agent...'}
            rows={2}
            className="chat-input"
          />
          <button
            className="send-btn"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
          >
            {loading ? '⏳' : '➤'}
          </button>
        </div>
      </div>
    </div>
  );
}
