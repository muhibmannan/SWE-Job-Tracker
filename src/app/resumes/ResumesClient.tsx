"use client";

import { useState, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { Resume } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import { formatRelativeDate, formatAbsoluteDate } from "@/lib/dateUtils";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function ResumesClient({
  user,
  initialResumes,
  firstName,
  usageCount,
}: {
  user: User;
  initialResumes: Resume[];
  firstName: string | null;
  usageCount: Record<string, number>;
}) {
  const supabase = createClient();
  const [resumes, setResumes] = useState<Resume[]>(initialResumes);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [label, setLabel] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSize = resumes.reduce((sum, r) => sum + (r.file_size ?? 0), 0);

  const handleFileSelect = (file: File) => {
    setError(null);
    if (file.type !== "application/pdf") {
      setError("// error: only pdf files accepted");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(
        `// error: file exceeds 2mb limit (got ${formatFileSize(file.size)})`,
      );
      return;
    }
    setPendingFile(file);
    if (!label) setLabel(file.name.replace(/\.pdf$/i, ""));
  };

  const handleUpload = async () => {
    if (!pendingFile || !label.trim() || uploading) return;
    setUploading(true);
    setError(null);

    try {
      const ext = pendingFile.name.split(".").pop() ?? "pdf";
      const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const path = `${user.id}/${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(path, pendingFile, {
          cacheControl: "3600",
          contentType: "application/pdf",
        });

      if (uploadError) throw uploadError;

      const { data: inserted, error: insertError } = await supabase
        .from("resumes")
        .insert({
          user_id: user.id,
          label: label.trim(),
          file_path: path,
          filename: pendingFile.name,
          file_size: pendingFile.size,
        })
        .select()
        .single();

      if (insertError) {
        await supabase.storage.from("resumes").remove([path]);
        throw insertError;
      }

      setResumes((r) => [inserted as Resume, ...r]);
      setPendingFile(null);
      setLabel("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error(err);
      setError("// error: upload failed → please try again");
    }
    setUploading(false);
  };

  const handleDownload = async (resume: Resume) => {
    const { data, error } = await supabase.storage
      .from("resumes")
      .createSignedUrl(resume.file_path, 60);
    if (error || !data) {
      setError("// error: could not generate download link");
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const handleDelete = async (resume: Resume) => {
    if (
      !confirm(
        `Delete "${resume.label}"? This will unlink it from any applications using it.`,
      )
    )
      return;

    const { error: dbError } = await supabase
      .from("resumes")
      .delete()
      .eq("id", resume.id);
    if (dbError) {
      setError("// error: delete failed");
      return;
    }

    await supabase.storage.from("resumes").remove([resume.file_path]);
    setResumes((r) => r.filter((x) => x.id !== resume.id));
  };

  const cancelPending = () => {
    setPendingFile(null);
    setLabel("");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <Navbar email={user.email ?? ""} firstName={firstName} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10 pb-28 sm:pb-10">
        {/* Hero */}
        <div
          className="pb-6 sm:pb-8 mb-6 sm:mb-8"
          style={{ borderBottom: "0.5px solid var(--border)" }}
        >
          <h1
            className="text-6xl font-medium tracking-tight leading-none"
            style={{ color: "var(--text)" }}
          >
            {resumes.length}
            <span
              className="text-4xl ml-1"
              style={{ color: "var(--text-dim)" }}
            >
              /resumes
            </span>
          </h1>
          <p className="mono text-sm mt-3" style={{ color: "var(--text-dim)" }}>
            // {formatFileSize(totalSize) || "0 B"} used · pdf only · max 2mb
            per file
          </p>
        </div>

        {/* Upload section */}
        <div className="flex items-center gap-3 mb-5">
          <p
            className="mono text-sm uppercase tracking-widest"
            style={{ color: "var(--text-dim)" }}
          >
            // upload
          </p>
          <div
            className="flex-1 h-[0.5px]"
            style={{ background: "var(--border)" }}
          />
        </div>

        {!pendingFile ? (
          <label
            htmlFor="resume-upload"
            className="block mb-8 cursor-pointer rounded-lg p-8 text-center transition-colors hover:opacity-80"
            style={{
              background: "var(--bg-elev)",
              border: "0.5px dashed var(--border-strong)",
            }}
          >
            <p className="mono text-base" style={{ color: "var(--text-dim)" }}>
              <span style={{ color: "var(--accent)" }}>$ </span>
              drop a pdf or tap to select
            </p>
            <p
              className="mono text-xs mt-2"
              style={{ color: "var(--text-muted)" }}
            >
              // max 2mb · pdf only
            </p>
            <input
              ref={fileInputRef}
              id="resume-upload"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
          </label>
        ) : (
          <div
            className="mb-8 rounded-lg p-5 space-y-4"
            style={{
              background: "var(--bg-elev)",
              border: "0.5px solid var(--border)",
            }}
          >
            <div>
              <p
                className="mono text-xs uppercase tracking-widest mb-2"
                style={{ color: "var(--text-dim)" }}
              >
                file
              </p>
              <p className="mono text-sm" style={{ color: "var(--text)" }}>
                {pendingFile.name}{" "}
                <span style={{ color: "var(--text-dim)" }}>
                  ({formatFileSize(pendingFile.size)})
                </span>
              </p>
            </div>
            <div>
              <label
                className="mono text-xs uppercase tracking-widest mb-2 block"
                style={{ color: "var(--text-dim)" }}
              >
                label
              </label>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. v2 — tailored for fintech"
                className="w-full mono px-3 rounded-lg outline-none border transition-colors focus:border-[var(--accent)]"
                style={{
                  background: "var(--bg)",
                  borderColor: "var(--border-strong)",
                  color: "var(--text)",
                  fontSize: "16px",
                  minHeight: "44px",
                }}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={cancelPending}
                className="flex-1 sm:flex-none mono text-sm px-4 py-3 rounded-lg transition-colors hover:opacity-70"
                style={{
                  border: "0.5px solid var(--border-strong)",
                  color: "var(--text-dim)",
                }}
              >
                cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={uploading || !label.trim()}
                className="flex-1 mono text-sm font-medium py-3 rounded-lg transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: "var(--accent)",
                  color: "#0A0A0A",
                  opacity: uploading || !label.trim() ? 0.4 : 1,
                  cursor:
                    uploading || !label.trim() ? "not-allowed" : "pointer",
                }}
              >
                {uploading ? "$ uploading..." : "$ upload"}
              </button>
            </div>
          </div>
        )}

        {error && (
          <p className="mono text-sm mb-6" style={{ color: "var(--red)" }}>
            {error}
          </p>
        )}

        {/* Library */}
        <div className="flex items-center gap-3 mb-5">
          <p
            className="mono text-sm uppercase tracking-widest"
            style={{ color: "var(--text-dim)" }}
          >
            // library
          </p>
          <div
            className="flex-1 h-[0.5px]"
            style={{ background: "var(--border)" }}
          />
        </div>

        {resumes.length === 0 ? (
          <div className="text-center py-16">
            <p className="mono text-base" style={{ color: "var(--text-dim)" }}>
              // no resumes yet → upload one above to get started
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="grid grid-cols-[1fr_auto] gap-4 items-center py-4 px-4 sm:px-5 rounded-lg transition-colors"
                style={{ background: "transparent" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--bg-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <div className="min-w-0">
                  <div
                    className="text-base font-medium truncate flex items-center gap-2"
                    style={{ color: "var(--text)" }}
                  >
                    <span className="truncate">{resume.label}</span>
                    {usageCount[resume.id] > 0 && (
                      <span
                        className="mono text-xs font-normal px-2 py-0.5 rounded shrink-0"
                        style={{
                          background: "var(--accent-bg)",
                          color: "var(--accent)",
                          border: "0.5px solid var(--accent)",
                        }}
                      >
                        {usageCount[resume.id]} app
                        {usageCount[resume.id] === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>
                  <div
                    className="mono text-sm mt-1 truncate"
                    style={{ color: "var(--text-dim)" }}
                    title={formatAbsoluteDate(resume.created_at)}
                  >
                    {resume.filename} · {formatFileSize(resume.file_size)} ·
                    uploaded {formatRelativeDate(resume.created_at)}
                  </div>
                </div>
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={() => handleDownload(resume)}
                    className="mono text-xs sm:text-sm px-2 sm:px-3 py-2 rounded-lg transition-opacity hover:opacity-70"
                    style={{
                      border: "0.5px solid var(--border-strong)",
                      color: "var(--text)",
                    }}
                  >
                    view
                  </button>
                  <button
                    onClick={() => handleDelete(resume)}
                    className="mono text-xs sm:text-sm px-2 sm:px-3 py-2 rounded-lg transition-opacity hover:opacity-70"
                    style={{
                      border: "0.5px solid var(--border-strong)",
                      color: "var(--red)",
                    }}
                  >
                    del
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  );
}
