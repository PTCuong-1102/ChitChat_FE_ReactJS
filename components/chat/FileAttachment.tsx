import React, { useState } from 'react';
import { apiService } from '../../services/apiService';
import { TrashIcon, DownloadIcon, PhotoIcon, DocumentIcon, FolderIcon, ArchiveIcon } from '../icons/Icons';

interface FileAttachmentProps {
  attachment: {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    fileUrl: string;
    messageId: string;
  };
  showDelete?: boolean;
  onDelete?: (attachmentId: string) => void;
}

const FileAttachment: React.FC<FileAttachmentProps> = ({ 
  attachment, 
  showDelete = false, 
  onDelete 
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string): React.JSX.Element => {
    if (fileType.startsWith('image/')) {
      return <PhotoIcon className="w-6 h-6 text-pink-500" />;
    } else if (fileType === 'application/pdf') {
      return <DocumentIcon className="w-6 h-6 text-red-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <DocumentIcon className="w-6 h-6 text-blue-500" />;
    } else if (fileType === 'text/plain') {
      return <DocumentIcon className="w-6 h-6 text-gray-500" />;
    } else if (fileType.includes('zip') || fileType.includes('rar')) {
      return <ArchiveIcon className="w-6 h-6 text-yellow-500" />;
    } else {
      return <FolderIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const getFileTypeLabel = (fileType: string): string => {
    if (fileType.startsWith('image/')) {
      return 'Image';
    } else if (fileType === 'application/pdf') {
      return 'PDF';
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return 'Word Document';
    } else if (fileType === 'text/plain') {
      return 'Text File';
    } else if (fileType.includes('zip')) {
      return 'ZIP Archive';
    } else if (fileType.includes('rar')) {
      return 'RAR Archive';
    } else {
      return 'File';
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadError(null);

    try {
      // Extract filename from fileUrl (remove the UUID part)
      const fileName = attachment.fileUrl.split('/').pop() || attachment.fileName;
      const blob = await apiService.downloadFile(fileName);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.fileName;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadError(error instanceof Error ? error.message : 'Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(attachment.id);
    }
  };

  const isImage = attachment.fileType.startsWith('image/');

  return (
    <div className="file-attachment border border-gray-200 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1">
          {/* File Icon or Preview */}
          <div className="flex-shrink-0">
            {isImage ? (
              <img
                src={attachment.fileUrl}
                alt={attachment.fileName}
                className="w-10 h-10 rounded object-cover"
                onError={(e) => {
                  // Fallback to icon if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-10 h-10 rounded bg-pink-100 flex items-center justify-center ${isImage ? 'hidden' : ''}`}>
              {getFileIcon(attachment.fileType)}
            </div>
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {attachment.fileName}
            </p>
            <p className="text-xs text-gray-500">
              {getFileTypeLabel(attachment.fileType)} • {formatFileSize(attachment.fileSize)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="p-2 text-gray-500 hover:text-pink-500 hover:bg-pink-50 rounded-full transition-colors disabled:opacity-50"
            title="Download file"
          >
            {isDownloading ? (
              <div className="w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <DownloadIcon className="w-4 h-4" />
            )}
          </button>
          {showDelete && onDelete && (
            <button
              onClick={() => onDelete(attachment.id)}
              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="Delete attachment"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {downloadError && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
          {downloadError}
        </div>
      )}
    </div>
  );
};

export default FileAttachment;