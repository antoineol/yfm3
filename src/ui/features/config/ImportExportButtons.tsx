import { useRef, useState } from "react";
import { Button } from "../../components/Button.tsx";
import { useImportExport } from "./use-import-export.ts";

interface ImportExportButtonsProps {
  onImportDone: () => void;
}

export function ImportExportButtons({ onImportDone }: ImportExportButtonsProps) {
  const { handleExport, handleImport, isExportReady } = useImportExport();
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset so the same file can be re-selected
    e.target.value = "";

    if (!window.confirm("This will replace your collection and deck. Continue?")) return;

    setIsImporting(true);
    try {
      const success = await handleImport(file);
      if (success) onImportDone();
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="flex gap-3">
      <Button
        className="flex-1"
        disabled={!isExportReady}
        onClick={handleExport}
        size="sm"
        variant="outline"
      >
        Export
      </Button>
      <Button
        className="flex-1"
        disabled={isImporting}
        onClick={() => fileInputRef.current?.click()}
        size="sm"
        variant="outline"
      >
        {isImporting ? "Importing…" : "Import"}
      </Button>
      <input
        accept=".json"
        className="hidden"
        onChange={(e) => void onFileSelected(e)}
        ref={fileInputRef}
        type="file"
      />
    </div>
  );
}
