import { useEffect, useState } from "react";
import { YOGA_POSES, generateQuickFlow, totalDurationForPoses, formatDuration } from "./yogaPoses.js";
import { YOGA_SERIES } from "./yogaSeries.js";
import { getPoseImage } from "./yogaImages.js";

const s = {
  card: {
    background: "#161616",
    border: "1px solid #262626",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
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
    marginBottom: 16,
  },
  chipRow: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  chip: (active) => ({
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 12,
    border: "1px solid " + (active ? "#e8e8e8" : "#2a2a2a"),
    background: active ? "#e8e8e8" : "transparent",
    color: active ? "#0a0a0a" : "#aaa",
    cursor: "pointer",
  }),
  poseCard: {
    background: "#161616",
    border: "1px solid #262626",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    cursor: "pointer",
  },
  poseTitle: { fontWeight: 700, fontSize: 14, marginBottom: 2 },
  sanskrit: { fontSize: 11, color: "#888", fontStyle: "italic", marginBottom: 4 },
  meta: { fontSize: 12, color: "#888" },
  detailOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.85)",
    zIndex: 50,
    overflowY: "auto",
    padding: "24px 16px 60px",
  },
  detailCard: {
    maxWidth: 480,
    margin: "0 auto",
    background: "#161616",
    border: "1px solid #262626",
    borderRadius: 12,
    padding: 20,
  },
  closeButton: {
    background: "none",
    border: "1px solid #2a2a2a",
    color: "#ccc",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 13,
    cursor: "pointer",
    marginBottom: 16,
  },
  step: { fontSize: 13, color: "#ccc", marginBottom: 6, lineHeight: 1.5 },
  benefitBox: { background: "#0a0a0a", borderRadius: 8, padding: 10, marginBottom: 10 },
  cautionBox: { background: "#2a2210", borderRadius: 8, padding: 10, marginBottom: 12 },
  empty: { color: "#666", fontSize: 13, fontStyle: "italic" },
  disclosure: { fontSize: 11, color: "#666", lineHeight: 1.5, marginBottom: 16 },
};

const LOW_RISK_CAUTIONS = new Set([
  "None significant.",
  "None significant — one of the more passive, low-risk options here.",
  "None significant — a good starting point if Cobra feels like too much.",
  "None significant — this is about as low-risk as a pose gets.",
]);

const ALL_AREAS = Array.from(new Set(YOGA_POSES.flatMap((p) => p.targetAreas))).sort();

export default function YogaLibrary() {
  const [areaFilter, setAreaFilter] = useState(null);
  const [flow, setFlow] = useState(null);
  const [selected, setSelected] = useState(null);
  const [activeSeries, setActiveSeries] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  useEffect(() => {
    if (!selected) {
      setSelectedImage(null);
      return;
    }
    setImageLoading(true);
    getPoseImage(selected.id, selected.sanskritName, selected.englishName).then((url) => {
      setSelectedImage(url);
      setImageLoading(false);
    });
  }, [selected]);

  const filtered = areaFilter
    ? YOGA_POSES.filter((p) => p.targetAreas.includes(areaFilter))
    : YOGA_POSES;

  return (
    <div>
      <p style={s.disclosure}>
        General mobility information, not medical advice — go carefully around any existing
        injury, and skip anything that causes sharp pain rather than a stretch sensation.
      </p>

      <p style={{ ...s.disclosure, marginBottom: 12 }}>
        Pose illustrations from{" "}
        <a href="https://github.com/alexcumplido/yoga-api" target="_blank" rel="noreferrer" style={{ color: "#888" }}>
          Yoga API
        </a>{" "}
        by Alexandre C. Some icons: Easy icons created by monkik - Flaticon, Yoga icons created by dDara - Flaticon.
      </p>

      <div style={{ fontWeight: 700, marginBottom: 8 }}>Yoga series</div>
      {YOGA_SERIES.map((series) => (
        <div key={series.name} style={s.poseCard} onClick={() => setActiveSeries(series)}>
          <div style={s.poseTitle}>{series.name}</div>
          <div style={s.meta}>{series.poses.length} poses · {series.estimatedDuration}</div>
        </div>
      ))}

      <button style={{ ...s.button, marginTop: 8 }} onClick={() => setFlow(generateQuickFlow({ count: 6 }))}>
        Or generate a random quick flow
      </button>

      {flow && (
        <div style={s.card}>
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Quick flow</div>
          <div style={{ ...s.meta, marginBottom: 8 }}>{flow.length} poses · {formatDuration(totalDurationForPoses(flow))}</div>
          {flow.map((pose, i) => (
            <div key={pose.id} style={s.poseCard} onClick={() => setSelected(pose)}>
              <div style={s.poseTitle}>{i + 1}. {pose.sanskritName}</div>
              <div style={s.sanskrit}>{pose.englishName}</div>
              <div style={s.meta}>{pose.targetAreas.join(", ")} · {pose.intensity}</div>
            </div>
          ))}
        </div>
      )}

      <div style={s.chipRow}>
        <button style={s.chip(areaFilter === null)} onClick={() => setAreaFilter(null)}>
          All areas
        </button>
        {ALL_AREAS.map((area) => (
          <button key={area} style={s.chip(areaFilter === area)} onClick={() => setAreaFilter(area)}>
            {area}
          </button>
        ))}
      </div>

      {filtered.length === 0 && <p style={s.empty}>No poses match that filter.</p>}

      {filtered.map((pose) => (
        <div key={pose.id} style={s.poseCard} onClick={() => setSelected(pose)}>
          <div style={s.poseTitle}>{pose.sanskritName}</div>
          <div style={s.sanskrit}>{pose.englishName}</div>
          <div style={s.meta}>{pose.targetAreas.join(", ")} · {pose.intensity}</div>
        </div>
      ))}

      {selected && (
        <div style={s.detailOverlay} onClick={() => setSelected(null)}>
          <div style={s.detailCard} onClick={(e) => e.stopPropagation()}>
            <button style={s.closeButton} onClick={() => setSelected(null)}>← Back</button>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 2 }}>{selected.sanskritName}</div>
            <div style={s.sanskrit}>{selected.englishName}</div>

            {imageLoading && <p style={s.empty}>Loading illustration...</p>}
            {!imageLoading && selectedImage && (
              <img
                src={selectedImage}
                alt={selected.englishName}
                style={{ width: "100%", maxWidth: 240, display: "block", margin: "0 auto 12px", background: "#fff", borderRadius: 8, padding: 8, cursor: "pointer" }}
                onClick={() => setFullscreenImage(selectedImage)}
              />
            )}

            <p style={{ ...s.meta, marginBottom: 12 }}>
              Targets: {selected.targetAreas.join(", ")} · Intensity: {selected.intensity}
            </p>

            <div style={s.benefitBox}>
              <div style={{ fontSize: 11, color: "#7ad67a", fontWeight: 700, marginBottom: 4 }}>Why this helps</div>
              <p style={{ fontSize: 12, color: "#ccc", lineHeight: 1.5 }}>{selected.benefit}</p>
            </div>

            {selected.caution && !LOW_RISK_CAUTIONS.has(selected.caution) && (
              <div style={s.cautionBox}>
                <div style={{ fontSize: 11, color: "#e0c85b", fontWeight: 700, marginBottom: 4 }}>Worth knowing</div>
                <p style={{ fontSize: 12, color: "#ccc", lineHeight: 1.5 }}>{selected.caution}</p>
              </div>
            )}

            {selected.instructions.map((step, i) => (
              <p key={i} style={s.step}>
                <strong>{i + 1}.</strong> {step}
              </p>
            ))}
          </div>
        </div>
      )}

      {activeSeries && (
        <div style={s.detailOverlay} onClick={() => setActiveSeries(null)}>
          <div style={s.detailCard} onClick={(e) => e.stopPropagation()}>
            <button style={s.closeButton} onClick={() => setActiveSeries(null)}>← Back</button>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 4 }}>{activeSeries.name}</div>
            <p style={{ ...s.meta, marginBottom: 12 }}>
              {activeSeries.poses.length} poses · {activeSeries.estimatedDuration}
            </p>
            <p style={{ fontSize: 12, color: "#ccc", lineHeight: 1.5, marginBottom: 16 }}>
              {activeSeries.description}
            </p>
            {activeSeries.poses.map((pose, i) => (
              <div
                key={pose.id}
                style={s.poseCard}
                onClick={() => {
                  setActiveSeries(null);
                  setSelected(pose);
                }}
              >
                <div style={s.poseTitle}>{i + 1}. {pose.sanskritName}</div>
                <div style={s.sanskrit}>{pose.englishName}</div>
                <div style={s.meta}>{pose.targetAreas.join(", ")} · {pose.bothSides ? "both sides" : ""}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {fullscreenImage && (
        <div
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 100,
            display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
          }}
          onClick={() => setFullscreenImage(null)}
        >
          <img src={fullscreenImage} alt="Full screen" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", background: "#fff", borderRadius: 8, padding: 16 }} />
        </div>
      )}
    </div>
  );
}
