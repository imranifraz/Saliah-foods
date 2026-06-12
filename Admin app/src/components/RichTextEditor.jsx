import { useCallback, useEffect, useRef, useState } from "react";
import { sanitizeRichHtml } from "../lib/richText.js";

const BLOCK_FORMATS = [
  { value: "p", label: "Paragraph" },
  { value: "h2", label: "Heading 2" },
  { value: "h3", label: "Heading 3" },
  { value: "blockquote", label: "Quote" },
];

const EMPTY_ACTIVE = {
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  unorderedList: false,
  orderedList: false,
  alignLeft: false,
  alignCenter: false,
  alignRight: false,
  alignJustify: false,
  formatBlock: "p",
};

function ToolbarDivider() {
  return <span className="rich-text-editor__divider" aria-hidden />;
}

function ToolbarButton({ title, onClick, active = false, children, className = "" }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onMouseDown={(event) => {
        event.preventDefault();
        onClick();
      }}
      className={`rich-text-editor__btn${active ? " rich-text-editor__btn--active" : ""}${className ? ` ${className}` : ""}`}
    >
      {children}
    </button>
  );
}

function IconBold() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 11h4.5a2.5 2.5 0 0 0 0-5H8v5zm10 4.5a4.5 4.5 0 0 1-4.5 4.5H6V4h6.5a4.5 4.5 0 0 1 3.256 7.606A4.498 4.498 0 0 1 18 15.5zM8 13v5h5.5a2.5 2.5 0 0 0 0-5H8z" />
    </svg>
  );
}

function IconItalic() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z" />
    </svg>
  );
}

function IconUnderline() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z" />
    </svg>
  );
}

function IconStrike() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7.24 8.75c-.26-.48-.39-1.03-.39-1.67 0-2.48 2.05-4.35 5.08-4.35 3.01 0 4.97 1.8 5.08 4.26h-2.52c-.1-1.11-1.04-1.79-2.42-1.79-1.47 0-2.49.94-2.49 2.24 0 .84.39 1.43 1.03 1.91l.01.01H17v2H7.24zm-.13 6.5H17v2H7.11l.01-.01z" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path strokeLinecap="round" d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function IconUnlink() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" d="m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-7.07-.12l-1.72 1.71" />
      <path strokeLinecap="round" d="m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 7.07.12l1.71-1.71" />
      <path strokeLinecap="round" d="m8 8 8 8" />
    </svg>
  );
}

function IconBulletList() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 5h14v2H7V5zm0 6h14v2H7v-2zm0 6h14v2H7v-2zM3 5h2v2H3V5zm0 6h2v2H3v-2zm0 6h2v2H3v-2z" />
    </svg>
  );
}

function IconNumberedList() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M2 17h2v.5H3v1h1v1.5H2V20h4v-1H3v-1h1v-1.5H2V17zm1-8h1V6H2v1h1v2zm-1 4h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm7-5v14h14V8H9zm12 12H11v-6h10v6zm0-10H11V6h10v4z" />
    </svg>
  );
}

function IconIndent() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 21h18v-2H3v2zM3 8v8l4-4-4-4zm8 9h10v-2H11v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z" />
    </svg>
  );
}

function IconOutdent() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 21h18v-2H3v2zM11 17h10v-2H11v2zm-8-5l4 4V8l-4 4zm8-9v2h10V3H3zM3 7h10V5H3v2zm0 4h10v-2H3v2z" />
    </svg>
  );
}

function IconAlignLeft() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 3h18v2H3V3zm0 4h12v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z" />
    </svg>
  );
}

function IconAlignCenter() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 3h18v2H3V3zm3 4h12v2H6V7zm-3 4h18v2H3v-2zm3 4h12v2H6v-2zm-3 4h18v2H3v-2z" />
    </svg>
  );
}

function IconAlignRight() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 3h18v2H3V3zm6 4h12v2H9V7zm-6 4h18v2H3v-2zm6 4h12v2H9v-2zm-6 4h18v2H3v-2z" />
    </svg>
  );
}

function IconAlignJustify() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2zm0 4h18v2H3v-2z" />
    </svg>
  );
}

function IconClearFormat() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" d="M6 20h9" />
      <path strokeLinecap="round" d="M10 4h4l7 12H3l7-12z" />
      <path strokeLinecap="round" d="m14 14-4-4" />
    </svg>
  );
}

function normalizeEditorHtml(html) {
  const cleaned = sanitizeRichHtml(html);
  if (cleaned === "<br>" || cleaned === "<p><br></p>") return "";
  return cleaned;
}

function readFormatBlock() {
  const value = String(document.queryCommandValue("formatBlock") ?? "")
    .replace(/[<>]/g, "")
    .toLowerCase();
  return value || "p";
}

function getLinkUrlFromSelection() {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return "";
  let node = selection.anchorNode;
  if (node?.nodeType === Node.TEXT_NODE) node = node.parentElement;
  const anchor = node?.closest?.("a");
  return anchor?.getAttribute("href") ?? "";
}

export function RichTextEditor({
  id,
  labelId,
  value,
  onChange,
  placeholder = "Start typing…",
  minHeight = 120,
}) {
  const editorRef = useRef(null);
  const chromeRef = useRef(null);
  const toolbarRef = useRef(null);
  const linkInputRef = useRef(null);
  const savedRangeRef = useRef(null);
  const lastEmittedRef = useRef(null);
  const [active, setActive] = useState(EMPTY_ACTIVE);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    if (chromeRef.current?.contains(document.activeElement)) return;

    const next = value || "";
    const fromInternalEdit = value === lastEmittedRef.current;
    const editorLooksEmpty = !editor.textContent?.trim();
    if (fromInternalEdit && !(next && editorLooksEmpty)) return;

    if (editor.innerHTML !== next) {
      editor.innerHTML = next;
    }
    lastEmittedRef.current = value;
  }, [value]);

  useEffect(() => {
    if (!labelId) return;
    const label = document.getElementById(labelId);
    if (!label) return;

    function focusEditor() {
      editorRef.current?.focus();
    }

    label.addEventListener("click", focusEditor);
    label.style.cursor = "text";
    return () => label.removeEventListener("click", focusEditor);
  }, [labelId]);

  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const editor = editorRef.current;
    if (!editor) return;
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;
    savedRangeRef.current = range.cloneRange();
  }, []);

  const restoreSelection = useCallback(() => {
    const range = savedRangeRef.current;
    if (!range) return;
    const selection = window.getSelection();
    if (!selection) return;
    selection.removeAllRanges();
    selection.addRange(range);
  }, []);

  const refreshActive = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const range = selection.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;

    saveSelection();
    setActive({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      strike: document.queryCommandState("strikeThrough"),
      unorderedList: document.queryCommandState("insertUnorderedList"),
      orderedList: document.queryCommandState("insertOrderedList"),
      alignLeft: document.queryCommandState("justifyLeft"),
      alignCenter: document.queryCommandState("justifyCenter"),
      alignRight: document.queryCommandState("justifyRight"),
      alignJustify: document.queryCommandState("justifyFull"),
      formatBlock: readFormatBlock(),
    });
  }, [saveSelection]);

  useEffect(() => {
    document.addEventListener("selectionchange", refreshActive);
    return () => document.removeEventListener("selectionchange", refreshActive);
  }, [refreshActive]);

  function emitChange() {
    const editor = editorRef.current;
    if (!editor) return;
    const normalized = normalizeEditorHtml(editor.innerHTML);
    lastEmittedRef.current = normalized;
    onChange(normalized);
  }

  function runCommand(command, commandValue) {
    restoreSelection();
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    emitChange();
    refreshActive();
  }

  function handleBlockChange(event) {
    const block = event.target.value;
    runCommand("formatBlock", block);
  }

  function openLinkPopover() {
    saveSelection();
    setLinkUrl(getLinkUrlFromSelection() || "https://");
    setLinkOpen(true);
    window.setTimeout(() => linkInputRef.current?.focus(), 0);
  }

  function applyLink() {
    const url = linkUrl.trim();
    if (!url) return;
    setLinkOpen(false);
    runCommand("createLink", url);
  }

  function closeLinkPopover() {
    setLinkOpen(false);
    editorRef.current?.focus();
  }

  function handleChromeFocusOut(event) {
    if (chromeRef.current?.contains(event.relatedTarget)) return;
    setLinkOpen(false);
  }

  return (
    <div className="rich-text-editor mt-1.5">
      <div ref={chromeRef} className="rich-text-editor__chrome" onFocusOut={handleChromeFocusOut}>
        <div
          ref={toolbarRef}
          className="rich-text-editor__toolbar"
          role="toolbar"
          aria-label="Text formatting"
        >
          <label className="rich-text-editor__format-select">
            <span className="sr-only">Text style</span>
            <select
              value={active.formatBlock}
              onMouseDown={(event) => {
                event.preventDefault();
                saveSelection();
              }}
              onChange={handleBlockChange}
              aria-label="Text style"
            >
              {BLOCK_FORMATS.map((format) => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
          </label>

          <ToolbarDivider />

          <div className="rich-text-editor__group" role="group" aria-label="Inline formatting">
            <ToolbarButton title="Bold (Ctrl+B)" active={active.bold} onClick={() => runCommand("bold")}>
              <IconBold />
            </ToolbarButton>
            <ToolbarButton title="Italic (Ctrl+I)" active={active.italic} onClick={() => runCommand("italic")}>
              <IconItalic />
            </ToolbarButton>
            <ToolbarButton
              title="Underline (Ctrl+U)"
              active={active.underline}
              onClick={() => runCommand("underline")}
            >
              <IconUnderline />
            </ToolbarButton>
            <ToolbarButton title="Strikethrough" active={active.strike} onClick={() => runCommand("strikeThrough")}>
              <IconStrike />
            </ToolbarButton>
          </div>

          <ToolbarDivider />

          <div className="rich-text-editor__group rich-text-editor__group--link" role="group" aria-label="Links">
            <ToolbarButton title="Insert link" onClick={openLinkPopover}>
              <IconLink />
            </ToolbarButton>
            <ToolbarButton title="Remove link" onClick={() => runCommand("unlink")}>
              <IconUnlink />
            </ToolbarButton>
            {linkOpen ? (
              <div className="rich-text-editor__link-popover" role="dialog" aria-label="Insert link">
                <input
                  ref={linkInputRef}
                  type="url"
                  value={linkUrl}
                  onChange={(event) => setLinkUrl(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      applyLink();
                    }
                    if (event.key === "Escape") {
                      event.preventDefault();
                      closeLinkPopover();
                    }
                  }}
                  placeholder="https://"
                  className="rich-text-editor__link-input"
                />
                <button
                  type="button"
                  className="rich-text-editor__link-apply"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={applyLink}
                >
                  Apply
                </button>
                <button
                  type="button"
                  className="rich-text-editor__link-cancel"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={closeLinkPopover}
                >
                  Cancel
                </button>
              </div>
            ) : null}
          </div>

          <ToolbarDivider />

          <div className="rich-text-editor__group" role="group" aria-label="Lists">
            <ToolbarButton
              title="Bullet list"
              active={active.unorderedList}
              onClick={() => runCommand("insertUnorderedList")}
            >
              <IconBulletList />
            </ToolbarButton>
            <ToolbarButton
              title="Numbered list"
              active={active.orderedList}
              onClick={() => runCommand("insertOrderedList")}
            >
              <IconNumberedList />
            </ToolbarButton>
            <ToolbarButton title="Increase indent" onClick={() => runCommand("indent")}>
              <IconIndent />
            </ToolbarButton>
            <ToolbarButton title="Decrease indent" onClick={() => runCommand("outdent")}>
              <IconOutdent />
            </ToolbarButton>
          </div>

          <ToolbarDivider />

          <div className="rich-text-editor__group" role="group" aria-label="Alignment">
            <ToolbarButton title="Align left" active={active.alignLeft} onClick={() => runCommand("justifyLeft")}>
              <IconAlignLeft />
            </ToolbarButton>
            <ToolbarButton
              title="Align center"
              active={active.alignCenter}
              onClick={() => runCommand("justifyCenter")}
            >
              <IconAlignCenter />
            </ToolbarButton>
            <ToolbarButton title="Align right" active={active.alignRight} onClick={() => runCommand("justifyRight")}>
              <IconAlignRight />
            </ToolbarButton>
            <ToolbarButton title="Justify" active={active.alignJustify} onClick={() => runCommand("justifyFull")}>
              <IconAlignJustify />
            </ToolbarButton>
          </div>

          <ToolbarDivider />

          <ToolbarButton title="Clear formatting" onClick={() => runCommand("removeFormat")}>
            <IconClearFormat />
          </ToolbarButton>
        </div>

        <div
          id={id}
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-labelledby={labelId || undefined}
          data-placeholder={placeholder}
          onInput={emitChange}
          onFocus={refreshActive}
          onMouseUp={refreshActive}
          onKeyUp={refreshActive}
          className="rich-text-editor__field"
          style={{ minHeight }}
        />
      </div>
    </div>
  );
}
