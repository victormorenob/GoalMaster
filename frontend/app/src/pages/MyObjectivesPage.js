import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../services/apiService';

import { FaFilter, FaDownload } from 'react-icons/fa';

import ObjetivoCard from '../components/objetivos/ObjetivoCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import FormGroup from '../components/ui/FormGroup';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import TagBadge from '../components/tags/TagBadge';
import { exportToCSV, exportToJSON } from '../utils/exportUtils';

const INITIAL_DISPLAY_LIMIT = 6;

const CATEGORY_OPTIONS = [
    { value: 'all', key: 'myObjectives.categories.all' },
    { value: 'HEALTH', key: 'categories.health' },
    { value: 'FINANCE', key: 'categories.finance' },
    { value: 'PERSONAL_DEV', key: 'categories.personalDevelopment' },
    { value: 'RELATIONSHIPS', key: 'categories.relationships' },
    { value: 'CAREER', key: 'categories.career' },
    { value: 'OTHER', key: 'categories.other' }
];

const SORT_BY_OPTIONS = [
    { value: "recent", key: "myObjectives.sort.recent" },
    { value: "oldest", key: "myObjectives.sort.oldest" },
    { value: "nameAsc", key: "myObjectives.sort.nameAsc" },
    { value: "nameDesc", key: "myObjectives.sort.nameDesc" },
    { value: "progressAsc", key: "myObjectives.sort.progressAsc" },
    { value: "progressDesc", key: "myObjectives.sort.progressDesc" },
    { value: "dateAsc", key: "myObjectives.sort.dateAsc" },
];

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

function MyObjectivesPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [objectives, setObjectives] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userTags, setUserTags] = useState([]);
    const [filters, setFilters] = useState({
        searchTerm: '',
        category: 'all',
        sortBy: 'recent',
        includeArchived: false,
        tags: '',
    });
    const [showAllObjectives, setShowAllObjectives] = useState(false);

    const fetchObjectives = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.getObjectives(filters);
            const objectivesArray = response?.data?.objectives;
            setObjectives(Array.isArray(objectivesArray) ? objectivesArray : []);
        } catch (err) {
            setError(err.message || t('errors.objectivesLoadError'));
            setObjectives([]);
        } finally {
            setIsLoading(false);
        }
    }, [filters, t]);

    useEffect(() => {
        fetchObjectives();
    }, [fetchObjectives]);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await api.getTags();
                setUserTags(response?.data?.tags || []);
            } catch {
                setUserTags([]);
            }
        };
        fetchTags();
    }, []);

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        setShowAllObjectives(false);
    };

    const handleObjectiveArchived = useCallback(() => {
        toast.info(t('toast.listUpdated'));
        fetchObjectives();
    }, [fetchObjectives, t]);

    const handleObjectiveUnarchived = useCallback(() => {
        toast.info(t('toast.listUpdated'));
        setFilters(prevFilters => ({
            ...prevFilters,
            includeArchived: false,
        }));
    }, [t]);

    const handleExportCSV = useCallback(() => {
        exportToCSV(objectives);
        setShowExportMenu(false);
        toast.success(t('toast.exportSuccess', 'Data exported successfully'));
    }, [objectives, t]);

    const handleExportJSON = useCallback(() => {
        exportToJSON(objectives, `goalmaster_objectives_${new Date().toISOString().split('T')[0]}.json`);
        setShowExportMenu(false);
        toast.success(t('toast.exportSuccess', 'Data exported successfully'));
    }, [objectives, t]);

    const objectivesToRender = showAllObjectives ? objectives : objectives.slice(0, INITIAL_DISPLAY_LIMIT);

    const filtersSidebarClasses = `bg-[var(--card)] p-6 rounded-[var(--radius-lg)] border border-[var(--border)] flex flex-col gap-5 fixed top-0 left-0 h-full w-[280px] z-[1010] transition-transform duration-300 ease-in-out shadow-[4px_0_15px_rgba(0,0,0,0.1)] overflow-y-auto md:sticky md:top-2 md:h-fit md:transform-none md:z-[1] md:shadow-none md:rounded-[var(--radius-lg)] ${isFiltersOpen ? 'translate-x-0' : '-translate-x-full'}`;

    return (
        <motion.div
            className="p-6 flex flex-col gap-6 w-full h-full overflow-hidden box-border"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
        >
            <div className="flex justify-between items-center flex-shrink-0">
                <h1 className="text-[1.75rem] text-[var(--heading-color,var(--foreground))] m-0 font-semibold">{t('pageTitles.myObjectives')}</h1>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                        className="flex md:hidden"
                        aria-label={t('myObjectives.toggleFilters')}
                    >
                        <FaFilter />
                    </Button>
                    <div className="relative">
                        <Button onClick={() => setShowExportMenu(!showExportMenu)} variant="outline" leftIcon={<FaDownload />}>
                            {t('myObjectives.export', 'Export')}
                        </Button>
                        {showExportMenu && (
                            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 min-w-[160px]">
                                <button
                                    onClick={handleExportCSV}
                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                                >
                                    {t('myObjectives.exportCSV', 'Export as CSV')}
                                </button>
                                <button
                                    onClick={handleExportJSON}
                                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                                >
                                    {t('myObjectives.exportJSON', 'Export as JSON')}
                                </button>
                            </div>
                        )}
                    </div>
                    <Button onClick={() => navigate('/objectives/new')} variant="primary">
                        {t('myObjectives.addNewObjective')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 flex-grow min-h-0 overflow-hidden md:grid-cols-[260px_1fr] md:gap-8">
                <aside className={filtersSidebarClasses}>
                    <FormGroup label={t('myObjectives.labels.search')} htmlFor="search-term">
                        <Input type="text" id="search-term" name="searchTerm" placeholder={t('myObjectives.searchPlaceholder')} value={filters.searchTerm} onChange={handleFilterChange} />
                    </FormGroup>
                    <FormGroup label={t('myObjectives.labels.category')} htmlFor="filter-category">
                        <Input type="select" id="filter-category" name="category" value={filters.category} onChange={handleFilterChange}>
                            {CATEGORY_OPTIONS.map(option => (<option key={option.value} value={option.value}>{t(option.key)}</option>))}
                        </Input>
                    </FormGroup>
                    {userTags.length > 0 && (
                        <FormGroup label={t('myObjectives.labels.tags')} htmlFor="filter-tags">
                            <Input type="select" id="filter-tags" name="tags" value={filters.tags} onChange={handleFilterChange}>
                                <option value="">{t('myObjectives.categories.all')}</option>
                                {userTags.map(tag => (
                                    <option key={tag.id} value={tag.name}>{tag.name}</option>
                                ))}
                            </Input>
                        </FormGroup>
                    )}

                    <FormGroup label={t('myObjectives.labels.sortBy')} htmlFor="sort-by">
                        <Input type="select" id="sort-by" name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
                            {SORT_BY_OPTIONS.map(option => (<option key={option.value} value={option.value}>{t(option.key)}</option>))}
                        </Input>
                    </FormGroup>
                    <FormGroup className="flex items-center pt-2 gap-2">
                        <input data-cy="include-archived-checkbox" type="checkbox" id="include-archived" name="includeArchived" className="absolute opacity-0 w-5 h-5 cursor-pointer" checked={filters.includeArchived} onChange={handleFilterChange} />
                        <label htmlFor="include-archived" className="text-sm text-[var(--foreground)] cursor-pointer flex items-center gap-[0.6rem]">{t('myObjectives.labels.includeArchived')}</label>
                    </FormGroup>
                </aside>

                <main className="flex flex-col overflow-y-auto min-h-0 pr-2">
                    {isLoading && (
                         <div className="flex flex-col items-center justify-center text-center p-12 h-full flex-grow"><LoadingSpinner size="large" text={t('loaders.loadingObjectives')} /></div>
                    )}
                    {error && (
                         <div className="flex flex-col items-center justify-center text-center p-12 h-full flex-grow"><p className="text-[var(--destructive)]">{t('common.errorPrefix', { error })}</p><Button onClick={fetchObjectives} variant="outline">{t('common.retryLoad')}</Button></div>
                    )}
                    {objectives.length === 0 && !isLoading && !error && (
                        <div className="flex flex-col items-center justify-center text-center p-12 h-full flex-grow">
                            <p className="text-lg text-[var(--muted-foreground)]">{filters.searchTerm || filters.category !== 'all' || filters.includeArchived ? t('myObjectives.noResults') : t('myObjectives.noObjectives')}</p>
                        </div>
                    )}
                    {objectives.length > 0 && (
                        <>
                            <motion.div
                                className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(320px,1fr))]"
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                            >
                                {objectivesToRender.map((objective) => (
                                    <motion.div key={objective.id} variants={cardVariants}>
                                        <ObjetivoCard
                                            objective={objective}
                                            onObjectiveArchived={handleObjectiveArchived}
                                            onObjectiveUnarchived={handleObjectiveUnarchived}
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                            {objectives.length > INITIAL_DISPLAY_LIMIT && !showAllObjectives && (
                                <motion.div
                                    className="flex justify-center mt-6 pb-4"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <Button onClick={() => setShowAllObjectives(true)} variant="outline">
                                        {t('myObjectives.viewMore', { count: objectives.length - INITIAL_DISPLAY_LIMIT, total: objectives.length })}
                                    </Button>
                                </motion.div>
                            )}
                        </>
                    )}
                </main>
            </div>

            {isFiltersOpen && <div className="fixed inset-0 bg-black/40 z-[1000] block md:hidden" onClick={() => setIsFiltersOpen(false)} />}
            {showExportMenu && <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />}
        </motion.div>
    );
}

export default MyObjectivesPage;
