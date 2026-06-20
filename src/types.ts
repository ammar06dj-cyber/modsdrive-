/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Mod {
  id: number;
  name: string;
  description: string;
  category: 'cars' | 'trucks' | 'buses' | 'boats' | 'excavators' | 'maps' | 'motorcycles' | 'news' | 'others' | 'planes' | 'tractors' | 'updates' | 'trailers';
  image_url: string;
  download_url: string;
  downloads_count: number;
  created_at: string;
  game_version?: string;
  mod_version?: string;
  gallery_urls?: string[];
  file_size?: string;
  creator_id?: string | null;
  status?: 'approved' | 'pending' | 'rejected';
}

export type ActivePage = 'home' | 'detail' | 'amdj0602' | 'privacy-policy' | 'designer-login' | 'not-found';

export interface RouteState {
  page: ActivePage;
  selectedModId?: number;
}
