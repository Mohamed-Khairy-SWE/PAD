export type IFile = {
    id: string;
    filename: string;
    originalName: string;
    path: string;
    size: number;
    mimetype: string;
    uploadedBy: string;
    createdAt: Date;
};

export type FileUploadResponse = {
    filename: string;
    path: string;
    size: number;
};

export type MultipleFilesUploadResponse = {
    files: FileUploadResponse[];
};
