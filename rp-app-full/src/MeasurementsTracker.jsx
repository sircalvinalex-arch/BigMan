import { useEffect, useRef, useState } from "react";
import { storage } from "./storage.js";

const s = {
  card: {
    background: "#161616",
    border: "1px solid #262626",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 14, fontWeight: 700, marginBottom: 12 },
  input: {
    width: "100%",
    background: "#111",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    color: "#f2f2f2",
    padding: "10px 12px",
    fontSize: 14,
    marginBottom: 8,
  },
  row: { display: "flex", gap: 8, marginBottom: 8 },
  button: {
    width: "100%",
    background: "#e8e8e8",
    color: "#0a0a0a",
    border: "none",
    borderRadius: 8,
    padding: "12px",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
  },
  entryRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    padding: "6px 0",
    borderBottom: "1px solid #222",
  },
  photoGrid: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 },
  photo: { width: 100, height: 100, objectFit: "cover", borderRadius: 8 },
  empty: { color: "#666", fontSize: 13, fontStyle: "italic" },
  note: { fontSize: 11, color: "#666", marginTop: 8 },
};

export default function MeasurementsTracker() {
  const [measurements, setMeasurements] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [uploading, setUploading] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef(null);

  const refresh = async () => {
    const [m, p] = await Promise.all([
      storage.getMeasurements(),
      storage.getProgressPhotos().catch(() => []), // bucket may not exist yet
    ]);
    setMeasurements(m);
    setPhotos(p);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleLog = async (e) => {
    e.preventDefault();
    if (!weight && !bodyFat) return;
    await storage.logMeasurement({
      weight: weight ? Number(weight) : null,
      bodyFatPct: bodyFat ? Number(bodyFat) : null,
    });
    setWeight("");
    setBodyFat("");
    refresh();
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setPhotoError("");
    try {
      await storage.uploadProgressPhoto(file);
      refresh();
    } catch (err) {
      setPhotoError(
        "Couldn't upload — the 'progress-photos' storage bucket may not be set up yet. See SETUP.md."
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <div style={s.card}>
        <div style={s.sectionTitle}>Log measurements</div>
        <form onSubmit={handleLog}>
          <div style={s.row}>
            <input
              style={s.input}
              type="number"
              placeholder="Weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
            <input
              style={s.input}
              type="number"
              placeholder="Body fat %"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
            />
          </div>
          <button style={s.button} type="submit">Log entry</button>
        </form>
      </div>

      <div style={s.card}>
        <div style={s.sectionTitle}>History</div>
        {measurements.length === 0 && <p style={s.empty}>No measurements logged yet.</p>}
        {[...measurements].reverse().map((m) => (
          <div key={m.id} style={s.entryRow}>
            <span>{new Date(m.date).toLocaleDateString()}</span>
            <span>{m.weight ? `${m.weight}` : ""} {m.body_fat_pct ? `· ${m.body_fat_pct}% BF` : ""}</span>
          </div>
        ))}
      </div>

      <div style={s.card}>
        <div style={s.sectionTitle}>Progress photos</div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          disabled={uploading}
        />
        {photoError && <p style={{ color: "#e07a7a", fontSize: 12, marginTop: 8 }}>{photoError}</p>}
        <p style={s.note}>
          Requires a one-time Supabase Storage bucket setup — see SETUP.md if uploads fail.
        </p>
        <div style={s.photoGrid}>
          {photos.map((p) => (
            <img key={p.id} src={p.url} alt="Progress" style={s.photo} />
          ))}
        </div>
      </div>
    </div>
  );
}
