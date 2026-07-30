import axios from 'axios';

const GOONG_API_URL = 'https://rsapi.goong.io';
const API_KEY = process.env.NEXT_PUBLIC_GOONG_API_KEY;

export const TOUR_HUB_COORDS = { lat: 21.028511, lng: 105.852447 };

export interface GoongSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface GoongDistanceElement {
  status: string;
  distance: { value: number; text: string };
  duration: { value: number; text: string };
}

export const goongService = {
  getSuggestions: async (input: string, sessionToken: string): Promise<GoongSuggestion[]> => {
    if (!input || input.trim().length < 3) return [];
    try {
      const response = await axios.get(`${GOONG_API_URL}/place/autocomplete`, {
        params: { api_key: API_KEY, input, sessiontoken: sessionToken },
      });
      return response.data.predictions || [];
    } catch {
      return [];
    }
  },

  getPlaceDetails: async (placeId: string, sessionToken: string) => {
    try {
      const response = await axios.get(`${GOONG_API_URL}/v2/place/detail`, {
        params: { api_key: API_KEY, place_id: placeId, sessiontoken: sessionToken },
      });
      return response.data.result || null;
    } catch {
      return null;
    }
  },

  getRoadDistance: async (
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number }
  ): Promise<GoongDistanceElement | null> => {
    try {
      const response = await axios.get(`${GOONG_API_URL}/DistanceMatrix`, {
        params: {
          api_key: API_KEY,
          origins: `${origin.lat},${origin.lng}`,
          destinations: `${destination.lat},${destination.lng}`,
          vehicle: 'car',
        },
      });
      return response.data.rows?.[0]?.elements?.[0] || null;
    } catch {
      return null;
    }
  },
};
