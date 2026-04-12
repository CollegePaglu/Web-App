import { tokenStorage } from '@/utils/storage';
import { env } from '@/config/env';
import { API_ENDPOINTS } from '@/api/endpoints';

interface UploadResponse {
    images: { url: string; key: string; thumbnailUrl: string }[];
    video?: { url: string; key: string };
}

export const MediaUploadService = {
    /**
     * Upload a single file using standard web Fetch API
     */
    async uploadFile(file: File): Promise<UploadResponse> {
        try {
            const accessToken = await tokenStorage.getAccessToken();
            const url = `${env.API_BASE_URL}${API_ENDPOINTS.COMMUNITY.MEDIA_UPLOAD}`;

            const formData = new FormData();
            formData.append('media', file);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json',
                    // Note: Don't set Content-Type manually when using FormData, 
                    // the browser will automatically set it with the correct boundary
                },
                body: formData
            });

            const resultText = await response.text();

            if (!response.ok) {
                let errorMessage = 'Upload failed';
                try {
                    const errorData = JSON.parse(resultText);
                    errorMessage = errorData.message || errorData.error?.message || errorMessage;
                } catch (e) {
                    // ignore parse error
                }
                throw new Error(errorMessage);
            }

            const responseData = JSON.parse(resultText);
            return responseData.data;

        } catch (error: any) {
            console.error('WEB UPLOAD ERROR:', error);
            throw new Error(error.message || 'Media upload failed');
        }
    },

    /**
     * Upload multiple files
     */
    async uploadBatch(files: File[]): Promise<UploadResponse> {
        const uploadedImages: any[] = [];
        let uploadedVideo: any = undefined;

        // Parallel execution for speed
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
