import { useState } from 'react';
import { api } from '@/api/client';
import type { FeedPostResponse, PostType } from '@/api/types';
import { errorMessage } from '@/hooks/useApi';
import { toDatetimeLocalValue } from '@/lib/datetime';
import type { GeocodePlace } from '@/lib/geocode';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Textarea } from '@/components/ui/Textarea';
import { Banner } from '@/components/ui/Banner';
import { LocationField } from '@/components/ui/LocationField';

interface Coord {
  lat: number;
  lng: number;
  placeId: string;
}

interface CreatePostModalProps {
  /** When set, the modal edits this post: submitting creates a replacement and deletes the original. */
  editingPost?: FeedPostResponse;
  onClose: () => void;
  onCreated: () => void;
}

export function CreatePostModal({ editingPost, onClose, onCreated }: CreatePostModalProps) {
  const isEditing = !!editingPost;
  const [postType, setPostType] = useState<PostType>(editingPost?.postType ?? 'DRIVER');
  const [origin, setOrigin] = useState(editingPost?.origin ?? '');
  const [originCoord, setOriginCoord] = useState<Coord | null>(null);
  const [destination, setDestination] = useState(editingPost?.destination ?? '');
  const [destCoord, setDestCoord] = useState<Coord | null>(null);
  const [departureTime, setDepartureTime] = useState(
    editingPost ? toDatetimeLocalValue(editingPost.departureTime) : '',
  );
  const [price, setPrice] = useState(editingPost?.price ? String(editingPost.price) : '');
  const [seats, setSeats] = useState(editingPost ? String(editingPost.seats) : '1');
  const [vehicleInfo, setVehicleInfo] = useState(editingPost?.vehicleInfo ?? '');
  const [description, setDescription] = useState(editingPost?.description ?? '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isDriver = postType === 'DRIVER';

  const changeOrigin = (text: string) => {
    setOrigin(text);
    setOriginCoord(null);
  };
  const changeDestination = (text: string) => {
    setDestination(text);
    setDestCoord(null);
  };
  const selectOrigin = (place: GeocodePlace) => setOriginCoord({ lat: place.lat, lng: place.lng, placeId: place.placeId });
  const selectDestination = (place: GeocodePlace) => setDestCoord({ lat: place.lat, lng: place.lng, placeId: place.placeId });

  const handleSubmit = async () => {
    if (!origin.trim() || !destination.trim() || !departureTime) {
      setError('Origin, destination, and departure time are required.');
      return;
    }
    const seatsNum = Number(seats);
    if (!Number.isInteger(seatsNum) || seatsNum < 1) {
      setError('Seats must be a whole number of at least 1.');
      return;
    }
    const priceNum = isDriver ? Number(price || '0') : 0;
    if (isDriver && (Number.isNaN(priceNum) || priceNum < 0)) {
      setError('Enter a valid price.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      await api.feed.create({
        postType,
        origin: origin.trim(),
        destination: destination.trim(),
        departureTime,
        price: priceNum,
        seats: seatsNum,
        vehicleInfo: isDriver && vehicleInfo.trim() ? vehicleInfo.trim() : undefined,
        description: description.trim() || undefined,
        originLat: originCoord?.lat,
        originLng: originCoord?.lng,
        originPlaceId: originCoord?.placeId,
        destLat: destCoord?.lat,
        destLng: destCoord?.lng,
        destPlaceId: destCoord?.placeId,
      });

      if (isEditing) {
        try {
          await api.feed.delete(editingPost.id);
        } catch {
          setError('Your updated post was created, but the old post could not be removed. You can delete it from My rides.');
          setBusy(false);
          onCreated();
          return;
        }
      }

      onCreated();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Modal title={isEditing ? 'Edit post' : 'New post'} onClose={onClose}>
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-1 rounded-2xl border border-line bg-cream-2 p-1">
          <button
            type="button"
            onClick={() => setPostType('DRIVER')}
            className={`rounded-xl py-2.5 text-xs font-semibold cursor-pointer transition-all duration-150 ease-out ${
              isDriver ? 'bg-cream text-ink shadow-[var(--shadow-sm)]' : 'text-muted hover:text-ink'
            }`}
          >
            Offering a ride
          </button>
          <button
            type="button"
            onClick={() => setPostType('PASSENGER')}
            className={`rounded-xl py-2.5 text-xs font-semibold cursor-pointer transition-all duration-150 ease-out ${
              !isDriver ? 'bg-cream text-ink shadow-[var(--shadow-sm)]' : 'text-muted hover:text-ink'
            }`}
          >
            Looking for a ride
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <LocationField
            label="From"
            placeholder="Search a place, e.g. Minneapolis"
            value={origin}
            onChangeText={changeOrigin}
            onSelect={selectOrigin}
          />
          <LocationField
            label="To"
            placeholder="Search a place, e.g. Denver"
            value={destination}
            onChangeText={changeDestination}
            onSelect={selectDestination}
          />
          <TextField
            label="Departure"
            type="datetime-local"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
          />

          <div className="flex gap-3">
            {isDriver ? (
              <TextField
                label="Price per seat ($)"
                type="number"
                min={0}
                step="0.01"
                placeholder="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            ) : null}
            <TextField
              label={isDriver ? 'Seats available' : 'Riders'}
              type="number"
              min={1}
              value={seats}
              onChange={(e) => setSeats(e.target.value)}
            />
          </div>

          {isDriver ? (
            <TextField
              label="Vehicle (optional)"
              placeholder="e.g. 2021 Honda Civic · Silver"
              value={vehicleInfo}
              onChange={(e) => setVehicleInfo(e.target.value)}
            />
          ) : null}

          <Textarea
            label="Notes (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Pickup spot, luggage space, music preferences…"
          />
        </div>

        {error ? <Banner tone="error">{error}</Banner> : null}

        <Button onClick={handleSubmit} size="lg" loading={busy}>
          {busy ? 'Saving…' : isEditing ? 'Save changes' : 'Post ride'}
        </Button>
      </div>
    </Modal>
  );
}
