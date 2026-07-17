// Zustand store — the single source of truth the UI reads from: the entry list plus addLeaf / markMilestone.
// Starts empty at stage 'seed' and grows as you add entries live; updates optimistically, then persists via /api so entries appear instantly on stage.
