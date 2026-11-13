import type { Person } from "@/domain/types";

/** Fictional demo people. No verification badges, no real identities. */
export const demoPeople: Person[] = [
  { id: "u-malika", handle: "malika.r", displayName: "Malika R.", bio: "Product designer. Collects quiet corners with good light.", neighborhood: "yunusabad", avatarTone: 1, isDemo: true },
  { id: "u-timur", handle: "timur.walks", displayName: "Timur A.", bio: "Walks everywhere. Notes what changes.", neighborhood: "chilonzor", avatarTone: 2, isDemo: true },
  { id: "u-dilnoza", handle: "dilnoza.k", displayName: "Dilnoza K.", bio: "Mother of two, planner of family dinners.", neighborhood: "mirzo-ulugbek", avatarTone: 4, isDemo: true },
  { id: "u-aziz", handle: "aziz.eats", displayName: "Aziz M.", bio: "Plov opinions, freely given.", avatarTone: 3, isDemo: true },
  { id: "u-sevara", handle: "sevara.t", displayName: "Sevara T.", bio: "Freelance translator, café hopper.", neighborhood: "chilonzor", avatarTone: 5, isDemo: true },
  { id: "u-rustam", handle: "rustam.y", displayName: "Rustam Y.", bio: "Engineer. Honest about service.", avatarTone: 2, isDemo: true },
  { id: "u-nigora", handle: "nigora.s", displayName: "Nigora S.", bio: "Visiting Tashkent this autumn.", avatarTone: 1, isDemo: true },
  { id: "u-jamshid", handle: "jamshid.b", displayName: "Jamshid B.", bio: "Early riser, bread enthusiast.", neighborhood: "shaykhontohur", avatarTone: 3, isDemo: true },
];

/** Demo creators the simulated profile follows at the start. */
export const demoInitialFollowing = ["u-timur", "u-aziz"];
