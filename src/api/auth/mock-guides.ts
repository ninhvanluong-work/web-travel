export interface MockGuideAccount {
  tourGuideId: string;
  firstName: string;
  lastName: string;
}

export const MOCK_GUIDE_ACCOUNTS: Record<string, MockGuideAccount> = {
  'guide.testing@vvv.travel': {
    tourGuideId: '991ad4ab-f45d-48ee-9d97-2020256d24b3',
    firstName: 'Nguyễn Văn',
    lastName: 'Testing',
  },
  'guide.song@vvv.travel': {
    tourGuideId: '6a3a3faa-d650-42cd-beaf-1c81da4c4469',
    firstName: 'Lo A',
    lastName: 'Song',
  },
  'guide.thuan@vvv.travel': {
    tourGuideId: '2f9f58a3-dd30-4b7e-9d30-90ac643528ce',
    firstName: '',
    lastName: 'Thuận',
  },
  'guide.luong@vvv.travel': {
    tourGuideId: 'ef2e8931-8f55-4b3c-9497-1ef385979fa0',
    firstName: '',
    lastName: 'Luong',
  },
};

export const MOCK_GUIDE_FALLBACK: MockGuideAccount = {
  tourGuideId: '991ad4ab-f45d-48ee-9d97-2020256d24b3',
  firstName: 'Tour',
  lastName: 'Guide',
};
