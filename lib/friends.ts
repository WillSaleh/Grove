// The signed-in person's friends — the six community members, enriched with the relationship metadata
// from the design (church, city, mutuals). Mock data; Connect is client-only until the social backend exists.
export type Friend = {
  church: string;
  city: string;
  id: string;
  initials: string;
  mutuals: number;
  name: string;
  since: number;
};

export const FRIENDS: Array<Friend> = [
  { church: "Grace Community Church", city: "Austin, TX", id: "u_grace", initials: "GO", mutuals: 12, name: "Grace Okafor", since: 2013 },
  { church: "Redeemer City Church", city: "Austin, TX", id: "u_marcus", initials: "MB", mutuals: 6, name: "Marcus Bell", since: 2016 },
  { church: "Grace Community Church", city: "Austin, TX", id: "u_priya", initials: "PA", mutuals: 9, name: "Priya Anand", since: 2019 },
  { church: "Hill Country Bible", city: "Austin, TX", id: "u_elena", initials: "ER", mutuals: 4, name: "Elena Ruiz", since: 2020 },
  { church: "Redeemer City Church", city: "Austin, TX", id: "u_josiah", initials: "JK", mutuals: 3, name: "Josiah Kim", since: 2022 },
  { church: "Grace Community Church", city: "Round Rock, TX", id: "u_daniel", initials: "DF", mutuals: 7, name: "Daniel Foster", since: 2018 },
];
