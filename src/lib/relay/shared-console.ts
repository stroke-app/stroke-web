import { useEffect, useState } from "react";
import { applyAwarenessUpdate, Awareness, encodeAwarenessUpdate } from "y-protocols/awareness";
import * as Y from "yjs";

import type { PresenceContext } from "./presence";

/**
 * The shared console: one SQL document for everyone on a share link, edited
 * together like a Figma file. Yjs merges what people type at the same time;
 * the awareness carries each person's cursor and selection, drawn in the
 * editor with their name (y-codemirror.next). It travels over the presence
 * socket, sealed with the link's key, and lives as long as someone has the
 * studio open: there is no server copy.
 *
 * Same protocol as the desktop app (src/lib/share-console.js): `y` an update,
 * `y-sync` a newcomer asking for state, `aw` an awareness update.
 */
export interface SharedConsole {
  doc: Y.Doc;
  text: Y.Text;
  awareness: Awareness;
}

type Presence = NonNullable<React.ContextType<typeof PresenceContext>>;

const toB64 = (bytes: Uint8Array) => {
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000)
    s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
};
const fromB64 = (text: string) => Uint8Array.from(atob(text), (c) => c.charCodeAt(0));

/** Cursor tint behind a name: the person's colour, faint. */
const light = (hex: string) => `${hex}33`;

export function useSharedConsole(presence: Presence | null): SharedConsole | null {
  const [shared] = useState<SharedConsole>(() => {
    const doc = new Y.Doc();
    return { doc, text: doc.getText("sql"), awareness: new Awareness(doc) };
  });
  const sendDoc = presence?.sendDoc;
  const onDoc = presence?.onDoc;
  const onConnect = presence?.onConnect;
  const name = presence?.me.name;
  const color = presence?.me.color;

  // Leaving takes this page's cursor out of everyone's editor at once. Declared
  // first so its cleanup runs while the sender below is still attached.
  useEffect(() => () => shared.awareness.setLocalState(null), [shared]);

  useEffect(() => {
    if (!sendDoc || !onDoc || !onConnect || !name || !color) return;
    const { doc, awareness } = shared;
    // setLocalState, not setLocalStateField: after a leave (or React's dev
    // double mount) the state is null, and setting one field of null is a
    // no-op, which left this page with no cursor for anyone to see.
    awareness.setLocalState({
      ...(awareness.getLocalState() ?? {}),
      user: { name, color, colorLight: light(color) },
    });

    const onUpdate = (update: Uint8Array, origin: unknown) => {
      if (origin !== "remote") sendDoc({ t: "y", u: toB64(update) });
    };
    const onAwareness = (
      { added, updated, removed }: { added: number[]; updated: number[]; removed: number[] },
      origin: unknown,
    ) => {
      if (origin === "remote") return;
      sendDoc({
        t: "aw",
        u: toB64(encodeAwarenessUpdate(awareness, [...added, ...updated, ...removed])),
      });
    };
    doc.on("update", onUpdate);
    awareness.on("update", onAwareness);

    // Catch up: ask everyone for their state and offer ours. Yjs merges both
    // ways and repeats are harmless, so this runs on every (re)connect.
    const sync = () => {
      sendDoc({ t: "y-sync" });
      sendDoc({ t: "y", u: toB64(Y.encodeStateAsUpdate(doc)) });
    };
    const offDoc = onDoc((msg) => {
      if (msg.t === "y") Y.applyUpdate(doc, fromB64(msg.u), "remote");
      else if (msg.t === "aw") applyAwarenessUpdate(awareness, fromB64(msg.u), "remote");
      else {
        sendDoc({ t: "y", u: toB64(Y.encodeStateAsUpdate(doc)) });
        sendDoc({ t: "aw", u: toB64(encodeAwarenessUpdate(awareness, [doc.clientID])) });
      }
    });
    const offConnect = onConnect(sync);
    sync();
    return () => {
      doc.off("update", onUpdate);
      awareness.off("update", onAwareness);
      offDoc();
      offConnect();
    };
  }, [shared, sendDoc, onDoc, onConnect, name, color]);

  return presence ? shared : null;
}
