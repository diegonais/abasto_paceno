import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { Input } from '../../components/ui/Input';
import { LoadingState } from '../../components/ui/LoadingState';
import { PageHeader } from '../../components/ui/PageHeader';
import { Select } from '../../components/ui/Select';
import { Table } from '../../components/ui/Table';
import { Textarea } from '../../components/ui/Textarea';
import { MapView } from '../../components/map/MapView';
import {
  OFFER_AVAILABILITY_TYPES,
  OFFER_PHOTO_MAX_SIZE_BYTES,
  SALE_TYPES,
} from '../../config/constants';
import { getAssetUrl } from '../../services/api/assets';
import { buildFormData } from '../../services/api/formData';
import { aiPublicationService } from '../../services/aiPublicationService';
import { offersService } from '../../services/offersService';
import { productsService } from '../../services/productsService';
import { formatCurrency } from '../../utils/format';
import { validateImageFile } from '../../utils/files';

const OTHER_PRODUCT_VALUE = '__other_product__';

const SALE_TYPE_KEYWORDS = {
  [SALE_TYPES.TRAY]: ['maple', 'carton', 'carton de huevo'],
  [SALE_TYPES.UNIT]: ['unidad', 'unidades', 'kilo', 'kg', 'libra', 'pieza', 'botella', 'bolsa'],
};

const AUDIO_FIELD_LABELS = {
  productId: 'producto',
  price: 'precio',
  approximateQuantity: 'cantidad',
  saleType: 'tipo de venta',
  locationDescription: 'ubicacion',
  availabilityType: 'disponibilidad',
};

const emptyForm = {
  productId: '',
  customProductName: '',
  saleType: SALE_TYPES.UNIT,
  availabilityType: OFFER_AVAILABILITY_TYPES.FIXED,
  approximateQuantity: '',
  price: '',
  latitude: '',
  longitude: '',
  locationDescription: '',
  availableFrom: '',
  availableUntil: '',
  audioTranscription: '',
};

function getProductLabel(product) {
  const categoryName = product.category?.categoryName;
  return categoryName ? `${product.productName} · ${categoryName}` : product.productName;
}

function normalizeSpeechText(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,;:!?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractPrice(text) {
  const priceMatch = text.match(
    /(?:^|\s)(?:a|en|precio|cuesta|esta a|bs|bs\.|bolivianos?)\s*(\d+(?:[.,]\d{1,2})?)/i,
  ) || text.match(/(\d+(?:[.,]\d{1,2})?)\s*(?:bs|bs\.|bolivianos?)/i);

  return priceMatch?.[1]?.replace(',', '.') ?? '';
}

function extractSaleType(normalizedText) {
  if (SALE_TYPE_KEYWORDS[SALE_TYPES.TRAY].some((keyword) => normalizedText.includes(keyword))) {
    return SALE_TYPES.TRAY;
  }

  if (SALE_TYPE_KEYWORDS[SALE_TYPES.UNIT].some((keyword) => normalizedText.includes(keyword))) {
    return SALE_TYPES.UNIT;
  }

  return '';
}

function extractApproximateQuantity(normalizedText) {
  const quantityMatch = normalizedText.match(
    /(?:tengo|hay|quedan|me quedan|disponible|disponibles)?\s*(\d+)\s*(?:maples?|unidades?|kilos?|kg|libras?|piezas?|botellas?|bolsas?)/i,
  );

  return quantityMatch?.[1] ?? '';
}

function formatDateTimeLocal(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function extractAvailableUntil(text) {
  const normalizedText = normalizeSpeechText(text);
  const untilMatch = normalizedText.match(/hasta (?:las\s*)?(\d{1,2})(?::(\d{2}))?\s*(de la tarde|de la manana|am|pm)?/i);

  if (!untilMatch) {
    return '';
  }

  const date = new Date();
  let hour = Number(untilMatch[1]);
  const minutes = untilMatch[2] ?? '00';
  const meridiem = normalizeSpeechText(untilMatch[3] ?? '');

  if ((meridiem.includes('tarde') || meridiem === 'pm') && hour < 12) {
    hour += 12;
  }

  if ((meridiem.includes('manana') || meridiem === 'am') && hour === 12) {
    hour = 0;
  }

  date.setHours(hour, Number(minutes), 0, 0);

  if (date <= new Date()) {
    date.setDate(date.getDate() + 1);
  }

  return formatDateTimeLocal(date);
}

function extractLocationDescription(text) {
  const locationMatch = text.match(/\b(?:en|por|desde)\s+(.+?)(?:\s+hasta\b|\s+a\s+\d|\s+en\s+\d|$)/i);
  return locationMatch?.[1]?.trim() ?? '';
}

function findMentionedProduct(products, normalizedText) {
  return products.find((product) => {
    const normalizedProductName = normalizeSpeechText(product.productName);
    const searchableWords = normalizedProductName
      .split(' ')
      .filter((word) => word.length >= 4);

    return normalizedText.includes(normalizedProductName) ||
      searchableWords.some((word) => normalizedText.includes(word));
  });
}

function getAudioSuggestions(transcription, products) {
  const normalizedText = normalizeSpeechText(transcription);
  const product = findMentionedProduct(products, normalizedText);
  const price = extractPrice(transcription);
  const saleType = extractSaleType(normalizedText);
  const approximateQuantity = extractApproximateQuantity(normalizedText);
  const availableUntil = extractAvailableUntil(transcription);
  const locationDescription = extractLocationDescription(transcription);

  return {
    productId: product?.id ?? '',
    price,
    saleType,
    approximateQuantity,
    availabilityType: availableUntil ? OFFER_AVAILABILITY_TYPES.TEMPORARY : '',
    availableFrom: availableUntil ? formatDateTimeLocal(new Date()) : '',
    availableUntil,
    locationDescription,
  };
}

function clearAudioSuggestedValues(values, audioSuggestedFields) {
  const nextValues = {
    ...values,
    audioTranscription: '',
  };

  audioSuggestedFields.forEach((fieldName) => {
    if (fieldName === 'productId') {
      nextValues.productId = '';
      nextValues.customProductName = '';
      return;
    }

    if (fieldName === 'availabilityType') {
      nextValues.availabilityType = OFFER_AVAILABILITY_TYPES.FIXED;
      nextValues.availableFrom = '';
      nextValues.availableUntil = '';
      return;
    }

    nextValues[fieldName] = '';
  });

  return nextValues;
}

function applyAudioSuggestions(values, suggestions, manuallyEditedFields) {
  const nextValues = {
    ...values,
    audioTranscription: suggestions.transcription,
  };
  const appliedFields = [];

  if (suggestions.productId && !manuallyEditedFields.has('productId')) {
    nextValues.productId = suggestions.productId;
    nextValues.customProductName = '';
    appliedFields.push('productId');
  }

  if (suggestions.price && !manuallyEditedFields.has('price')) {
    nextValues.price = suggestions.price;
    appliedFields.push('price');
  }

  if (suggestions.approximateQuantity && !manuallyEditedFields.has('approximateQuantity')) {
    nextValues.approximateQuantity = suggestions.approximateQuantity;
    appliedFields.push('approximateQuantity');
  }

  if (suggestions.saleType && !manuallyEditedFields.has('saleType')) {
    nextValues.saleType = suggestions.saleType;
    appliedFields.push('saleType');
  }

  if (suggestions.locationDescription && !manuallyEditedFields.has('locationDescription')) {
    nextValues.locationDescription = suggestions.locationDescription;
    appliedFields.push('locationDescription');
  }

  if (
    suggestions.availableUntil &&
    !manuallyEditedFields.has('availabilityType') &&
    !manuallyEditedFields.has('availableFrom') &&
    !manuallyEditedFields.has('availableUntil')
  ) {
    nextValues.availabilityType = suggestions.availabilityType;
    nextValues.availableFrom = suggestions.availableFrom;
    nextValues.availableUntil = suggestions.availableUntil;
    appliedFields.push('availabilityType', 'availableFrom', 'availableUntil');
  }

  return { appliedFields, values: nextValues };
}

export function MerchantOffersPage({ mode }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [offers, setOffers] = useState([]);
  const [products, setProducts] = useState([]);
  const [formValues, setFormValues] = useState(emptyForm);
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [productPhoto, setProductPhoto] = useState(null);
  const [currentOffer, setCurrentOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recordingAudio, setRecordingAudio] = useState(false);
  const [transcribingAudio, setTranscribingAudio] = useState(false);
  const [audioSuggestedFields, setAudioSuggestedFields] = useState([]);
  const [error, setError] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioStreamRef = useRef(null);
  const manuallyEditedFieldsRef = useRef(new Set());

  const productOptions = useMemo(
    () => [
      { value: '', label: 'Selecciona un producto' },
      ...products.map((product) => ({
        value: product.id,
        label: getProductLabel(product),
      })),
      { value: OTHER_PRODUCT_VALUE, label: 'Otro producto' },
    ],
    [products],
  );

  const isCustomProduct = formValues.productId === OTHER_PRODUCT_VALUE;
  const audioSuggestedLabels = useMemo(
    () => Array.from(new Set(audioSuggestedFields
      .map((fieldName) => AUDIO_FIELD_LABELS[fieldName])
      .filter(Boolean))),
    [audioSuggestedFields],
  );

  async function loadData() {
    setLoading(true);
    try {
      const [offersData, productsData] = await Promise.all([
        offersService.listMine(),
        productsService.list(),
      ]);
      setOffers(offersData);
      setProducts(productsData);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    queueMicrotask(() => {
      void loadData();
    });
  }, []);

  useEffect(() => {
    async function loadOffer() {
      if (!id) return;

      try {
        const offer = await offersService.getById(id);
        setCurrentOffer(offer);
        manuallyEditedFieldsRef.current.clear();
        setAudioSuggestedFields([]);
        setFormValues({
          ...emptyForm,
          productId: offer.product?.id ?? '',
          saleType: offer.saleType ?? SALE_TYPES.UNIT,
          availabilityType: offer.availabilityType ?? OFFER_AVAILABILITY_TYPES.FIXED,
          approximateQuantity: offer.approximateQuantity ?? '',
          price: offer.price ?? '',
          latitude: offer.latitude ?? '',
          longitude: offer.longitude ?? '',
          locationDescription: offer.locationDescription ?? '',
          availableFrom: offer.availableFrom ? offer.availableFrom.slice(0, 16) : '',
          availableUntil: offer.availableUntil ? offer.availableUntil.slice(0, 16) : '',
          audioTranscription: '',
        });
        setSelectedPoint({ lat: Number(offer.latitude), lng: Number(offer.longitude) });
      } catch (requestError) {
        setError(requestError.message);
      }
    }

    void loadOffer();
  }, [id]);

  function handleChange(event) {
    const { name, value } = event.target;
    manuallyEditedFieldsRef.current.add(name);
    setAudioSuggestedFields((current) => current.filter((fieldName) => fieldName !== name));

    setFormValues((current) => ({
      ...current,
      [name]: value,
      ...(name === 'productId' && value !== OTHER_PRODUCT_VALUE
        ? { customProductName: '' }
        : {}),
      ...(name === 'availabilityType' && value === OFFER_AVAILABILITY_TYPES.FIXED
        ? { availableFrom: '', availableUntil: '' }
        : {}),
    }));
  }

  function handleCoordinatePick(point) {
    setSelectedPoint(point);
    setFormValues((current) => ({
      ...current,
      latitude: point.lat.toFixed(7),
      longitude: point.lng.toFixed(7),
    }));
  }

  function handlePhotoChange(event) {
    const file = event.target.files?.[0];
    const validationError = validateImageFile(file, OFFER_PHOTO_MAX_SIZE_BYTES);

    if (validationError) {
      setError(validationError);
      setProductPhoto(null);
      return;
    }

    setError('');
    setProductPhoto(file ?? null);
  }

  function stopAudioStream() {
    audioStreamRef.current?.getTracks().forEach((track) => track.stop());
    audioStreamRef.current = null;
  }

  useEffect(() => () => stopAudioStream(), []);

  async function handleStartAudioRecording() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setError('Tu navegador no permite grabar audio desde esta pantalla.');
      return;
    }

    setError('');
    setFormValues((current) => clearAudioSuggestedValues(current, audioSuggestedFields));
    setAudioSuggestedFields([]);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredMimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : '';
      const recorder = new MediaRecorder(
        stream,
        preferredMimeType ? { mimeType: preferredMimeType } : undefined,
      );

      audioChunksRef.current = [];
      audioStreamRef.current = stream;
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const mimeType = recorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const audioFile = new File([audioBlob], 'publicacion-audio.webm', {
          type: mimeType,
        });

        stopAudioStream();
        setRecordingAudio(false);
        setTranscribingAudio(true);

        try {
          const { transcription } = await aiPublicationService.transcribeAudio(audioFile);
          const suggestions = {
            ...getAudioSuggestions(transcription, products),
            transcription,
          };
          let appliedFields = [];

          setFormValues((current) => {
            const result = applyAudioSuggestions(
              current,
              suggestions,
              manuallyEditedFieldsRef.current,
            );
            appliedFields = result.appliedFields;
            return result.values;
          });
          setAudioSuggestedFields(appliedFields);
          setError('');
        } catch (requestError) {
          setError(requestError.message);
        } finally {
          setTranscribingAudio(false);
          mediaRecorderRef.current = null;
          audioChunksRef.current = [];
        }
      };

      recorder.start();
      setRecordingAudio(true);
    } catch {
      stopAudioStream();
      setRecordingAudio(false);
      setError('No se pudo acceder al microfono. Revisa los permisos del navegador.');
    }
  }

  function handleStopAudioRecording() {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }

  function validateForm() {
    if (isCustomProduct && !formValues.customProductName.trim()) {
      return 'Escribe el nombre del producto.';
    }
    if (!isCustomProduct && !formValues.productId) return 'Selecciona un producto.';
    if (!formValues.latitude || Number.isNaN(Number(formValues.latitude))) {
      return 'Selecciona una ubicación válida en el mapa.';
    }
    if (!formValues.longitude || Number.isNaN(Number(formValues.longitude))) {
      return 'Selecciona una ubicación válida en el mapa.';
    }
    if (!formValues.locationDescription.trim()) return 'Describe la ubicación de venta.';
    if (!formValues.price || Number(formValues.price) < 0) return 'Ingresa un precio válido.';
    if (!productPhoto && !currentOffer?.productPhotoPath) {
      return 'La foto del producto es obligatoria.';
    }
    if (formValues.availabilityType === OFFER_AVAILABILITY_TYPES.TEMPORARY) {
      if (!formValues.availableFrom || !formValues.availableUntil) {
        return 'Las ofertas temporales requieren fecha de inicio y fin.';
      }
      if (new Date(formValues.availableUntil) <= new Date(formValues.availableFrom)) {
        return 'La fecha final debe ser posterior a la fecha inicial.';
      }
    }

    return '';
  }

  async function handleDisable(offerId) {
    try {
      await offersService.disable(offerId);
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      const payload = buildFormData({
        productId: isCustomProduct ? '' : formValues.productId,
        customProductName: isCustomProduct ? formValues.customProductName.trim() : '',
        saleType: formValues.saleType,
        availabilityType: formValues.availabilityType,
        approximateQuantity: formValues.approximateQuantity,
        price: formValues.price,
        latitude: Number(formValues.latitude).toFixed(7),
        longitude: Number(formValues.longitude).toFixed(7),
        locationDescription: formValues.locationDescription.trim(),
        availableFrom:
          formValues.availabilityType === OFFER_AVAILABILITY_TYPES.TEMPORARY
            ? formValues.availableFrom
            : '',
        availableUntil:
          formValues.availabilityType === OFFER_AVAILABILITY_TYPES.TEMPORARY
            ? formValues.availableUntil
            : '',
        productPhoto,
      });

      if (id) {
        await offersService.update(id, payload);
      } else {
        await offersService.create(payload);
      }

      navigate('/merchant/offers');
      await loadData();
      setFormValues(emptyForm);
      setSelectedPoint(null);
      setProductPhoto(null);
      setCurrentOffer(null);
      setAudioSuggestedFields([]);
      manuallyEditedFieldsRef.current.clear();
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  const isFormMode = mode === 'create' || mode === 'edit';

  return (
    <div className="stack-lg merchant-offers-page">
      <PageHeader
        title="Mis ofertas"
        description="Publica, edita o deshabilita tus ofertas desde un solo lugar."
        actions={!isFormMode ? <Button onClick={() => navigate('/merchant/offers/create')}>Nueva oferta</Button> : null}
      />

      <ErrorMessage message={error} />

      {isFormMode ? (
        <div className="content-grid content-grid-map-form offer-editor-layout">
          <Card className="form-card offer-form-card">
            <form className="offer-editor-form" onSubmit={handleSubmit}>
              <section className="offer-form-section">
                <div className="offer-section-head">
                  <span>1</span>
                  <div>
                    <h2>Audio asistido</h2>
                    <p>Graba una oferta corta para detectar texto. Revisa y edita antes de guardar.</p>
                  </div>
                </div>

                <div className="audio-publication-panel">
                  <div>
                    <strong>{recordingAudio ? 'Grabando audio...' : 'Texto detectado por audio'}</strong>
                    <p>La transcripcion no crea ni guarda una oferta automaticamente.</p>
                  </div>
                  <Button
                    type="button"
                    variant={recordingAudio ? 'secondary' : 'primary'}
                    disabled={transcribingAudio}
                    onClick={recordingAudio ? handleStopAudioRecording : handleStartAudioRecording}
                  >
                    {transcribingAudio
                      ? 'Transcribiendo...'
                      : recordingAudio
                        ? 'Detener y transcribir'
                        : 'Grabar audio'}
                  </Button>
                </div>

                <div className="audio-speaking-guide">
                  <strong>Orden sugerido al hablar</strong>
                  <p>Producto, cantidad, precio, tipo de venta, ubicacion y horario.</p>
                  <span>
                    Ejemplo: Tengo 20 maples de huevo a 28 bolivianos el maple en Villa Fatima hasta las 5 de la tarde.
                  </span>
                </div>

                <Textarea
                  className="field-span-full"
                  label="Texto detectado por audio"
                  name="audioTranscription"
                  value={formValues.audioTranscription}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Aqui aparecera la transcripcion para que la uses como borrador."
                />
                {audioSuggestedLabels.length ? (
                  <p className="audio-suggestion-summary">
                    Campos autollenados: {audioSuggestedLabels.join(', ')}. Revisa todo antes de guardar.
                  </p>
                ) : formValues.audioTranscription ? (
                  <p className="audio-suggestion-summary">
                    No se detectaron campos claros. Usa la transcripcion como guia para completar la oferta.
                  </p>
                ) : null}
              </section>
              <section className="offer-form-section">
                <div className="offer-section-head">
                  <span>2</span>
                  <div>
                    <h2>Producto</h2>
                    <p>Elige uno existente o registra uno nuevo con la opción Otro producto.</p>
                  </div>
                </div>

                {currentOffer?.productPhotoPath ? (
                  <img
                    className="offer-current-photo"
                    src={getAssetUrl(currentOffer.productPhotoPath)}
                    alt="Foto actual del producto"
                  />
                ) : null}

                <div className="offer-form-grid">
                  <Select
                    className={isCustomProduct ? '' : 'field-span-2'}
                    label="Producto"
                    name="productId"
                    value={formValues.productId}
                    onChange={handleChange}
                    options={productOptions}
                  />
                  {isCustomProduct ? (
                    <Input
                      label="Nombre del producto"
                      name="customProductName"
                      value={formValues.customProductName}
                      onChange={handleChange}
                      placeholder="Ej. quinua, miel, charque..."
                    />
                  ) : null}
                  <Input
                    className="field-span-2"
                    label="Foto del producto"
                    name="productPhoto"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handlePhotoChange}
                  />
                </div>
              </section>

              <section className="offer-form-section">
                <div className="offer-section-head">
                  <span>3</span>
                  <div>
                    <h2>Precio y venta</h2>
                    <p>Indica cómo vendes el producto y su disponibilidad.</p>
                  </div>
                </div>

                <div className="offer-form-grid offer-form-grid-three">
                  <Select
                    label="Tipo de venta"
                    name="saleType"
                    value={formValues.saleType}
                    onChange={handleChange}
                    options={[
                      { value: SALE_TYPES.UNIT, label: 'Unidad' },
                      { value: SALE_TYPES.TRAY, label: 'Maple' },
                    ]}
                  />
                  <Input
                    label="Cantidad aproximada"
                    name="approximateQuantity"
                    type="number"
                    min="0"
                    value={formValues.approximateQuantity}
                    onChange={handleChange}
                    placeholder="Opcional"
                  />
                  <Input
                    label="Precio"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formValues.price}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                  <Select
                    className="field-span-full"
                    label="Disponibilidad"
                    name="availabilityType"
                    value={formValues.availabilityType}
                    onChange={handleChange}
                    options={[
                      { value: OFFER_AVAILABILITY_TYPES.FIXED, label: 'Venta fija' },
                      { value: OFFER_AVAILABILITY_TYPES.TEMPORARY, label: 'Por periodo de tiempo' },
                    ]}
                  />
                  {formValues.availabilityType === OFFER_AVAILABILITY_TYPES.TEMPORARY ? (
                    <>
                      <Input
                        label="Disponible desde"
                        name="availableFrom"
                        type="datetime-local"
                        value={formValues.availableFrom}
                        onChange={handleChange}
                      />
                      <Input
                        label="Disponible hasta"
                        name="availableUntil"
                        type="datetime-local"
                        value={formValues.availableUntil}
                        onChange={handleChange}
                      />
                    </>
                  ) : null}
                </div>
              </section>

              <section className="offer-form-section">
                <div className="offer-section-head">
                  <span>4</span>
                  <div>
                    <h2>Ubicación</h2>
                    <p>Toca el mapa para llenar las coordenadas y describe el punto de venta.</p>
                  </div>
                </div>

                <div className="offer-form-grid">
                  <Input
                    label="Latitud"
                    name="latitude"
                    value={formValues.latitude}
                    onChange={handleChange}
                  />
                  <Input
                    label="Longitud"
                    name="longitude"
                    value={formValues.longitude}
                    onChange={handleChange}
                  />
                  <Textarea
                    className="field-span-full"
                    label="Descripción de ubicación"
                    name="locationDescription"
                    value={formValues.locationDescription}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Ej. puesto 12, pasillo central del mercado."
                  />
                </div>
              </section>

              <div className="offer-submit-bar">
                <Button type="button" variant="ghost" onClick={() => navigate('/merchant/offers')}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar oferta'}
                </Button>
              </div>
            </form>
          </Card>

          <Card className="map-card map-card-picker offer-map-card">
            <div className="map-panel-heading">
              <h2>Ubicación de la oferta</h2>
              <p>Toca el mapa exactamente donde atenderás esta oferta.</p>
            </div>
            <MapView
              offers={offers}
              height="100%"
              onCoordinatePick={handleCoordinatePick}
              selectedPoint={selectedPoint}
            />
          </Card>
        </div>
      ) : (
        <Card>
          {loading ? (
            <LoadingState />
          ) : offers.length ? (
            <Table
              columns={[
                { key: 'product', label: 'Producto', render: (row) => row.product?.productName },
                { key: 'saleType', label: 'Venta' },
                { key: 'availabilityType', label: 'Disponibilidad' },
                { key: 'price', label: 'Precio', render: (row) => row.price ? formatCurrency(row.price) : '-' },
                { key: 'isActive', label: 'Estado', render: (row) => <Badge tone={row.isActive ? 'success' : 'warning'}>{row.isActive ? 'Activa' : 'Inactiva'}</Badge> },
                {
                  key: 'actions',
                  label: 'Acciones',
                  render: (row) => (
                    <div className="table-actions">
                      <Button variant="secondary" size="sm" onClick={() => navigate(`/merchant/offers/${row.id}/edit`)}>Editar</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDisable(row.id)}>Deshabilitar</Button>
                    </div>
                  ),
                },
              ]}
              rows={offers}
            />
          ) : (
            <EmptyState title="Sin ofertas propias" description="Crea tu primera oferta para aparecer en el mapa público." />
          )}
        </Card>
      )}
    </div>
  );
}
