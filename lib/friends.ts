// Mock friends shown in the sidebar's "Friends" section. Connect (their profiles/timelines) isn't built
// yet, so selecting a friend routes to the Connect placeholder. Replace with live data when Connect ships.
export type Friend = {
  id: string;
  initials: string;
  name: string;
};

export const FRIENDS: Array<Friend> = [
  { id: "u_grace", initials: "GO", name: "Grace Okafor" },
  { id: "u_marcus", initials: "MB", name: "Marcus Bell" },
  { id: "u_priya", initials: "PA", name: "Priya Anand" },
  { id: "u_elena", initials: "ER", name: "Elena Ruiz" },
  { id: "u_josiah", initials: "JK", name: "Josiah Kim" },
  { id: "u_daniel", initials: "DF", name: "Daniel Foster" },
];
