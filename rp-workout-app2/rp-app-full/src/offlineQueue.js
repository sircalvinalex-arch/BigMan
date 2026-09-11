// offlineQueue.js
//
// Scope note: this handles the realistic gym scenario — you log a set,
// the gym wifi drops, the write to Supabase fails. Instead of losing the
// data, it's queued in localStorage and retried automatically when the
// connection returns.
//
// This is NOT a full offline-capable app (that would need a service
// worker to cache the app shell itself so the page loads with no network
// at all). That's a bigger, separate piece of infrastructure — worth
// doing later if you find you need the app to open with zero signal,
// not just survive a mid-session drop.

const QUEUE_KEY = "rp-workout-app:offline-queue";

function readQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

function enqueue(item) {
  const queue = readQueue();
  queue.push({ ...item, queuedAt: new Date().toISOString() });
  writeQueue(queue);
}

function getQueueLength() {
  return readQueue().length;
}

// Attempts to run `fn`. On failure (network error), queues it under `type`
// with `payload` so it can be replayed later via flushQueue.
async function runOrQueue(type, payload, fn) {
  try {
    return await fn();
  } catch (err) {
    // Only queue actual network failures, not validation/auth errors —
    // those would just fail again identically on replay.
    const looksLikeNetworkError =
      err?.message?.includes("fetch") || err?.name === "TypeError" || !navigator.onLine;
    if (looksLikeNetworkError) {
      enqueue({ type, payload });
      return { queued: true };
    }
    throw err;
  }
}

// Called with a map of { type: (payload) => Promise } handlers so this
// module doesn't need to import storage.js directly (avoids a circular
// import, since storage.js is what calls into this file).
async function flushQueue(handlers) {
  const queue = readQueue();
  if (queue.length === 0) return { flushed: 0, remaining: 0 };

  const remaining = [];
  let flushed = 0;

  for (const item of queue) {
    const handler = handlers[item.type];
    if (!handler) {
      remaining.push(item); // unknown type, keep it rather than drop it
      continue;
    }
    try {
      await handler(item.payload);
      flushed++;
    } catch {
      remaining.push(item); // still failing, keep for next attempt
    }
  }

  writeQueue(remaining);
  return { flushed, remaining: remaining.length };
}

function onReconnect(callback) {
  window.addEventListener("online", callback);
  return () => window.removeEventListener("online", callback);
}

export const offlineQueue = {
  runOrQueue,
  flushQueue,
  getQueueLength,
  onReconnect,
};
