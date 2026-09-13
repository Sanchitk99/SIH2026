import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Clock3, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { recyclerApi, type RecyclerProfileData } from '../../services/recyclerApi';
import { Button, Card, ErrorState, LoadingState, PageHeader, StatusBadge } from '../../components/ui/Primitives';
import { useForm } from 'react-hook-form';

const defaults: RecyclerProfileData = { facility_name: '', facility_address: '', city: '', state: '', contact_person: '', authorization_number: '', pickup_available: false, service_area: 10 };

export default function RecyclerProfile() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<RecyclerProfileData>({ defaultValues: defaults });
  const profileQuery = useQuery({ queryKey: ['recyclerProfile'], queryFn: recyclerApi.getProfile });
  useEffect(() => { if (profileQuery.data?.data) reset({ ...defaults, ...profileQuery.data.data }); }, [profileQuery.data, reset]);
  const mutation = useMutation({ mutationFn: recyclerApi.updateProfile, onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['recyclerProfile'] }) });
  const profile = profileQuery.data?.data;

  return <>
    <PageHeader title={t('profile.title')} description={t('profile.description')} />
    {profileQuery.isLoading ? <LoadingState label={t('profile.loading')} /> : profileQuery.isError ? <ErrorState message={t('profile.loadError')} onRetry={() => void profileQuery.refetch()} /> : <div className="recycler-profile-grid">
      <Card className="form-card">
        {mutation.isError && <div className="form-alert" role="alert">{t('errors.genericTitle')}</div>}
        <div className="profile-status"><div><h2>{t('profile.details')}</h2><p>{t('profile.detailsHelp')}</p></div><StatusBadge status={profile?.authorization_status || 'PENDING'} /></div>
        <form className="form-grid" onSubmit={handleSubmit((data) => { const { latitude: _latitude, longitude: _longitude, ...profileData } = data; void _latitude; void _longitude; mutation.mutate({ ...profileData, service_area: Number(data.service_area) }); })}>
          <label className="form-field full"><span className="form-label">{t('profile.facilityName')}</span><input className="form-input" {...register('facility_name', { required: t('errors.required') })} placeholder={t('profile.facilityNamePlaceholder')} />{errors.facility_name && <span className="field-error">{errors.facility_name.message}</span>}</label>
          <label className="form-field full"><span className="form-label">{t('profile.facilityAddress')}</span><input className="form-input" {...register('facility_address', { required: t('errors.required') })} placeholder={t('profile.addressPlaceholder')} />{errors.facility_address && <span className="field-error">{errors.facility_address.message}</span>}</label>
          <label className="form-field"><span className="form-label">{t('profile.city')}</span><input className="form-input" {...register('city', { required: t('errors.required') })} placeholder={t('profile.cityPlaceholder')} />{errors.city && <span className="field-error">{errors.city.message}</span>}</label>
          <label className="form-field"><span className="form-label">{t('profile.state')}</span><input className="form-input" {...register('state', { required: t('errors.required') })} placeholder={t('profile.statePlaceholder')} />{errors.state && <span className="field-error">{errors.state.message}</span>}</label>
          <label className="form-field"><span className="form-label">{t('profile.contactPerson')}</span><input className="form-input" {...register('contact_person')} placeholder={t('profile.contactPlaceholder')} /></label>
          <label className="form-field"><span className="form-label">{t('profile.authorizationNumber')}</span><input className="form-input" {...register('authorization_number')} placeholder={t('profile.authorizationPlaceholder')} /></label>
          <label className="form-field"><span className="form-label">{t('profile.serviceArea')}</span><input className="form-input" type="number" min="1" {...register('service_area')} /></label>
          <label className="checkbox-line align-end"><input type="checkbox" {...register('pickup_available')} /><span>{t('profile.pickupAvailable')}</span></label>
          <div className="form-actions full"><Button type="submit" loading={mutation.isPending}><Save size={16} /> {t('profile.saveProfile')}</Button></div>
          {mutation.isSuccess && <p className="success-note"><CheckCircle2 size={15} /> {t('profile.saved')}</p>}
        </form>
      </Card>
      <Card className="profile-side"><h2>{t('profile.verificationTitle')}</h2><p>{t('profile.verificationDescription')}</p><ul className="profile-checklist"><li><CheckCircle2 size={16} /> {t('profile.completeDetails')}</li><li><Clock3 size={16} /> {t('profile.uploadDocuments')}</li><li><CheckCircle2 size={16} /> {t('profile.keepDetailsCurrent')}</li></ul></Card>
    </div>}
  </>;
}
