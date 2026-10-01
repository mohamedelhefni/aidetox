// CodeMirror 6 with per-language highlighting, and optional vim mode and paste blocking.
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, Compartment, Prec } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { indentUnit } from '@codemirror/language';
import { indentWithTab } from '@codemirror/commands';
import { autocompletion } from '@codemirror/autocomplete';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { go } from '@codemirror/lang-go';
import { cpp } from '@codemirror/lang-cpp';
import { oneDark } from '@codemirror/theme-one-dark';
import { vim } from '@replit/codemirror-vim';

const MODES = {
  js: [javascript(), indentUnit.of('  ')],
  ts: [javascript({ typescript: true }), indentUnit.of('  ')],
  python: [python(), indentUnit.of('    ')],
  go: [go(), indentUnit.of('\t')],
  cpp: [cpp(), indentUnit.of('    ')],
};

export function createEditor(parent, { doc, lang, vimMode, blockPaste, onChange, onRun, onPasteBlocked }) {
  const vimC = new Compartment(), langC = new Compartment(), pasteC = new Compartment();
  const dark = matchMedia('(prefers-color-scheme: dark)').matches;
  let silent = false; // programmatic doc swaps aren't user edits
  const blocked = e => { e.preventDefault(); onPasteBlocked(); return true; };
  const noPaste = on => (on ? EditorView.domEventHandlers({ paste: blocked, drop: blocked }) : []);
  const view = new EditorView({
    parent,
    state: EditorState.create({
      doc,
      extensions: [
        vimC.of(vimMode ? vim() : []), // vim must precede basicSetup's keymaps
        basicSetup,
        autocompletion({ activateOnTyping: false }), // no suggestion pop-ups; Ctrl-Space still asks
        keymap.of([indentWithTab]),
        Prec.highest(keymap.of([{ key: 'Mod-Enter', run: () => (onRun(), true) }])),
        langC.of(MODES[lang]),
        dark ? oneDark : [],
        pasteC.of(noPaste(blockPaste)),
        EditorView.updateListener.of(u => u.docChanged && !silent && onChange(u.state.doc.toString())),
        EditorView.theme({ '&': { height: '100%' }, '.cm-scroller': { fontFamily: 'var(--mono)' } }),
      ],
    }),
  });
  return {
    view,
    setVim: on => view.dispatch({ effects: vimC.reconfigure(on ? vim() : []) }),
    setBlockPaste: on => view.dispatch({ effects: pasteC.reconfigure(noPaste(on)) }),
    setDoc(text, l) {
      silent = true;
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: text }, effects: langC.reconfigure(MODES[l]) });
      silent = false;
    },
    focus: () => view.focus(),
  };
}
