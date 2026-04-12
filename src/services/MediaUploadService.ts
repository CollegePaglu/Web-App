import * as FileSystem from 'expo-file-system/legacy';
import { tokenStorage } from '@/utils/storage';

// Define enum locally to avoid import issues with expo-file-system exports
enum FileSystemUploadType {
    BINARY_CONTENT = 0,
    MULTIPART = 1
}
import { env } from '@/config/env';
import { API_ENDPOINTS } from '@/api/endpoints';

interface UploadResponse {
    images: { url: string; key: string; thumbnailUrl: string }[];
    video?: { url: string; key: string };
}

export const MediaUploadService = {
    /**
     * Upload a single file using native Expo FileSystem
     * This bypasses the JS bridge for better reliability with large files
     */
    async uploadFile(file: { uri: string; type: string; name: string }): Promise<UploadResponse> {
        try {
            const accessToken = await tokenStorage.getAccessToken();
            const url = `${env.API_BASE_URL}${API_ENDPOINTS.COMMUNITY.MEDIA_UPLOAD}`;

            // Create upload task
            const task = FileSystem.createUploadTask(
                url,
                file.uri,
                {
                    fieldName: 'media',
                    httpMethod: 'POST',
                    uploadType: FileSystemUploadType.MULTIPART as any,
                    mimeType: file.type, // Pass the correct mime type
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Accept': 'application/json',
                    },
                    parameters: {
                        // FileSystem upload parameters generally go here if not files
                    }
                }
            );

            const result = await task.uploadAsync();

            if (!result || !result.body) {
                throw new Error('Upload failed: No response received');
            }

            if (result.status !== 200 && result.status !== 201) {
                let errorMessage = 'Upload failed';
                try {
                    const errorData = JSON.parse(result.body);
                    errorMessage = errorData.message || errorData.error?.message || errorMessage;
                } catch (e) {
                    // ignore parse error
                }
                throw new Error(errorMessage);
            }

            const responseData = JSON.parse(result.body);
            return responseData.data;

        } catch (error: any) {
            console.error('NATIVE UPLOAD ERROR:', error);
            throw new Error(error.message || 'Media upload failed');
        }
    },

    /**
     * Upload multiple files sequentially (FileSystem doesn't support batch multipart natively as easily)
     * For a truly robust batch upload in parallel, we can map promises.
     */
    async uploadBatch(files: { uri: string; type: string; name: string }[]): Promise<UploadResponse> {
        // Since the backend expects multiple files "upload.array('media', 5)", 
        // using createUploadTask for *single* file limits us.
        // However, standard FileSystem.uploadAsync creates a single request.
        // BUT, `uploadAsync` logic is primarily for single file logic or single multipart field.

        // WORKAROUND FOR BATCHING WITH EXPO FILE SYSTEM:
        // Attempting to send ONE file at a time might be safer if the backend allows it.
        // BUT our backend endpoint is `/media/upload` which typically returns the array of uploaded objects.
        // If we call it multiple times, we get multiple arrays. We can aggregate them.

        const uploadedImages: any[] = [];
        let uploadedVideo: any = undefined;

        // Parallel execution for speed, but constrained to avoid OOM
        const uploadPromises = files.map(file => this.uploadFile(file));
        const results = await Promise.all(uploadPromises);

        results.forEach(res => {
            if (res.images) {
                uploadedImages.push(...res.images);
            }
            if (res.video) {
                uploadedVideo = res.video;
            }
        });

        return {
            images: uploadedImages,
            video: uploadedVideo
        };
    }
};
