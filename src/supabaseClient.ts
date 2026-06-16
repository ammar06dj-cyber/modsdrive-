/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { Mod } from './types';

// Placeholder credentials as requested.
// The user will replace these placeholders with real values later.
export const SUPABASE_URL = 'https://qqamwmjtbsnbjtxlpriv.supabase.co/rest/v1/';
export const SUPABASE_KEY = 'sb_publishable_gpAiNrSnz0oeIG2iK9D1Mg_1SvxBzko';

// Check if credentials are placeholders
const isPlaceholder = (url: string, key: string) => {
  return !url || !key || url.includes('YOUR_SUPABASE_') || key.includes('YOUR_SUPABASE_');
};

export const IS_DEMO_MODE = isPlaceholder(SUPABASE_URL, SUPABASE_KEY);

const supabaseClient = !IS_DEMO_MODE ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// Premium initial seed mods for the demo mode
const SEED_MODS: Mod[] = [
  {
    id: 1,
    name: "Toyota Supra MK4 Turbo 1994",
    description: "Legendary JDM sports car featuring a highly customized twin-turbo 2JZ-GTE engine sound pack, active adjustable active spoiler physics, premium interior details with functional speedo and boost gauges, drift suspension kit, and ultra high-res textures compatible with all street simulator engines.",
    category: "cars",
    image_url: "https://images.unsplash.com/photo-1617469767053-d3b508a0d822?auto=format&fit=crop&q=80&w=800",
    download_url: "https://archive.org/download/free-vehicle-modes-pack-v1/toyota_supra_mk4_simulator_ready.zip",
    downloads_count: 1842,
    created_at: "2026-06-10T12:00:00Z",
    game_version: "v1.49",
    mod_version: "v2.1",
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
    download_url: "https://archive.org/download/free-vehicle-modes-pack-v1/scania_s730_v8_streamline.zip",
    downloads_count: 2451,
    created_at: "2026-06-11T14:30:00Z",
    game_version: "v1.49",
    mod_version: "v1.0",
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
    download_url: "https://archive.org/download/free-vehicle-modes-pack-v1/mercedes_citaro_city_transit.zip",
    downloads_count: 1205,
    created_at: "2026-06-12T09:15:00Z",
    game_version: "v1.48",
    mod_version: "v1.5"
  },
  {
    id: 4,
    name: "Nissan Skyline GT-R R34 Godzilla Edition",
    description: "Iconic high-performance vehicle with authentic multi-functional dashboard screen reflecting dynamic boost, torque distribution, and oil temperature. Equipped with performance intercoolers, custom tuned exhaust, AWD ATTESA track setup, and multiple metallic paint styles.",
    category: "cars",
    image_url: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=800",
    download_url: "https://archive.org/download/free-vehicle-modes-pack-v1/nissan_skyline_g_t_r_r34_tuned.zip",
    downloads_count: 3108,
    created_at: "2026-06-13T18:45:00Z",
    game_version: "v1.50",
    mod_version: "v3.0_beta"
  },
  {
    id: 5,
    name: "Peterbilt 389 Extended Hood Custom",
    description: "Classic American long-haul truck with brilliant chrome plating. Features deep-toned dual vertical exhaust stacks, fully styled sleeper cab, manual 18-speed shift synchronization support, analog gauge cluster, skin support, and massive triple-train cargo pulling power.",
    category: "trucks",
    image_url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800",
    download_url: "https://archive.org/download/free-vehicle-modes-pack-v1/peterbilt_389_classic_chrome.zip",
    downloads_count: 1983,
    created_at: "2026-06-14T11:20:00Z",
    game_version: "v1.49",
    mod_version: "v4.2"
  },
  {
    id: 6,
    name: "Volvo 9700 Grand Coach Horizon",
    description: "Premium interstate passenger liner built for long-distance cruising. Outfitted with high-luxury passenger recliners, personal air ventilation outputs, automated luggage bay animations, double rear axles, silent electronic dynamic driving aids, and long range fuel tanks.",
    category: "buses",
    image_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800",
    download_url: "https://archive.org/download/free-vehicle-modes-pack-v1/volvo_9700_premium_coach.zip",
    downloads_count: 837,
    created_at: "2026-06-15T15:10:00Z",
    game_version: "v1.47",
    mod_version: "v1.2"
  },
  {
    id: 7,
    name: "MAN TGX Euro 6 Cargo Carrier",
    description: "Highly detailed heavy duty transport truck ideal for European highways. It boasts highly tuned custom high-torque diesel sound profiles, active dynamic cruise assist, standard digital cabin consoles, customizable trailer attachments and custom decals.",
    category: "trucks",
    image_url: "https://images.unsplash.com/photo-1591768793355-74d7189607f7?auto=format&fit=crop&q=80&w=800",
    download_url: "https://archive.org/download/free-vehicle-modes-pack-v1/man_tgx_euro_6_carrier.zip",
    downloads_count: 1420,
    created_at: "2026-06-15T18:30:00Z",
    game_version: "v1.49",
    mod_version: "v1.1"
  },
  {
    id: 8,
    name: "Mitsubishi Lancer Evolution X Drift",
    description: "All-wheel-drive drift tuning spec of the legendary sports sedan. Fully equipped with multi-stage launch control system, performance racing wheels, dynamic suspension telemetry, carbon fiber wings, and direct responsiveness on race tracks.",
    category: "cars",
    image_url: "https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&q=80&w=800",
    download_url: "https://archive.org/download/free-vehicle-modes-pack-v1/lancer_evo_x_drifter.zip",
    downloads_count: 2790,
    created_at: "2026-06-16T10:00:00Z",
    game_version: "v1.50",
    mod_version: "v2.0"
  },
  {
    id: 9,
    name: "Hyundai Super Aero City Bus",
    description: "Highly recognizable East Asian urban commuter transit bus. It contains automated double doors, realistic low-floor step animations, fully voiced passenger bell sound clips, detailed cockpit steering controls, and authentic engine rattles.",
    category: "buses",
    image_url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800",
    download_url: "https://archive.org/download/free-vehicle-modes-pack-v1/hyundai_super_aero_city.zip",
    downloads_count: 954,
    created_at: "2026-06-16T11:45:00Z",
    game_version: "v1.48",
    mod_version: "v1.0"
  },
  {
    id: 10,
    name: "Ford Mustang Shelby GT500 2020",
    description: "Vicious muscle car simulation package featuring a supercharged V8 engine. Comes with standard active sound valves, carbon track performance package, track telemetry suite, customizable glossy stripes, and brutal modern line-lock capabilities.",
    category: "cars",
    image_url: "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=800",
    download_url: "https://archive.org/download/free-vehicle-modes-pack-v1/ford_shelby_gt500_mustang.zip",
    downloads_count: 3512,
    created_at: "2026-06-16T12:00:00Z",
    game_version: "v1.49",
    mod_version: "v1.8"
  },
  {
    id: 11,
    name: "Kenworth W900 Custom Classic Long",
    description: "Traditional American master truck featuring extended exhaust pipes. Outfitted with high-fidelity mechanical transmission gears, detailed sleepers, 650HP custom power engines, ultra polished steel chrome, and dual horns ready for simulation.",
    category: "trucks",
    image_url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800",
    download_url: "https://archive.org/download/free-vehicle-modes-pack-v1/kenworth_w900_long_classic.zip",
    downloads_count: 2195,
    created_at: "2026-06-16T13:10:00Z",
    game_version: "v1.50",
    mod_version: "v4.0"
  },
  {
    id: 12,
    name: "Ikarus 260 Vintage Articulated Bus",
    description: "Classic retro city public transporter featuring realistic mechanical high-floor suspensions, fully articulated accordion physics, manual transmission shifter, hand-operated manual doors, and authentic smoky diesel exhaust exhaust fumes.",
    category: "buses",
    image_url: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=800",
    download_url: "https://archive.org/download/free-vehicle-modes-pack-v1/ikarus_260_vintage_class.zip",
    downloads_count: 671,
    created_at: "2026-06-16T14:15:00Z",
    game_version: "v1.47",
    mod_version: "v1.1"
  }
];

// Helper to initialize local storage
const getLocalStorageMods = (): Mod[] => {
  const data = localStorage.getItem('simulator_mods');
  if (!data) {
    localStorage.setItem('simulator_mods', JSON.stringify(SEED_MODS));
    return SEED_MODS;
  }
  try {
    const parsed = JSON.parse(data) as Mod[];
    // Migrate: check if we need to add game_version/mod_version back to seed mods
    if (parsed.length <= 6) {
      localStorage.setItem('simulator_mods', JSON.stringify(SEED_MODS));
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
      }
      // Guarantee a default game version if not there programmatically
      if (!mod.game_version) {
        mod.game_version = "v1.49";
        changed = true;
      }
      return mod;
    });

    if (changed) {
      localStorage.setItem('simulator_mods', JSON.stringify(migrated));
    }
    return migrated;
  } catch (e) {
    return SEED_MODS;
  }
};

const setLocalStorageMods = (mods: Mod[]) => {
  localStorage.setItem('simulator_mods', JSON.stringify(mods));
};

// Mod operations
export const getMods = async (): Promise<Mod[]> => {
  if (IS_DEMO_MODE) {
    // Add brief animation delay
    await new Promise(resolve => setTimeout(resolve, 350));
    return getLocalStorageMods();
  } else {
    try {
      const { data, error } = await supabaseClient!
        .from('mods')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        throw error;
      }
      return data || [];
    } catch (err) {
      console.warn('Failed to fetch from Supabase, falling back to Local Storage:', err);
      return getLocalStorageMods();
    }
  }
};

export const getModById = async (id: number): Promise<Mod | null> => {
  if (IS_DEMO_MODE) {
    const mods = getLocalStorageMods();
    return mods.find(m => m.id === id) || null;
  } else {
    try {
      const { data, error } = await supabaseClient!
        .from('mods')
        .select('*')
        .eq('id', id)
        .single();
      if (error) {
        throw error;
      }
      return data;
    } catch (err) {
      console.warn('Failed to fetch detail from Supabase, falling back to Local Storage:', err);
      const mods = getLocalStorageMods();
      return mods.find(m => m.id === id) || null;
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
      const { data, error } = await supabaseClient!
        .from('mods')
        .insert([
          {
            name: mod.name,
            description: mod.description,
            category: mod.category,
            image_url: mod.image_url,
            download_url: mod.download_url,
            downloads_count: 0,
            game_version: mod.game_version,
            mod_version: mod.mod_version,
            gallery_urls: mod.gallery_urls
          }
        ])
        .select()
        .single();
      if (error) {
        throw error;
      }
      return data;
    } catch (err) {
      console.warn('Failed to insert into Supabase, writing to Local Storage instead:', err);
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
      const { error } = await supabaseClient!
        .from('mods')
        .delete()
        .eq('id', id);
      if (error) {
        throw error;
      }
      return true;
    } catch (err) {
      console.warn('Failed to delete from Supabase, removing from Local Storage:', err);
      const mods = getLocalStorageMods();
      const filtered = mods.filter(m => m.id !== id);
      setLocalStorageMods(filtered);
      return true;
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
      const { data: currentMod, error: fetchError } = await supabaseClient!
        .from('mods')
        .select('downloads_count')
        .eq('id', id)
        .single();
      
      if (fetchError || !currentMod) {
        throw fetchError || new Error('Mod not found');
      }

      const nextCount = (currentMod.downloads_count || 0) + 1;

      const { data, error } = await supabaseClient!
        .from('mods')
        .update({ downloads_count: nextCount })
        .eq('id', id)
        .select('downloads_count')
        .single();

      if (error) {
        throw error;
      }
      return data?.downloads_count ?? nextCount;
    } catch (err) {
      console.warn('Failed to update download count in Supabase, updating Local Storage:', err);
      const mods = getLocalStorageMods();
      const index = mods.findIndex(m => m.id === id);
      if (index !== -1) {
        mods[index].downloads_count += 1;
        setLocalStorageMods(mods);
        return mods[index].downloads_count;
      }
      return 0;
    }
  }
};
