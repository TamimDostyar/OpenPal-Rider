import { useState } from 'react';
import { api } from '@/api/client';
import type { PostType } from '@/api/types';
import { errorMessage } from '@/hooks/useApi';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { Textarea } from '@/components/ui/Textarea';
import { Banner } from '@/components/ui/Banner';

interface CreatePostModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export function CreatePostModal({ onClose, onCreated }: CreatePostModalProps) {
  const [postType, setPostType] = useState<PostType>('DRIVER');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [price, setPrice] = useState('');
  const [seats, setSeats] = useState('1');
  const [vehicleInfo, setVehicleInfo] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isDriver = postType === 'DRIVER';

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
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Modal title="New post" onClose={onClose}>
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
          <TextField
            label="From"
            placeholder="e.g. Main Campus"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
          />
          <TextField
            label="To"
            placeholder="e.g. Airport"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
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
          {busy ? 'Posting…' : 'Post ride'}
        </Button>
      </div>
    </Modal>
  );
}
