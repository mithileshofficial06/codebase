import { create } from 'zustand';
import { ChatMessage } from '@codemap/shared';

interface ChatStore {
  messages: ChatMessage[];
  isStreaming: boolean;
  repoContext: {
    owner: string;
    repo: string;
    fileCount: number;
    healthScore: number;
    topDependencies: string[];
  } | null;

  setRepoContext: (context: ChatStore['repoContext']) => void;
  addMessage: (message: ChatMessage) => void;
  appendToLastMessage: (text: string) => void;
  sendMessage: (content: string) => Promise<void>;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  isStreaming: false,
  repoContext: null,

  setRepoContext: (context) => set({ repoContext: context }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  appendToLastMessage: (text) =>
    set((state) => {
      const msgs = [...state.messages];
      if (msgs.length > 0 && msgs[msgs.length - 1].role === 'assistant') {
        msgs[msgs.length - 1] = {
          ...msgs[msgs.length - 1],
          content: msgs[msgs.length - 1].content + text,
        };
      }
      return { messages: msgs };
    }),

  sendMessage: async (content) => {
    const { repoContext, addMessage, appendToLastMessage } = get();

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    addMessage(userMessage);

    // Add empty assistant message for streaming
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };
    addMessage(assistantMessage);
    set({ isStreaming: true });

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const response = await fetch(`${apiUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, context: repoContext }),
      });

      if (!response.ok) throw new Error('Chat request failed');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                appendToLastMessage(data.text);
              }
              if (data.done) {
                set({ isStreaming: false });
              }
              if (data.error) {
                appendToLastMessage(`\n\n_Error: ${data.error}_`);
                set({ isStreaming: false });
              }
            } catch {
              // skip malformed JSON
            }
          }
        }
      }
    } catch (error: any) {
      appendToLastMessage(`\n\n_Error: ${error.message}_`);
    } finally {
      set({ isStreaming: false });
    }
  },
}));
