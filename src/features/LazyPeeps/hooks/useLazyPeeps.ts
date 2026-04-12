import { useState, useEffect, useCallback } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { Alert } from 'react-native';
import { LazyPeepsService, Product, PageConfig, PageAnalysis } from '../services/LazyPeepsService';
import { useVendorCart } from './useVendorCart';

export type TabType = 'printouts' | 'snaks' | 'orders';

const COLOR_PRICE = 10; // Fixed color price per page

export interface PrintoutConfig {
    bwPages: number;
    colorPages: number;
    binding: boolean;
}

interface UseLazyPeepsOptions {
    onPrintoutAdded?: () => void;
}

export const useLazyPeeps = (options?: UseLazyPeepsOptions) => {
    const [activeTab, setActiveTab] = useState<TabType>('printouts');
    const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
    const [printConfig, setPrintConfig] = useState<PrintoutConfig>({ bwPages: 1, colorPages: 0, binding: false });

    // Product Discovery State
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [categories, setCategories] = useState<string[]>([]);

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Page analysis state
    const [analyzing, setAnalyzing] = useState(false);
    const [pageConfigs, setPageConfigs] = useState<PageConfig[]>([]);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    // Call useVendorCart hook at top level (BEFORE nested functions)
    const { addPrintoutToCart } = useVendorCart();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const allProducts = await LazyPeepsService.getAllProducts();
            setProducts(allProducts);
            setFilteredProducts(allProducts);

            // Extract unique categories
            const uniqueCategories = Array.from(new Set(allProducts.map(p => p.category).filter(Boolean)));
            setCategories(uniqueCategories);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchProducts();
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        filterProducts(query, selectedCategory);
    };

    const handleCategorySelect = (category: string | null) => {
        setSelectedCategory(category);
        filterProducts(searchQuery, category);
    };

    const filterProducts = (query: string, category: string | null) => {
        let result = products;

        if (query) {
            const lowerQuery = query.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(lowerQuery) ||
                p.description?.toLowerCase().includes(lowerQuery)
            );
        }

        if (category) {
            result = result.filter(p => p.category === category);
        }

        setFilteredProducts(result);
    };

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
    };

    const handleFilePick = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                setSelectedFile(file);
                // Reset previous analysis
                setPageConfigs([]);
                setAnalysisError(null);
                setUploadedFileUrl(null);

                // Only analyze document for page-level customization
                // The file will be uploaded when placing the order
                await analyzeDocumentForPrint(file);
            }
        } catch (err) {
            console.error("Error picking file:", err);
            Alert.alert("Error", "Failed to pick file.");
        }
    };

    const handleFileUpload = async (file: DocumentPicker.DocumentPickerAsset) => {
        setUploading(true);
        try {
            console.log('🔄 Starting file upload:', file.name);
            const result = await LazyPeepsService.uploadFile(file);
            console.log('Upload result:', result);

            if (result && result.url) {
                setUploadedFileUrl(result.url);
                console.log('✅ File uploaded successfully:', result.url);
            } else if (result && result.path) {
                setUploadedFileUrl(result.path);
                console.log('✅ File uploaded successfully:', result.path);
            } else if (typeof result === 'string') {
                setUploadedFileUrl(result);
                console.log('✅ File uploaded successfully:', result);
            } else {
                console.error('Unexpected upload response:', result);
                throw new Error("Invalid upload response - no URL returned");
            }
        } catch (error: any) {
            console.error("❌ Upload error:", error);
            const errorMsg = error.response?.data?.error ||
                error.response?.data?.message ||
                error.message ||
                "Could not upload file. Please try again.";
            Alert.alert("Upload Failed", errorMsg);
            setSelectedFile(null);
            setUploadedFileUrl(null);
        } finally {
            setUploading(false);
        }
    };

    // Analyze document for ink coverage
    const analyzeDocumentForPrint = async (file: DocumentPicker.DocumentPickerAsset) => {
        setAnalyzing(true);
        setAnalysisError(null);
        try {
            console.log('🔍 Starting document analysis for:', file.name);
            const result = await LazyPeepsService.analyzeDocument(file);

            // Convert analysis results to page configs
            const configs: PageConfig[] = result.pages.map((page: PageAnalysis) => ({
                pageNumber: page.pageNumber,
                selected: true, // All selected by default
                printMode: 'bw' as const, // Default to B&W
                inkTier: page.tier,
                bwPrice: page.price, // Price from ink analysis
                colorPrice: COLOR_PRICE,
                previewBase64: page.previewBase64,
            }));

            setPageConfigs(configs);

            // Update printConfig based on analysis
            setPrintConfig(prev => ({
                ...prev,
                bwPages: configs.length,
                colorPages: 0,
            }));

            console.log('✅ Analysis complete:', configs.length, 'pages');
        } catch (error: any) {
            console.error('❌ Analysis error:', error);
            setAnalysisError(error.message || 'Failed to analyze document');
            // Fallback to basic mode - user can still set pages manually
        } finally {
            setAnalyzing(false);
        }
    };

    // Page toggle handlers
    const handlePageToggle = useCallback((pageNumber: number) => {
        setPageConfigs(prev => prev.map(p =>
            p.pageNumber === pageNumber ? { ...p, selected: !p.selected } : p
        ));
    }, []);

    const handlePageModeChange = useCallback((pageNumber: number, mode: 'bw' | 'color') => {
        setPageConfigs(prev => prev.map(p =>
            p.pageNumber === pageNumber ? { ...p, printMode: mode } : p
        ));
    }, []);

    const handleSelectAllPages = useCallback(() => {
        setPageConfigs(prev => prev.map(p => ({ ...p, selected: true })));
    }, []);

    const handleDeselectAllPages = useCallback(() => {
        setPageConfigs(prev => prev.map(p => ({ ...p, selected: false })));
    }, []);

    const handleAllBW = useCallback(() => {
        setPageConfigs(prev => prev.map(p => ({ ...p, printMode: 'bw' as const })));
    }, []);

    const handleAllColor = useCallback(() => {
        setPageConfigs(prev => prev.map(p => ({ ...p, printMode: 'color' as const })));
    }, []);

    // Calculate total from selected pages
    const calculateTotalFromPages = useCallback(() => {
        const selectedPages = pageConfigs.filter(p => p.selected);
        const pageTotal = selectedPages.reduce((sum, p) => {
            return sum + (p.printMode === 'bw' ? p.bwPrice : p.colorPrice);
        }, 0);
        const bindingCost = printConfig.binding ? 30 : 0;
        return pageTotal + bindingCost;
    }, [pageConfigs, printConfig.binding]);

    const handlePrintConfigChange = (key: keyof PrintoutConfig, value: number | boolean) => {
        setPrintConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleOrderPrintout = async () => {
        if (!selectedFile) {
            Alert.alert("No File", "Please select a file to print.");
            return;
        }

        if (analyzing) {
            Alert.alert("Please Wait", "Document is still being analyzed...");
            return;
        }

        // Check if we have page configs from analysis
        const hasPageAnalysis = pageConfigs.length > 0;
        const selectedPages = pageConfigs.filter(p => p.selected);

        // Validate at least some pages selected
        if (hasPageAnalysis && selectedPages.length === 0) {
            Alert.alert("No Pages Selected", "Please select at least one page to print.");
            return;
        }

        // Fallback: if no page analysis, use manual config
        if (!hasPageAnalysis && printConfig.bwPages === 0 && printConfig.colorPages === 0) {
            Alert.alert("Invalid Config", "Please select at least some pages to print.");
            return;
        }

        try {
            // Calculate total based on page configs or manual config
            let totalCost: number;
            let bwCount = 0;
            let colorCount = 0;

            if (hasPageAnalysis) {
                totalCost = selectedPages.reduce((sum, p) => {
                    if (p.printMode === 'bw') {
                        bwCount++;
                        return sum + p.bwPrice;
                    } else {
                        colorCount++;
                        return sum + p.colorPrice;
                    }
                }, 0);
            } else {
                bwCount = printConfig.bwPages;
                colorCount = printConfig.colorPages;
                totalCost = (bwCount * 2) + (colorCount * 10);
            }

            const bindingCost = printConfig.binding ? 30 : 0;
            totalCost += bindingCost;

            console.log('📝 Adding printout to cart:', selectedFile.name);

            // Create print config for cart
            const printoutConfig: PrintoutConfig = {
                bwPages: bwCount,
                colorPages: colorCount,
                binding: printConfig.binding,
            };

            // Use file URI as identifier (will be uploaded during checkout)
            addPrintoutToCart(selectedFile.uri, printoutConfig);

            console.log('✅ Printout added to cart!', { totalCost, bwCount, colorCount });
            Alert.alert(
                "Added to Cart!",
                `Printout request added to cart\nTotal Cost: ₹${totalCost}\n\nProceed to checkout to complete your order`,
                [
                    {
                        text: "Continue Shopping", onPress: () => {
                            setSelectedFile(null);
                            setUploadedFileUrl(null);
                            setPageConfigs([]);
                            setPrintConfig({ bwPages: 1, colorPages: 0, binding: false });
                        }
                    },
                    {
                        text: "View Cart", onPress: () => {
                            setSelectedFile(null);
                            setUploadedFileUrl(null);
                            setPageConfigs([]);
                            setPrintConfig({ bwPages: 1, colorPages: 0, binding: false });
                            // Trigger cart visibility callback
                            options?.onPrintoutAdded?.();
                        }
                    }
                ]
            );

            // Reset form after adding to cart
            setSelectedFile(null);
            setUploadedFileUrl(null);
            setPageConfigs([]);
            setPrintConfig({ bwPages: 1, colorPages: 0, binding: false });
        } catch (error: any) {
            console.error("❌ Error adding printout to cart:", error);
            const errorMsg = error.message || "Could not add printout to cart.";
            Alert.alert("Error", errorMsg);
        }
    };

    return {
        activeTab,
        handleTabChange,
        selectedFile,
        handleFilePick,

        // Products
        products: filteredProducts,
        categories,
        searchQuery,
        selectedCategory,
        handleSearch,
        handleCategorySelect,
        handleRefresh,
        refreshing,

        // Printouts
        printConfig,
        handlePrintConfigChange,
        handleOrderPrintout,

        // Page Analysis
        analyzing,
        pageConfigs,
        analysisError,
        handlePageToggle,
        handlePageModeChange,
        handleSelectAllPages,
        handleDeselectAllPages,
        handleAllBW,
        handleAllColor,
        calculateTotalFromPages,

        loading,
        uploading
    };
};
