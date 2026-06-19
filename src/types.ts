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
}

export type ActivePage = 'home' | 'detail' | 'amdj0602' | 'privacy-policy' | 'designer-login';

export interface RouteState {
  page: ActivePage;
  selectedModId?: number;
}
