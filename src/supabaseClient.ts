/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { Mod } from './types';
import { safeStorage } from './utils/safeStorage';

// Custom error class for database/Supabase operations
export class ModsDriveError extends Error {
  code: 'NETWORK_ERROR' | 'DB_ERROR' | 'AUTH_ERROR' | 'NOT_FOUND' | 'RATE_LIMIT';
  originalError: any;

  constructor(
    code: 'NETWORK_ERROR' | 'DB_ERROR' | 'AUTH_ERROR' | 'NOT_FOUND' | 'RATE_LIMIT',
    message: string,
    originalError?: any
  ) {
    super(message);
    this.name = 'ModsDriveError';
    this.code = code;
    this.originalError = originalError;
  }
}

// Helper to clean the Supabase URL by removing trailing slashes and /rest/v1 suffix
const getCleanUrl = (url: string): string => {
  if (!url) return '';
  let clean = url.trim();
  // Remove any trailing slash first
  if (clean.endsWith('/')) {
    clean = clean.slice(0, -1);
  }
  // Strip off /rest/v1 if it is appended in the input
  if (clean.endsWith('/rest/v1')) {
    clean = clean.slice(0, -8);
  }
  // Remove any trailing slash after stripping
  if (clean.endsWith('/')) {
    clean = clean.slice(0, -1);
  }
  return clean;
};

// Check environment variables first, falling back to empty string
export const SUPABASE_URL = (
  ((import.meta as any).env && (import.meta as any).env.VITE_SUPABASE_URL) || 
  ''
).trim();

export const SUPABASE_KEY = (
  ((import.meta as any).env && (import.meta as any).env.VITE_SUPABASE_ANON_KEY) || 
  ''
).trim();

const cleanSupabaseUrl = getCleanUrl(SUPABASE_URL);

const IS_DEV = !!((import.meta as any).env && (import.meta as any).env.DEV);

// Check if credentials are placeholders or invalid URL formats
const isPlaceholder = (url: string, key: string) => {
  if (!url || !key) return true;
  const urlLower = url.toLowerCase();
  if (urlLower.includes('your_supabase_') || key.toLowerCase().includes('your_supabase_')) return true;
  if (!urlLower.startsWith('http://') && !urlLower.startsWith('https://')) return true;
  return false;
};

const computedDemoMode = isPlaceholder(SUPABASE_URL, SUPABASE_KEY);

export const supabaseClient = (() => {
  if (computedDemoMode) return null;
  try {
    return createClient(cleanSupabaseUrl, SUPABASE_KEY);
  } catch (err) {
    console.error('[Supabase Init] Failed to initialize client. Forcing demo mode fallback.', err);
    return null;
  }
})();

export const IS_DEMO_MODE = computedDemoMode || (supabaseClient === null);

if (IS_DEV) {
  console.log('Supabase configuration:', {
    originalUrl: SUPABASE_URL,
    cleanUrl: cleanSupabaseUrl,
    isDemoMode: IS_DEMO_MODE,
    keyLength: SUPABASE_KEY ? SUPABASE_KEY.length : 0
  });
}

// Premium initial seed mods for the demo mode
export const SEED_MODS: Mod[] = [
  {
    id: 1,
    name: "Toyota Supra MK4 Turbo 1994",
    description: "Legendary JDM sports car featuring a highly customized twin-turbo 2JZ-GTE engine sound pack, active adjustable active spoiler physics, premium interior details with functional speedo and boost gauges, drift suspension kit, and ultra high-res textures compatible with all street simulator engines.",
    category: "cars",
    image_url: "https://images.unsplash.com/photo-1617469767053-d3b508a0d822?auto=format&fit=crop&q=80&w=800",
    download_url: "https://modsfire.com/download/free-vehicle-modes-pack-v1/toyota_supra_mk4_simulator_ready.zip",
    downloads_count: 1842,
    created_at: "2026-06-10T12:00:00Z",
    game_version: "v1.49",
    mod_version: "v2.1",
    file_size: "42 MB",
    gallery_urls: [
      "https://images.unsplash.com/photo-1626847037657-fd3622613ce3?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: 2,
    name: "Scania S730 V8 Streamline Heavy Duty",
    description: "Luxurious heavy commercial truck meticulously designed for highway cargo simulation. Features a hyper-realistic 16.4L V8 open pipe exhaust sound model, multiple chassis configurations (4x2, 6x2, 8x4), interactive driver cabin, in-dash GPS, full LED matrix illumination and customized decals.",
    category: "trucks",
    image_url: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80&w=800",
    download_url: "https://modsfire.com/download/free-vehicle-modes-pack-v1/scania_s730_v8_streamline.zip",
    downloads_count: 2451,
    created_at: "2026-06-11T14:30:00Z",
    game_version: "v1.49",
    mod_version: "v1.0",
    file_size: "125 MB",
    gallery_urls: [
      "https://images.unsplash.com/photo-1542382156909-9ae37b3f56fd?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&q=80&w=600"
    ]
  },
  {
    id: 3,
    name: "Mercedes-Benz Citaro G Transit Bus",
    description: "Excellent articulated urban passenger transport. Comes with fully functional pneumatic automatic passenger doors, realistic interior cabin buzzer, modern transit route matrix display, ticket printer machine model, commuter standing physics, and responsive urban city steering ratios.",
    category: "buses",
    image_url: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=800",
    download_url: "https://modsfire.com/download/free-vehicle-modes-pack-v1/mercedes_citaro_city_transit.zip",
    downloads_count: 1205,
    created_at: "2026-06-12T09:15:00Z",
    game_version: "v1.48",
    mod_version: "v1.5",
    file_size: "98 MB"
  },
  {
    id: 4,
    name: "Nissan Skyline GT-R R34 Godzilla Edition",
    description: "Iconic high-performance vehicle with authentic multi-functional dashboard screen reflecting dynamic boost, torque distribution, and oil temperature. Equipped with performance intercoolers, custom tuned exhaust, AWD ATTESA track setup, and multiple metallic paint styles.",
    category: "cars",
    image_url: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=800",
    download_url: "https://modsfire.com/download/free-vehicle-modes-pack-v1/nissan_skyline_g_t_r_r34_tuned.zip",
    downloads_count: 3108,
    created_at: "2026-06-13T18:45:00Z",
    game_version: "v1.50",
    mod_version: "v3.0_beta",
    file_size: "75 MB"
  },
  {
    id: 5,
    name: "Peterbilt 389 Extended Hood Custom",
    description: "Classic American long-haul truck with brilliant chrome plating. Features deep-toned dual vertical exhaust stacks, fully styled sleeper cab, manual 18-speed shift synchronization support, analog gauge cluster, skin support, and massive triple-train cargo pulling power.",
    category: "trucks",
    image_url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800",
    download_url: "https://modsfire.com/download/free-vehicle-modes-pack-v1/peterbilt_389_classic_chrome.zip",
    downloads_count: 1983,
    created_at: "2026-06-14T11:20:00Z",
    game_version: "v1.49",
    mod_version: "v4.2",
    file_size: "154 MB"
  },
  {
    id: 6,
    name: "Volvo 9700 Grand Coach Horizon",
    description: "Premium interstate passenger liner built for long-distance cruising. Outfitted with high-luxury passenger recliners, personal air ventilation outputs, automated luggage bay animations, double rear axles, silent electronic dynamic driving aids, and long range fuel tanks.",
    category: "buses",
    image_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800",
    download_url: "https://modsfire.com/download/free-vehicle-modes-pack-v1/volvo_9700_premium_coach.zip",
    downloads_count: 837,
    created_at: "2026-06-15T15:10:00Z",
    game_version: "v1.47",
    mod_version: "v1.2",
    file_size: "112 MB"
  },
  {
    id: 7,
    name: "MAN TGX Euro 6 Cargo Carrier",
    description: "Highly detailed heavy duty transport truck ideal for European highways. It boasts highly tuned custom high-torque diesel sound profiles, active dynamic cruise assist, standard digital cabin consoles, customizable trailer attachments and custom decals.",
    category: "trucks",
    image_url: "https://images.unsplash.com/photo-1591768793355-74d7189607f7?auto=format&fit=crop&q=80&w=800",
    download_url: "https://modsfire.com/download/free-vehicle-modes-pack-v1/man_tgx_euro_6_carrier.zip",
    downloads_count: 1420,
    created_at: "2026-06-15T18:30:00Z",
    game_version: "v1.49",
    mod_version: "v1.1",
    file_size: "89 MB"
  },
  {
    id: 8,
    name: "Mitsubishi Lancer Evolution X Drift",
    description: "All-wheel-drive drift tuning spec of the legendary sports sedan. Fully equipped with multi-stage launch control system, performance racing wheels, dynamic suspension telemetry, carbon fiber wings, and direct responsiveness on race tracks.",
    category: "cars",
    image_url: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=800",
    download_url: "https://modsfire.com/download/free-vehicle-modes-pack-v1/lancer_evo_x_drifter.zip",
    downloads_count: 2790,
    created_at: "2026-06-16T10:00:00Z",
    game_version: "v1.50",
    mod_version: "v2.0",
    file_size: "64 MB"
  },
  {
    id: 9,
    name: "Hyundai Super Aero City Bus",
    description: "Highly recognizable East Asian urban commuter transit bus. It contains automated double doors, realistic low-floor step animations, fully voiced passenger bell sound clips, detailed cockpit steering controls, and authentic engine rattles.",
    category: "buses",
    image_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800",
    download_url: "https://modsfire.com/download/free-vehicle-modes-pack-v1/hyundai_super_aero_city.zip",
    downloads_count: 954,
    created_at: "2026-06-16T11:45:00Z",
    game_version: "v1.48",
    mod_version: "v1.0",
    file_size: "130 MB"
  },
  {
    id: 10,
    name: "Ford Mustang Shelby GT500 2020",
    description: "Vicious muscle car simulation package featuring a supercharged V8 engine. Comes with standard active sound valves, carbon track performance package, track telemetry suite, customizable glossy stripes, and brutal modern line-lock capabilities.",
    category: "cars",
    image_url: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800",
    download_url: "https://modsfire.com/download/free-vehicle-modes-pack-v1/ford_shelby_gt500_mustang.zip",
    downloads_count: 3512,
    created_at: "2026-06-16T12:00:00Z",
    game_version: "v1.49",
    mod_version: "v1.8",
    file_size: "210 MB"
  },
  {
    id: 11,
    name: "Kenworth W900 Custom Classic Long",
    description: "Traditional American master truck featuring extended exhaust pipes. Outfitted with high-fidelity mechanical transmission gears, detailed sleepers, 650HP custom power engines, ultra polished steel chrome, and dual horns ready for simulation.",
    category: "trucks",
    image_url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800",
    download_url: "https://modsfire.com/download/free-vehicle-modes-pack-v1/kenworth_w900_long_classic.zip",
    downloads_count: 2195,
    created_at: "2026-06-16T13:10:00Z",
    game_version: "v1.50",
    mod_version: "v4.0",
    file_size: "240 MB"
  },
  {
    id: 12,
    name: "Ikarus 260 Vintage Articulated Bus",
    description: "Classic retro city public transporter featuring realistic mechanical high-floor suspensions, fully articulated accordion physics, manual transmission shifter, hand-operated manual doors, and authentic smoky diesel exhaust exhaust fumes.",
    category: "buses",
    image_url: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=800",
    download_url: "https://modsfire.com/download/free-vehicle-modes-pack-v1/ikarus_260_vintage_class.zip",
    downloads_count: 671,
    created_at: "2026-06-16T14:15:00Z",
    game_version: "v1.47",
    mod_version: "v1.1",
    file_size: "118 MB"
  }
];

// Helper to initialize local storage
const getLocalStorageMods = (): Mod[] => {
  const data = safeStorage.getItem('simulator_mods');
  if (!data) {
    safeStorage.setItem('simulator_mods', JSON.stringify(SEED_MODS));
    return SEED_MODS;
  }
  try {
    const parsed = JSON.parse(data) as Mod[];
    // Migrate: check if we need to add game_version/mod_version back to seed mods
    if (parsed.length <= 6) {
      safeStorage.setItem('simulator_mods', JSON.stringify(SEED_MODS));
      return SEED_MODS;
    }
    let changed = false;
    const migrated = parsed.map(mod => {
      const seedMatch = SEED_MODS.find(sm => sm.id === mod.id);
      if (seedMatch) {
        if (!mod.game_version && seedMatch.game_version) {
          mod.game_version = seedMatch.game_version;
          changed = true;
        }
        if (!mod.mod_version && seedMatch.mod_version) {
          mod.mod_version = seedMatch.mod_version;
          changed = true;
        }
        if (!mod.gallery_urls && seedMatch.gallery_urls) {
          mod.gallery_urls = seedMatch.gallery_urls;
          changed = true;
        }
        if (!mod.file_size && seedMatch.file_size) {
          mod.file_size = seedMatch.file_size;
          changed = true;
        }
      }
      // Guarantee a default game version if not there programmatically
      if (!mod.game_version) {
        mod.game_version = "v1.49";
        changed = true;
      }
      if (!mod.file_size) {
        const idNum = typeof mod.id === 'number' && !isNaN(mod.id) ? mod.id : (mod.id ? String(mod.id).length : 1);
        const sizes = ["42 MB", "125 MB", "98 MB", "154 MB", "210 MB", "89 MB", "112 MB", "64 MB", "75 MB", "130 MB", "240 MB", "118 MB"];
        const index = Math.abs(idNum - 1) % sizes.length;
        mod.file_size = sizes[index];
        changed = true;
      }
      return mod;
    });

    if (changed) {
      safeStorage.setItem('simulator_mods', JSON.stringify(migrated));
    }
    return migrated;
  } catch (e) {
    return SEED_MODS;
  }
};

const setLocalStorageMods = (mods: Mod[]) => {
  safeStorage.setItem('simulator_mods', JSON.stringify(mods));
};

// Mod operations
export const getMods = async (): Promise<Mod[]> => {
  const isApproved = (m: Mod) => m.status === 'approved' || m.status === undefined || m.status === null;

  if (IS_DEMO_MODE) {
    // Add brief animation delay
    await new Promise(resolve => setTimeout(resolve, 350));
    const mods = getLocalStorageMods();
    return mods.filter(isApproved);
  } else {
    try {
      const { data, error } = await supabaseClient!
        .from('mods')
        .select('*')
        .or('status.eq.approved,status.is.null')
        .order('created_at', { ascending: false });
      if (error) {
        throw new ModsDriveError('DB_ERROR', error.message, error);
      }
      const fetchedMods = data as Mod[] || [];
      return fetchedMods.filter(isApproved);
    } catch (err) {
      if (err instanceof ModsDriveError) throw err;
      throw new ModsDriveError('NETWORK_ERROR', 'Failed to connect to database', err);
    }
  }
};

export const getModById = async (id: number): Promise<Mod | null> => {
  const isApproved = (m: Mod) => m.status === 'approved' || m.status === undefined || m.status === null;

  if (IS_DEMO_MODE) {
    const mods = getLocalStorageMods();
    const found = mods.find(m => m.id === id);
    if (found && isApproved(found)) {
      return found;
    }
    return null;
  } else {
    try {
      const { data, error } = await supabaseClient!
        .from('mods')
        .select('*')
        .eq('id', id)
        .or('status.eq.approved,status.is.null')
        .single();
      if (error) {
        if (error.code === 'PGRST116') {
          throw new ModsDriveError('NOT_FOUND', 'Mod not found', error);
        }
        throw new ModsDriveError('DB_ERROR', error.message, error);
      }
      if (!data || !isApproved(data as Mod)) {
        throw new ModsDriveError('NOT_FOUND', 'Mod not found');
      }
      return data as Mod;
    } catch (err) {
      if (err instanceof ModsDriveError) throw err;
      throw new ModsDriveError('NETWORK_ERROR', 'Failed to connect to database', err);
    }
  }
};

export const createMod = async (mod: Omit<Mod, 'id' | 'created_at' | 'downloads_count'>): Promise<Mod> => {
  if (IS_DEMO_MODE) {
    const mods = getLocalStorageMods();
    const newId = mods.length > 0 ? Math.max(...mods.map(m => m.id)) + 1 : 1;
    const newMod: Mod = {
      ...mod,
      id: newId,
      downloads_count: 0,
      created_at: new Date().toISOString()
    };
    mods.unshift(newMod);
    setLocalStorageMods(mods);
    return newMod;
  } else {
    try {
      const response = await fetch('/api/admin/mods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(mod),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new ModsDriveError('DB_ERROR', errData.error || 'Failed to create mod through secure backend server.');
      }

      return await response.json();
    } catch (err) {
      if (err instanceof ModsDriveError) throw err;
      throw new ModsDriveError('NETWORK_ERROR', 'Failed to save mod through secure backend API', err);
    }
  }
};

export const deleteMod = async (id: number): Promise<boolean> => {
  if (IS_DEMO_MODE) {
    const mods = getLocalStorageMods();
    const filtered = mods.filter(m => m.id !== id);
    setLocalStorageMods(filtered);
    return true;
  } else {
    try {
      const response = await fetch(`/api/admin/mods/${id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new ModsDriveError('DB_ERROR', errData.error || 'Failed to delete mod through secure backend server.');
      }

      return true;
    } catch (err) {
      if (err instanceof ModsDriveError) throw err;
      throw new ModsDriveError('NETWORK_ERROR', 'Failed to delete mod through secure backend API', err);
    }
  }
};

export const incrementDownloadsCount = async (id: number): Promise<number> => {
  if (IS_DEMO_MODE) {
    const mods = getLocalStorageMods();
    const index = mods.findIndex(m => m.id === id);
    if (index !== -1) {
      mods[index].downloads_count += 1;
      setLocalStorageMods(mods);
      return mods[index].downloads_count;
    }
    return 0;
  } else {
    try {
      const response = await fetch(`/api/mods/${id}/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new ModsDriveError('DB_ERROR', errData.error || 'Failed to securely update download count');
      }

      const resJson = await response.json();
      return resJson.downloads_count !== undefined ? resJson.downloads_count : 0;
    } catch (err) {
      if (err instanceof ModsDriveError) throw err;
      throw new ModsDriveError('NETWORK_ERROR', 'Failed to increment download count via secure backend proxy API', err);
    }
  }
};

export const signUpDesigner = async (email: string, password: string, displayName: string): Promise<any> => {
  if (IS_DEMO_MODE) {
    throw new ModsDriveError('AUTH_ERROR', 'Signup is disabled in Demo Mode');
  }
  try {
    const { data, error } = await supabaseClient!.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });
    if (error) {
      throw new ModsDriveError('AUTH_ERROR', error.message, error);
    }
    return data;
  } catch (err) {
    if (err instanceof ModsDriveError) throw err;
    throw new ModsDriveError('NETWORK_ERROR', 'Authentication failed', err);
  }
};

export const signInDesigner = async (email: string, password: string): Promise<any> => {
  if (IS_DEMO_MODE) {
    throw new ModsDriveError('AUTH_ERROR', 'Sign in is disabled in Demo Mode');
  }
  try {
    const { data, error } = await supabaseClient!.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw new ModsDriveError('AUTH_ERROR', error.message, error);
    }
    return data;
  } catch (err) {
    if (err instanceof ModsDriveError) throw err;
    throw new ModsDriveError('NETWORK_ERROR', 'Authentication failed', err);
  }
};

export interface DesignerUser {
  id: string;
  email: string;
  display_name?: string;
}

export const getCurrentDesignerUser = async (): Promise<DesignerUser | null> => {
  if (IS_DEMO_MODE) {
    const saved = safeStorage.getItem('demo_designer_user');
    if (saved) {
      try {
        return JSON.parse(saved) as DesignerUser;
      } catch (e) {
        return null;
      }
    }
    return null;
  } else {
    try {
      if (!supabaseClient) return null;
      const { data: { session }, error } = await supabaseClient.auth.getSession();
      if (error || !session?.user) return null;
      return {
        id: session.user.id,
        email: session.user.email || '',
        display_name: session.user.user_metadata?.display_name || session.user.email || 'Designer'
      };
    } catch (e) {
      return null;
    }
  }
};

export const signOutDesignerUser = async (): Promise<void> => {
  if (IS_DEMO_MODE) {
    safeStorage.removeItem('demo_designer_user');
  } else {
    if (supabaseClient) {
      await supabaseClient.auth.signOut();
    }
  }
};

export const getModsByCreator = async (creatorId: string): Promise<Mod[]> => {
  if (IS_DEMO_MODE) {
    const mods = getLocalStorageMods();
    return mods.filter(m => m.creator_id === creatorId);
  } else {
    try {
      if (!supabaseClient) {
        throw new ModsDriveError('DB_ERROR', 'Database client is not available.');
      }
      const { data, error } = await supabaseClient
        .from('mods')
        .select('*')
        .eq('creator_id', creatorId)
        .order('created_at', { ascending: false });
      if (error) {
        throw new ModsDriveError('DB_ERROR', error.message, error);
      }
      return data as Mod[] || [];
    } catch (err) {
      if (err instanceof ModsDriveError) throw err;
      throw new ModsDriveError('NETWORK_ERROR', 'Failed to connect to database', err);
    }
  }
};

export const createDesignerMod = async (
  mod: Omit<Mod, 'id' | 'created_at' | 'downloads_count' | 'status' | 'creator_id'>,
  creatorId: string
): Promise<Mod> => {
  if (IS_DEMO_MODE) {
    const mods = getLocalStorageMods();
    const newId = mods.length > 0 ? Math.max(...mods.map(m => m.id)) + 1 : 1;
    const newMod: Mod = {
      ...mod,
      id: newId,
      downloads_count: 0,
      created_at: new Date().toISOString(),
      status: 'pending',
      creator_id: creatorId
    };
    mods.unshift(newMod);
    setLocalStorageMods(mods);
    return newMod;
  } else {
    try {
      if (!supabaseClient) {
        throw new ModsDriveError('DB_ERROR', 'Database client is not available.');
      }
      const { data, error } = await supabaseClient
        .from('mods')
        .insert([
          {
            name: mod.name,
            description: mod.description,
            category: mod.category,
            image_url: mod.image_url,
            download_url: mod.download_url,
            game_version: mod.game_version,
            mod_version: mod.mod_version,
            downloads_count: 0,
            status: 'pending',
            creator_id: creatorId
          }
        ])
        .select()
        .single();

      if (error) {
        throw new ModsDriveError('DB_ERROR', error.message, error);
      }
      return data as Mod;
    } catch (err) {
      if (err instanceof ModsDriveError) throw err;
      throw new ModsDriveError('NETWORK_ERROR', 'Failed to submit mod structure directly to database', err);
    }
  }
};
