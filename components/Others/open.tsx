import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useState } from 'react';

export const useCamera = () => {
  const [cameraLoading, setCameraLoading] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const resetCamera = () => {
    setScannedImage(null);
    setBase64(null);
    setCameraError(null);
    setCameraLoading(false);
  };

  const openCamera = async () => {
    setCameraError(null);
    try {
      setCameraLoading(true);

      const result = await launchCamera({
        mediaType: 'photo',
        includeBase64: true,
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8,
        saveToPhotos: false,
      });

      if (result.didCancel) {
        setCameraLoading(false);
        return;
      }

      if (result.errorCode) {
        setCameraError(result.errorMessage || 'Camera error');
        setCameraLoading(false);
        return;
      }

      const asset = result.assets?.[0];

      if (!asset?.base64) {
        setCameraError('No image captured');
        setCameraLoading(false);
        return;
      }

      setScannedImage(asset.uri || null);
      setBase64(asset.base64);
      setCameraError(null);
    } catch (err) {
      setCameraError('Failed to open camera');
    } finally {
      setCameraLoading(false);
    }
  };

  return {
    cameraLoading,
    scannedImage,
    base64,
    cameraError,
    openCamera,
    resetCamera,
  };
};

export const useGallery = () => {
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [base64, setBase64] = useState<string | null>(null);
  const [galleryError, setGalleryError] = useState<string | null>(null);

  const resetGallery = () => {
    setScannedImage(null);
    setBase64(null);
    setGalleryError(null);
    setGalleryLoading(false);
  };

  const openGallery = async () => {
    setGalleryError(null);
    try {
      setGalleryLoading(true);

      const result = await launchImageLibrary({
        mediaType: 'photo',
        includeBase64: true,
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8,
      });

      if (result.didCancel) {
        setGalleryLoading(false);
        return;
      }

      if (result.errorCode) {
        setGalleryError(result.errorMessage || 'Gallery error');
        setGalleryLoading(false);
        return;
      }

      const asset = result.assets?.[0];

      if (!asset?.base64) {
        setGalleryError('No image captured');
        setGalleryLoading(false);
        return;
      }

      setScannedImage(asset.uri || null);
      setBase64(asset.base64);
      setGalleryError(null);
    } catch (err) {
      setGalleryError('Failed to open gallery');
    } finally {
      setGalleryLoading(false);
    }
  };

  return {
    galleryLoading,
    scannedImage,
    base64,
    galleryError,
    openGallery,
    resetGallery,
  };
};
