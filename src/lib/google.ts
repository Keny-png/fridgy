export const DISCOVERY_DOCS = [
    'https://sheets.googleapis.com/$discovery/rest?version=v4',
    'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
];

export const SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive';

export interface UserProfile {
    name: string;
    email: string;
    photoUrl: string;
}

/**
 * Note: The actual initialization of the GIS client happens in the AuthContext.
 * This file contains constants and helper types.
 */
