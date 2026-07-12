import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { useEffect, useRef, useState, type DragEvent, type ChangeEvent } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export function RichTextEditor({ value, onChange }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "underline text-gold" } }),
    ],
    content: value || "",
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[200px] border border-border bg-background/50 px-3 py-2 text-sm text-ink focus:border-gold focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  async function importDocx(file: File, mode: "replace" | "append" = "append") {
    if (!editor) return;
    if (!/\.docx?$/i.test(file.name)) {
      setImportMsg("Solo se admiten archivos .docx (Word moderno).");
      return;
    }
    if (/\.doc$/i.test(file.name)) {
      setImportMsg("El formato .doc antiguo no se puede leer. Guarda el documento como .docx desde Word.");
      return;
    }
    setImporting(true);
    setImportMsg(null);
    try {
      const arrayBuffer = await file.arrayBuffer();
      // @ts-expect-error - browser build has no types
      const mammoth = await import("mammoth/mammoth.browser.js");
      const result = await mammoth.convertToHtml(
        { arrayBuffer },
        {
          styleMap: [
            "p[style-name='Title'] => h2:fresh",
            "p[style-name='Heading 1'] => h2:fresh",
            "p[style-name='Heading 2'] => h3:fresh",
            "p[style-name='Heading 3'] => h3:fresh",
            "p[style-name='Quote'] => blockquote:fresh",
            "b => strong",
            "i => em",
            "u => u",
          ],
        }
      );
      const html = result.value;
      if (mode === "replace") {
        editor.commands.setContent(html);
      } else {
        editor.commands.focus("end");
        editor.commands.insertContent(html);
      }
      setImportMsg(`Importado: ${file.name}${result.messages.length ? ` (con ${result.messages.length} avisos menores)` : ""}`);
    } catch (err) {
      console.error(err);
      setImportMsg("No se pudo leer el documento.");
    } finally {
      setImporting(false);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) importDocx(file, "append");
  }

  function onPickFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) importDocx(file, "append");
    e.target.value = "";
  }

  if (!editor) return null;

  return (
    <div className="mt-2">
      <Toolbar editor={editor} />

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative ${dragOver ? "ring-2 ring-gold ring-offset-2 ring-offset-background" : ""}`}
      >
        <EditorContent editor={editor} />
        {dragOver && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gold/10 text-sm font-medium text-gold">
            Suelta el documento Word aquí
          </div>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink/70">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="border border-border px-2 py-1 hover:border-gold hover:text-gold"
          disabled={importing}
        >
          {importing ? "Importando…" : "Importar Word (.docx)"}
        </button>
        <span className="text-ink/50">o arrastra un archivo .docx sobre el editor</span>
        <input
          ref={fileInputRef}
          type="file"
          accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={onPickFile}
          className="hidden"
        />
        {importMsg && <span className="ml-auto text-ink/60">{importMsg}</span>}
      </div>
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const btn = (active: boolean) =>
    `px-2 py-1 text-xs border border-border ${active ? "bg-gold/20 text-gold border-gold" : "text-ink/70 hover:text-gold"}`;
  return (
    <div className="mb-2 flex flex-wrap gap-1">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btn(editor.isActive("bold"))}><b>B</b></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btn(editor.isActive("italic"))}><i>I</i></button>
      <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btn(editor.isActive("underline"))}><u>U</u></button>
      <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={btn(editor.isActive("strike"))}><s>S</s></button>
      <span className="mx-1 w-px bg-border" />
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btn(editor.isActive("heading", { level: 2 }))}>H2</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btn(editor.isActive("heading", { level: 3 }))}>H3</button>
      <button type="button" onClick={() => editor.chain().focus().setParagraph().run()} className={btn(editor.isActive("paragraph"))}>P</button>
      <span className="mx-1 w-px bg-border" />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btn(editor.isActive("bulletList"))}>• Lista</button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btn(editor.isActive("orderedList"))}>1. Lista</button>
      <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btn(editor.isActive("blockquote"))}>"</button>
      <span className="mx-1 w-px bg-border" />
      <button
        type="button"
        onClick={() => {
          const prev = editor.getAttributes("link").href as string | undefined;
          const url = window.prompt("URL del enlace", prev ?? "https://");
          if (url === null) return;
          if (url === "") editor.chain().focus().unsetLink().run();
          else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }}
        className={btn(editor.isActive("link"))}
      >
        Link
      </button>
      <button type="button" onClick={() => editor.chain().focus().undo().run()} className={btn(false)}>↶</button>
      <button type="button" onClick={() => editor.chain().focus().redo().run()} className={btn(false)}>↷</button>
    </div>
  );
}
