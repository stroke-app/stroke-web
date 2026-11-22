import { autocompletion, closeBrackets, completionKeymap } from "@codemirror/autocomplete";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import {
  MSSQL,
  MySQL,
  PLSQL,
  PostgreSQL,
  SQLite,
  StandardSQL,
  sql,
  type SQLDialect,
} from "@codemirror/lang-sql";
import { bracketMatching, HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { Compartment, EditorState } from "@codemirror/state";
import {
  drawSelection,
  EditorView,
  highlightActiveLine,
  keymap,
  lineNumbers,
  placeholder as placeholderExt,
} from "@codemirror/view";
import { tags as t } from "@lezer/highlight";
import { useEffect, useRef } from "react";
import { yCollab, yUndoManagerKeymap } from "y-codemirror.next";
import * as Y from "yjs";

import type { SharedConsole } from "#/lib/relay/shared-console";
import type { Engine } from "#/lib/studio-bridge";

/** Colours from the site's tokens (.studio in styles.css), so light and dark both read. */
const highlight = HighlightStyle.define([
  { tag: t.keyword, color: "var(--cm-keyword)" },
  { tag: [t.string, t.special(t.string)], color: "var(--cm-string)" },
  { tag: [t.number, t.bool, t.null], color: "var(--cm-number)" },
  { tag: [t.lineComment, t.blockComment], color: "var(--cm-comment)", fontStyle: "italic" },
  { tag: [t.typeName, t.function(t.variableName)], color: "var(--cm-name)" },
  { tag: [t.operator, t.punctuation], color: "var(--cm-operator)" },
]);

const theme = EditorView.theme({
  "&": {
    height: "100%",
    fontSize: "13px",
    backgroundColor: "transparent",
    color: "var(--foreground)",
  },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": { fontFamily: "var(--font-mono, ui-monospace, monospace)", lineHeight: "1.6" },
  ".cm-content": { padding: "8px 0", caretColor: "var(--foreground)" },
  ".cm-gutters": {
    backgroundColor: "transparent",
    border: "none",
    color: "color-mix(in oklch, var(--muted-foreground) 55%, transparent)",
  },
  ".cm-activeLine": { backgroundColor: "color-mix(in oklch, var(--foreground) 4%, transparent)" },
  ".cm-activeLineGutter": { backgroundColor: "transparent", color: "var(--muted-foreground)" },
  ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
    backgroundColor: "color-mix(in oklch, var(--foreground) 16%, transparent) !important",
  },
  ".cm-tooltip": {
    backgroundColor: "var(--popover)",
    color: "var(--popover-foreground)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
  },
  ".cm-tooltip-autocomplete ul li[aria-selected]": {
    backgroundColor: "var(--accent)",
    color: "var(--foreground)",
  },
});

/** Highlighting per engine; anything else reads as standard SQL. GoogleSQL
 *  (Spanner, BigQuery) quotes with backticks, as MySQL does. */
const DIALECTS: Record<string, SQLDialect> = {
  postgres: PostgreSQL,
  duckdb: PostgreSQL,
  mysql: MySQL,
  spanner: MySQL,
  bigquery: MySQL,
  sqlite: SQLite,
  mssql: MSSQL,
  oracle: PLSQL,
};
const dialectOf = (engine: string) => DIALECTS[engine] ?? StandardSQL;

export interface SqlEditorHandle {
  /** The selection if there is one, else the whole text. */
  runnable: () => string;
  focus: () => void;
}

/**
 * CodeMirror 6 for SQL: highlighting in the site's colours, autocomplete of
 * tables and their columns, Mod+Enter to run.
 */
export function SqlEditor({
  value,
  onChange,
  onRun,
  engine,
  schema,
  handleRef,
  placeholder = "",
  autoFocus = false,
  collab,
}: {
  value: string;
  onChange: (v: string) => void;
  onRun: () => void;
  engine: Engine;
  schema: Record<string, string[]>;
  handleRef?: React.RefObject<SqlEditorHandle | null>;
  placeholder?: string;
  autoFocus?: boolean;
  /** Edit the shared console's document with everyone else (live cursors). */
  collab?: SharedConsole | null;
}) {
  const host = useRef<HTMLDivElement>(null);
  const view = useRef<EditorView | null>(null);
  const lang = useRef(new Compartment());
  const callbacks = useRef({ onChange, onRun });
  // The editor is built once; its key handlers read the latest callbacks.
  useEffect(() => {
    callbacks.current = { onChange, onRun };
  });

  useEffect(() => {
    if (!host.current) return;
    const v = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: collab ? collab.text.toString() : value,
        extensions: [
          lineNumbers(),
          // Shared: undo takes back only this person's typing (Yjs), not others'.
          collab
            ? yCollab(collab.text, collab.awareness, {
                undoManager: new Y.UndoManager(collab.text),
              })
            : history(),
          drawSelection(),
          highlightActiveLine(),
          bracketMatching(),
          closeBrackets(),
          highlightSelectionMatches(),
          autocompletion({ activateOnTyping: true }),
          syntaxHighlighting(highlight),
          theme,
          placeholderExt(placeholder),
          lang.current.of(sql({ dialect: dialectOf(engine), schema, upperCaseKeywords: true })),
          keymap.of([
            {
              key: "Mod-Enter",
              preventDefault: true,
              run: () => {
                callbacks.current.onRun();
                return true;
              },
            },
            indentWithTab,
            ...completionKeymap,
            ...searchKeymap,
            ...(collab ? yUndoManagerKeymap : historyKeymap),
            ...defaultKeymap,
          ]),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) callbacks.current.onChange(u.state.doc.toString());
          }),
        ],
      }),
    });
    view.current = v;
    if (autoFocus) v.focus();
    return () => {
      v.destroy();
      view.current = null;
    };
    // The editor is created once; value, schema and engine are pushed below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Schema arrives after the tables load: reconfigure, don't recreate.
  useEffect(() => {
    view.current?.dispatch({
      effects: lang.current.reconfigure(
        sql({ dialect: dialectOf(engine), schema, upperCaseKeywords: true }),
      ),
    });
  }, [engine, schema]);

  // A value set from outside (history, a new tab): replace the document. A
  // shared console's document is Yjs's: changes go through it, not here.
  useEffect(() => {
    const v = view.current;
    if (collab) return;
    if (v && v.state.doc.toString() !== value) {
      v.dispatch({ changes: { from: 0, to: v.state.doc.length, insert: value } });
    }
  }, [value, collab]);

  useEffect(() => {
    if (!handleRef) return;
    handleRef.current = {
      runnable: () => {
        const v = view.current;
        if (!v) return value;
        const { from, to } = v.state.selection.main;
        return from !== to ? v.state.sliceDoc(from, to) : v.state.doc.toString();
      },
      focus: () => view.current?.focus(),
    };
  }, [handleRef, value]);

  return <div ref={host} className="h-full min-h-0 overflow-hidden" />;
}
