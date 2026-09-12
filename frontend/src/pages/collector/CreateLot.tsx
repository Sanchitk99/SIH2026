import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, ArrowRight, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { lotApi, type CreateLotData } from '../../services/lotApi';

export default function CreateLot() {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { register, handleSubmit, formState: { errors } } = useForm<CreateLotData>();

  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      // In the future, this is where you will call the AI classification API
    }
  };

  const onSubmit = async (data: CreateLotData) => {
    if (!imageFile) {
      setError('Please take a photo of the item first.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      // 1. Create the Lot Document
      const lotResponse = await lotApi.createLot(data);
      const lotId = lotResponse.data.id;

      // 2. Upload the Image to Firebase Storage via Backend
      await lotApi.uploadLotImage(lotId, imageFile);

      navigate('/collector/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create lot. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add E-Waste</h1>
      
      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* STEP 1: Photo Capture */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">1. Take a Photo</label>
          {imagePreview ? (
            <div className="relative rounded-xl overflow-hidden border-2 border-green-500">
              <img src={imagePreview} alt="E-waste preview" className="w-full h-48 object-cover" />
              <button 
                type="button" 
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full text-xs font-bold"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {/* Capture from mobile camera */}
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                <Camera size={32} className="text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-600">Take Photo</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageCapture} />
              </label>
              
              {/* Upload from gallery */}
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                <Upload size={32} className="text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-600">Upload</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageCapture} />
              </label>
            </div>
          )}
        </div>

        {/* STEP 2: Details */}
        <div className="space-y-4">
          <label className="block text-sm font-bold text-gray-700 mb-2">2. Item Details</label>
          
          <div>
            <select 
              {...register('category_id', { required: 'Category is required' })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="">Select Material Category...</option>
              <option value="Smartphones">Smartphones / Mobiles</option>
              <option value="Laptops">Laptops / Computers</option>
              <option value="Batteries">Batteries</option>
              <option value="PCBs">Circuit Boards (PCB)</option>
              <option value="Cables">Cables & Wires</option>
            </select>
            {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id.message}</p>}
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <input 
                type="number" 
                step="0.1"
                placeholder="Weight (kg)"
                {...register('weight_kg', { required: 'Weight is required', min: 0.1 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
              />
            </div>
            <div className="flex-1">
              <select 
                {...register('condition', { required: 'Condition is required' })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-green-500 outline-none"
              >
                <option value="">Condition...</option>
                <option value="Working">Working</option>
                <option value="Repairable">Repairable</option>
                <option value="Scrap">Complete Scrap</option>
              </select>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors flex justify-center items-center gap-2 mt-8 disabled:opacity-70"
        >
          {isSubmitting ? <><Loader2 className="animate-spin" size={24} /> Processing...</> : <>Submit for Quotes <ArrowRight size={24} /></>}
        </button>
      </form>
    </div>
  );
}