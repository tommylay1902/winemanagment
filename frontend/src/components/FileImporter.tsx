import { toast } from "@/hooks/use-toast";
import React, { useRef } from "react";
// import { GetWines, ImportFileFromJstoGo } from "../wailsjs/go/main/App";
import { File } from "lucide-react";
import { services } from "wailsjs/go/models";
import { GetWines, ImportFileFromJstoGo } from "../../wailsjs/go/main/App";

interface FileImporterProps {
  setWines: React.Dispatch<React.SetStateAction<services.Wine[]>>;
  setIsInitialLoad: React.Dispatch<React.SetStateAction<boolean>>;
}
const FileImporter: React.FC<FileImporterProps> = ({
  setWines,
  setIsInitialLoad,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const onFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      try {
        const file = event.target.files[0];

        // Immediately process the file
        const ab = await file.arrayBuffer();
        const u = new Uint8Array(ab);
        const base64 = btoa(String.fromCharCode(...u));

        await ImportFileFromJstoGo(base64);

        // Refresh data
        const data = await GetWines();
        setWines(data);
        setIsInitialLoad(false);

        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = "";

        toast({
          title: "Success!",
          description: `Imported ${data.length} wines successfully`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to import file",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <label className="cursor-pointer">
      <input
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={onFileChange}
      />
      <div className="flex items-center p-2 border rounded hover:bg-gray-50 gap-2">
        <File className="h-4 w-4 text-blue-600" />
        <span className="text-sm">Import File</span>
      </div>
    </label>
  );
};

export default FileImporter;
