'use client'

import { useState, useMemo } from 'react'
import {
  MessageSquare, Search, Send, Paperclip, Check, CheckCheck,
  AlertCircle, Building2, User, Phone, Ticket, Zap
} from 'lucide-react'
import { Breadcrumb } from '@/components/layout/breadcrumb'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { chatThreads } from '@/lib/data/ocrms-data'
import type { ChatThread, ChatMessage } from '@/lib/types'

export default function ClientChatPage() {
  const [threads, setThreads] = useState<ChatThread[]>(chatThreads)
  const [selectedThreadId, setSelectedThreadId] = useState<string>(chatThreads[0]?.id || '')
  const [messageInput, setMessageInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  // Selected thread
  const activeThread = useMemo(() => {
    return threads.find(t => t.id === selectedThreadId)
  }, [threads, selectedThreadId])

  // Filtered threads list
  const filteredThreads = useMemo(() => {
    return threads.filter(t => 
      t.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.client.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [threads, searchTerm])

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return

    const newMessage: ChatMessage = {
      id: `MSG_${Date.now()}`,
      siteId: activeThread?.siteId || '',
      site: activeThread?.site || '',
      client: activeThread?.client || '',
      sender: 'oe',
      senderName: 'Ravi Shankar (OE)',
      message: text,
      timestamp: new Date().toISOString(),
      hasAttachment: false
    }

    setThreads(prev => prev.map(t => {
      if (t.id === selectedThreadId) {
        return {
          ...t,
          lastMessage: text,
          lastTimestamp: newMessage.timestamp,
          messages: [...t.messages, newMessage]
        }
      }
      return t
    }))

    setMessageInput('')
  }

  // Quick replies definition
  const quickReplies = [
    "Working on this immediately, sir.",
    "Deployed reliever. Roster updated.",
    "Deep cleaning completed. Photo attached.",
    "Electrician dispatched to check the issue.",
  ]

  return (
    <div className="space-y-4 h-[calc(100vh-140px)] flex flex-col">
      <Breadcrumb items={[{ label: 'Client Chatbox' }]} />

      <div className="flex flex-1 gap-4 overflow-hidden min-h-0">
        
        {/* Left Panel: Conversation List */}
        <Card className="w-80 flex flex-col shadow-soft border-border shrink-0 overflow-hidden">
          <div className="p-3 border-b space-y-2">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <MessageSquare size={14} className="text-emerald-600" />
              Client Conversations
            </h3>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={12} />
              <Input
                placeholder="Search chats..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-[11px] rounded-lg"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y">
            {filteredThreads.map((thread) => {
              const isActive = thread.id === selectedThreadId
              return (
                <button
                  key={thread.id}
                  onClick={() => {
                    setSelectedThreadId(thread.id)
                    // Clear unread count on select
                    setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, unreadCount: 0 } : t))
                  }}
                  className={`w-full text-left p-3 flex items-start gap-2.5 transition-colors ${
                    isActive ? 'bg-indigo-50/50 border-r-2 border-r-primary' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                    <Building2 size={14} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start">
                      <p className="text-[11px] font-bold text-slate-800 truncate">{thread.site}</p>
                      <span className="text-[9px] text-muted-foreground shrink-0 ml-1">
                        {new Date(thread.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{thread.client}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-1 italic font-medium">
                      {thread.lastMessage}
                    </p>
                  </div>
                  {thread.unreadCount > 0 && (
                    <span className="h-4 min-w-[16px] rounded-full bg-rose-500 text-white font-bold text-[8px] flex items-center justify-center px-1 shrink-0">
                      {thread.unreadCount}
                    </span>
                  )}
                </button>
              )
            })}
            {filteredThreads.length === 0 && (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No conversations found.
              </div>
            )}
          </div>
        </Card>

        {/* Right Panel: Conversation Thread Area */}
        <Card className="flex-1 flex flex-col shadow-soft border-border overflow-hidden">
          {activeThread ? (
            <>
              {/* Active Chat Header */}
              <div className="p-3 border-b flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">{activeThread.site}</h3>
                    <p className="text-[10px] text-muted-foreground">{activeThread.client}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-7.5 text-[10px] font-bold rounded-lg border-rose-200 text-rose-700 bg-rose-50/20 hover:bg-rose-50 flex items-center gap-1">
                    <Ticket size={12} /> Create Ticket
                  </Button>
                </div>
              </div>

              {/* Chat Messages Log */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/20">
                {activeThread.messages.map((msg) => {
                  const isMe = msg.sender === 'oe' || msg.sender === 'rm'
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl p-3 shadow-soft border ${
                        isMe 
                          ? 'bg-slate-900 border-slate-900 text-white rounded-tr-none' 
                          : 'bg-white border-border text-slate-800 rounded-tl-none'
                      }`}>
                        <p className="text-[9px] font-bold opacity-70 mb-1">{msg.senderName}</p>
                        <p className="text-xs leading-relaxed">{msg.message}</p>
                        
                        {/* Attachments Mock */}
                        {msg.hasAttachment && (
                          <div className="mt-2 p-1.5 rounded bg-slate-100/10 border border-slate-100/20 flex items-center gap-1.5 text-[10px] font-semibold">
                            <Paperclip size={10} />
                            <span>site_verification.jpg</span>
                          </div>
                        )}
                        
                        <div className="flex justify-end items-center gap-1 mt-1 opacity-70">
                          <span className="text-[8px]">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMe && <CheckCheck size={11} className="text-sky-400" />}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Quick Reply Strip */}
              <div className="px-3 py-2 border-t bg-slate-50/70 flex items-center gap-2 overflow-x-auto">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-0.5 shrink-0">
                  <Zap size={10} className="text-amber-500 fill-amber-500" />
                  Quick Reply:
                </span>
                {quickReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(reply)}
                    className="whitespace-nowrap bg-white hover:bg-indigo-50 border border-border text-slate-700 hover:text-indigo-700 text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-soft transition-all shrink-0"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              {/* Chat Input form */}
              <div className="p-3 border-t flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 rounded-xl">
                  <Paperclip size={15} />
                </Button>
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(messageInput)}
                  placeholder="Type a message to client..."
                  className="flex-1 h-9 text-xs rounded-xl"
                />
                <Button 
                  onClick={() => handleSendMessage(messageInput)}
                  className="h-9 w-9 shrink-0 bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center justify-center p-0"
                >
                  <Send size={14} />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground flex-col gap-2">
              <MessageSquare size={24} className="text-slate-300" />
              Select a conversation to start chatting.
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
