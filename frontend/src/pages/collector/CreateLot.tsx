import { useEffect, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Camera, Check, CheckCircle2, ImagePlus, RefreshCw, Trash2, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { categoryApi, type MaterialCategory } from '../../services/categoryApi';
import { aiApi, type ClassificationResult } from '../../services/aiApi';
import { lotApi, type CreateLotData } from '../../services/lotApi';
import { Button, Card, ErrorState, LoadingState, PageHeader } from '../../components/ui/Primitives';
import { getErrorMessage } from '../../utils/errors';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export default function CreateLot() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [classification, setClassification] = useState<ClassificationResult | null>(null);
  const [suggestedCategory, setSuggestedCategory] = useState<MaterialCategory | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, setValue, control, reset, formState: { errors } } = useForm<CreateLotData>();
  const categoryId = useWatch({ control, name: 'category_id' });
  const weight = useWatch({ control, name: 'weight_kg' });
  const condition = useWatch({ control, name: 'condition' });
  const description = useWatch({ control, name: 'description' });
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: categoryApi.getCategories });
  const categories = categoriesQuery.data?.data.filter((category) => category.is_active) ?? [];
  const selectedCategory = categories.find((category) => category.id === categoryId);
  const categoryPlaceholder = categoriesQuery.isLoading
    ? t('createLot.loadingCategories')
    : categoriesQuery.isSuccess && categories.length === 0
      ? t('createLot.categoriesEmpty')
      : t('createLot.chooseCategory');

  useEffect(() => () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const identifyImage = async (file: File) => {
    setIsClassifying(true);
    setClassification(null);
    setSuggestedCategory(null);
    setShowCategoryPicker(false);
    setError('');
    try {
      const result = await aiApi.classifyImage(file);
      const classificationResult = result.data;
      const matched = categories.find((category) => category.name.toLowerCase() === classificationResult.predicted_category.toLowerCase());
      setClassification(classificationResult);
      setSuggestedCategory(matched ?? null);
      if (!matched || classificationResult.requires_manual_review) setShowCategoryPicker(true);
    } catch {
      setShowCategoryPicker(true);
      setError(t('createLot.aiUnavailable'));
    } finally {
      setIsClassifying(false);
    }
  };

  const chooseImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError(t('createLot.imageFileError'));
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError(t('createLot.imageTooLarge'));
      return;
    }
    setError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setValue('category_id', '');
    void identifyImage(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setValue('category_id', '');
    setClassification(null);
    setSuggestedCategory(null);
    setShowCategoryPicker(false);
    setError('');
  };

  const confirmSuggestion = () => {
    if (!suggestedCategory) return;
    setValue('category_id', suggestedCategory.id, { shouldValidate: true });
    setShowCategoryPicker(false);
    setError('');
  };

  const chooseAnother = () => {
    setShowCategoryPicker(true);
    setValue('category_id', '');
  };

  const resetForm = () => {
    reset();
    removeImage();
    setIsSuccess(false);
  };

  const onSubmit = async (data: CreateLotData) => {
    if (!imageFile) {
      setError(t('createLot.imageRequired'));
      return;
    }
    const category = categories.find((item) => item.id === data.category_id);
    if (!category) {
      setError(t('createLot.categoryRequired'));
      setShowCategoryPicker(true);
      return;
    }
    setIsSubmitting(true);
    setError('');
    let submissionStage: 'create-lot' | 'image-upload' = 'create-lot';
    const payload = {
      material_category_id: category.id,
      material_category_name: category.name,
      material_description: data.description || '',
      approximate_weight: Number(data.weight_kg),
      weight_unit: 'kg',
      condition: data.condition,
    };
    try {
      const response = await lotApi.createLot(payload);
      const lotId = response.data?.id;
      if (!lotId) throw new Error(t('createLot.lotCreateError'));
      submissionStage = 'image-upload';
      await lotApi.uploadLotImage(lotId, imageFile);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['collectorLots'] }),
        queryClient.invalidateQueries({ queryKey: ['availableLots'] }),
        queryClient.invalidateQueries({ queryKey: ['adminStats'] }),
      ]);
      setIsSuccess(true);
    } catch (err: unknown) {
      if (import.meta.env.DEV) {
        console.error('Collector lot submission failed.', {
          stage: submissionStage,
          payload,
          status: axios.isAxiosError(err) ? err.response?.status : undefined,
          response: axios.isAxiosError(err) ? err.response?.data : err,
        });
      }
      setError(getErrorMessage(err, t('createLot.lotCreateError')));
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryPicker = (
    <div className="item-choice">
      <p>{classification ? t('createLot.manualConfirm') : t('createLot.chooseItemHelp')}</p>
      <label className="form-field">
        <span className="form-label">{t('createLot.materialCategory')}</span>
        <select className="form-select" {...register('category_id', { required: t('createLot.categoryRequired') })} disabled={categoriesQuery.isLoading || categoriesQuery.isError}>
          <option value="">{categoryPlaceholder}</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
        {errors.category_id && <span className="field-error">{errors.category_id.message}</span>}
      </label>
    </div>
  );

  let identificationContent: ReactNode;
  if (isClassifying) {
    identificationContent = <LoadingState label={t('createLot.checkingItem')} />;
  } else if (classification && suggestedCategory && !classification.requires_manual_review && !categoryId) {
    identificationContent = (
      <div className="item-suggestion" role="status">
        <p>{t('createLot.aiSuggestion', { category: suggestedCategory.name })}</p>
        <strong>{suggestedCategory.name}</strong>
        <p>{t('createLot.confidence')}</p>
        <div className="item-suggestion-actions">
          <Button type="button" onClick={confirmSuggestion}><Check size={16} /> {t('createLot.yesContinue')}</Button>
          <Button type="button" variant="secondary" onClick={chooseAnother}>{t('createLot.chooseAnother')}</Button>
        </div>
      </div>
    );
  } else {
    identificationContent = categoryPicker;
  }

  if (isSuccess) {
    return (
      <div className="modal-backdrop" role="presentation">
        <section className="modal-card listing-success-card" role="dialog" aria-modal="true" aria-labelledby="create-lot-success-title" aria-describedby="create-lot-success-description">
          <CheckCircle2 size={42} aria-hidden="true" />
          <h1 id="create-lot-success-title">{t('createLot.successTitle')}</h1>
          <p id="create-lot-success-description">{t('createLot.successDescription')}</p>
          <div className="create-lot-success-actions">
            <Link to="/collector/lots"><Button>{t('createLot.viewLots')}</Button></Link>
            <Button type="button" variant="secondary" onClick={resetForm}>{t('createLot.addAnother')}</Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <>
      <PageHeader title={t('createLot.title')} description={t('createLot.description')} />
      <nav className="create-lot-steps" aria-label={t('createLot.stepsLabel')}>
        <span className="create-lot-step is-current"><span>1</span>{t('createLot.stepPhoto')}</span>
        <span className="create-lot-step"><span>2</span>{t('createLot.stepDetails')}</span>
        <span className="create-lot-step"><span>3</span>{t('createLot.stepPublish')}</span>
      </nav>
      {error && <div className="form-alert" role="alert">{error}</div>}

      <form className="create-lot-flow" onSubmit={handleSubmit(onSubmit)}>
        <Card className="create-lot-section">
          <div className="create-lot-section-heading">
            <div><span className="create-lot-number">1</span><div><h2>{t('createLot.showMaterial')}</h2><p>{t('createLot.photoHelp')}</p></div></div>
          </div>
          {imagePreview ? (
            <div className="photo-preview">
              <img src={imagePreview} alt={t('createLot.uploadPhoto')} />
              <div className="photo-preview-actions">
                <label className="ui-button ui-button-secondary"><RefreshCw size={16} /> {t('createLot.replacePhoto')}<input type="file" accept="image/*" capture="environment" onChange={(event) => chooseImage(event.target.files?.[0])} /></label>
                <Button type="button" variant="ghost" onClick={removeImage}><Trash2 size={16} /> {t('createLot.removePhoto')}</Button>
              </div>
            </div>
          ) : (
            <label className="photo-dropzone">
              <ImagePlus size={32} aria-hidden="true" />
              <strong>{t('createLot.uploadPhoto')}</strong>
              <span>{t('createLot.photoHelpText')}</span>
              <input type="file" accept="image/*" capture="environment" onChange={(event) => chooseImage(event.target.files?.[0])} />
            </label>
          )}
          {!imagePreview && <div className="upload-actions"><label className="ui-button ui-button-secondary"><Camera size={16} /> {t('createLot.takePhoto')}<input type="file" accept="image/*" capture="environment" onChange={(event) => chooseImage(event.target.files?.[0])} /></label><label className="ui-button ui-button-ghost"><Upload size={16} /> {t('createLot.chooseFile')}<input type="file" accept="image/*" onChange={(event) => chooseImage(event.target.files?.[0])} /></label></div>}
        </Card>

        {imageFile && <Card className="create-lot-section">
          <div className="create-lot-section-heading">
            <div><span className="create-lot-number">2</span><div><h2>{t('createLot.identifyTitle')}</h2><p>{t('createLot.identifyHelp')}</p></div></div>
          </div>
          {identificationContent}
          {categoriesQuery.isError && <ErrorState message={t('createLot.categoriesError')} onRetry={() => void categoriesQuery.refetch()} />}
          {selectedCategory && !isClassifying && <div className="selected-item"><CheckCircle2 size={17} aria-hidden="true" /><span>{t('createLot.selectedItem', { category: selectedCategory.name })}</span><Button type="button" variant="ghost" onClick={chooseAnother}>{t('createLot.changeItem')}</Button></div>}
        </Card>}

        {imageFile && (categoryId || showCategoryPicker) && <Card className="create-lot-section">
          <div className="create-lot-section-heading">
            <div><span className="create-lot-number">3</span><div><h2>{t('createLot.lotDetails')}</h2><p>{t('createLot.detailsHelp')}</p></div></div>
          </div>
          <div className="form-grid">
            <label className="form-field"><span className="form-label">{t('createLot.approximateWeight')}</span><div className="input-with-suffix"><input className="form-input" type="number" step="0.1" min="0.1" placeholder={t('createLot.weightPlaceholder')} {...register('weight_kg', { required: t('createLot.weightRequired'), min: { value: 0.1, message: t('createLot.weightPositive') } })} /><span>{t('common.kg')}</span></div>{errors.weight_kg && <span className="field-error">{errors.weight_kg.message}</span>}</label>
            <label className="form-field"><span className="form-label">{t('createLot.condition')}</span><select className="form-select" {...register('condition', { required: t('createLot.conditionRequired') })}><option value="">{t('createLot.chooseCondition')}</option><option value="Working">{t('createLot.working')}</option><option value="Repairable">{t('createLot.repairable')}</option><option value="Scrap">{t('createLot.scrap')}</option><option value="Mixed">{t('createLot.mixed')}</option></select>{errors.condition && <span className="field-error">{errors.condition.message}</span>}</label>
            <label className="form-field full"><span className="form-label">{t('createLot.shortDescription')} <span className="optional">{t('common.optional')}</span></span><textarea className="form-textarea" {...register('description')} placeholder={t('createLot.descriptionPlaceholder')} /></label>
          </div>
        </Card>}

        {imageFile && categoryId && <Card className="create-lot-review" as="section">
          <div className="create-lot-section-heading"><div><span className="create-lot-number">4</span><div><h2>{t('createLot.reviewTitle')}</h2><p>{t('createLot.reviewHelp')}</p></div></div></div>
          <dl className="review-list"><div><dt>{t('createLot.materialCategory')}</dt><dd>{selectedCategory?.name}</dd></div><div><dt>{t('createLot.approximateWeight')}</dt><dd>{weight ? `${weight} ${t('common.kg')}` : '—'}</dd></div><div><dt>{t('createLot.condition')}</dt><dd>{condition ? t(`createLot.${String(condition).toLowerCase()}`, { defaultValue: condition }) : '—'}</dd></div>{description && <div><dt>{t('createLot.shortDescription')}</dt><dd>{description}</dd></div>}</dl>
          <div className="form-actions"><Button type="button" variant="ghost" onClick={() => navigate('/collector/dashboard')}>{t('common.cancel')}</Button><Button type="submit" loading={isSubmitting}>{t('createLot.publishLot')} <CheckCircle2 size={16} /></Button></div>
        </Card>}
      </form>
    </>
  );
}
