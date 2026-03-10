// frontend/src/components/editor/SqlEditor.jsx
// Monaco Editor = the same code editor used in VS Code
// @monaco-editor/react is the React wrapper for it

import { useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';

// Monaco Editor configuration for SQL
const MONACO_OPTIONS = {
  language: 'sql',
  theme: 'vs-dark',
  fontSize: 13,
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  fontLigatures: true,
  minimap: { enabled: false },        // Disable the small overview map
  scrollBeyondLastLine: false,
  automaticLayout: true,              // Auto-resize when container changes
  tabSize: 2,
  wordWrap: 'on',
  lineNumbers: 'on',
  renderLineHighlight: 'line',
  suggestOnTriggerCharacters: true,
  quickSuggestions: true,
  padding: { top: 12, bottom: 12 },
};

const SqlEditor = ({ 
  value,           // Current SQL text
  onChange,        // Called when user types
  onExecute,       // Called when user runs query (Ctrl+Enter)
  isLoading        // Show loading state
}) => {
  const editorRef = useRef(null);

  // Called when Monaco editor mounts (is ready)
  const handleEditorMount = useCallback((editor, monaco) => {
    editorRef.current = editor;

    // Add keyboard shortcut: Ctrl+Enter (or Cmd+Enter on Mac) = run query
    editor.addAction({
      id: 'execute-query',
      label: 'Execute SQL Query',
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter
      ],
      run: () => {
        if (!isLoading) onExecute();
      }
    });

    // Auto-focus the editor when it loads
    editor.focus();
  }, [onExecute, isLoading]);

  return (
    <div className="sql-editor">
      {/* Top toolbar */}
      <div className="sql-editor__toolbar">
        <span className="sql-editor__info">
          SQL Editor — PostgreSQL dialect
        </span>
        <div className="sql-editor__actions">
          <button
            className={`btn btn--ghost btn--sm`}
            onClick={() => onChange('')}
            disabled={isLoading || !value}
            title="Clear editor"
          >
            ✕ Clear
          </button>
          <button
            className={`btn btn--primary btn--sm ${isLoading ? 'btn--loading' : ''}`}
            onClick={onExecute}
            disabled={isLoading || !value?.trim()}
          >
            {isLoading ? 'Running...' : '▶ Run Query'}
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="sql-editor__container">
        <Editor
          height="200px"
          defaultLanguage="sql"
          value={value}
          onChange={(newValue) => onChange(newValue || '')}
          onMount={handleEditorMount}
          options={MONACO_OPTIONS}
          // Custom dark theme matching our app
          beforeMount={(monaco) => {
            monaco.editor.defineTheme('cipher-dark', {
              base: 'vs-dark',
              inherit: true,
              rules: [
                { token: 'keyword', foreground: '00ff87', fontStyle: 'bold' },
                { token: 'string', foreground: '60a5fa' },
                { token: 'number', foreground: 'fbbf24' },
                { token: 'comment', foreground: '4a5568', fontStyle: 'italic' },
                { token: 'operator', foreground: 'f472b6' },
              ],
              colors: {
                'editor.background': '#0f1626',
                'editor.foreground': '#a9b7d0',
                'editor.lineHighlightBackground': '#161d2e',
                'editor.selectionBackground': '#1e2840',
                'editorCursor.foreground': '#00ff87',
                'editorLineNumber.foreground': '#2d3748',
                'editorLineNumber.activeForeground': '#4a5568',
              }
            });
            monaco.editor.setTheme('cipher-dark');
          }}
        />
      </div>

      {/* Keyboard shortcut hint */}
      <div className="sql-editor__keyboard-hint">
        Press <kbd>Ctrl</kbd>+<kbd>Enter</kbd> to run query
      </div>
    </div>
  );
};

export default SqlEditor;
