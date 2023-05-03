export const API_MESSAGES = <const>{
  UPLOAD_DESCRIPTION: 'Upload file method to storage.',
  DOWNLOAD_DESCRIPTION: 'Download file method from storage.',
  GET_FILE_DESCRIPTION: 'Get one file from storage by id.',
  GET_FILES_DESCRIPTION: 'Get many files from storage.',
  DELETE_FILE_DESCRIPTION: 'Delete one file from storage by id.',
  RENAME_FILE_DESCRIPTION: 'Rename one file by id.',
};

export const ERROR_MESSAGES = <const>{
  NOT_FOUND: 'File has not found.',
  INVALID_DELETE_TYPE: 'Invalid request type for delete operation.',
  ALREADY_UPLOADED: 'File has already uploaded.',
  NOT_EXISTS_IN_THRASH: 'File do not exist in thrash.',
  INVALID_QUERY_PARAMETERS: 'Invalid query parameters for this operation.',
};
