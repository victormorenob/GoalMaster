import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import api from '../services/apiService';

import { FaFilter } from 'react-icons/fa';

import ObjetivoCard from '../components/objetivos/ObjetivoCard';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import FormGroup from '../components/ui/FormGroup';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const INITIAL_DISPLAY_LIMIT = 6;

const CATEGORY_OPTIONS = [
  { value: 'all', key: 'myObjectives.categories.all' },
  { value: 'HEALTH', key: 'categories.health' },
  { value: 'FINANCE', key: 'categories.finance' },
  { value: 'PERSONAL_DEV', key: 'categories.personalDevelopment' },
  { value: 'RELATIONSHIPS', key: 'categories.relationships' },
  { value: 'CAREER', key: 'categories.career' },
  { value: 'OTHER', key: 'categories.other' },
];

const SORT_BY_OPTIONS = [
  { value: 'recent', key: 'myObjectives.sort.recent' },
  { value: 'oldest', key: 'myObjectives.sort.oldest' },
  { value: 'nameAsc', key: 'myObjectives.sort.nameAsc' },
  { value: 'nameDesc', key: 'myObjectives.sort.nameDesc' },
  { value: 'progressAsc', key: 'myObjectives.sort.progressAsc' },
  { value: 'progressDesc', key: 'myObjectives.sort.progressDesc' },
  { value: 'dateAsc', key: 'myObjectives.sort.dateAsc' },
];

function MyObjectivesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [objectives, setObjectives] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    searchTerm: '',
    category: 'all',
    sortBy: 'recent',
    includeArchived: false,
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

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => ({
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
    setFilters((prevFilters) => ({
      ...prevFilters,
      includeArchived: false,
    }));
  }, [t]);

  const objectivesToRender = showAllObjectives
    ? objectives
    : objectives.slice(0, INITIAL_DISPLAY_LIMIT);

  return (
    <div className="flex flex-col gap-4 h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 m-0">
          {t('pageTitles.myObjectives')}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="lg:hidden"
            aria-label={t('myObjectives.toggleFilters')}
          >
            <FaFilter />
          </Button>
          <Button onClick={() => navigate('/objectives/new')} variant="primary" size="sm">
            {t('myObjectives.addNewObjective')}
          </Button>
        </div>
      </div>

      {/* Content grid */}
      <div className="flex gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Filters sidebar */}
        <aside
          className={`
            w-64 shrink-0 flex flex-col gap-4 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700
            overflow-y-auto
            hidden lg:flex
            ${isFiltersOpen ? '!fixed inset-0 z-50 flex lg:static' : ''}
          `}
        >
          <div className="flex items-center justify-between lg:hidden">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {t('myObjectives.filters')}
            </span>
            <button
              onClick={() => setIsFiltersOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-lg"
              aria-label="Close filters"
            >
              ✕
            </button>
          </div>

          <FormGroup label={t('myObjectives.labels.search')} htmlFor="search-term">
            <Input
              type="text"
              id="search-term"
              name="searchTerm"
              placeholder={t('myObjectives.searchPlaceholder')}
              value={filters.searchTerm}
              onChange={handleFilterChange}
            />
          </FormGroup>
          <FormGroup label={t('myObjectives.labels.category')} htmlFor="filter-category">
            <Input
              type="select"
              id="filter-category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.key)}
                </option>
              ))}
            </Input>
          </FormGroup>
          <FormGroup label={t('myObjectives.labels.sortBy')} htmlFor="sort-by">
            <Input
              type="select"
              id="sort-by"
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
            >
              {SORT_BY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.key)}
                </option>
              ))}
            </Input>
          </FormGroup>
          <FormGroup>
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 dark:text-slate-400">
              <input
                data-cy="include-archived-checkbox"
                type="checkbox"
                id="include-archived"
                name="includeArchived"
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                checked={filters.includeArchived}
                onChange={handleFilterChange}
              />
              {t('myObjectives.labels.includeArchived')}
            </label>
          </FormGroup>
        </aside>

        {/* Overlay for mobile filters */}
        {isFiltersOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setIsFiltersOpen(false)}
          />
        )}

        {/* Objectives area */}
        <main className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner size="large" text={t('loaders.loadingObjectives')} />
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <p className="text-red-500 text-sm">
                {t('common.errorPrefix', { error })}
              </p>
              <Button onClick={fetchObjectives} variant="outline" size="sm">
                {t('common.retryLoad')}
              </Button>
            </div>
          )}
          {!isLoading && !error && objectives.length === 0 && (
            <div className="flex items-center justify-center h-64">
              <p className="text-slate-400 dark:text-slate-500 text-sm">
                {filters.searchTerm || filters.category !== 'all' || filters.includeArchived
                  ? t('myObjectives.noResults')
                  : t('myObjectives.noObjectives')}
              </p>
            </div>
          )}
          {objectives.length > 0 && (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05 }}
            >
              {objectivesToRender.map((objective) => (
                <ObjetivoCard
                  key={objective.id}
                  objective={objective}
                  onObjectiveArchived={handleObjectiveArchived}
                  onObjectiveUnarchived={handleObjectiveUnarchived}
                />
              ))}
            </motion.div>
          )}
          {objectives.length > INITIAL_DISPLAY_LIMIT && !showAllObjectives && (
            <div className="flex justify-center mt-6">
              <Button
                onClick={() => setShowAllObjectives(true)}
                variant="outline"
                size="sm"
              >
                {t('myObjectives.viewMore', {
                  count: objectives.length - INITIAL_DISPLAY_LIMIT,
                  total: objectives.length,
                })}
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default MyObjectivesPage;
