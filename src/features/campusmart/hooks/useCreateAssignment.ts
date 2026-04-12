/**
 * useCreateAssignment Hook
 * 
 * Form state management for creating assignments
 */

import { useState, useCallback } from 'react';
import {
    createAssignment,
    uploadAttachments,
    AssignmentType,
    CreateAssignmentData,
    Assignment,
} from '@/api/assignmentApi';

interface UploadedFile {
    uri: string;
    type: string;
    name: string;
}

interface FormData {
    type: AssignmentType | null;
    title: string;
    description: string;
    requirements: string[];
    deadline: Date | null;
    budget: {
        min: number;
        max: number;
    };
}

interface FormErrors {
    type?: string;
    title?: string;
    description?: string;
    deadline?: string;
    budget?: string;
}

interface UseCreateAssignmentReturn {
    formData: FormData;
    files: UploadedFile[];
    errors: FormErrors;
    isSubmitting: boolean;
    uploadProgress: number;

    setType: (type: AssignmentType) => void;
    setTitle: (title: string) => void;
    setDescription: (description: string) => void;
    setRequirements: (requirements: string[]) => void;
    setDeadline: (deadline: Date) => void;
    setBudget: (budget: { min: number; max: number }) => void;
    setFiles: (files: UploadedFile[]) => void;

    addRequirement: (requirement: string) => void;
    removeRequirement: (index: number) => void;

    validate: () => boolean;
    submit: () => Promise<Assignment | null>;
    reset: () => void;
}

const initialFormData: FormData = {
    type: null,
    title: '',
    description: '',
    requirements: [],
    deadline: null,
    budget: { min: 0, max: 0 },
};

export const useCreateAssignment = (): UseCreateAssignmentReturn => {
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const setType = useCallback((type: AssignmentType) => {
        setFormData(prev => ({ ...prev, type }));
        setErrors(prev => ({ ...prev, type: undefined }));
    }, []);

    const setTitle = useCallback((title: string) => {
        setFormData(prev => ({ ...prev, title }));
        setErrors(prev => ({ ...prev, title: undefined }));
    }, []);

    const setDescription = useCallback((description: string) => {
        setFormData(prev => ({ ...prev, description }));
        setErrors(prev => ({ ...prev, description: undefined }));
    }, []);

    const setRequirements = useCallback((requirements: string[]) => {
        setFormData(prev => ({ ...prev, requirements }));
    }, []);

    const setDeadline = useCallback((deadline: Date) => {
        setFormData(prev => ({ ...prev, deadline }));
        setErrors(prev => ({ ...prev, deadline: undefined }));
    }, []);

    const setBudget = useCallback((budget: { min: number; max: number }) => {
        setFormData(prev => ({ ...prev, budget }));
        setErrors(prev => ({ ...prev, budget: undefined }));
    }, []);

    const addRequirement = useCallback((requirement: string) => {
        if (requirement.trim()) {
            setFormData(prev => ({
                ...prev,
                requirements: [...prev.requirements, requirement.trim()],
            }));
        }
    }, []);

    const removeRequirement = useCallback((index: number) => {
        setFormData(prev => ({
            ...prev,
            requirements: prev.requirements.filter((_, i) => i !== index),
        }));
    }, []);

    const validate = useCallback((): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.type) {
            newErrors.type = 'Please select an assignment type';
        }

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.length < 5) {
            newErrors.title = 'Title must be at least 5 characters';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.length < 20) {
            newErrors.description = 'Description must be at least 20 characters';
        }

        if (!formData.deadline) {
            newErrors.deadline = 'Deadline is required';
        } else if (formData.deadline < new Date()) {
            newErrors.deadline = 'Deadline must be in the future';
        }

        if (formData.budget.min <= 0 || formData.budget.max <= 0) {
            newErrors.budget = 'Please enter a valid budget range';
        } else if (formData.budget.min > formData.budget.max) {
            newErrors.budget = 'Minimum cannot be greater than maximum';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const submit = useCallback(async (): Promise<Assignment | null> => {
        if (!validate()) return null;
        if (isSubmitting) return null;

        setIsSubmitting(true);
        setUploadProgress(0);

        try {
            // Upload attachments first (if any)
            let attachmentUrls: string[] = [];
            let uploadWarning = '';

            if (files.length > 0) {
                setUploadProgress(10);
                try {
                    attachmentUrls = await uploadAttachments(files);
                    setUploadProgress(50);
                } catch (uploadError: any) {
                    // Log the error but continue without attachments
                    console.warn('File upload failed, creating assignment without attachments:', uploadError);
                    uploadWarning = 'Note: Files could not be uploaded due to network issues. You can add attachments later.';
                    attachmentUrls = [];
                }
            }

            // Create assignment
            const data: CreateAssignmentData = {
                type: formData.type!,
                title: formData.title.trim(),
                description: formData.description.trim(),
                requirements: formData.requirements.filter(r => r.trim()),
                attachments: attachmentUrls,
                deadline: formData.deadline!.toISOString(),
                budget: formData.budget,
            };

            setUploadProgress(75);
            const assignment = await createAssignment(data);
            setUploadProgress(100);

            // Return assignment with warning if applicable
            if (uploadWarning) {
                (assignment as any)._uploadWarning = uploadWarning;
            }

            return assignment;
        } catch (err: any) {
            console.error('Failed to create assignment:', err);
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, files, isSubmitting, validate]);

    const reset = useCallback(() => {
        setFormData(initialFormData);
        setFiles([]);
        setErrors({});
        setUploadProgress(0);
    }, []);

    return {
        formData,
        files,
        errors,
        isSubmitting,
        uploadProgress,

        setType,
        setTitle,
        setDescription,
        setRequirements,
        setDeadline,
        setBudget,
        setFiles,

        addRequirement,
        removeRequirement,

        validate,
        submit,
        reset,
    };
};

export default useCreateAssignment;
